---
title: "TIL. Jul 2, 2026"
date: 2026-07-02

categories:
series:
tags:
  - Content Migration
  - Hugo

draft: false
original: "https://junmusu.tistory.com/200"
aliases:
  - /posts/til-2026-07-02/
---

## 오늘의 기록

- PS
  - [LeetCode 3286. Find a Safe Walk Through a Grid]({{< relref "ps/2026/ps-leetcode-3286-find-a-safe-walk-through-a-grid" >}})
- Hugo 블로그 마이그레이션 스크립트 작성

### 0-1 BFS

그동안은 거리 개념이 나오면 무조건 다익스트라를 사용했는데, 처음으로 0-1 BFS를 이용해서 문제를 풀었다. 같은 문제를 Python에서는 다익스트라로 풀었고. 0-1 BFS는 Swift로 풀었다.  

기존에 Swift에서 BFS를 사용할 때는 배열과 인덱스 포인터를 이용한 유사 Queue를 사용했는데, 이 방식으로는 큐의 헤드에 원소를 push하는 메소드를 구현하기 어려워서 배열을 사용했다. 

문제의 제약조건이 널널해서 배열로 충분히 통과했는데, 어떻게 해야할지는 고민해봐야 할 것 같다. Linked List를 이용해서 큐를 만들면 되지만, 이게 힙와 다익스트라를 쓰는 것보다 코드를 작성하는 입장에서 효율적일지는 잘 모르겠다.

### Hugo 블로그 마이그레이션

티스토리에서 Hugo 기반의 정적 블로그로 이전하기 위해 파이썬으로 마이그레이션 스크립트를 만들기 시작했다.

처음에는 단순히 HTML을 Markdown으로 변환하면 끝날 줄 알았는데, 실제로는 코드 블록, 태그, 제목, 카테고리, 날짜, 이미지 등 생각보다 손봐야 할 부분이 많았다. 특히 `<pre>` 태그를 fenced code block으로 변환하고 언어까지 복원하는 과정은 직접 수정하면서 구현해야 했다.

이번 작업을 하면서 BeautifulSoup와 html2text를 처음 사용해봤는데, HTML을 다루기 위한 라이브러리로 상당히 만족스러웠다. AI가 기본적인 구조를 만들어 줘서, 그 구조에 함수를 붙이는 방식으로 쉽게 포스트를 마크다운으로 뽑아낼 수 있었다.

HTML을 Markdown으로 변환할 때 일반화할 수 있는 규칙은 어디까지일지 더 고민해봐야 한다.

## 다음에 할 것

- Hugo 마이그레이션 스크립트를 더 일반화하기
- Hugo shortcode와 이미지 처리까지 자동화하기
