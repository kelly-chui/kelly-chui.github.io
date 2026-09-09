---
title: "TIL. Sep 9, 2026"
date: 2026-09-09T23:13:36+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - Domain Modeling
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. Habit Calculator와 도메인 정책 분리하기]({{< relref "/posts/stackday-dev-log-statistics-calculator-inputs" >}})
- PS
  - [Codeforces 1915E. Romantic Glasses]({{< relref "/ps/2026/ps-codeforces-1915e-romantic-glasses" >}})
  - [LeetCode 3871. Count Commas in Range II]({{< relref "/ps/2026/ps-leetcode-3871-count-commas-in-range-ii" >}})

## StackDay

### Statistics Calculator 정상화

드디어 통계 계산기를 순수하게 만들었다. 기존에는 통계 계산기가 `Habit`과 완료 기록을 직접 받아 추적 기간을 해석하고 통계까지 계산하고 있었다. 

계산기에는 실제로 대상 날짜와 완료 날짜만 있으면 된다는 점을 기준으로, 기간을 결정하는 정책은 `Habit` 쪽으로 옮기고 계산기 입력은 `eligibleDays`, `completedDays`, `referenceDay`로 좁혔다.

나중에 복잡한 도메인 정책들이 추가되어도, 그냥 유즈케이스 혹은 다른 서비스 레이어에서 전처리를 하고 넘겨주기만 하면 된다. 이제 통계 계산기는 더 이상 앱의 (통계를 제외한) 정책 변경에 흔들리지 않는다.

## PS

### Codeforces 1915E

홀수 위치와 짝수 위치의 원소 합이 같은 연속 구간이 있는지 확인해야 한다. 번갈아 부호를 붙인 누적합을 만들고, 이전에 나온 누적합을 다시 만나는지 확인했다.

두 누적합이 같다는 것은 그 사이 구간의 부호를 붙인 합이 0이라는 뜻이다. 시작점부터 조건을 만족하는 경우도 찾도록 초기 누적합 0을 함께 고려한다.

### LeetCode 3871

1부터 `n`까지의 쉼표 총개수를 구해야 하고, 하나의 수에 쉼표가 여러 개 들어갈 수 있다. 1,000, 1,000,000처럼 쉼표가 하나씩 추가되는 경계마다 그 이상인 수의 개수를 더했다.

Python이나 C++이면 조금 더 코드를 깔끔하게 풀 수 있을 것 같았는데, Swift는 PS 하라고 만든 언어가 아니니까 뭐...
