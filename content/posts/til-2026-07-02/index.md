---
title: "TIL. Jul 2, 2026"
date: 2026-07-02

categories:
  - TIL
tags:
  - 0-1 BFS
  - Content Migration
  - Hugo

draft: false
original: "https://junmusu.tistory.com/200"
---

# 요약

오늘은 0-1 BFS를 문제에 적용해 보면서 알고리즘 선택의 중요성을 느꼈다. 또한 티스토리 블로그를 Hugo로 이전하기 위한 마이그레이션 스크립트를 작성하며 HTML을 Markdown으로 변환했다.

## 배운 것

### 0-1 BFS

- LeetCode 3286. Find a Safe Walk Through a Grid
- 사용 언어: Python, Swift
- 사용 알고리즘: Dijkstra, 0-1 BFS

그동안은 거리 개념이 나오면 무조건 다익스트라를 사용했는데, 처음으로 0-1 BFS를 이용해서 문제를 풀었다. 같은 문제를 Python에서는 다익스트라로 풀었고. 0-1 BFS는 Swift로 풀었다.  
기존에 Swift에서 BFS를 사용할 때는 배열과 인덱스 포인터를 이용한 유사 Queue를 사용했는데, 이 방식으로는 큐의 헤드에 원소를 push하는 메소드를 구현하기 어려워서 배열을 사용했다. 문제의 제약조건이 널널해서 배열로 충분히 통과했는데, 어떻게 해야할지는 고민해봐야 할 것 같다. Linked List를 이용해서 큐를 만들면 되지만, 이게 힙와 다익스트라를 쓰는 것보다 코드를 작성하는 입장에서 효율적일지는 잘 모르겠다.

### Hugo 블로그 마이그레이션

티스토리에서 Hugo 기반의 정적 블로그로 이전하기 위해 파이썬으로 마이그레이션 스크립트를 만들기 시작했다.

처음에는 단순히 HTML을 Markdown으로 변환하면 끝날 줄 알았는데, 실제로는 코드 블록, 태그, 제목, 카테고리, 날짜, 이미지 등 생각보다 손봐야 할 부분이 많았다. 특히 `<pre>` 태그를 fenced code block으로 변환하고 언어까지 복원하는 과정은 직접 수정하면서 구현해야 했다.

이번 작업을 하면서 BeautifulSoup와 html2text를 처음 사용해봤는데, HTML을 다루기 위한 라이브러리로 상당히 만족스러웠다. AI가 기본적인 구조를 만들어 줘서, 그 구조에 함수를 붙이는 방식으로 쉽게 포스트를 마크다운으로 뽑아낼 수 있었다.

## 남은 의문

- Swift에서 0-1 BFS를 구현할 때 가장 적합한 Deque 자료구조는 무엇일까?
- HTML을 Markdown으로 변환할 때 일반화할 수 있는 규칙은 어디까지일까?

## 다음에 해볼 것

- Swift용 Deque 구현 또는 라이브러리 조사하기
- Hugo 마이그레이션 스크립트를 더 일반화하기
- Hugo shortcode와 이미지 처리까지 자동화하기
