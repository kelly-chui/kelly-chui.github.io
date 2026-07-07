from pathlib import Path
import re
import shutil
import unicodedata

POSTS_ROOT = Path("content/posts")
IMAGES_ROOT = Path("static/images")
TISTORY_IMAGES_ROOT = IMAGES_ROOT / "tistory"

DRY_RUN = False


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9가-힣ぁ-んァ-ン一-龥-]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "untitled"


def make_new_stem(old_stem: str) -> str | None:
    stem = re.sub(r"^tistory-\d+-", "", old_stem)

    boj_match = re.match(r"백준BOJ-(\d+)-(.+)", stem)
    if boj_match:
        number = boj_match.group(1)
        title = slugify(boj_match.group(2))
        return f"ps-boj-{number}-{title}"

    programmers_match = re.match(r"프로그래머스-(.+)", stem)
    if programmers_match:
        title = slugify(programmers_match.group(1))
        return f"ps-programmers-{title}"

    return None


def process_post(md_path: Path):
    old_stem = md_path.stem
    new_stem = make_new_stem(old_stem)

    if new_stem is None:
        return

    new_md_path = md_path.with_name(f"{new_stem}.md")

    old_image_dir = TISTORY_IMAGES_ROOT / old_stem
    new_image_dir = IMAGES_ROOT / new_stem

    text = md_path.read_text(encoding="utf-8")
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
    md_files = sorted(POSTS_ROOT.glob("tistory-*.md"))

    for md_path in md_files:
        process_post(md_path)

    print(f"\n총 {len(md_files)}개 검사")


if __name__ == "__main__":
    main()
