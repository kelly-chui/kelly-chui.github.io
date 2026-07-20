---
title: "BOJ 2667. 단지 번호 붙이기"
date: 2022-11-07

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
  - "/posts/ps-boj-2667-단지-번호-붙이기/"

original: "https://junmusu.tistory.com/36"
---

## 문제

<https://www.acmicpc.net/problem/2667>

## 풀이

그래프가 입력으로 주어지고, 각 노드마다 탐색의 범위가 상하좌우로 제한된다. 앞서 해결했던 미로 탐색과 순열 사이클을 섞어놓은 듯 한 문제이다.

따라서 다음과 같은 과정으로 출력값을 얻었다.

1. 전체 그래프를 탐색하는 2중 반복문을 작성한다.
2. 방문하지 않은 노드가 나올 때마다 그래프 탐색(DFS, BFS)를 실시한다.
3. 각 그래프를 탐색했을때 노드의 개수를 저장하고 정렬한 다음에 출력한다. 

### 코드

```py
from collections import deque

def bfs(v):
    bfsQ = deque()
    bfsQ.append(v)
    isVisited[v[0]][v[1]] = True
    moves = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    count = 1
    while bfsQ:
        node = bfsQ.popleft()
        for move in moves:
            row = node[0] + move[0]
            column = node[1] + move[1]
            if row < 0 or row >= n or column < 0 or column >= n:
                continue
            if graph[row][column] != 0 and not isVisited[row][column]:
                isVisited[row][column] = True
                bfsQ.append((row, column))
                count += 1
    return count

n = int(input())
graph = []
for _ in range(n):
    temp = input()
    graph.append(list(map(int, temp)))

isVisited = [[False] * n for i in range(n)]
area = []
for row in range(n):
    for column in range(n):
        if graph[row][column] == 1 and not isVisited[row][column]:
            area.append(bfs((row, column)))
area.sort()
print(len(area))
for i in range(len(area)):
    print(area[i])
```
