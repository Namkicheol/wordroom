#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


def verify_manifest(manifest_path: Path) -> list[str]:
    errors: list[str] = []
    if not manifest_path.exists():
        return [f"missing manifest: {manifest_path}"]

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    base = manifest_path.parent.parent.parent

    for item in manifest:
        output = base / item["output_file"]
        if not output.exists():
            errors.append(f"missing output: {output}")
            continue

        text = output.read_text(encoding="utf-8", errors="replace")
        if len(text) < 1000:
            errors.append(f"too small: {output} ({len(text)} chars)")
        if "## Page " not in text:
            errors.append(f"missing page markers: {output}")
        if item["extracted_pages"] != item["total_pages"]:
            errors.append(f"partial extraction: {output}")

    return errors


def main() -> int:
    manifest_path = Path("sources/extracted/manifest.json")
    errors = verify_manifest(manifest_path)
    if errors:
        print("\n".join(errors))
        return 1

    print("OK: extracted Markdown files verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
