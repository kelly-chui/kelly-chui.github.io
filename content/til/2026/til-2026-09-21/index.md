---
title: "TIL. Sep 21, 2026"
date: 2026-09-21T22:12:46+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - Software Architecture
  - Error Handling
  - Data Persistence
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. Repository 오류를 UseCase 오류로 변환하기]({{< relref "posts/stackday-dev-log-failure-reproduction" >}})
- PS
  - [LeetCode 3524. Find X Value of Array I]({{< relref "ps/2026/ps-leetcode-3524-find-x-value-of-array-i" >}})
  - [Programmers. 노란불 신호등]({{< relref "ps/2026/ps-programmers-노란불-신호등" >}})

## Stack Day

### 에러 계층화

[DevBox에서도 했던 작업인데]({{< relref "posts/devbox-light-server-09-error-boundaries-and-tests" >}}), Stack Day에서는 모든 계층의 에러를 구조화 하지 않았다. Presentation 계층에선 다른 방법으로 에러 핸들링 할 생각이니까.

기본 원칙은 이전과 동일하게, 각 계층의 에러가 경계를 뚫고 나가지 않게 하는 것이다. 예시를 들면 유즈케이스에서 JSON 구현체의 세부적인 에러를 알 필요가 없고, 알아서도 안 된다.

`FileHabitRepository`는 JSON 디코딩·도메인 복원·파일 읽기 실패를 `readFailed`로, 파일 교체 실패를 `writeFailed`로 바꿨다. 호출자는 `JSONDecoder`나 `FileManager`의 세부 에러 대신 저장소의 읽기와 쓰기 중 무엇이 실패했는지만 알면 된다.

유즈케이스는 이 저장소 에러와 도메인 에러를 사용자가 시도한 작업 기준으로 다시 바꾼다. 예를 들어 `RecordCompletionUseCase`는 기록할 수 없는 날짜를 `dateNotRecordable`로, 중복된 완료 기록을 `alreadyCompleted`로, 그 밖의 실패를 `couldNotRecord`로 표현한다. 

UI에서 각 에러를 어떤 문구와 복구 동작으로 보여 줄지는 결정해야 하는 부분이 많아서 다음 단계로 넘겼다.

## PS

### LeetCode 3524

배열의 앞과 뒤를 제거하고 남은 부분 배열의 곱을 `k`로 나눈 나머지별 개수를 구해야 한다. 남는 구간은 연속 부분 배열이고 다음 계산에는 곱의 나머지만 필요하므로, 현재 위치에서 끝나는 구간을 나머지별 개수로 묶는 DP를 사용했다.

곱 자체를 모두 저장하지 않아도 같은 나머지를 가진 구간은 다음 원소를 붙일 때 함께 갱신할 수 있다.

### Programmers: 노란불 신호등

각 신호등은 주기적으로 색이 바뀌고, 모두 동시에 노란불인 최초 시각을 찾아야 한다. 전체 상태는 각 신호등 주기의 최소공배수마다 반복되므로 그 범위 안에서 시각을 순회했다.

시각을 각 주기 안의 위치로 바꾸면 신호등마다 노란불 구간에 있는지 비교할 수 있다.
