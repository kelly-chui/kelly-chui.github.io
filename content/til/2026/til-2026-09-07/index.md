---
title: "TIL. Sep 7, 2026"
date: 2026-09-07T22:04:19+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - 통계 그리드 뷰 작업
- PS
  - [Codeforces 1201C. Maximum Median]({{< relref "/ps/2026/ps-codeforces-1201c-maximum-median" >}})
  - [LeetCode 940. Distinct Subsequences II]({{< relref "/ps/2026/ps-leetcode-940-distinct-subsequences-ii" >}})

## Stack Day

통계 뷰를 작업했다. `Habit`별 통계 카드를 그리드로 표시하고, 현재 진행중인 `Habit`과 보관한 `Habit`을 나눠 보여주도록 구성했다. 목록이 비어 있거나 로딩 중인 상태도 처리했다.

## PS

### Codeforces 1201C

원소를 1씩 늘리는 연산을 최대 `k`번 사용해 중앙값을 최대화하는 문제이다. 목표 중앙값이 높아질 수록 필요한 연산 수도 늘어나므로, 정렬을 한 후에 가능한 목표값을 바이너리 서치했다.

### LeetCode 940

서로 다른 비어 있지 않은 부분 수열의 개수를 구해야 하고, 같은 캐릭터가 여러 번 등장하면 중복이 생긴다. 캐릭터를 하나씩 추가하며 부분 수열 수를 갱신하는 DP를 사용했다.

새 캐릭터를 붙이면 경우의 수가 두 배가 되지만, 같은 캐릭터가 이전에 만들었던 부분 수열은 다시 빼야 한다.
