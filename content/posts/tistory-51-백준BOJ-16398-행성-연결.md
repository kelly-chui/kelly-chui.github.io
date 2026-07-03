---
title: "[백준]BOJ 16398 - 행성 연결"
date: 2023-02-25
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "MST"]
draft: false
original: "https://junmusu.tistory.com/51"
---

## 문제

<https://www.acmicpc.net/problem/16398>

## 풀이

모든 행성을 연결해야 하고, 그 비용을 최소로 하려면 최소 스패닝 트리(MST)를 찾아야 한다.

따라서 알고리즘의 흐름은 다음과 같아진다.

1. 2차원 배열로 입력받은 플로우 관리비용을 정렬한다.  
2. Kruskal 알고리즘을 이용해 최소 스패닝 트리를 구한다.

여기서 에지(플로우 관리비용)의 정보가 2차원 배열로 입력되므로 배열을 순회하여 (노드, 노드, 비용)꼴의 튜플 배열로 만들어 정렬했다.

2차원 배열의 각 인덱스가 노드를 특정하므로 이렇게 하는 것이 최선이라 생각했다.

### 코드

```swift
func find(_ a: Int) -> Int {
    if parent[a] != a {
        parent[a] = find(parent[a])
    }
    return parent[a]
}

func union(_ a: Int, _ b: Int) {
    let pa = find(a)
    let pb = find(b)
    if pa < pb {
        parent[pb] = pa
    } else {
        parent[pa] = pb
    }
}

import Foundation

let n = Int(readLine()!)!
var graph: [[Int]] = []
var edges: [(Int, Int, Int)] = []
var parent = Array(0..<n)
var answer: Int = 0
for _ in 0..<n {
    graph.append(readLine()!.split(separator: " ").map { Int(String($0))! })
}

for row in 0..<n {
    for column in 0..<row {
        edges.append((row, column, graph[row][column]))
    }
}

edges.sort(by: { $0.2 < $1.2 } )

for edge in edges {
    if find(edge.0) != find(edge.1) {
        union(edge.0, edge.1)
        answer += edge.2
    }
}

print(answer)
```
