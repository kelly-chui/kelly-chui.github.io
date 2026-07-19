---
title: "BOJ 1697. 숨바꼭질"
date: 2022-11-07

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - Python

draft: false
original: "https://junmusu.tistory.com/38"
---

## 문제

<https://www.acmicpc.net/problem/1697>

## 풀이

입력으로 수빈이와 동생의 위치, 그리고 수빈이가 이동할 수 있는 제약조건을 알려준다.

수빈이의 위치보다 동생의 위치가 더 앞에 있거나 같을때는 (n >= k) 뒤로 가는 방법이 한칸 이동하는 것 밖에 없으므로 n - k 로 쉽게 결과를 도출 할 수 있다.

그 외의 경우에는 각각의 좌표를 노드라고 생각했을 때, 이 그래프는 각 노드가 노드값이 1만큼 크거나 작은 노드와 2배인 노드와 연결되어 있다.

따라서 BFS를 이용하면 쉽게 해결 할 수 있다.

### 코드

```py
from collections import deque

def bfs(n, k):
    bfsQ = deque()
    bfsQ.append([n, 0])
    while bfsQ:
        node = bfsQ.popleft()
        if node[0] == k:
            return node[1]
        teleport = node[0] * 2
        front = node[0] + 1
        back = node[0] - 1
        moves = [teleport, front, back]
        for i in range(3):
            if moves[i] < 0 or moves[i] > 100_000:
                continue
            if not isVisited[moves[i]]:
                isVisited[moves[i]] = True
                bfsQ.append([moves[i], node[1] + 1])



n, k = map(int, input().split())
isVisited = [False] * 100_001
if n >= k:
    print(n - k)
else:
    print(bfs(n, k))
```
 

이 문제에서 isVisited를 쓴 이유는, 앞서 방문한 좌표라면 그 다음에 갈 수 있는 노드가 이미 큐에 들어있기 때문에 불필요한 계산을 하는 경우를 방지해준다.
