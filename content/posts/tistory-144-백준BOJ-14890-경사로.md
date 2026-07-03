---
title: "[백준]BOJ 14890: 경사로"
date: 2024-04-19
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Python", "Implementation", "Simulation"]
draft: false
original: "https://junmusu.tistory.com/144"
---

## 문제

<https://www.acmicpc.net/problem/14890>

## 풀이

경사로의 방향을 생각해보면 왼쪽에서 오른쪽으로 올라가는 방향이 있을 것이고, 그 반대인 오른쪽에서 왼쪽으로 올라가는 방향도 있을 것이다. 이러한 경우에는 한 번에 해결하기 보다는 배열을 정방향, 역방향으로 각각 순회하여 경사로를 만들어주는 것이 좋다.

따라서 알고리즘은 다음과 같다.

1. 주어진 2차원 배열을 Transpose한 배열을 하나 더 만든다. 세로 모양의 길을 찾기 위해서이다.
2. 정방향으로 우선 순회한다. 다음에 있는 칸의 높이가 현재 칸보다 같으면 `count`를 하나 늘리고(`count`는 경사로를 지을 수 있는지 판단할 때 사용한다.) 1 낮으면 일단은 패스(역방향에서 확인한다), 1 높으면 경사로를 설치할 수 있는지 판단한다.  
3. 경사로를 설치할 수 있는지 판단하는 기준은 두 가지이다. 일단 경사로를 설치하기 충분한 공간이 확보되었는가 (`count`로 충분한 공간이 얼마나 있는지를 알 수 있다.), 만약 가능하다면 이미 그곳에 경사로가 설치되어 있지는 않는가(이는 `is_built` 배열로 추적한다. 하지만 정방향을 먼저 하므로 지금 상황에선 필요 없다.)  
4. 역방향으로 순회한다. 정방향과 같지만 정방향을 순회하면서 경사로를 지은 곳을 유의할 필요가 있다.

### 코드

```py
def check(line):
    is_built = [False] * n
    current_height = line[0]
    count = 1
    for idx in range(1, n):
        if current_height == line[idx]:
            count += 1
        elif current_height - line[idx] == 1:
            current_height = line[idx]
            continue
        elif current_height - line[idx] == -1:
            if count >= l:
                for back in range(1, l + 1):
                    is_built[idx - back] = True
                count = 1
            else:
                return False
            current_height = line[idx]
        else:
            return False

    current_height = line[n - 1]
    count = 1
    for idx in range(n - 2, -1, -1):
        if current_height == line[idx]:
            count += 1
        elif current_height - line[idx] == 1:
            current_height = line[idx]
            continue
        elif current_height - line[idx] == -1:
            if count >= l:
                for back in range(1, l + 1):
                    if is_built[idx + back]:
                        return False
                    is_built[idx + back] = True
                count = 1
            else:
                return False
            current_height = line[idx]
        else:
            return False
    return True

n, l = map(int, input().split())
graph = []
graph_tranposed = [[0] * n for _ in range(n)]
answer = 0

for _ in range(n):
    graph.append(list(map(int, input().split())))

for row in range(n):
    for column in range(n):
        graph_tranposed[row][column] = graph[column][row]

for idx in range(n):
    answer += 1 if check(graph[idx]) else 0
    answer += 1 if check(graph_tranposed[idx]) else 0

print(answer)
```
