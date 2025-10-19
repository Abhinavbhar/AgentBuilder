from odf.opendocument import load as load_odt

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