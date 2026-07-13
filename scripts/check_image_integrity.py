#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path


MARKDOWN_IMAGE_RE = re.compile(r'!\[[^\]]*]\(([^)]+)\)')
THEME_IMAGE_RE = re.compile(
    r'{{<\s*theme-image\b([^>]*)>}}'
)
SHORTCODE_ARG_RE = re.compile(
    r'(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*\'([^\']*)\''
)


@dataclass
class Reference:
    post: Path
    line: int
    raw: str
    kind: str


@dataclass
class Report:
    missing: list[Reference] = field(default_factory=list)
    external: list[Reference] = field(default_factory=list)
    unsupported: list[Reference] = field(default_factory=list)
    referenced: set[Path] = field(default_factory=set)


def normalize_path_parts(path: Path) -> Path:
    parts = [unicodedata.normalize("NFC", part) for part in path.parts]
    return Path(*parts)


def normalize_raw_path(raw: str) -> str:
    return unicodedata.normalize("NFC", raw)


def iter_markdown_files(content_root: Path) -> list[Path]:
    posts_root = content_root / "posts"
    if posts_root.exists():
        return sorted(posts_root.rglob("*.md"))
    return sorted(content_root.rglob("*.md"))


def collect_image_paths(images_root: Path) -> set[Path]:
    paths: set[Path] = set()
    for path in images_root.rglob("*"):
        if path.is_file() and path.name != ".DS_Store":
            paths.add(normalize_path_parts(path.relative_to(images_root)))
    return paths


def parse_shortcode_args(arg_text: str) -> dict[str, str]:
    args: dict[str, str] = {}
    for match in SHORTCODE_ARG_RE.finditer(arg_text):
        if match.group(1):
            args[match.group(1)] = match.group(2)
        elif match.group(3):
            args[match.group(3)] = match.group(4)
    return args


def extract_references(text: str) -> list[tuple[int, str, str]]:
    refs: list[tuple[int, str, str]] = []
    lines = text.splitlines()

    for line_no, line in enumerate(lines, start=1):
        for match in MARKDOWN_IMAGE_RE.finditer(line):
            refs.append((line_no, "markdown", match.group(1).strip()))

        for match in THEME_IMAGE_RE.finditer(line):
            args = parse_shortcode_args(match.group(1))
            for key in ("light", "dark", "src", "image"):
                value = args.get(key)
                if value:
                    refs.append((line_no, f"theme-image:{key}", value.strip()))

    return refs


def resolve_image_path(raw: str, content_root: Path, images_root: Path) -> Path | None:
    raw = normalize_raw_path(raw)

    if raw.startswith(("http://", "https://", "//", "data:")):
        return None

    if raw.startswith("/images/"):
        return images_root / raw.removeprefix("/images/")

    if raw.startswith("images/"):
        return content_root.parent / raw

    if raw.startswith("/"):
        return content_root.parent / raw.lstrip("/")

    return content_root.parent / raw


def check_posts(content_root: Path, images_root: Path) -> Report:
    report = Report()
    md_files = iter_markdown_files(content_root)

    for md_path in md_files:
        text = md_path.read_text(encoding="utf-8")
        refs = extract_references(text)

        for line_no, kind, raw in refs:
            resolved = resolve_image_path(raw, content_root, images_root)

            if resolved is None:
                report.external.append(
                    Reference(post=md_path, line=line_no, raw=raw, kind=kind)
                )
                continue

            if not raw.startswith("/images/"):
                report.unsupported.append(
                    Reference(post=md_path, line=line_no, raw=raw, kind=kind)
                )
                continue

            rel = normalize_path_parts(resolved.relative_to(images_root))
            report.referenced.add(rel)

            if not resolved.exists():
                report.missing.append(
                    Reference(post=md_path, line=line_no, raw=raw, kind=kind)
                )

    return report


def print_report(report: Report, images_root: Path, content_root: Path) -> int:
    actual = collect_image_paths(images_root)
    unused = sorted(path for path in actual if path not in report.referenced)
    missing_count = len(report.missing)

    print(f"Checked posts under: {content_root / 'posts'}")
    print(f"Checked images under: {images_root}")
    print()

    if report.missing:
        print("[Missing]")
        for ref in report.missing:
            rel_post = ref.post.relative_to(content_root.parent)
            print(f"- {rel_post}:{ref.line} [{ref.kind}] {ref.raw}")
        print()

    if report.external:
        print("[External]")
        for ref in report.external:
            rel_post = ref.post.relative_to(content_root.parent)
            print(f"- {rel_post}:{ref.line} [{ref.kind}] {ref.raw}")
        print()

    if report.unsupported:
        print("[Unsupported]")
        for ref in report.unsupported:
            rel_post = ref.post.relative_to(content_root.parent)
            print(f"- {rel_post}:{ref.line} [{ref.kind}] {ref.raw}")
        print()

    if unused:
        print("[Unused]")
        for path in unused:
            print(f"- {images_root / path}")
        print()

    print(
        f"Summary: {missing_count} missing, "
        f"{len(report.external)} external, "
        f"{len(report.unsupported)} unsupported, "
        f"{len(unused)} unused"
    )

    return 1 if missing_count else 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check that Hugo post image references match files under static/images."
    )
    parser.add_argument(
        "content_dir",
        nargs="?",
        default="content",
        help="Content directory path (default: ./content)",
    )
    parser.add_argument(
        "--images-dir",
        default="static/images",
        help="Images directory path (default: ./static/images)",
    )
    args = parser.parse_args()

    content_root = Path(args.content_dir)
    images_root = Path(args.images_dir)

    if not content_root.exists():
        print(f"[ERROR] Content directory not found: {content_root}", file=sys.stderr)
        return 1

    if not images_root.exists():
        print(f"[ERROR] Images directory not found: {images_root}", file=sys.stderr)
        return 1

    report = check_posts(content_root, images_root)
    return print_report(report, images_root, content_root)


if __name__ == "__main__":
    raise SystemExit(main())
