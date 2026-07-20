---
title: "BOJ 10451. 순열 사이클"
date: 2022-11-06

categories:
  - PS
series:
  - Problem Solving
tags:
  - BOJ
  - DFS
  - Python

draft: false
aliases:
  - "/posts/ps-boj-10451-순열-사이클/"

original: "https://junmusu.tistory.com/35"
---

## 문제

<https://www.acmicpc.net/problem/10451>

## 풀이

순열이 각각의 (1부터 시작하는)인덱스와 매칭되어있는 그래프를 만들면 쉽게 해결된다. (친절하게 문제에 그림도 있다.)

순열과 인덱스는 내부 원소들이 순서를 제외하고 같으므로 무조건 내부에 사이클을 형성하게 된다.

따라서 문제에서 주어진 그대로 우리는 서로 가르키는 방향을 재귀로 따라가고, 이미 방문한 숫자가 나온다면 재귀를 종료시키기를 반복해서 생기는 사이클의 총 개수를 카운트 하기만 하면 된다.

### 코드

```py
def dfs(v, start):
    isVisited[v] = True
    if not isVisited[permutation[v - 1]]:
        dfs(permutation[v - 1], start)

n = []
per = []
t = int(input())
for _ in range(t):
    n_temp = int(input())
    per_temp = list(map(int, input().split()))
    n.append(n_temp)
    per.append(per_temp)

for case in range(t):
    count = 0
    isVisited = [False] * (n[case] + 1)
    permutation = per[case]
    for i in range(1, n[case] + 1):
        if not isVisited[i]:
            dfs(i, i)
            count += 1
    print(count)
```

굳이 재귀를 쓰지 않더라도 반복문만으로도 깔끔한 코드가 나올것 같다.
