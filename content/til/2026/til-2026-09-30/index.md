---
title: "TIL. Sep 30, 2026"
date: 2026-09-30T21:14:09+09:00
categories:
  - TIL
series:
tags:
  - DevBox
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- DevBox
  - [devbox-light-server (12). 파일 태스크를 직렬화해서 동시성 문제 해결하기]({{< relref "posts/devbox-light-server-12-json-file-operation-queue" >}})
- PS
  - [LeetCode 1111. Maximum Nesting Depth of Two Valid Parentheses Strings]({{< relref "ps/2026/ps-leetcode-1111-maximum-nesting-depth-of-two-valid-parentheses-strings" >}})

## DevBox

### JSON 파일 작업 직렬화

JSON 파일을 수정할 때, 단순 원자성으로는 데이터 레이스를 막을 수 없었다. 그래서 Swift 액터 컨셉을 좀 빌려서 요청을 직렬화 하는 방식으로 데이터 레이스를 막으려 했다.

그래서 같은 파일에 대한 읽기, 수정, 쓰기 작업을 하나로 묶고, 파일 경로별로 이전 작업이 끝난 뒤 다음 작업을 실행하도록 했다. 만약 서로 다른 파일이면 애초에 데이터 레이스가 일어날 일이 없으니 각각 진행할 수 있게 했다.

처음에는 유사 액터를 만들고 싶었는데, 막상 구현을 살펴보니 `Promise`를 연결해서 같은 파일의 작업 순서를 관리하는 태스크 큐에 더 가까웠다.

#### Promise와 Continuation 복습

에이전트가 작성한 큐 코드를 이해하는 데 생각보다 오래 걸렸다. `Promise`의 resolve 함수를 저장해 뒀다가 작업이 끝나면 호출하는 부분이 특히 낯설어서, `Promise<T>`와 `async` 함수의 리턴 타입, microtask 큐까지 살펴봤다.

Swift의 Continuation도 함께 복습했다. Promise의 `resolve`를 나중에 호출해 기다리던 작업을 이어가게 하는 방식이 Continuation을 저장해 뒀다가 `resume`하는게 비슷해보였다.

이해했는지 확인하려고 AI에게 Continuation 문제를 내달라고 하고 직접 구현해보기도 했다. 코드를 받아서 끝내는 것보다, 관련 개념을 다시 공부한 시간이 더 길었던 것 같다.

## PS

### LeetCode 1111

유효한 괄호 스트링을 두 유효한 그룹으로 나누고, 두 그룹의 최대 중첩 깊이를 최소화해야 한다. 괄호 쌍의 깊이 홀짝에 따라 그룹을 번갈아 배정했다.

깊이가 `D`인 곳의 괄호 쌍을 두 그룹으로 나누면 한 그룹은 적어도 `ceil(D / 2)`개를 가져야 한다. 번갈아 배정하면 이 하한을 달성하고, 같은 쌍의 여닫는 괄호도 같은 그룹에 남는다.
