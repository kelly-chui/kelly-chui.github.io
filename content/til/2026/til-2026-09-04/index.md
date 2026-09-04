---
title: "TIL. Sep 4, 2026"
date: 2026-09-04T22:58:41+09:00

categories:
  - TIL
series:
tags:
  - StackDay
  - Domain Modeling

draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. 보관과 복원을 추적 구간으로 모델링하기]({{< relref "posts/stackday-dev-log-tracking-period-lifecycle" >}})
- PS
  - [Codeforces 1195C]({{< relref "ps/2026/ps-codeforces-1195c-basketball-exercise" >}})
  - [LeetCode 3903]({{< relref "ps/2026/ps-leetcode-3903-smallest-stable-index-i" >}})

## StackDay

### 복원 이력 추적하기

보관 날짜 하나만 가진 모델로는 보관 후 복원한 기간의 이력을 표현할 수 없어서 (통계 할 때 문제가 생긴다) `Habit`이 실제로 추적 중이었던 구간을 `TrackingPeriod` 배열로 저장하도록 모델을 변경했다.

이렇게 하면 과거 `Completion`을 수정해도 이미 닫힌 추적 기간의 경계가 바뀌지 않는다. 시작 당일 보관, 현재 열린 기간보다 이른 날짜로 보관, 인접한 기간이 분리돼 남는 경우도 도메인 규칙으로 막았다.

## Strideable

날짜 구간을 어떻게 표현해야 할지 찾아보다가 `Strideable` 프로토콜을 찾아봤다. 어떤 값을 일정한 간격만큼 전진시키거나(`advance`), 두 값 사이의 거리를 구할 수 있게(`distance`) 하는 프로토콜이다.

날짜에 적용하면 `addingDays(1)` 같은 동작과 두 날짜 사이의 일수 계산을 공통된 인터페이스로 표현할 수 있다.

그런데 지금 당장 필요해 보이진 않아서 (특히 `distance`가 현재 MVP에 필요하지 않다.) 도입을 미뤘다. 언젠가는 도입할 것 같은데, MVP는 일단 MVP에만 집중하는게 좋다.

## PS

### Codeforces 1195C

두 줄로 배치된 선수들을 조건에 맞게 선택해 키의 합을 최대로 만들어야 한다. 현재 선택에 앞선 선택이 영향을 주므로, 열까지의 최댓값을 위쪽과 아래쪽 선택 상태로 나누는 DP를 사용했다.

### LeetCode 3903

각 인덱스에서 왼쪽 구간의 최댓값과 오른쪽 구간의 최솟값을 비교해 조건을 처음 만족하는 위치를 찾아야 한다. 매번 구간을 다시 탐색하지 않도록 왼쪽 누적 최댓값과 오른쪽 누적 최솟값을 미리 계산했다.
