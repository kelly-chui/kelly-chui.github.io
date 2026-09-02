---
title: "TIL. Sep 2, 2026"
date: 2026-09-02T23:07:38+09:00

categories:
  - TIL
series:
tags:
  - Swift Concurrency

draft: false
original: ""
---

## 오늘의 기록

- Swift
  - [Swift Concurrency. Meet AsyncSequence - WWDC21]({{< relref "posts/wwdc-swift-concurrency-meet-asyncsequence" >}})
- PS
  - [Codeforces 2254E]({{< relref "ps/2026/ps-codeforces-2254e-chronostasis" >}})
  - [LeetCode 3875]({{< relref "ps/2026/ps-leetcode-3875-construct-uniform-parity-array-i" >}})

## Meet AsyncSequence - WWDC21

WWDC21 Meet AsyncSequence를 보고 정리했다. 

`AsyncSequence`는 비동기적으로 만들어지는 여러 값을 순서대로 꺼내 읽는 추상화다. 네트워크 응답을 한 줄씩 읽거나, 알림·파일 변경·위치 업데이트처럼 언제 도착할지 알 수 없는 이벤트를 다룰 때 사용한다.

일반 `Sequence`와 같이 iterator의 `next()`를 호출한다. 다음 값이 아직 준비되지 않았다면 task는 그 지점에서 일시 중단되고, 값이 도착하거나 시퀀스가 종료되거나 오류가 발생했을 때 재개된다.

Async Sequence도 다른 Swift Concurrency API와 마찬가지로 기존 Sequence에서 사용하던 문법들을 거의 그대로 사용할 수 있게 했다. `continue`, `break` 제어 뿐만 아니라 `map` 같은 고차 함수 까지 기존과 비슷한 감각으로 사용할 수 있다.

## WWDC21 Swift Concurrency 아주 짧은 회고

이번에 시청한 세션이 마지막 WWDC21 Swift Concurrency 세션일 것 같다. 현재 시청하고 정리한 WWDC21 세션은 다음과 같다:

- Meet async/await in Swift
- Explore structured concurrency in Swift
- Protect mutable states with Swift actors
- Swift Concurrency Behind the Scenes
- Meet AsyncSequence

정리 포스트에서도 여러 번 작성했지만, Swift Concurrency의 주요 컨셉을 다음과 같이 이해했다:

1. 비동기 코드의 흐름을 마치 동기 코드처럼 읽기 쉽게 만든다
2. Swift 언어 차원에서 비동기 코드를 관리하게 한다.

단순히 `async`, `await`로 콜백을 없애는 것 뿐만이 아니다.

- 에러 핸들링 관점에서는 비동기 작업의 에러도 `throw`, `try`, `catch`로 다루게 한다.
- Structured Concurrency는 자식 태스크의 생명주기를 스코프에 묶는다. (`@escaping`을 생각해보자)
- AsyncSequence는 비동기 값들을 기존 Sequence처럼 순회할 수 있게 한다.
- 공유 상태를 격리하는 액터는 클래스와 스트럭처처럼 프로퍼티와 메소드를 가진 타입으로 작성한다.

기존 Swift에서 익숙한 문법과 타입으로 비동기 코드의 흐름을 드러내면서 동시성까지 관리할 수 있게 하는게 주 목적인 것 같다.

물론 문제를 완벽하게 해결한 것은 아니라서, 미리 동작을 알아야 하는 부분도 있다. `await`의 전후 앱 상태가 변경될 수 있다는 점이라든지...

## PS

### Codeforces 2254E

[이 때 공부한]({{< relref "til/2026/til-2026-08-15">}}) 사용한 차분 배열을 다시 이용해야 하는 문제였다.

섞인 차분 배열 `b`를 재배치해 모든 원소가 양수인 수열 `a` 중 사전순으로 가장 작은 수열을 만들어야 한다. `a`는 `b`의 누적합이므로, 현재 누적합을 양수로 유지하는 값 중 가장 작은 값을 매번 고르는 그리디와 이분 탐색을 사용해서 풀었다.
