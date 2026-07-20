---
title: "BOJ 2178. 미로 탐색"
date: 2022-11-06

categories:
  - PS
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - Python

draft: false
aliases:
  - "/posts/ps-boj-2178-미로-탐색/"

original: "https://junmusu.tistory.com/34"
---

## 문제

<https://www.acmicpc.net/problem/2178>

## 풀이

입력값으로 미로의 크기와 구성이 주어진다.

미로 안에서는 값이 1인 칸으로만 이동 할 수 있고, 또 각 칸에서는 상하좌우의 칸으로밖에 이동하지 못한다.

-> 현재 칸에서 상하좌우의 칸을 탐색해서 1인 경우에만 Queue에 넣는다.

이 문제에서는 각 노드를 방문했는지의 여부보다 몇번째에 방문했는지의 여부가 더 중요하다.

-> 이전 노드의 방문 순서에 1을 더한 값을 현재 노드의 방문 순서로 한다. (isVisited가 Bool이 아닌 Integer로 구현된다)

이렇게 얻어낸 두가지 인사이트로 BFS를 구현한다.

### 코드

```py
from collections import deque

def bfs(location):
    visit = [[0] * m for _ in range(n)]
    bfsQ = deque()
    bfsQ.append(location)
    visit[0][0] = 1
    while bfsQ:
        node = bfsQ.popleft()
        up = [node[0] - 1, node[1]]
        down = [node[0] + 1, node[1]]
        left = [node[0], node[1] - 1]
        right = [node[0], node[1] + 1]
        moves = [up, down, left, right]
        for i in range(len(moves)):
            x = moves[i][0]
            y = moves[i][1]
            if x < 0 or y < 0 or x >= n or y >= m:
                continue
            if maze[x][y] == "0":
                continue
            if visit[x][y] == 0:
                visit[x][y] = visit[node[0]][node[1]] + 1
                bfsQ.append([x, y])
    return visit[n - 1][m - 1]

maze = []
n, m = map(int, input().split())
for i in range(n):
    temp = list(input())
    maze.append(temp)
print(bfs([0, 0]))
```
 

시작 노드와 종료 노드가 명확하게 정해져 있으므로 DFS로도 풀릴것이라는 생각이 든다.
