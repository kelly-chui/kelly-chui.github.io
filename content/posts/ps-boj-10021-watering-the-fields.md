---
title: "BOJ 10021. watering the fields"
date: 2024-04-12
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Python", "MST", "Kruskal"]
draft: false
original: "https://junmusu.tistory.com/138"
---

## 문제

<https://www.acmicpc.net/problem/10021>

## 풀이

"모든 필드를 파이프 네트워크로 연결하는 데 필요한 최소 금액"에서 MST 문제임을 알았다. 크루스칼 알고리즘을 쓰면 쉽게 풀릴 문제다.

우선 각 노드간의 거리를 알 수 없으므로 모든 경우의 수를 계산해야 한다. 필드의 개수가 2000개 이하이므로 O(n^2)의 연산을 해도 충분하다.

그 이후에는 크루스칼 알고리즘을 적용하면 되는데, 제약조건 중 하나가 비용이 C 미만인 파이프는 만들지 않는다는 것이다. 따라서 두 노드간 거리가 C 미만인 엣지는 존재하지 않는 것으로 해야한다.

### 코드

```py
def find(field):
    if parent[field] == field:
        return field
    else:
        parent[field] = find(parent[field])
        return parent[field]

def union(a, b):
    pa = find(a)
    pb = find(b)
    if pa != pb:
        parent[pa] = pb

def squared_euclidean_length(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

n, c = map(int, input().split())
fields = []
mapping = {}

for idx in range(n):
    xi, yi = map(int, input().split())
    fields.append((xi, yi))
    mapping[(xi, yi)] = idx
edges = []
parent = list(range(n))

for i in range(0, len(fields) - 1):
    for j in range(i + 1, len(fields)):
        distance = squared_euclidean_length(fields[i], fields[j])
        if distance >= c:
            edges.append((mapping[fields[i]], mapping[fields[j]], distance))

edges.sort(key = lambda x: x[2])

answer = 0
count = 0
for edge in edges:
    if find(edge[0]) != find(edge[1]):
        union(edge[0], edge[1])
        answer += edge[2]
        count += 1

print(answer if count == n - 1 else -1)
```
