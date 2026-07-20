---
title: "BOJ 1260. dfs와 bfs"
date: 2022-11-06

categories:
  - PS
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - DFS
  - Python

draft: false
aliases:
  - "/posts/ps-boj-1260-dfs와-bfs/"

original: "https://junmusu.tistory.com/33"
---

## 문제

<https://www.acmicpc.net/problem/1260>

## 풀이

심플하다. 입력값으로 그래프가 주어지고, DFS와 BFS를 이용해 탐색한 결과를 각각 출력하면 된다.

### 코드

```py
from collections import deque

def dfs(v, dfsArray):
    isVisitedDFS[v] = True
    dfsArray.append(v)
    for i in range(len(graph[v])):
        if graph[v][i] != 0 and isVisitedDFS[i] == False:
            dfs(i, dfsArray)

def bfs(v, bfsArray):
    QueueBFS = deque()
    isVisitedBFS[v] = True
    QueueBFS.append(v)
    while len(QueueBFS) != 0:
        node = QueueBFS.popleft()
        bfsArray.append(node)
        for i in range(len(graph[node])):
            if graph[node][i] != 0 and not isVisitedBFS[i]
                QueueBFS.append(i)
                isVisitedBFS[i] = True

n, m, v = map(int, input().split())
graph = [[0] * (n + 1) for i in range(n + 1)]
isVisitedDFS = [False for i in range(n + 1)]
isVisitedBFS = [False for i in range(n + 1)]
dfsArray = []
bfsArray = []

for i in range(m):
    a, b = map(int, input().split())
    graph[a][b] = graph[b][a] = 1

dfs(v, dfsArray)
bfs(v, bfsArray)

for node in dfsArray:
    print(node, end=" ")
print()
for node in bfsArray:
    print(node, end=" ")
print()
```
