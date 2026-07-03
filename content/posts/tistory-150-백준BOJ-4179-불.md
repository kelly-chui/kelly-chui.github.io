---
title: "[백준]BOJ 4179: 불!"
date: 2024-06-10
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Python", "BFS"]
draft: false
original: "https://junmusu.tistory.com/150"
---

## 문제

<https://www.acmicpc.net/problem/4179>

## 풀이

지훈이가 움직이고, 불을 퍼뜨리면 된다. 순서대로 진행하면 되는데 주의해야 할 점이 두 가지 있다.

1. 1분마다 기준으로 번갈아서 움직여야 한다.
2. 지훈이가 움직이기 전에 불에 타면 안된다.

### 코드

```py
from collections import deque

def bfs(jihun, fires):
    is_jihun_Visited = [[-1] * c for _ in range(r)]
    fire_queue = deque()
    jihun_queue = deque()
    fire_queue.append(fires)
    jihun_queue.append([jihun])
    
    is_jihun_Visited[jihun[0]][jihun[1]] = 0

    while jihun_queue or fire_queue:
        if jihun_queue:
            jihun_temp_queue = []
            jihun_nodes = jihun_queue.popleft()
            for cur in jihun_nodes:
                if graph[cur[0]][cur[1]] == "F":
                    continue
                for move in [(-1, 0), (0, 1), (1, 0), (0, -1)]:
                    next = (cur[0] + move[0], cur[1] + move[1])
                    if next[0] == -1 or next[1] == -1 or next[0] == r or next[1] == c:
                        return is_jihun_Visited[cur[0]][cur[1]] + 1
                    if next[0] < 0 or next[0] >= r or next[1] < 0 or next[1] >= c:
                        continue
                    if is_jihun_Visited[next[0]][next[1]] != -1:
                        continue
                    if graph[next[0]][next[1]] == ".":
                        jihun_temp_queue.append(next)
                        is_jihun_Visited[next[0]][next[1]] = is_jihun_Visited[cur[0]][cur[1]] + 1
            if jihun_temp_queue:
                jihun_queue.append(jihun_temp_queue)
                    
        if fire_queue:
            fire_temp_queue = []
            fire_nodes = fire_queue.popleft()
            for cur in fire_nodes:
                for move in [(-1, 0), (0, 1), (1, 0), (0, -1)]:
                    next = (cur[0] + move[0], cur[1] + move[1])
                    if next[0] < 0 or next[0] >= r or next[1] < 0 or next[1] >= c:
                        continue
                    if graph[next[0]][next[1]] == ".":
                        fire_temp_queue.append(next)
                        graph[next[0]][next[1]] = "F"
            if fire_temp_queue:
                fire_queue.append(fire_temp_queue)
    return "IMPOSSIBLE"

r, c = map(int, input().split())
graph = []
for _ in range(r):
    graph.append(list(input()))

jihun = (0, 0)
fires = []

for row in range(r):
    for column in range(c):
        if graph[row][column] == "J":
            jihun = (row, column)
        elif graph[row][column] == "F":
            fires.append((row, column))

print(bfs(jihun, fires))
```
