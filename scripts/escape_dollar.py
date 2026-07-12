#!/usr/bin/env python3
"""
Hugo /content/ 내 모든 .md 파일에서
front matter, 코드블록을 제외하고 $ -> \$ 이스케이프 처리
"""

import os
import re
import sys
from pathlib import Path

def escape_dollars_in_content(text: str) -> tuple[str, list[int]]:
    """
    front matter, 코드블록(``` 및 인라인 `)을 제외하고
    $ -> \$ 로 변환. 변경된 줄 번호 목록도 반환.
    """
    lines = text.split("\n")
    result = []
    changed_lines = []

    in_front_matter = False
    front_matter_done = False
    in_fenced_code = False  # ``` 블록

    for i, line in enumerate(lines, start=1):
        # ── Front matter 처리 ──────────────────────────────────────────
        if i == 1 and line.strip() == "---":
            in_front_matter = True
            result.append(line)
            continue

        if in_front_matter:
            result.append(line)
            if line.strip() == "---":
                in_front_matter = False
                front_matter_done = True
            continue

        # ── Fenced code block (```) 토글 ───────────────────────────────
        if re.match(r"^```", line):
            in_fenced_code = not in_fenced_code
            result.append(line)
            continue

        # ── 코드블록 안이면 그대로 ────────────────────────────────────
        if in_fenced_code:
            result.append(line)
            continue

        # ── 일반 텍스트: 인라인 코드(`) 구간 제외하고 $ 이스케이프 ───
        new_line = escape_dollars_outside_inline_code(line)
        if new_line != line:
            changed_lines.append(i)
        result.append(new_line)

    return "\n".join(result), changed_lines


def escape_dollars_outside_inline_code(line: str) -> str:
    """
    인라인 코드(` ... `) 바깥의 $ 만 \$ 로 바꾼다.
    이미 이스케이프된 \$ 는 건드리지 않는다.
    """
    result = []
    in_code = False
    j = 0
    while j < len(line):
        ch = line[j]

        # 인라인 코드 토글
        if ch == "`":
            in_code = not in_code
            result.append(ch)
            j += 1
            continue

        # 이미 이스케이프된 \$ 는 그대로
        if ch == "\\" and j + 1 < len(line) and line[j + 1] == "$":
            result.append("\\$")
            j += 2
            continue

        # 이스케이프 대상
        if ch == "$" and not in_code:
            result.append("\\$")
            j += 1
            continue

        result.append(ch)
        j += 1

    return "".join(result)


def process_directory(content_dir: str, dry_run: bool = False):
    content_path = Path(content_dir)
    if not content_path.exists():
        print(f"[ERROR] 디렉토리를 찾을 수 없어요: {content_dir}")
        sys.exit(1)

    md_files = sorted(content_path.rglob("*.md"))
    affected = []  # (파일경로, 변경된 줄 목록)

    for md_file in md_files:
        original = md_file.read_text(encoding="utf-8")
        converted, changed_lines = escape_dollars_in_content(original)

        if changed_lines:
            affected.append((md_file, changed_lines))
            if not dry_run:
                md_file.write_text(converted, encoding="utf-8")

    # ── 결과 출력 ──────────────────────────────────────────────────────
    print("=" * 60)
    if dry_run:
        print("  [DRY RUN] 실제 파일은 수정되지 않았어요.")
    else:
        print("  $ 이스케이프 처리 완료!")
    print("=" * 60)

    if not affected:
        print("\n✅ $ 가 포함된 파일이 없어요. 아무것도 변경되지 않았습니다.")
        return

    print(f"\n📝 영향받은 파일: {len(affected)}개\n")
    for filepath, lines in affected:
        rel = filepath.relative_to(content_path)
        print(f"  📄 {rel}")
        print(f"     변경된 줄: {lines}\n")

    print("=" * 60)
    print("위 파일들을 직접 확인해 보세요! 😊")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Hugo /content/ 내 .md 파일의 $ 를 이스케이프합니다."
    )
    parser.add_argument(
        "content_dir",
        nargs="?",
        default="content",
        help="content 디렉토리 경로 (기본값: ./content)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="파일을 실제로 수정하지 않고 영향받을 파일 목록만 출력",
    )
    args = parser.parse_args()

    process_directory(args.content_dir, dry_run=args.dry_run)
