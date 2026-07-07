from pathlib import Path
import re

POSTS_ROOT = Path("content/posts")
DRY_RUN = False

PREFIX = "the-swift-programming-language-"


def title_case(text: str) -> str:
    return " ".join(word.capitalize() for word in text.split())


def build_title(stem: str) -> str | None:
    if not stem.startswith(PREFIX):
        return None

    body = stem[len(PREFIX):]

    # weight 제거
    body = re.sub(r"^\d+-", "", body)

    part = None

    # 마지막이 -숫자 이면 part
    m = re.match(r"(.+)-(\d+)$", body)
    if m:
        body = m.group(1)
        part = m.group(2)

    topic = title_case(body.replace("-", " "))

    title = f"The Swift Programming Language. {topic}"

    if part is not None:
        title += f" ({part})"

    return title


def replace_title(text: str, title: str) -> str:
    return re.sub(
        r'^title:\s*".*?"$',
        f'title: "{title}"',
        text,
        count=1,
        flags=re.MULTILINE,
    )


def process(path: Path):
    title = build_title(path.stem)
    if title is None:
        return

    content = path.read_text(encoding="utf-8")
    new_content = replace_title(content, title)

    print(path.name)
    print(f"  -> {title}")

    if not DRY_RUN:
        path.write_text(new_content, encoding="utf-8")


def main():
    for path in sorted(POSTS_ROOT.glob("the-swift-programming-language-*.md")):
        process(path)


if __name__ == "__main__":
    main()