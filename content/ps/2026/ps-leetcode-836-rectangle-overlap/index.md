---
title: "LeetCode 836. Rectangle Overlap"
date: 2026-09-14T20:26:17+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/rectangle-overlap>

## 풀이

두 축에 평행한 직사각형 `rec1`, `rec2`가 주어지고, 넓이를 가지도록 겹치는지 리턴하면 된다.

뒤집어 생각해서, 겹치지 않는 경우를 구하는게 더 편하다. `rec1`와 `rec2`의 각 꼭짓점의 좌표가 모두 구해져 있으므로, 단순 대소비교로 쉽게 '겹치지 않음'을 판단할 수 있다.

되게 오랜만에 한줄로 끝낸 문제다. 프로그래머스에선 많이 봤는데.

## 코드

```python
class Solution:
    def isRectangleOverlap(self, rec1: List[int], rec2: List[int]) -> bool:
        return not (rec1[2] <= rec2[0] or rec2[2] <= rec1[0] or rec1[3] <= rec2[1] or rec2[3] <= rec1[1])
```
