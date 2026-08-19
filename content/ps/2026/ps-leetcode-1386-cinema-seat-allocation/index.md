---
title: "LeetCode 1386. Cinema Seat Allocation"
date: 2026-08-19T13:45:47+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/cinema-seat-allocation>

## 풀이

column이 10개로 고정된 극장에서 row의 수 `n`과 이미 예약된 좌석의 배열 `reservedSeats`가 주어진다. 각 row에서 4명이 연속으로 앉을 수 있는 좌석은 {2, 3, 4, 5}, {4, 5, 6, 7}, {6, 7, 8, 9} 세 구간이다. 예약된 좌석을 피해 배치할 수 있는 4인 가족 수의 최댓값을 구하면 된다.

`n`이 최대 $10^9$ 이므로, 전체 순회는 시간 안에 풀기 매우 힘들다. 대신 `reservedSeats`가 최대 $10^4$이므로, 미리 최적화 할 수 있는 값들이 많다.

우선, `reservedSeats`가 없는 row는 모두 2로 계산하면 되고, `reservedSeats`가 있는 곳은 직접 주어진 세 구간과 대조하면 된다.

## 코드

```python
class Solution:
    def maxNumberOfFamilies(self, n: int, reservedSeats: List[List[int]]) -> int:
        reservedTable = {}
        for seat in reservedSeats:
            reservedTable.setdefault(seat[0], set()).add(seat[1])
        answer = (n - len(reservedTable)) * 2
        for reserved in reservedTable.values():
            block1 = not reserved & {2, 3, 4, 5}
            block2 = not reserved & {4, 5, 6, 7}
            block3 = not reserved & {6, 7, 8, 9}
            if block1 and block3:
                answer += 2
            elif block1 or block2 or block3:
                answer += 1
        return answer
```
