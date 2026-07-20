---
title: "LeetCode. Shift 2D Grid"
date: 2026-07-20

categories:
  - PS
series:
tags:
  - LeetCode
  - Modular
  - Python

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/shift-2d-grid>

## 풀이

$m \times n$ 2d 그리드에 있는 원소들을 오른쪽으로 `k`번 민 결과를 리턴하면 된다.

- `grid[row][n - 1]` → `grid[row + 1][0]` : 마지막 열의 원소는 다음 행의 첫 번째 열로 이동
- `grid[m - 1][n - 1]` → `grid[0][0]` : 마지막 행의 마지막 열 원소는 첫 번째 행의 첫 번째 열로 이동

`k`번 직접 반복하는 대신, 그리드를 1차원으로 평탄화하면 shift 연산이 단순한 배열 회전으로 바뀐다.

평탄화한 배열을 오른쪽으로 `k`칸 회전시킨 뒤, 다시 $m \times n$ 2차원 배열로 복원하면 된다.
단, `k`가 배열 길이 $m \times n$ 보다 클 수 있으므로 모듈러 연산으로 정규화한다.

## 코드

```py
class Solution:
    def shiftGrid(self, grid: List[List[int]], k: int) -> List[List[int]]:
        m = len(grid)
        n = len(grid[0])
        k = k % (n * m)
        flattenGrid = [x for row in grid for x in row]
        flattenGrid = flattenGrid[-k:] + flattenGrid[:-k]
        return [flattenGrid[i * n: (i + 1) * n] for i in range(m)]
```
