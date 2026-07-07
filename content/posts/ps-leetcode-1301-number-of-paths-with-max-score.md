---
title: "LeetCode 1301. Number of Paths with Max Score"
date: 2026-07-05T14:30:01+09:00

categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["LeetCode", "Python", "DP"]

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/number-of-paths-with-max-score>

## 풀이

2차원 그리드의 우하단에서 시작해 좌상단까지 이동하면서, 경로에 있는 숫자들의 합의 최대값과 그 최대값이 나오는 경로의 개수를 구하는 문제이다.

최단 거리를 찾는 문제가 아니므로 BFS나 Dijkstra는 필요 없고, 어떻게 경로의 수를 구할지가 핵심이다. 이동 방향은 문제에서 주어져 있으므로, 각 노드에서 인접한 노드들의 값을 활용해 특정 합(`v`)에 도달하는 경로의 개수를 구할 수 있다.

이런 문제를 효율적으로 푸는 방법은 결국 DP이다. 처음에 점화식을 이렇게 만들었다.

```
dp[r][c][v]: row = r, column = c인 노드에서 지나온 경로에 있는 칸들의 합이 v가 되는 경로의 개수.
```

테스트 케이스는 통과할 수 있었지만, 실제 제출했을 때는 시간 초과가 되어서 통과하지 못했다. `v` 차원 때문에 dp공간이 너무 커지는 것이 문제였다. 

- `r`, `c`는 최대 100이다.
- 좌, 상으로만 움직였을때, 2 * (n - 1) 이상 이동할 수 없다. (우, 하로 연결되어있지 않으므로 되돌아 갈 수 없다. 따라서 이동 횟수가 제한된다.)
- `v`는 모든 칸이 '9' 이고 모든 경로를 다 지났다고 가정했을 때 9(각 노드의 최대 값) * 2(가로, 세로) * 100(가로, 세로의 길이)이 된다. 

결국 저 점화식은 O(n^3) 이상의 시간 복잡도를 가진다.

일단 문제는 `v`차원이다. 가망이 없는 값들도 모두 계산하고 있기 때문이다. 각 칸에서 가질 수 있는 `v`의 최대값을 알면 그 경로의 개수를 계산하는 것이 매우 쉬워진다.

따라서 `v`의 최대값을 찾는 점화식과, 그 최대값에 도달 할 수 있는 경로의 개수를 찾는 점화식으로 분리했다.

```text
// 인접 노드 중 큰 최대 `v`를 가진 노드의 `v`값 + 자기 자신의 값
dpMax[r][c]  = max(dpMax[r+1][c], dpMax[r][c+1], dpMax[r+1][c+1]) + board[r][c]
// dpMax[r][c]에 도달할 수 있는 경로의 개수
dpCount[r][c] = sum of dpCount[nr][nc] where dpMax[nr][nc] == max(dpMax[r+1][c], dpMax[r][c+1], dpMax[r+1][c+1])
```

각 점화식의 시간과 공간 복잡도 모두 O(n^2)이 되어 효율적으로 DP 계산을 할 수 있다.

## 코드

```py
class Solution:
    def pathsWithMaxScore(self, board: List[str]) -> List[int]:
        MOD = 1000000007
        n = len(board)
        dpMax = [[-1] * n for _ in range(n)]
        dpCount = [[0] * n for _ in range(n)]
        dpMax[n - 1][n - 1] = 0
        dpCount[n - 1][n - 1] = 1
        for row in range(n - 1, -1, -1):
            for col in range(n - 1, -1, -1):
                if (row, col) == (n - 1, n - 1):
                    continue
                if board[row][col] == "X":
                    continue
                curValue = int(board[row][col]) if board[row][col].isdigit() else 0
                downValue = dpMax[row + 1][col] if row + 1 < n else -1
                rightValue = dpMax[row][col + 1] if col + 1 < n else -1
                downRightValue = dpMax[row + 1][col + 1] if row + 1 < n and col + 1 < n else -1
                maxValue = max(downValue, rightValue, downRightValue)
                if maxValue == -1:
                    continue
                dpMax[row][col] = maxValue + curValue
                if maxValue == downValue:
                    dpCount[row][col] += dpCount[row + 1][col]
                if maxValue == rightValue:
                    dpCount[row][col] += dpCount[row][col + 1]
                if maxValue == downRightValue:
                    dpCount[row][col] += dpCount[row + 1][col + 1]
                dpCount[row][col] %= MOD
        if dpMax[0][0] == -1:
            return [0, 0]
        return [dpMax[0][0], dpCount[0][0] % MOD]
```