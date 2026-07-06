---
title: "[백준]BOJ 15591: MooTube(Sliver) - Python/BFS"
date: 2024-04-12
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Python", "BFS"]
draft: false
original: "https://junmusu.tistory.com/139"
---

## 문제

<https://www.acmicpc.net/problem/15591>

## 풀이

문제가 복잡하게 설명되어 있다. 중요한 것은 모든 노드가 연결되어 있고 웨이트를 가진 엣지가 존재하지만, 두 노드간의 거리는 경로상의 가장 작은 웨이트를 가진 엣지가 된다.

따라서 웨이트가 있다 해서 다익스트라를 쓸 필요가 없다. 들어오는 쿼리마다 BFS를 이용하여 그래프를 탐색하고 두 노드간의 거리는 실시간으로 업데이트 해주면 된다.

### 코드

```py
from collections import deque

def bfs(k, v):
    queue = deque()
    queue.append((v, 987_654_321))
    isVisited = [False] * (n + 1)
    isVisited[v] = True
    answer = 0

    while queue:
        cur_node, cur_usado = queue.popleft()
        for next_node, next_usado in graph[cur_node]:
            if isVisited[next_node]:
                continue
            if cur_usado < next_usado:
                next_usado = cur_usado
            if next_usado >= k:
                queue.append((next_node, next_usado))
                isVisited[next_node] = True
                answer += 1
    print(answer)

n, q = map(int, input().split())
graph = {}
for _ in range(n - 1):
    pi, qi, ri = map(int, input().split())
    if pi in graph:
        graph[pi].append((qi, ri))
    else:
        graph[pi] = [(qi, ri)]
    if qi in graph:
        graph[qi].append((pi, ri))
    else:
        graph[qi] = [(pi, ri)]

for _ in range(q):
    k, v = map(int, input().split())
    bfs(k, v)
```
