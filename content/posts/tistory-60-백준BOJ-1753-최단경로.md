---
title: "[백준]BOJ 1753 - 최단경로"
date: 2023-03-05
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "Dijkstra"]
draft: false
original: "https://junmusu.tistory.com/60"
---

## 문제

<https://www.acmicpc.net/problem/1753>

## 풀이

다익스트라 입문 문제이다. 단, 스위프트로 풀려면 힙을 직접 구현해야 한다.

입력으로 주어지는 엣지의 웨이트가 모두 같다는 조건이 없으므로, BFS가 아닌 다익스트라로 탐색해야 한다.

### 코드

```swift
import Foundation

struct Heap {
    var heap: [(Int, Int)] = []
    
    func isEmpty() -> Bool {
        return heap.isEmpty ? true : false
    }

    mutating func insert(_ value: (Int, Int)) {
        heap.append(value)
        var currentIndex = heap.count - 1
        while currentIndex > 0 {
            let parentIndex = (currentIndex - 1) / 2
            if heap[currentIndex].1 < heap[parentIndex].1 {
                heap.swapAt(currentIndex, parentIndex)
                currentIndex = parentIndex
            } else {
                break
            }
        }
    }

    mutating func deleteMin() -> (Int, Int) {
        if heap.isEmpty{
            return (0, 0)
        }
        let min = heap[0]
        heap[0] = heap[heap.count - 1]
        heap.removeLast()
        
        var currentIndex = 0
        while true {
            let leftChildIndex = 2 * currentIndex + 1
            let rightChildIndex = 2 * currentIndex + 2
            
            if leftChildIndex >= heap.count {
                break
            }
            var minChildIndex = leftChildIndex
            if rightChildIndex < heap.count && heap[rightChildIndex].1 < heap[leftChildIndex].1 {
                minChildIndex = rightChildIndex
            }
            if heap[minChildIndex].1 < heap[currentIndex].1 {
                heap.swapAt(currentIndex, minChildIndex)
                currentIndex = minChildIndex
            } else {
                break
            }
        }
        return min
    }
}

func dijkstra(k: Int) {
    var heap = Heap()
    heap.insert((k, 0))
    distanceTable[k] = 0
    while !heap.isEmpty() {
        let edge = heap.deleteMin()
        if distanceTable[edge.0] < edge.1 {
            continue
        }
        for node in graph[edge.0] {
            let cost = edge.1 + node.1
            if cost < distanceTable[node.0] {
                distanceTable[node.0] = cost
                heap.insert((node.0, cost))
            }
        }
    }
}

let ve = readLine()!.split(separator: " ").map { Int(String($0))! }
let k = Int(readLine()!)!
var graph = [[(Int, Int)]](repeating: [], count: ve[0] + 1)
for _ in 0..<ve[1] {
    let uvw = readLine()!.split(separator: " ").map { Int(String($0))! }
    graph[uvw[0]].append((uvw[1], uvw[2]))
}
var distanceTable = [Int](repeating: 300_001, count: ve[0] + 1)

dijkstra(k: k)

for i in 1...ve[0] {
    if distanceTable[i] == 300_001 {
        print("INF")
    } else {
        print(distanceTable[i])
    }
}
```
