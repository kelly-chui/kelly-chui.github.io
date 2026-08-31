---
title: "TIL. Aug 31, 2026"
date: 2026-08-31T23:17:36+09:00

categories:
  - TIL
series:
tags:
features:
  - katex

draft: false
original: ""
---

## 기록

### 오늘의 기록

- WWDC
  - [Protect Mutable States With Swift Actors - WWDC21]({{< relref "posts/wwdc-swift-concurrency-protect-mutable-states-with-swift-actors" >}})
- PS
  - [LeetCode 2058. Find the Minimum and Maximum Number of Nodes Between Critical Points]({{< relref "ps/2026/ps-leetcode-2058-find-the-minimum-and-maximum-number-of-nodes-between-critical-points" >}})
  - [Codeforces 1526B. I Hate 1111]({{< relref "ps/2026/ps-codeforces-1526b-i-hate-1111" >}})

### WWDC 세션

[Protect Mutable States With Swift Actors - WWDC21]({{< relref "posts/wwdc-swift-concurrency-protect-mutable-states-with-swift-actors" >}}) 세션을 정리했다. 

Actor가 공유 가변 상태를 어떻게 격리하는지, 그리고 `await`가 Actor 내부 상태에 어떤 변화를 만들 수 있는지 정리했다.

WWDC21에서 했던 굵직한 Swift Concurrency 세션 3개를 이제 마무리 했는데, async/await, actor, structured Concurrency 셋의 공통점은 '일반 코드처럼 작성하고, Swift의 기능에 통합하기'인 것으로 느꼈다.

(async/await에서는 중요하지만) 단순히 콜백을 안쓰고 `async`, `await`를 붙인 다음 일반 코드처럼 작성하는 수준이 아니라. 에러 핸들링이나 컴파일러 차원에서 문제를 잡아내는 것이 가장 핵심인 것 같다.

Structured Concurrency도 마찬가지로, 동시성 코드를 `if` `for` 같은 코드처럼 자연스럽게 중첩되게 사용할 수 있게 한다는 것을 비중으로 다뤘고, actor도 마찬가지로, 일반 타입처럼 사용할 수 있다는 것을 강조한다는 느낌을 받았다.

별개로 이번 세션을 보면서 느낀 3가지 인사이트가 있다.

### Swift Concurrency 인사이트 3개

#### Swift Concurrency는 거대한 추상화다

스레드, 락, 디스패치 큐 같은 도구를 직접 조작하는 대신 async/await, Actor, isolation처럼 언어가 이해하는 개념으로 동시성을 다루게 해 준다.

#### 액터는 우리 앱의 '정상 동작'에 관심 없다

액터가 보장하는 범위도 분명히 구분해야 한다. 여러 Task가 같은 가변 상태에 동시에 접근해서 생기는 저수준의 데이터 레이스는 막아 주지만, 그것만으로 작업의 실행 순서나 비즈니스 로직이 올바르다고 말할 수는 없다. 

특히 느낀 부분이 클래스의 Sendable에 관한 부분이었는데, 이 클래스가 우리가 원하는 대로 작동하는지는 액터는 전혀 보장하지 않는다! 그냥 데이터 레이스만 일어나지 않으면 Sendable이 되기 OK고, 그 순서 자체는 액터는 전혀 관심이 없다!

#### Swift 6에서 MainActor isolation을 기본으로 하려는 이유

Swift 5.5 시절에 나온 세션을 보고 Swift 6에 관한 인사이트를 얻은게 약간 웃길 수 있는데, 이번 세션에서 왜 MainActor isolation이 기본인지 대략적으로 알 수 있게 되었다.

결론부터 말하면, 액터에 격리되지 않은 '무주지'를 줄이기 위해서라고 생각했다. 앱을 여러 액터로 쪼개서, 데이터 레이스를 방지하려고 하는데 액터에 격리되지 않은 상태들은 데이터 레이스 위험이 여전히 존재한다.

이런 무주지들을 없애기 위해 기본적으로 메인 액터에 격리하려고 한 것이라고 이해했다.
