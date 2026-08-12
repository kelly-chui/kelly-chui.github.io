---
title: "TIL. Aug 12, 2026"
date: 2026-08-12T23:30:00+09:00

categories:
  - TIL
series:
tags:
  - Swift
  - Two Pointers
  - Hash Table

draft: false
original: ""
---

## 오늘 한 내용

- [LeetCode 2958. Length of Longest Subarray With at Most K Frequency]({{< relref "ps/2026/ps-leetcode-2958-length-of-longest-subarray-with-at-most-k-frequency" >}})
- [LeetCode 2996. Smallest Missing Integer Greater Than Sequential Prefix Sum]({{< relref "ps/2026/ps-leetcode-2996-smallest-missing-integer-greater-than-sequential-prepix-sum" >}})
- [StackDay. 엔티티와 계산 책임 분리하기]({{< relref "posts/stackday-dev-log-derived-value-responsibility" >}})

## 배운 내용

### 파생 값을 구현할 때의 책임 분리

StackDay의 `HabitEntry`와 `HabitStreak`을 구현했다. 모델링 단계에서 정의한 파생 값을 실제 코드로 옮기면서, 값을 표현하는 타입과 값을 계산하는 로직을 분리했다.

AI 에이전트가 작성한 내용중에 별로인 것들을 몇개 직접 수정했는데 리스트로 정리하면 다음과 같다.

- `HabitEntry`의 이니셜라이저 전체 `Completion` 목록을 직접 탐색하고, 생성 실패/성공을 판정했다.
- `HabitStreak`의 이니셜라이저 내부에 `Streak` 계산 로직이 들어있었다.

둘 다 경계가 제대로 구분되지 않았다. `HabitEntry` 내부에서 전체 `Completion`을 탐색하면서 조건에 맞는 `Completion`을 찾아내는건 비효율적이기도 하고, 이건 유즈케이스에서 해야 될 일이다.

`HabitStreak`도 마찬가지로 단순한 데이터 모델이고, 스트릭을 계산할 책임은 `HabitStreak`의 이니셜라이저가 아닌 Service 레이어에서 해야한다.

추가적으로 시점을 어떻게 다룰지에 대한 정책이 비어있는걸 확인하고, 임시적으로 '날짜 단위'로 하도록 했다. MVP에선 데일리만 하기로 했고, 시간 단위는 크게 필요하지 않다...

자세한 구현 과정 및 수정 과정은 [StackDay 개발일지]({{< relref "posts/stackday-dev-log-derived-value-responsibility" >}})에 정리했다.

## 내일 할 것

- StackDay 도메인 구현 마무리하기.
