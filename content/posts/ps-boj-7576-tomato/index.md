---
title: "BOJ 7576. 토마토"
date: 2022-11-10

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - Multi-source BFS
  - Python

draft: false
aliases:
  - "/posts/ps-boj-7576-토마토/"

original: "https://junmusu.tistory.com/39"
---

## 문제

https://www.acmicpc.net/problem/7576

## 풀이

처음엔 무난한 BFS 문제라고 생각했다. 처음부터 익어있는 토마토(루트 토마토라고 하겠다.)가 들어있는 칸을 알아낸 다음에 반복문으로 BFS를 적용하고, 루트 토마토를 할 때마다 만약 칸에 더 적은 숫자가 들어 갈 수 있다면 숫자를 업데이트 하는 식으로 문제를 풀었다.

그랬더니 시간초과가 나온다. 쓸데없는 연산이 너무 많아서 그렇다.

정확한 풀이는 BFS 큐를 처음 만들때부터 모든 루트 토마토를 넣어서 초기화 하는 것이었다. 그러면 모든 루트 토마토를 기준으로 동시에 탐색할 수 있으니까.

칸을 탐색할때도 더 높은 숫자가 나오면 그 칸은 큐에 넣을 필요가 없다. 이미 전에 했던 탐색이 더 좋은 결과를 가져다 주었을태니

### 코드

```py
from collections import deque

def bfs(roots):
    moves = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    bfsQ = deque(roots)
    while bfsQ:
        node = bfsQ.popleft()
        for i in range(4):
            y = node[0] + moves[i][0]
            x = node[1] + moves[i][1]
            if y < 0 or y >= n or x < 0 or x >= m:
                continue
            if isVisited[y][x]:
                continue
            if graph[y][x] == 0:
                isVisited[y][x] = True
                bfsQ.append((y, x))
                graph[y][x] = graph[node[0]][node[1]] + 1

m, n = map(int, input().split())
graph = []
for i in range(n):
    graph.append(list(map(int, input().split())))
isVisited = [[False] * m for _ in range(n)]
roots = []

for i in range(n):
    for j in range(m):
        if graph[i][j] == 1:
            isVisited[i][j] = True
            roots.append((i, j))

isContinue = False
for i in range(n):
    if 0 in graph[i]:
        isContinue = True
        break

if isContinue:
    bfs(roots)

    isEnd = False
    for i in range(n):
        if 0 in graph[i]:
            isEnd = True
            print(-1)
            break

    if not isEnd:
        maxValues = []
        for i in range(n):
            maxValues.append(max(graph[i]))
        print(max(maxValues) - 1)

else:
    print(0)
```
