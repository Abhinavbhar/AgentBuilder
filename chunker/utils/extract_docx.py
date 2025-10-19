from docx import Document
import io
def extract_docx_text(file_bytes):
    """Extract text from DOCX files."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print(f"❌ Error extracting DOCX: {e}")
        return ""