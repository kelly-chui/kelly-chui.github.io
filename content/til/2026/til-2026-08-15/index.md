---
title: "TIL. Aug 15, 2026"
date: 2026-08-15T23:30:00+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘 한 내용

- PS
  - [Codeforces 276C. Little Girl and Maximum Sum]({{< relref "ps/2026/ps-codeforces-276c-little-girl-and-maximum-sum" >}})
  - [LeetCode 3702. Longest Subsequence With Non-Zero Bitwise XOR]({{< relref "ps/2026/ps-leetcode-3702-longest-subsequence-with-non-zero-bitwise-xor" >}})
- [Swift Concurrency. Explore Structured Concurrency in Swift (1) - WWDC21]({{< relref "posts/wwdc-swift-concurrency-explore-structured-concurrency-in-swift-1" >}})

## 배운 내용

### Structured Concurrency

Explore Structured Concurrency in Swift WWDC 세션을 봤다.

Meet async/await in Swift 세션도 마찬가지고, 이번 세션을 보면서 느낀 것은 Swift Concurrency의 중요한 컨셉은 비동기 코드를 일반적인 동기 코드와 비슷한 흐름으로 작성할 수 있게 하는 것이라고 생각했다.

async/await가 에러 핸들링과 같은 부분을 비동기 코드도 동기 코드와 비슷하게 사용할 수 있게 해줬다면, Structured Concurrency는 조건문이나 루프같은 제어 흐름도 동기 코드와 비슷하게 사용하게 해준다.

비동기 작업에도 명확한 부모-자식 관계와 생명주기를 부여해서, 자식 Task가 부모의 범위를 벗어나지 않도록 구조화함으로써 태스크의 시작과 종료, 취소, 에러 전파를 추적하기 쉬워진다.

### PS

Codeforces 276C 문제에서는 차분 배열을 사용해야 했다. 예전에 백준 풀 때 한번 만난 테크닉 같은데, 바로 떠오르지 않았다. 

리트코드에서는 요즘 XOR문제랑 Stone game만 데일리에 계속 나오는 것 같은데, 이번에 나온 문제는 꽤 수학적인 직관이 필요했다.

개인적으로 XOR를 단순히 캐리 없는 덧셈으로 생각하는데 이런 생각이 문제 풀때 꽤 도움이 됐다. 덧셈도 역연산이 존재하는데 XOR도 역연산이 존재하지 않을까? 찾아보니까 XOR의 역연산은 XOR이더라. 이 정도의 발상이면 쉽게 풀 수 있었다.

## 내일 할 것

- StackDay 완료 취소·보관·삭제 유즈케이스 구현
- Swift Concurrency WWDC 세션 정리
