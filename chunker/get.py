from qdrant_client import QdrantClient

CLOUD_URL = "https://79c3c650-b3e8-48cf-a76c-ce62bc67f909.us-west-2-0.aws.cloud.qdrant.io"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.xZuR70oDkb00FD7c1MjvponTpIz0B6zFEOVg8L2nzkM"
try:
    # Connect to Qdrant Cloud
    client = QdrantClient(
    url=CLOUD_URL,
    api_key=API_KEY
        )
    collections = client.get_collections()
    print("✅ Connected to Qdrant Cloud successfully!")
    print("Existing collections:", collections)
except Exception as e:
    print("❌ Failed to connect to Qdrant Cloud:", e)
    