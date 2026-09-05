import glob
import os
from pypdf import PdfReader

def resolve_pdf_paths(source: str | list[str]) -> list[str]:
    """
    Accepts:
      - a single PDF path
      - a directory containing PDFs
      - a list of PDF paths
    
    Returns a flat list of PDF file paths.
    """
    if isinstance(source, list):
        paths = source
    elif os.path.isdir(source):
        paths = sorted(glob.glob(os.path.join(source, "*.pdf")))
    else:
        paths = [source]

    if not paths:
        raise ValueError(f"No PDF files found for source: {source}")

    return paths


def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    full_text = ""

    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

    return full_text
