#!/usr/bin/env python3
"""Extract OCR text from vocabulary PDFs into page-based Markdown files."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path

import fitz


SLUGS = {
    "MD-VOCA_1_K1.pdf": "md-voca-1-k1",
    "보카바이블 A권 (4th)OCR.pdf": "voca-bible-a-4th-ocr",
    "보카바이블 B권 (4th)OCR.pdf": "voca-bible-b-4th-ocr",
    "워드스마트 통합본 (넥서스)_ocr.pdf": "word-smart-nexus-ocr",
}


def normalized_name(path: Path) -> str:
    return unicodedata.normalize("NFC", path.name)


def slug_for(path: Path) -> str:
    name = normalized_name(path)
    if name in SLUGS:
        return SLUGS[name]
    stem = unicodedata.normalize("NFKD", path.stem)
    stem = stem.encode("ascii", "ignore").decode("ascii")
    stem = re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-").lower()
    return stem or "wordbook"


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    cleaned = []
    blank = False
    for line in lines:
        if not line:
            if not blank:
                cleaned.append("")
            blank = True
            continue
        cleaned.append(line)
        blank = False
    return "\n".join(cleaned).strip()


def extract_pdf(pdf_path: Path, output_dir: Path, limit_pages: int | None) -> dict:
    doc = fitz.open(pdf_path)
    slug = slug_for(pdf_path)
    output_path = output_dir / f"{slug}.md"
    max_pages = min(len(doc), limit_pages) if limit_pages else len(doc)
    extracted_chars = 0
    empty_pages = []

    with output_path.open("w", encoding="utf-8") as out:
        out.write(f"# {normalized_name(pdf_path)}\n\n")
        out.write("<!--\n")
        out.write("Purpose: OCR/text-layer extraction for internal rewriting and analysis.\n")
        out.write("Do not publish copied source examples, explanations, jokes, or layout text.\n")
        out.write("-->\n\n")
        out.write("## Metadata\n\n")
        out.write(f"- source_file: {normalized_name(pdf_path)}\n")
        out.write(f"- total_pages: {len(doc)}\n")
        out.write(f"- extracted_pages: {max_pages}\n")
        out.write(f"- extracted_at: {datetime.now().isoformat(timespec='seconds')}\n\n")

        for page_index in range(max_pages):
            page = doc[page_index]
            text = clean_text(page.get_text("text"))
            if not text:
                empty_pages.append(page_index + 1)
            extracted_chars += len(text)
            out.write(f"## Page {page_index + 1}\n\n")
            out.write(text or "[[NO_TEXT_EXTRACTED]]")
            out.write("\n\n")

    return {
        "source_file": normalized_name(pdf_path),
        "output_file": str(output_path),
        "total_pages": len(doc),
        "extracted_pages": max_pages,
        "extracted_chars": extracted_chars,
        "empty_pages": empty_pages[:50],
        "empty_page_count": len(empty_pages),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--limit-pages", type=int, default=None)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(args.source_dir.glob("*.pdf"), key=lambda p: normalized_name(p))
    if not pdfs:
        raise SystemExit(f"No PDF files found in {args.source_dir}")

    manifest = [extract_pdf(pdf, args.output_dir, args.limit_pages) for pdf in pdfs]
    manifest_path = args.output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
