---
title: "TIL. Aug 19, 2026"
date: 2026-08-19T23:47:41+09:00

categories:
  - TIL
series:
tags:
  - Hugo
features:
  - jsxgraph

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 1386. Cinema Seat Allocation]({{< relref "ps/2026/ps-leetcode-1386-cinema-seat-allocation" >}})
  - [Codeforces 478B. Random Teams]({{< relref "ps/2026/ps-codeforces-478b-random-teams" >}})
- 블로그
  - JSXGraph 기능 추가
  - ToC UI 추가 (데스크톱, 모바일)
  - 블로그 카테고리, 시리즈, 태그 정리
- devbox-light-server
  - HTTP API Endpoint 문서, README 정리
  - HTTP 계약 테스트 추가.

### JSXGraph 기능 추가

블로그에 수식 그래프를 그릴 방법이 없었다. [최고의 집합]({{< relref "ps/2025/ps-programmers-best-set" >}}) 문제 하나만 그래프가 필요했는데, 외부 사이트에서 그린 다음, 그걸 가져와서 이미지로 사용하고 있었다.

그런데 이번에 Random Teams 문제 풀면서 2차함수 그래프로 그리면 설명이 깔끔하게 되는 것 같아서, 수식 그래프를 도입했다.

{{< jsxgraph
  id="test-functions"
  functions="sin(x)"
  boundingbox="-3,2,3,-2"
>}}

기존에 있던 기능인 Mermaid와 Katex와 마찬가지로 프론트매터에서 명시적으로 JSXGraph를 사용한다고 해야만, 기능이 로드되도록 했다. 필요 없는 경우도 항상 메모리에 로드할 필요는 없으니까 (특히 Mermaid는 3mb가 넘는다)

### ToC UI 추가

글 내부 목차를 글 보는 도중에도 볼 수 있도록 ToC를 추가했다. Paper Mode에 기본 ToC가 있는지는 몰랐는데, 그걸 기반으로 sticky sidebar 형식으로 구현해서 글을 읽으면서도 계속 따라오는 방식으로 만들었다. 더해서 현재 읽는 섹션을 하이라이팅 하도록 했다.

만들면서 몇 가지 이슈가 있었는데.

1. 모바일과 데스크톱 환경 차이 -> 너비가 1080p 이상인 경우에만 사이드바로 뜨게 했다, 미만인 경우에는 최상단에 고정되어 나타난다.
2. 맨 아래 섹션이 하이라이팅이 되지 않는 문제 -> 맨 아래 섹션의 내용이 적은 경우에 발생하는데, 최하단에 도달한 경우엔 맨 아래 섹션이 하이라이팅되도록 했다.
3. 너무 섹션이 긴 경우에 사이드바가 화면 밖으로 넘어가는 문제 -> 사이드바에도 스크롤을 만들어 하이라이팅을 자동으로 따라가게 했다.

생각보다 구현이 잘 된 것 같아서 만족한다.

{{< video src="video-001-optimized-video.mp4" autoplay="true" loop="true" caption="비디오" align="center" >}}

### 블로그 카테고리, 시리즈, 태그 정리

태그는 대소문자, 두문자, 일회성 태그들을 우선 정리했다. PS는 중간부터 자체적인 태그 시스템을 사용하도록 했는데, 일반 태그가 달려있던 것을 싹 제거했다.

시리즈도 많이 제거했는데, 특히 CS에서 시리즈로 잡혀있던 Network, os, algorithm 이런 항목들을 다 태그로 내렸다.

### devbox-light-server

실제 구현에 맞게 README와 API 문서를 정리하고 HTTP API 계약 테스트를 추가했다.

통합 테스트는 서버 내부의 함수만 따로 호출하는 대신, 실제 클라이언트처럼 HTTP 요청을 보내 라우터·서비스·저장소·에러 핸들러가 함께 동작하는지를 확인하는 테스트다. supertest를 사용해 실제 포트를 열지 않고 Express 앱에 요청을 보냈다.

## 다음에 할 것

- Stack Day MVP가 중간에 결정사항들이 많아서 늦어지는데 금요일까지 MVP 완성하기
- devbox-light-server에 Multipart 기능 추가.
