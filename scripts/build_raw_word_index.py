#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


PAGE_RE = re.compile(r"^## Page (\d+)\s*$", re.MULTILINE)
UPPER_ENTRY_RE = re.compile(r"^([A-Z][A-Z-]{2,})\b(?:\s+\[[^\]]+\])?", re.MULTILINE)
LOWER_ENTRY_RE = re.compile(r"^([a-z][a-z-]{2,})(?:\s+/|\s+[a-z].{0,80}/)", re.MULTILINE)
THEME_CONTEXT_RE = re.compile(r"\b(?:SYNONYM|THEME|ETYMOLOGY|IDIOM|WORDS?)\b", re.IGNORECASE)
ASCII_WORD_RE = re.compile(r"\b([A-Za-z][A-Za-z-]{2,23})\b")

NOISE_WORDS = {
    "and",
    "basic",
    "contents",
    "day",
    "etymology",
    "exam",
    "gre",
    "idiom",
    "isbn",
    "part",
    "page",
    "sat",
    "synonym",
    "synonymous",
    "teps",
    "theme",
    "the",
    "toefl",
    "top",
    "word",
    "words",
}


def split_pages(markdown: str) -> list[tuple[int, str]]:
    matches = list(PAGE_RE.finditer(markdown))
    pages: list[tuple[int, str]] = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        pages.append((int(match.group(1)), markdown[start:end]))
    return pages


def normalize_word(word: str) -> str:
    return word.strip("-").lower()


def is_good_word(word: str) -> bool:
    if word in NOISE_WORDS:
        return False
    if len(word) < 3 or len(word) > 24:
        return False
    return bool(re.fullmatch(r"[a-z][a-z-]*", word))


def nearby_text(page_text: str, raw_word: str) -> str:
    pos = page_text.lower().find(raw_word.lower())
    if pos < 0:
        return ""
    snippet = page_text[pos : pos + 260]
    return re.sub(r"\s+", " ", snippet).strip()


def add_candidate(
    candidates: dict[str, dict],
    source_slug: str,
    page: int,
    page_text: str,
    raw_word: str,
    confidence: float,
) -> None:
    word = normalize_word(raw_word)
    if not is_good_word(word):
        return

    existing = candidates.get(word)
    item = {
        "word": word,
        "source": source_slug,
        "page": page,
        "confidence": confidence,
        "nearby_text": nearby_text(page_text, raw_word),
    }
    if existing is None or item["confidence"] > existing["confidence"]:
        candidates[word] = item


def extract_candidates_from_page(source_slug: str, page: int, page_text: str) -> list[dict]:
    candidates: dict[str, dict] = {}

    for match in UPPER_ENTRY_RE.finditer(page_text):
        confidence = 0.9 if source_slug.startswith("word-smart") else 0.66
        add_candidate(candidates, source_slug, page, page_text, match.group(1), confidence)

    for match in LOWER_ENTRY_RE.finditer(page_text):
        confidence = 0.82 if source_slug.startswith("md-voca") else 0.6
        add_candidate(candidates, source_slug, page, page_text, match.group(1), confidence)

    if source_slug.startswith("voca-bible") and THEME_CONTEXT_RE.search(page_text):
        for match in ASCII_WORD_RE.finditer(page_text):
            add_candidate(candidates, source_slug, page, page_text, match.group(1), 0.58)

    return sorted(candidates.values(), key=lambda item: item["word"])


def build_index(extracted_dir: Path) -> list[dict]:
    grouped: dict[str, dict] = {}
    for path in sorted(extracted_dir.glob("*.md")):
        source_slug = path.stem
        markdown = path.read_text(encoding="utf-8", errors="replace")
        for page, text in split_pages(markdown):
            for candidate in extract_candidates_from_page(source_slug, page, text):
                word = candidate["word"]
                entry = grouped.setdefault(
                    word,
                    {
                        "word": word,
                        "sources": [],
                        "best_confidence": 0.0,
                    },
                )
                entry["sources"].append(
                    {
                        "source": candidate["source"],
                        "page": candidate["page"],
                        "confidence": candidate["confidence"],
                        "nearby_text": candidate["nearby_text"],
                    }
                )
                entry["best_confidence"] = max(entry["best_confidence"], candidate["confidence"])

    return sorted(grouped.values(), key=lambda item: (-item["best_confidence"], item["word"]))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--extracted-dir", default="sources/extracted")
    parser.add_argument("--output", default="sources/normalized/raw_word_index.json")
    args = parser.parse_args()

    index = build_index(Path(args.extracted_dir))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(index)} candidates to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
