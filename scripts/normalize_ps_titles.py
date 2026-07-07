from pathlib import Path
import re

POSTS_ROOT = Path("content/posts")
DRY_RUN = False


def yaml_quote(text: str) -> str:
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


def make_title_from_stem(stem: str) -> str | None:
    # ps-boj-3055-탈출
    boj = re.match(r"ps-boj-(\d+)-(.+)", stem)
    if boj:
        number = boj.group(1)
        title = boj.group(2).replace("-", " ")
        return f"BOJ {number}. {title}"

    # ps-programmers-순위-검색
    programmers = re.match(r"ps-programmers-(.+)", stem)
    if programmers:
        title = programmers.group(1).replace("-", " ")
        return f"Programmers. {title}"

    # ps-leetcode-1301
    leetcode = re.match(r"ps-leetcode-(\d+)(?:-(.+))?", stem)
    if leetcode:
        number = leetcode.group(1)
        title = leetcode.group(2)

        if title:
            return f"LeetCode {number}. {title.replace('-', ' ')}"

        return f"LeetCode {number}"

    return None


def replace_title(text: str, new_title: str) -> str:
    if not text.startswith("---"):
        return text

    return re.sub(
        r'^title:\s*.*$',
        f"title: {yaml_quote(new_title)}",
        text,
        count=1,
        flags=re.MULTILINE,
    )


def process_post(md_path: Path):
    new_title = make_title_from_stem(md_path.stem)

    if new_title is None:
        return

    text = md_path.read_text(encoding="utf-8")
    new_text = replace_title(text, new_title)

    print(f"{md_path}")
    print(f"  title -> {new_title}")

    if DRY_RUN:
        return

    md_path.write_text(new_text, encoding="utf-8")


def main():
    md_files = sorted(POSTS_ROOT.glob("ps-*.md"))

    for md_path in md_files:
        process_post(md_path)

    print(f"\n총 {len(md_files)}개 검사")


if __name__ == "__main__":
    main()
