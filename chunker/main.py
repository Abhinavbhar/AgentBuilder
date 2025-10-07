from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

# 1️⃣ Split text into chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    length_function=len,
)

with open("hello.txt", "r", encoding="utf-8") as f:
    text = f.read()

chunks = splitter.split_text(text)
print(len(chunks), "chunks created.")

# 2️⃣ Load local embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim embeddings, runs on CPU

# 3️⃣ Convert chunks to embeddings
embeddings = model.encode(chunks, show_progress_bar=True)
print(f"{len(embeddings)} embeddings created.")

# 4️⃣ Optional: inspect first embedding
print("First embedding vector:", embeddings[0])
