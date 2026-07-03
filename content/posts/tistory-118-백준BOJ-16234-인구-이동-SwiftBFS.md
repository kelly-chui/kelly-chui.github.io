---
title: "[백준]BOJ 16234 - 인구 이동"
date: 2023-07-06
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "BFS"]
draft: false
original: "https://junmusu.tistory.com/118"
---

## 문제

<https://www.acmicpc.net/problem/16234>

## 풀이

그래프 각 원소를 전체 탐색하며, BFS를 수행하는 문제이다. 탐색할 수 있는 칸에 대한 제약조건이 문제에 제시되므로, 이에 따라 BFS를 수행하면 된다.

알고리즘은 다음과 같다.

1. 그래프 전체를 순서대로 순회한다. 이 때 칸이 `isVisited`가 `false`인 칸에서 bfs를 수행한다. 따라서 `isVisited`는 전역 변수(혹은 call by reference)가 되어야 한다.  
2. bfs로 탐색한 칸은 서로 연합이 가능한 칸이다. bfs 탐색의 조건은 문제에 상세히 적혀있다. 그래프 전체를 순회하며 bfs 탐색을 실시하고 각 칸의 값을 조정하면, 이게 문제에서 말하는 '하루'가 지난 것이다. `isVisited`가 `false`인 칸만 연합을 수행하므로, 앞선 칸에서 수행한 bfs 탐색이 뒤에 있는 칸에 영향을 끼칠 일은 없다.  
3. 1회의 인구 이동이 끝났어도 또 인구 이동이 가능할 수 있다. 따라서 1.을 더 이상 인구이동이 불가능해 질 때까지 수행한다.

### 코드

```swift
import Foundation

func bfs(root: (Int, Int)) -> Bool {
    struct Queue {
        private var queue = [(Int, Int)]()
        private var ptr = 0
        var isEmpty: Bool {
            ptr >= queue.count
        }
        mutating func insert(v: (Int, Int)) {
            queue.append(v)
        }
        mutating func delete() -> (Int, Int) {
            let popped = queue[ptr]
            ptr += 1
            return popped
        }
    }
    let moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    var queue = Queue()
    var union: [(Int, Int)] = [root]
    var unionPop = graph[root.0][root.1]
    queue.insert(v: root)
    isVisited[root.0][root.1] = true
    while !queue.isEmpty {
        let node = queue.delete()
        for move in moves {
            let newNode = (node.0 + move.0, node.1 + move.1)
            if newNode.0 < 0 || newNode.0 >= n || newNode.1 < 0 || newNode.1 >= n { continue }
            if isVisited[newNode.0][newNode.1] { continue }
            let differ = abs(graph[node.0][node.1] - graph[newNode.0][newNode.1])
            if differ >= l && differ <= r {
                isVisited[newNode.0][newNode.1] = true
                queue.insert(v: newNode)
                union.append(newNode)
                unionPop += graph[newNode.0][newNode.1]
            }
        }
    }
    let dividedPop = unionPop / union.count
    for element in union {
        graph[element.0][element.1] = dividedPop
    }
    if union.count > 1 {
        return true
    } else {
        return false
    }
}

let nlr = readLine()!.split(separator: " ").map { Int(String($0))! }
let (n, l, r) = (nlr[0], nlr[1], nlr[2])
var graph = [[Int]]()
for _ in 0..<n {
    graph.append(readLine()!.split(separator: " ").map { Int(String($0))! })
}
var isVisited = [[Bool]](repeating: [Bool](repeating: false, count: n), count: n)
var answer = 0

while true {
    var isEnd = true
    for row in 0..<n {
        for column in 0..<n {
            if !isVisited[row][column] && bfs(root: (row, column)){
                isEnd = false
            }
        }
    }
    if isEnd {
       break
    }
    isVisited = [[Bool]](repeating: [Bool](repeating: false, count: n), count: n)
    answer += 1
}
print(answer)
```
