---
title: "LeetCode 835. Image Overlap"
date: 2026-09-14T20:18:42+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Hash Table
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/image-overlap>

## 풀이

두 정사각형 이미지(2차원 인티저 배열) `img1`, `img2`가 주어지고, 한 이미지를 상하좌우로 평행 이동 했을 때 1이 가장 많이 겹친 경우의 겹친 1의 개수를 리턴하면 된다.

일단은 브루트 포스로도 가능하다. 상하 이동 가능한 범위가 각 59, 그리고 행렬을 전체 순회하는 값이 $30^2$ 이므로 대략 300만 번의 연산이면 모든 경우의 수를 구할 수 있다. 

하지만 코드가 길어지고 귀찮아지므로, 더 좋은 최적화 방법을 이용하자. 우리가 알고 싶은건 1이 얼마나 겹치는가? 아니다.

각 이미지에서 값이 1인 좌표만 따로 모은 다음에, `img1`의 1인 좌표가 `img2`의 1인 좌표의 위치로 이동하는 델타값을 모든 경우에서 모은다. (코드가 간단하다)

이 델타값을 키로 하는 딕셔너리를 만들어서 경우가 하나 등장할 때마다 1씩 증가시켜 개수를 카운트 하면 된다. 자연스럽게 가장 값이 높은 키의 값이 정답이 된다.

## 코드

```python
class Solution:
    def largestOverlap(self, img1: List[List[int]], img2: List[List[int]]) -> int:
        n = len(img1)
        img1Positive = [(row, col) for row in range(n) for col in range(n) if img1[row][col] == 1]
        img2Positive = [(row, col) for row in range(n) for col in range(n) if img2[row][col] == 1]
        count = {}
        for row1, col1 in img1Positive:
            for row2, col2 in img2Positive:
                diff = (row2 - row1, col2 - col1)
                count[diff] = count.get(diff, 0) + 1
        return max(count.values()) if count else 0
```
