---
title: "BOJ 1939. 중량 제한"
date: 2023-07-07
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "Binary Search"]
draft: false
original: "https://junmusu.tistory.com/120"
---

## 문제

<https://www.acmicpc.net/problem/1939>

## 풀이

섬(노드)들과 다리(엣지)로 이루어진 그래프가 주어지고, 그 다리들 사이를 지나 목표 노드에 도착해야 한다.

다리에 웨이트가 존재하지 않고 (중량 제한은 엣지가 유효한지 판단하는 기준일 뿐 엣지의 웨이트랑 관련 없다) 최단 거리를 구하는 문제도 아니므로, 다익스트라 알고리즘이 아닌 BFS를 이용해 탐색할 수 있다.

중량이 늘어날수록 건널 수 있는 다리가 적어진다(엣지가 비활성화 된다). 우리는 이 때 주어진 두 섬 중 하나의 섬에서 다른 하나의 섬으로 갈 수 있는 최대의 중량을 구하면 된다. 리니어 서치로도 결과를 구할 수야 있겠지만 현실적으로 1 - 1,000,000,000 값을 다 탐색하는건 너무 비효율적이기 때문에 바이너리 서치를 하면 된다.

알고리즘은 다음과 같다.

1. `low`를 1, `high`를 1,000,000,000으로 설정하여 바이너리 서치를 한다. `mid`는 `(low + high) / 2`이다.  
2. 바이너리 서치에서 참/거짓을 나누는 기준값은 BFS를 통해서 구한다. 현재 주어진 `mid` 값을 중량이라고 했을 때, BFS로 두 노드가 연결된다면 `true` 안된다면 `false`로 한다.  
3. 바이너리 서치의 결과값을 출력한다. 이게 두 섬 사이를 지나다닐 수 있는 중량의 최댓값이다.

### 코드

```swift
import Foundation

struct Queue {
    private var queue = [Int]()
    private var ptr = 0
    var isEmpty: Bool {
        ptr >= queue.count
    }
    mutating func push(v: Int) {
        queue.append(v)
    }
    mutating func pop() -> Int {
        let popped = queue[ptr]
        ptr += 1
        if ptr > 50_000 {
            queue = Array(queue[ptr...])
            ptr = 0
        }
        return popped
    }
}

func bfs(root: Int, weight: Int) -> Bool {
    var isVisited = [Bool](repeating: false, count: n + 1)
    var queue = Queue()
    queue.push(v: root)
    isVisited[root] = true
    while !queue.isEmpty {
        let island = queue.pop()
        for nextIsland in graphs[island]! {
            if isVisited[nextIsland.0] { continue }
            if nextIsland.1 < weight { continue }
            isVisited[nextIsland.0] = true
            if nextIsland.0 == factories[1] {
                return true
            }
            queue.push(v: nextIsland.0)
        }
    }
    return false
}

func binarySearch() -> Int {
    var low = 1
    var high = 1_000_000_000
    var mid = 0
    while low <= high {
        mid = (low + high) / 2
        if bfs(root: factories[0], weight: mid) {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return high
}

let nm = readLine()!.split(separator: " ").map { Int(String($0))! }
let (n, m) = (nm[0], nm[1])
var graphs: [Int: [(Int, Int)]] = [:]
for _ in 0..<m {
    let bridge = readLine()!.split(separator: " ").map { Int(String($0))! }
    graphs[bridge[0], default: []].append((bridge[1], bridge[2]))
    graphs[bridge[1], default: []].append((bridge[0], bridge[2]))
}
let factories = readLine()!.split(separator: " ").map { Int(String($0))! }
print(binarySearch())
```
