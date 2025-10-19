from pdfminer.high_level import extract_text
def extract_pdf_text(file_path):
    """Extract text from PDF files."""
    try:
        return extract_text(file_path)
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""