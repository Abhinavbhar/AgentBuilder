try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ sentence_transformers not available. Install with: pip install sentence_transformers")
    SentenceTransformer = None
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def get_embedding_model():
    print("🔄 Loading embedding model...")
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    print("✅ Model loaded.")
    return embedding_model
