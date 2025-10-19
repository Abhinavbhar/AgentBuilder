import os
import io
import pika
import json
from sendVectorDb import upload_vectors_to_qdrant
from odf.text import P
from minio import Minio
from langchain.text_splitter import RecursiveCharacterTextSplitter
from utils import extract_docx_text
from utils import extract_odt_text
from utils import extract_csv_text
from utils import extract_pdf_text
from utils import extract_txt_text
from utils import get_embedding_model
from db import connect_minio


BUCKET_NAME = "live"
DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Embedding config
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
# ============================================

# Initialize embedding model once (for efficiency)
def process_folder(folder_path):
    """
    Process all files in a MinIO folder, merge text, and generate embeddings.
    folder_path: e.g., 8d834764-b311-4e1c-ab6a-503cb5b324bc
    """
    from urllib.parse import unquote
    
    print(f"\n📂 Processing folder: {folder_path}")

    # Decode URL-encoded paths
    clean_path = unquote(folder_path).strip("/")
    
    # Remove bucket name if included in path
    if clean_path.startswith(BUCKET_NAME + "/"):
        clean_path = clean_path[len(BUCKET_NAME) + 1:]
    
    print(f"🔍 Looking for objects with prefix: {clean_path}")

    # Connect to MinIO
    try:
        client =connect_minio()
        print("connected")
    except Exception as e:
        print(f"❌ Error connecting to MinIO: {e}")
        return None
    
    merged_text = ""
    file_info_list = []

    # List all objects under the folder
    try:
        objects = client.list_objects(
            BUCKET_NAME, 
            prefix=clean_path, 
            recursive=True
        )
        
        object_list = list(objects)
        if not object_list:
            print(f"⚠️ No objects found in folder: {clean_path}")
            return None

        print(f"📋 Found {len(object_list)} files in folder")

        # Download and extract text from each file
        for idx, obj in enumerate(object_list, 1):
            print(f"\n[{idx}/{len(object_list)}] Processing: {obj.object_name}")
            
            local_file = os.path.join(DOWNLOAD_DIR, os.path.basename(obj.object_name))
            
            try:
                client.fget_object(BUCKET_NAME, obj.object_name, local_file)
                print(f"✅ Downloaded: {obj.object_name}")

                filename = os.path.basename(obj.object_name)
                ext = filename.split(".")[-1].lower()
                text = ""

                with open(local_file, "rb") as f:
                    content = f.read()

                if ext == "pdf":
                    text = extract_pdf_text(local_file)
                elif ext == "docx":
                    text = extract_docx_text(content)
                elif ext == "odt":
                    text = extract_odt_text(content)
                elif ext == "csv":
                    text = extract_csv_text(content)
                elif ext == "txt":
                    text = extract_txt_text(content)
                else:
                    print(f"⚠️ Unsupported file type: {filename}")
                    continue

                if text.strip():
                    merged_text += f"\n\n==== {filename} ====\n{text}"
                    file_info_list.append(filename)
                    print(f"✅ Extracted text from: {filename}")
                else:
                    print(f"⚠️ No text extracted from {filename}")

            except Exception as e:
                print(f"❌ Error processing {obj.object_name}: {e}")
                continue
            finally:
                if os.path.exists(local_file):
                    os.remove(local_file)

        if not merged_text.strip():
            print(f"⚠️ No text extracted from any files in folder")
            return None

        print(f"\n📝 Merged text from {len(file_info_list)} files")
        print(f"📊 Total text length: {len(merged_text)} characters")

        # Split merged text into chunks
        print(f"\n✂️ Splitting merged text into chunks...")
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
        )
        chunks = splitter.split_text(merged_text)
        print(f"📦 Created {len(chunks)} chunks")

        if not chunks:
            print(f"⚠️ No chunks created from merged text")
            return None

        # Generate embeddings
        print(f"\n🧠 Generating embeddings for all chunks...")
        
        model = get_embedding_model()
        embeddings = model.encode(chunks, show_progress_bar=True)
        
        # Convert to list once
        embeddings_list = embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings
        print(f"✅ Generated {len(embeddings_list)} embeddings")

        # Upload to qdrant
        upload_vectors_to_qdrant(folder_path, chunks, embeddings_list)
        
        return {
            "folder": folder_path,
            "files_processed": file_info_list,
            "num_files": len(file_info_list),
            "num_chunks": len(chunks),
            "num_embeddings": len(embeddings_list),
            "chunks": chunks,
            "embeddings": embeddings_list,
            "merged_text": merged_text,
        }

    except Exception as e:
        print(f"❌ Error processing folder: {e}")
        return None
# ---------- RabbitMQ Consumer ----------
def callback(ch, method, properties, body):
    """Callback for RabbitMQ messages."""
    
    # 1. Decode and strip the incoming body
    full_string = body.decode().strip()
    print(f"\n🐇 Received full string: {full_string}")
    
    # 2. Split the string using the unique delimiter "mail-:"
    try:
        # We only need to split once, at the first occurrence
        folder_path, email = full_string.split("mail-:", 1)
        
        # Strip any accidental whitespace from the extracted parts
        folder_path = folder_path.strip()
        email = email.strip()
        
        print(f"📁 Extracted folder path: {folder_path}")
        print(f"📧 Extracted email: {email}")

    except ValueError:
        # Handle cases where the delimiter "mail-:" is not found
        print(f"❌ Error: Delimiter 'mail-:' not found in message body: {full_string}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False) # Don't requeue a malformed message
        return # Stop execution for this message
        
    # --- Continue with your existing logic using the extracted 'folder_path' ---
    
    try:
        # Note: You now have the 'email' variable available for logging/use if needed
        embedding_data = process_folder(folder_path) # Use the clean folder_path
        
        if embedding_data:
            # Optional: Save embeddings metadata to JSON
            output_file = f"embeddings_{os.path.basename(folder_path.strip('/'))}.json"
            
            # Use 'email' in the metadata for tracking
            json_data = {
                "folder": embedding_data["folder"],
                "user_email": email, # Added email to metadata
                "files_processed": embedding_data["files_processed"],
                "num_files": embedding_data["num_files"],
                "num_chunks": embedding_data["num_chunks"],
                "num_embeddings": embedding_data["num_embeddings"],
            }
            # ... (rest of file saving logic)
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(json_data, f, indent=2)
            print(f"📄 Metadata saved to: {output_file}")
            print(f"💾 Ready to store embeddings in vector DB for user: {email}")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("✅ Folder processed and message acknowledged.\n")

    except Exception as e:
        print(f"❌ Error processing folder: {e}")
        # Note: Added requeue=True for actual processing errors
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
def main():
    """Start RabbitMQ consumer."""
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters('localhost')
        )
        channel = connection.channel()

        channel.queue_declare(queue='minio_urls', durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(
            queue='minio_urls', 
            on_message_callback=callback, 
            auto_ack=False
        )

        print(" [*] Waiting for MinIO folder paths. Press CTRL+C to exit.")
        channel.start_consuming()

    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()