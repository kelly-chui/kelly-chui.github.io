---
title: "BOJ 5558. チ ズ cheese"
date: 2024-04-12

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - Python

draft: false
aliases:
  - "/posts/ps-boj-5558-チ-ズ-cheese/"

original: "https://junmusu.tistory.com/140"
---

## 문제

<https://www.acmicpc.net/problem/5558>

### 파파고 번역
```
올해도 JOI 마을의 치즈 공장이 치즈 생산을 시작하여, 쥐들이 둥지에서 얼굴을 내밀었다. JOI 마을은 동서남북으로 구획 정리되어 있고, 각 구획은 둥지, 치즈 공장, 장애물, 공터 중 하나이다. 쥐들은 둥지에서 출발하여 모든 치즈 공장을 방문 하여 치즈를 한 개씩 먹는다.
이 마을에는 N개의 치즈 공장이 있는데, 모든 공장이 한 종류의 치즈만을 생산한다. 치즈의 단단함은 공장마다 다르고 단단함도 다르다 1부터 N까지의 치즈를 생 산하는 치즈공장이 마침 하나씩 있다.
증가
쥐들의 첫 번째 체력은 1이고, 치즈를 한 개 먹을 때마다 그들의 체력은 1증가 하지만, 쥐들은 자신의 체력보다 더 단단한 치즈를 먹을 수는 없다. 
쥐는 동서남북으로 이웃한 구역으로 1분이면 이동할 수 있지만, 장애물 구역에는 들어갈 수 없다. 치즈 공장을 치즈를 먹지 않고 지나갈 수도 있다. 치즈를 다 먹을 때까지 걸리는 가장 짧은 시간을 요구하는 프로그램을 작성하라. 쥐가 치즈를 먹 는 데 걸리는 시간은 무시할 수 없다.
```

### 풀이

처음에 문제를 읽었을 땐, 치즈를 먹는 순서를 어떻게 정해야 하나 싶었지만, 시작 할 때 쥐의 체력이 1 고정이므로 고민할 필요 없이 1, 2, 3, ..., N 순서대로 먹으면 된다.

BFS를 이용하여 시작 지점에서 시작해서 각 치즈간의 거리를 순서대로 더하면 된다.

### 코드


```py
from collections import deque

def bfs(start, end):
    moves = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    queue = deque()
    isVisited = [[False] * w for _ in range(h)]
    queue.append((start, 0))
    isVisited[start[0]][start[1]] = True
    
    while queue:
        cur_place, cur_time = queue.popleft()
        for move in moves:
            new_place = (cur_place[0] + move[0], cur_place[1] + move[1])
            if new_place[0] < 0 or new_place[0] >= h or new_place[1] < 0 or new_place[1] >= w:
                continue
            if isVisited[new_place[0]][new_place[1]]:
                continue
            if graph[new_place[0]][new_place[1]] == "X":
                continue
            if graph[new_place[0]][new_place[1]] == end:
                return cur_time + 1
            queue.append((new_place, cur_time + 1))
            isVisited[new_place[0]][new_place[1]] = True
    return 0

h, w, n = map(int, input().split())
graph = []
for _ in range(h):
    graph.append(list(input()))

cheese_mapping = {}
for row in range(h):
    for column in range(w):
        if graph[row][column] in ["1", "2", "3", "4", "5", "6", "7", "8", "9"]:
            cheese_mapping[graph[row][column]] = (row, column)
        if graph[row][column] == "S":
            cheese_mapping["0"] = (row, column)
answer = 0
for cheese in range(1, n + 1):
    answer += bfs(cheese_mapping[str(cheese - 1)], str(cheese))

print(answer)
```

