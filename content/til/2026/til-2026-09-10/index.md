---
title: "TIL. Sep 10, 2026"
date: 2026-09-10T22:25:20+09:00
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
  - 통계 목록과 상세 화면 구현
  - 루트 탭 상태 정리
- PS
  - [Codeforces 1538C. Number of Pairs]({{< relref "/ps/2026/ps-codeforces-1538c-number-of-pairs" >}})
  - [LeetCode 2265. Count Nodes Equal to Average of Subtree]({{< relref "/ps/2026/ps-leetcode-2265-count-nodes-equal-to-average-of-subtree" >}})

## Stack Day

통계 목록 화면에서 진행중인 `Habit`과 보관한 `Habit`을 나눠 카드로 보여주도록 작성했다.

카드를 누르면 연속 달성과 완료 통계를 확인할 수 있는 상세 화면으로 이동한다. 상세 화면에서 `Habit`을 보관·복원·삭제하는 동작도 연결했다.

앱 진입점도 살짝 정리했는데, 뷰 모델들 조립 위치와 탭 선택 상태를 `RootTabViewModel`에 모았다.

## PS

### Codeforces 1538C

두 원소의 합이 주어진 범위에 드는 쌍의 개수를 구해야 한다. 배열을 정렬하고 한 원소를 고정하면 나머지 후보가 연속된 구간이 되므로, 이분 탐색으로 양쪽 경계를 찾았다.

범위 안의 원소 수는 `upperBound - lowerBound`로 구할 수 있다.

### LeetCode 2265

각 노드의 값과 해당 서브트리의 평균을 비교해야 한다. 부모의 평균을 계산하려면 양쪽 자식의 합과 개수가 먼저 필요하므로 후위 순회했다.

자식이 합과 개수를 함께 전달하면 각 서브트리를 다시 순회하지 않아도 됐다.
