from qdrant_client import QdrantClient

def upload_vectors_to_qdrant(
    collection_name: str,
    chunks: list[str],
    embeddings: list[list[float]]
):
    """
    Uploads text chunks and their corresponding embeddings to Qdrant.
    
    Args:
        collection_name (str): Name of the collection (acts like folder).
        chunks (list[str]): List of text chunks.
        embeddings (list[list[float]]): Corresponding embedding vectors.
    """
    # Replace with your Qdrant Cloud details
    CLOUD_URL = "https://79c3c650-b3e8-48cf-a76c-ce62bc67f909.us-west-2-0.aws.cloud.qdrant.io"
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.xZuR70oDkb00FD7c1MjvponTpIz0B6zFEOVg8L2nzkM"
    
    try:
        # Connect to Qdrant Cloud
        client = QdrantClient(
            url=CLOUD_URL,
            api_key=API_KEY,
            timeout=60
        )
        print("✅ Connected to Qdrant Cloud successfully!")
    except Exception as e:
        print("❌ Failed to connect to Qdrant Cloud:", e)
        return
    
    if not chunks or not embeddings or len(chunks) != len(embeddings):
        raise ValueError("Chunks and embeddings must be non-empty and of the same length.")
    
    # Auto-generate IDs
    ids = list(range(len(chunks)))
    
    # Create or recreate collection
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config={
            "size": len(embeddings[0]),
            "distance": "Cosine"  # change if needed
        }
    )
    
    # Prepare points with payload
    points = [
        {"id": idx, "vector": vec, "payload": {"text": chunk}}
        for idx, vec, chunk in zip(ids, embeddings, chunks)
    ]
    
    # Upload to Qdrant
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    
    print(f"✅ Uploaded {len(chunks)} vectors with text payloads to '{collection_name}'")