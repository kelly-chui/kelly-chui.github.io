---
title: "TestPost"
date: 2026-07-03T12:40:24+09:00

categories:
  - Archive
series: []
tags: []
features:
  - mermaid

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
