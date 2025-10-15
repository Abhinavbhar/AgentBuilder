import os
import io
import csv
import pika
import json
from pdfminer.high_level import extract_text
from docx import Document
from odf.opendocument import load as load_odt
from odf.text import P
from minio import Minio
from langchain.text_splitter import RecursiveCharacterTextSplitter
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ sentence_transformers not available. Install with: pip install sentence_transformers")
    SentenceTransformer = None

# ================= CONFIG ===================
MINIO_SERVER = "localhost:9000"
MINIO_ACCESS_KEY = "admin"
MINIO_SECRET_KEY = "admin123"
MINIO_SECURE = False

BUCKET_NAME = "live"
DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Embedding config
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
# ============================================

# Initialize embedding model once (for efficiency)
embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        print("🔄 Loading embedding model...")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL)
        print("✅ Model loaded.")
    return embedding_model

# ---------- File extraction functions ----------
def extract_docx_text(file_bytes):
    """Extract text from DOCX files."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print(f"❌ Error extracting DOCX: {e}")
        return ""

def extract_odt_text(file_bytes):
    """Extract text from ODT files."""
    try:
        odt = load_odt(io.BytesIO(file_bytes))
        texts = []
        for p in odt.getElementsByType(P):
            texts.append("".join(
                node.data for node in p.childNodes 
                if hasattr(node, 'nodeType') and node.nodeType == node.TEXT_NODE
            ))
        return "\n".join(texts)
    except Exception as e:
        print(f"❌ Error extracting ODT: {e}")
        return ""

def extract_csv_text(file_bytes):
    """Extract text from CSV files."""
    try:
        text = file_bytes.decode("utf-8", errors="ignore")
        rows = []
        for row in csv.reader(text.splitlines()):
            rows.append(", ".join(row))
        return "\n".join(rows)
    except Exception as e:
        print(f"❌ Error extracting CSV: {e}")
        return ""

def extract_pdf_text(file_path):
    """Extract text from PDF files."""
    try:
        return extract_text(file_path)
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""

def extract_txt_text(file_bytes):
    """Extract text from TXT files."""
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"❌ Error extracting TXT: {e}")
        return ""

# ---------- Download, extract, and embed ----------
def download_and_create_embeddings(client, object_name):
    """Download file, extract text, create chunks, and generate embeddings."""
    local_file = os.path.join(DOWNLOAD_DIR, os.path.basename(object_name))
    print(f"📥 Downloading: {object_name}")
    
    try:
        client.fget_object(BUCKET_NAME, object_name, local_file)
    except Exception as e:
        print(f"❌ Error downloading {object_name}: {e}")
        return None

    filename = os.path.basename(object_name)
    ext = filename.split(".")[-1].lower()
    text = ""

    try:
        with open(local_file, "rb") as f:
            content = f.read()

        if ext == "pdf":
            text = extract_pdf_text(local_file)  # PDF needs file path
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
            return None

        if not text.strip():
            print(f"⚠️ No text extracted from {filename}")
            return None

    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")
        return None
    finally:
        # Clean up downloaded file
        if os.path.exists(local_file):
            os.remove(local_file)

    # Split text into chunks
    print(f"✂️ Splitting text into chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
    )
    chunks = splitter.split_text(text)
    print(f"📦 Created {len(chunks)} chunks from {filename}")

    if not chunks:
        print(f"⚠️ No chunks created from {filename}")
        return None

    # Generate embeddings
    print(f"🧠 Generating embeddings...")
    model = get_embedding_model()
    embeddings = model.encode(chunks, show_progress_bar=False)
    print(f"✅ Generated {len(embeddings)} embeddings for {filename}")

    # Return structured embedding data
    return {
        "filename": filename,
        "object_name": object_name,
        "num_chunks": len(chunks),
        "num_embeddings": len(embeddings),
        "chunks": chunks,
        "embeddings": embeddings.tolist(),  # Convert numpy array to list for JSON serialization
    }

# ---------- Process folder ----------
def process_folder(folder_path):
    """
    Process all files in a MinIO folder, merge text, and generate embeddings.
    folder_path: e.g., 8d834764-b311-4e1c-ab6a-503cb5b324bc or live/8d834764-b311-4e1c-ab6a-503cb5b324bc
    """
    from urllib.parse import unquote
    
    print(f"\n📂 Processing folder: {folder_path}")

    # Decode URL-encoded paths (e.g., %2F -> /)
    clean_path = unquote(folder_path).strip("/")
    
    # Remove bucket name if included in path
    if clean_path.startswith(BUCKET_NAME + "/"):
        clean_path = clean_path[len(BUCKET_NAME) + 1:]
    
    print(f"🔍 Looking for objects with prefix: {clean_path}")

    # Connect to MinIO
    try:
        client = Minio(
            MINIO_SERVER,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE
        )
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
                # Clean up downloaded file
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
        print(f"✅ Generated {len(embeddings)} embeddings")

        # Return structured embedding data
        return {
            "folder": folder_path,
            "files_processed": file_info_list,
            "num_files": len(file_info_list),
            "num_chunks": len(chunks),
            "num_embeddings": len(embeddings),
            "chunks": chunks,
            "embeddings": embeddings.tolist(),
            "merged_text": merged_text,
        }

    except Exception as e:
        print(f"❌ Error processing folder: {e}")
        return None

# ---------- RabbitMQ Consumer ----------
def callback(ch, method, properties, body):
    """Callback for RabbitMQ messages."""
    folder_path = body.decode().strip()
    print(f"\n🐇 Received folder path: {folder_path}")

    try:
        embedding_data = process_folder(folder_path)

        if embedding_data:
            # Optional: Save embeddings metadata to JSON
            output_file = f"embeddings_{os.path.basename(folder_path.strip('/'))}.json"
            with open(output_file, "w", encoding="utf-8") as f:
                json_data = {
                    "folder": embedding_data["folder"],
                    "files_processed": embedding_data["files_processed"],
                    "num_files": embedding_data["num_files"],
                    "num_chunks": embedding_data["num_chunks"],
                    "num_embeddings": embedding_data["num_embeddings"],
                }
                json.dump(json_data, f, indent=2)
            print(f"📄 Metadata saved to: {output_file}")

            # Here you can:
            # - Store embeddings in a vector database (Pinecone, Weaviate, Milvus, etc.)
            # - Use embeddings for similarity search
            # - Process them further as needed
            print(f"💾 Ready to store embeddings in vector DB")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("✅ Folder processed and message acknowledged.\n")

    except Exception as e:
        print(f"❌ Error processing folder: {e}")
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