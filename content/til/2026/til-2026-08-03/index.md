---
title: "TIL. Aug 3, 2026"
date: 2026-08-03T23:31:07+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
aliases:
  - /posts/til-2026-08-03/
---

## 오늘 한 내용

- LeetCode 1406 Stone Game III
- Codeforces 520B Two Buttons
- WWDC `Meet async/await in Swift` 세션 시청 및 정리.

## 배운 내용

### PS

LeetCode 1406은 현재 차례인 플레이어가 상대보다 확보할 수 있는 최대 점수 차이를 DP로 정의해 풀었다. 누가 Alice인지 Bob인지에 따라 상태를 나누지 않아도, 현재 상태를 점수 차이로 표현하면 같은 점화식으로 문제를 풀 수 있다.

점화식이 안떠올라서 힌트를 보고 풀었다.

Codeforces 520B는 두 연산을 그래프의 간선으로 보고 BFS로 최단 거리를 구했다. 다만 목표값이 시작값보다 작을 때는 2배 연산이 도움이 되지 않으므로, 단순히 1씩 감소시키는 경우를 분리해 처리했다.

### Meet async/await in Swift

단순히 async/await를 편의성 정도로만 생각했는데, completion handler 기반 비동기 코드는 모든 실행 경로에서 completion을 정확히 한 번 호출해야 해서, 코드가 길어지고 누락으로 인한 버그가 생기기 쉽다. `async/await`는 비동기 작업의 순서를 일반적인 동기 코드처럼 읽히게 만들고, `throws`와 함께 오류 전달 경로도 더 명확하게 표현한다는 것을 알게되었다.

XCTest의 `async` 테스트, 동기 컨텍스트에서 비동기 작업을 시작하는 `Task`, 기존 completion handler API를 async alternative로 연결하는 continuation도 함께 살펴봤다. SwiftUI에서는 화면 생명주기에 맞춰 작업을 관리할 때 `.onAppear` 안의 `Task`보다 `.task(id:)`가 더 적절할 수 있다는 점도 기억해 두자.

## 해결 내용

- 아직 async alternative가 없는 기존 API는 continuation을 사용해 `async/await` 형태로 감쌀 수 있다. 이때 continuation을 한 번만 재개(resume)하고, 모든 실행 경로에서 재개되도록 관리해야 한다.

## 내일 할 것

- 블로그 katex 렌더링이 예쁘지 않다. 폰트 사이즈 같은 것 좀 줄여야 할 것 같다.
- stack day MVP
