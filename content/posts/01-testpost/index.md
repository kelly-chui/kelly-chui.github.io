---
title: "TestPost"
date: 2026-07-03T12:40:24+09:00

categories:
  - Archive
series: []
tags: []
features:
  - mermaid
  - katex

draft: true
original: ""
---

## Theme Image

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Raw Markdown Image

![](image-001.gif#center)

![마크다운 이미지 캡션 예시](image-001.gif "마크다운 제목")

## Mermaid

```mermaid
classDiagram
    class Post {
        +String title
        +render()
    }

    class Feature {
        +String name
    }

    Post "1" o-- "*" Feature : enables
```

## KaTeX

인라인 수식 \\(a^2 + b^2 = c^2\\)과 블록 수식을 함께 테스트한다.

$$
E = mc^2
$$

## Callout

{{< callout type="note" title="참고" >}}
이 블록은 참고용 정보를 담을 때 씁니다.
{{< /callout >}}

{{< callout type="tip" title="팁" >}}
짧은 조언이나 추천은 tip으로 두면 읽는 흐름이 좋습니다.
{{< /callout >}}

{{< callout type="warning" title="주의" >}}
색이 너무 많아지면 페이지의 톤이 깨질 수 있습니다.
{{< /callout >}}

{{< callout type="danger" title="위험" >}}
정말 중요한 경고는 적게, 하지만 확실하게 보여주는 편이 좋습니다.
{{< /callout >}}
