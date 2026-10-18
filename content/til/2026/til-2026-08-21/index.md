---
title: "TIL. Aug 21, 2026"
date: 2026-08-21T22:54:21+09:00

categories:
  - TIL
series:
tags:
  - Software Architecture
  - Error Handling
  - Dynamic Programming
  - Binary Search

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [Codeforces 698A. Vacations]({{< relref "ps/2026/ps-codeforces-698a-vacations" >}})
  - [LeetCode 3116. Kth Smallest Amount With Single Denomination]({{< relref "ps/2026/ps-leetcode-3116-kth-smallest-amount-with-single-denomination" >}})
- devbox-light-server
  - [디렉토리와 계층 구조 정리]({{< relref "posts/devbox-light-server-08-layered-architecture" >}})
  - [에러 처리 경계와 테스트 구조 정리]({{< relref "posts/devbox-light-server-09-error-boundaries-and-tests" >}})

### 디렉토리, 에러 구조화

어떤 모듈이 다른 모듈을 호출하고, 어떤 책임을 가져야 하고, 의존성 방향은 어떻게 되고, 이런 것들을 관리하기 위해서 아키텍처를 다루는데, 에러를 구조화하지 못하고 있었다.

Repository 구현체에서 라우트까지 에러가 그대로 전달되면서 세부 구현 사항이 줄줄 세고 있었는데 이걸 보고 에러를 구조화 해야겠다고 생각했다.

에러를 구조화하기 위해서 디렉토리부터 한번 싹 갈아엎었는데, 기존에 인지는 하고 있었지만 '가벼운 Mock' 서버라는 컨셉으로 그냥 냅뒀던 안티 패턴들도 이번 기회에 싹 엎었다. (디렉토리구조가 아키텍처를 단 하나도 반영하지 못한다.)

### 포함-배제 원리

LeetCode 3116 문제를 풀면서 포함-배제 원리를 써야 했다. 문제에서 배수의 개수를 세어야 하는데, 아무래도 LCM 덕분에 두 번 셀 수도 있으니 중복 카운팅된 것은 제거해야 한다.

생각해보면 너무 당연한 것이긴 한데, 이게 은근히 떠올리기가 쉽지 않다. 그리고 문제에 따라서 구현도 생각보다 복잡하다.

이번 문제에서는 비트마스킹 대신 DFS로 모든 부분집합을 순회하면서 포함-배제를 적용했다. Swift에는 자체적인 비트마스킹 연산이 존재하는데(공부만 했고 써본적은 없다), 그냥 DFS가 더 빠를 것 같았다.

## 다음에 할 것

- Stack Day MVP 완성하기
- devbox-light-server 계층별 테스트와 문서 계속 정리하기
