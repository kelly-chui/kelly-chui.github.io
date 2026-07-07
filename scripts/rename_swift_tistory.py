from pathlib import Path
import re
import shutil
import unicodedata

POSTS_ROOT = Path("content/posts")
IMAGES_ROOT = Path("static/images")
TISTORY_IMAGES_ROOT = IMAGES_ROOT / "tistory"

SERIES_SLUG = "the-swift-programming-language"

DRY_RUN = False


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9가-힣]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text


def extract_front_matter_value(text: str, key: str) -> str | None:
    match = re.search(rf"^{key}:\s*(.+)$", text, re.MULTILINE)
    if not match:
        return None

    value = match.group(1).strip()
    return value.strip('"')


def extract_topic_and_part(old_stem: str) -> tuple[str, str | None]:
    # tistory-127-Swift-Generics제네릭-4
    name = re.sub(r"^tistory-\d+-Swift-", "", old_stem)

    part = None
    part_match = re.search(r"-(\d+)$", name)
    if part_match:
        part = part_match.group(1)
        name = name[:part_match.start()]

    english_match = re.match(r"[A-Za-z0-9-]+", name)
    topic = english_match.group(0) if english_match else name

    return slugify(topic), part


def make_new_stem(md_path: Path, text: str) -> str:
    old_stem = md_path.stem

    weight = extract_front_matter_value(text, "weight")
    if weight is None or not weight.isdigit():
        raise ValueError(f"weight 없음 또는 숫자 아님: {md_path}")

    topic, part = extract_topic_and_part(old_stem)

    new_stem = f"{SERIES_SLUG}-{int(weight):02d}-{topic}"

    if part:
        new_stem += f"-{part}"

    return new_stem


def process_post(md_path: Path):
    old_stem = md_path.stem
    text = md_path.read_text(encoding="utf-8")

    new_stem = make_new_stem(md_path, text)
    new_md_path = md_path.with_name(f"{new_stem}.md")

    old_image_dir = TISTORY_IMAGES_ROOT / old_stem
    new_image_dir = IMAGES_ROOT / new_stem

    new_text = text.replace(
        f"/images/tistory/{old_stem}/",
        f"/images/{new_stem}/",
    )

    print(f"{md_path}")
    print(f"  -> {new_md_path}")

    if old_image_dir.exists():
        print(f"{old_image_dir}")
        print(f"  -> {new_image_dir}")

    if DRY_RUN:
        return

    md_path.write_text(new_text, encoding="utf-8")

    if old_image_dir.exists():
        if new_image_dir.exists():
            shutil.rmtree(new_image_dir)
        shutil.move(str(old_image_dir), str(new_image_dir))

    if md_path != new_md_path:
        md_path.rename(new_md_path)


def main():
    md_files = sorted(POSTS_ROOT.glob("tistory-*-Swift-*.md"))

    for md_path in md_files:
        process_post(md_path)

    print(f"\n총 {len(md_files)}개 처리 대상")


if __name__ == "__main__":
    main()