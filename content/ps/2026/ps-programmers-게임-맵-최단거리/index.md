---
title: "Programmers. 게임 맵 최단거리"
date: 2026-09-28T20:18:24+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - BFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/1844>

## 풀이

$n \times m$ 그래프가 주어지고, 좌상단 좌표 `(1, 1)`에서 시작했을 때, `(n, m)` 까지 가는 최단 거리를 리턴하면 된다.

그래프에서 연결된 노드 간의 이동비용이 같은 최단 거리 문제이므로 BFS를 사용하면 된다.

당연한 패턴이지만 최단 거리는 이미 방문한 노드를 확인하는것과 동시에 처리할 수 있다.

## 코드

```python
from collections import deque

def solution(maps):
    n = len(maps)
    m = len(maps[0])

    def bfs() -> int:
        queue = deque()
        queue.append((0, 0))
        isVisited = [[-1] * m for _ in range(n)]
        isVisited[0][0] = 1
        while queue:
            row, col = queue.popleft()
            for dr, dc in [(-1, 0), (0, 1), (1, 0), (0, -1)]:
                newRow = row + dr
                newCol = col + dc
                if 0 > newRow or n <= newRow or 0 > newCol or m <= newCol:
                    continue
                if isVisited[newRow][newCol] != -1:
                    continue
                if maps[newRow][newCol] == 0:
                    continue
                if newRow == n - 1 and newCol == m - 1:
                    return isVisited[row][col] + 1
                queue.append((newRow, newCol))
                isVisited[newRow][newCol] = isVisited[row][col] + 1
        return -1

    answer = bfs()
    return answer
```
