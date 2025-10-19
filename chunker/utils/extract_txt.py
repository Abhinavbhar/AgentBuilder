def extract_txt_text(file_bytes):
    """Extract text from TXT files."""
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"❌ Error extracting TXT: {e}")
        return ""