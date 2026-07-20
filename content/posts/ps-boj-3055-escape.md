---
title: "BOJ 3055. 탈출"
date: 2022-11-17

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
original: "https://junmusu.tistory.com/41"
---

## 문제

<https://www.acmicpc.net/problem/3055>

## 풀이

입력으로 그래프가 주어지고, 어느 칸에서 BFS를 시작해야하는지 알려준다. 문제를 읽어보면 고슴도치와 물 둘 다 BFS 탐색을 해야 하는 것을 알 수 있다.

주의할 점은 예제에는 초기에 물인 칸이 1개밖에 없지만 문제를 읽어보면 1칸이라는 제약조건이 없다. 따라서 물이 여러칸일 때도 생각하고 프로그래밍을 해야 한다.

처음에 두 가지 생각을 했다.

- BFS탐색을 각각 따로 하는 방법
  - 고슴도치를 먼저 BFS 탐색시켜서 그래프에 각 칸마다 몇번째 이동에 도달하는지 검사한다.  
  - 다음에 물을 BFS 탐색해서 1의 결과가 가능한지를 판단한다.

- 고슴도치와 물을 단계별로 번갈아가면서 BFS 탐색 하는 방법
  - 예시를 보니 고슴도치가 먼저 이동하고 그 다음에 물이 들어오는 것으로 보인다.  
  - 하지만 고슴도치는 다음에 물이 찰 곳을 가지 못 한다(= 결국엔 물이 먼저 움직인다.)  
  - 따라서 물이 한번 BFS큐를 비우고 채웠으면, 그 다음에 고슴도치가 BFS큐를 비우고 채우는 방식으로 번갈아가면서 한다.

A는 2번에서 어떻게 로직을 구현해야 하는지 생각하다가 아무리 봐도 조잡하다는 생각을 지울 수가 없어 바로 B로 넘어갔다.

B도 일반적인 BFS 탐색과는 좀 다르다. 물과 고슴도치가 따로 있고 정확한 시점이 존재하므로 (파이프라인처럼) 같은 레벨이면 한번에 큐를 비워줘야 한다고 생각해서 큐를 2중 배열로 작성하고, 같은 단계의 칸들은 한번에 pop 하도록 했다.

### 코드

```py
from collections import deque

def beaverBFS(beaver, waterRoot):
    beaverQ = deque()
    waterQ = deque()
    beaverQ.append([beaver])
    waterQ.append(waterRoot)
    isVisitedBeaver[beaver[0]][beaver[1]] = True
    for water in waterRoot:
        isVisitedWater[water[0]][water[1]] = True
    moves = [(1, 0), (-1, 0), (0, 1), (0, -1)]

    while(len(beaverQ) != 0 or len(waterQ) != 0):
        if waterQ:
            waterNodes = waterQ.popleft()
            tempQ = []
            for waterNode in waterNodes:
                for move in moves:
                    row = waterNode[0] + move[0]
                    column = waterNode[1] + move[1]
                    if row < 0 or row >= r or column < 0 or column >= c:
                        continue
                    if graph[row][column] == "X" or graph[row][column] == "D" or isVisitedWater[row][column]:
                        continue
                    isVisitedWater[row][column] = True
                    tempQ.append((row, column))
            if len(tempQ) != 0:
                waterQ.append(tempQ)

        if beaverQ:
            beaverNodes = beaverQ.popleft()
            tempQ = []
            for beaverNode in beaverNodes:
                for move in moves:
                    row = beaverNode[0] + move[0]
                    column = beaverNode[1] + move[1]
                    if row < 0 or row >= r or column < 0 or column >= c:
                        continue
                    if isVisitedBeaver[row][column] or isVisitedWater[row][column] or graph[row][column] == "X":
                        continue
                    if graph[row][column] == "D":
                        return int(graph[beaverNode[0]][beaverNode[1]]) + 1
                    if graph[row][column] == ".":
                        graph[row][column]= str(int(graph[beaverNode[0]][beaverNode[1]]) + 1)
                        isVisitedBeaver[row][column] = True
                        tempQ.append((row, column))
            if len(tempQ) != 0:
                beaverQ.append(tempQ)
    return "KAKTUS"

graph = []
waterRoot = []
hedgehog = [0, 0]

r, c = map(int, input().split())
for _ in range(r):
    graph.append(list(input()))

isVisitedBeaver = [[False] * c for _ in range(r)]
isVisitedWater = [[False] * c for _ in range(r)]
for i in range(r):
    for j in range(c):
        if graph[i][j] == "*":
            waterRoot.append([i, j])
        elif graph[i][j] == "S":
            hedgehog = [i, j]
            graph[i][j] = "0"
print(beaverBFS(hedgehog, waterRoot))
```
