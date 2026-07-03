from pathlib import Path
import re

POSTS_DIR = Path("content/posts")
SERIES_NAME = "The Swift Programming Language"

SERIES_ORDER = [
    "The Basics",
    "Basic Operators",
    "Strings and Characters",
    "Collection Types",
    "Control Flow",
    "Functions",
    "Closures",
    "Enumerations",
    "Structures and Classes",
    "Properties",
    "Methods",
    "Subscripts",
    "Inheritance",
    "Initialization",
    "Deinitialization",
    "Optional Chaining",
    "Error Handling",
    "Concurrency",
    "Macros",
    "Type Casting",
    "Nested Types",
    "Extensions",
    "Protocols",
    "Generics",
    "Opaque and Boxed Protocol Types",
    "Automatic Reference Counting",
    "Memory Safety",
    "Access Control",
    "Advanced Operators",
]

TOPIC_MAP = {
    "function": "Functions",
    "functions": "Functions",
    "함수": "Functions",

    "closure": "Closures",
    "closures": "Closures",
    "클로저": "Closures",

    "enumeration": "Enumerations",
    "enumerations": "Enumerations",
    "열거형": "Enumerations",

    "structure": "Structures and Classes",
    "structures": "Structures and Classes",
    "class": "Structures and Classes",
    "classes": "Structures and Classes",
    "구조체": "Structures and Classes",
    "클래스": "Structures and Classes",

    "structures and classes": "Structures and Classes",
    "structures-and-classes": "Structures and Classes",
    "structuresandclasses": "Structures and Classes",
    "스트럭처와 클래스": "Structures and Classes",
    "스트럭처와-클래스": "Structures and Classes",

    "property": "Properties",
    "properties": "Properties",
    "프로퍼티": "Properties",

    "method": "Methods",
    "methods": "Methods",
    "메소드": "Methods",

    "subscript": "Subscripts",
    "subscripts": "Subscripts",
    "서브스크립트": "Subscripts",

    "inheritance": "Inheritance",
    "상속": "Inheritance",

    "initialization": "Initialization",
    "초기화": "Initialization",

    "deinitialization": "Deinitialization",
    "초기화 해제": "Deinitialization",

    "optional chaining": "Optional Chaining",
    "옵셔널 체이닝": "Optional Chaining",
    "옵셔널체이닝": "Optional Chaining",

    "error handling": "Error Handling",
    "에러 처리": "Error Handling",
    "에러처리": "Error Handling",

    "concurrency": "Concurrency",
    "동시성": "Concurrency",

    "macro": "Macros",
    "macros": "Macros",
    "매크로": "Macros",

    "type casting": "Type Casting",
    "타입 캐스팅": "Type Casting",

    "nested types": "Nested Types",
    "중첩 타입": "Nested Types",

    "extension": "Extensions",
    "extensions": "Extensions",
    "익스텐션": "Extensions",

    "protocol": "Protocols",
    "protocols": "Protocols",
    "프로토콜": "Protocols",

    "generic": "Generics",
    "generics": "Generics",
    "제네릭": "Generics",

    "opaque type": "Opaque and Boxed Protocol Types",
    "opaque types": "Opaque and Boxed Protocol Types",
    "불투명 타입": "Opaque and Boxed Protocol Types",
    "opaque type": "Opaque and Boxed Protocol Types",
    "opaque types": "Opaque and Boxed Protocol Types",
    "opaque boxed protocol types": "Opaque and Boxed Protocol Types",
    "opaque and boxed protocol types": "Opaque and Boxed Protocol Types",
    "불투명 타입": "Opaque and Boxed Protocol Types",
    "불투명타입": "Opaque and Boxed Protocol Types",

    "arc": "Automatic Reference Counting",
    "automatic reference counting": "Automatic Reference Counting",
    "automaticreferencecounting": "Automatic Reference Counting",
    "자동참조카운팅": "Automatic Reference Counting",
    "자동 참조 카운팅": "Automatic Reference Counting",

    "memory safety": "Memory Safety",
    "메모리 안전": "Memory Safety",

    "access control": "Access Control",
    "액세스 컨트롤": "Access Control",

    "advanced operators": "Advanced Operators",
}

ORDER_MAP = {name: i for i, name in enumerate(SERIES_ORDER)}

posts = []

for path in POSTS_DIR.glob("*.md"):
    text = path.read_text(encoding="utf-8")

    if f'series: ["{SERIES_NAME}"]' not in text:
        continue

    tag_match = re.search(r'^tags:\s*\[(.*?)\]', text, re.MULTILINE)
    if not tag_match:
        print(f"Skip (tags): {path.name}")
        continue

    raw_tags = [
        t.strip().strip('"').strip("'")
        for t in tag_match.group(1).split(",")
    ]

    topic = None

    for tag in raw_tags:
        key = " ".join(tag.lower().split())
        if key in TOPIC_MAP:
            topic = TOPIC_MAP[key]
            break

    if topic is None:
        print(f"Skip (topic): {path.name}")
        continue

    part_match = re.search(r'-(\d+)\.md$', path.name)
    part = int(part_match.group(1)) if part_match else 999

    posts.append({
        "path": path,
        "topic": topic,
        "part": part,
        "text": text,
    })

posts.sort(
    key=lambda p: (
        ORDER_MAP[p["topic"]],
        p["part"],
    )
)

for weight, post in enumerate(posts, start=1):
    text = post["text"]

    new_tags = (
        f'tags: ["{SERIES_NAME}", "Swift", "{post["topic"]}"]'
    )

    text = re.sub(
        r'^tags:\s*\[.*?\]',
        new_tags,
        text,
        flags=re.MULTILINE,
    )

    if re.search(r'^weight:\s*\d+', text, re.MULTILINE):
        text = re.sub(
            r'^weight:\s*\d+',
            f'weight: {weight}',
            text,
            flags=re.MULTILINE,
        )
    else:
        text = re.sub(
            r'^draft:',
            f'weight: {weight}\n\ndraft:',
            text,
            count=1,
            flags=re.MULTILINE,
        )

    post["path"].write_text(text, encoding="utf-8")

    print(f'{weight:2d}. {post["topic"]:<35} {post["path"].name}')

print(f"\nUpdated {len(posts)} posts.")
