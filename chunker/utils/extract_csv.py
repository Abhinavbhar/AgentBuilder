import csv

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