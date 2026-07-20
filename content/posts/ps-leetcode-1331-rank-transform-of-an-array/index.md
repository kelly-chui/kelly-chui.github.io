---
title: "Leetcode 1331. Rank Transform of an Array"
date: 2026-07-13T11:09:28+09:00

categories:
  - PS
series:
  - Problem Solving
tags:
  - LeetCode
  - Python
  - Sorting

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/rank-transform-of-an-array>

## 풀이

배열의 각 원소를 크기 기준으로 순위로 변환해 리턴하는 문제이다. 배열을 정렬한 뒤 각 원소에 순위를 매핑하고, 원본 배열 순서대로 순위를 꺼내 리턴한다.

문제에서 주의점이 하나 있는데, 같은 숫자는 같은 순위를 가진다는 것이다. 따라서 매핑할 때, 중복처리를 해줘야 한다.

## 코드

```py
class Solution:
    def arrayRankTransform(self, arr: List[int]) -> List[int]:
        sortedArr = sorted(arr)
        rankDict = {}
        rank = 1
        for element in sortedArr:
            if not element in rankDict:
                rankDict[element] = rank
                rank += 1
        return list(map(lambda x: rankDict[x], arr))
```
