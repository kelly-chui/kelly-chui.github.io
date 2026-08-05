---
title: "LeetCode 3310. Remove Methods From Project"
date: 2026-08-05T21:10:33+09:00

categories:
  - Problem Solving
series:
tags:
  - BFS
algorithmTags:
  - BFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/remove-methods-from-project>

## 풀이

메소드 `k`에서 시작해서 도달할 수 있는 노드들을 'suspicious' 하다고 했을 때, 이 'suspicious'한 메소드들을 `k`가 직, 간접적으로 호출하는 것을 제외하고도 호출되는 경우가 있는지 확인하고 있다면 전체 메소드를, 없다면 'suspicious'한 메소드를 제외하고 리턴하면 된다.

메소드들의 호출 관계가 단방향 엣지 그래프를 이루기 때문에, BFS나 DFS 무엇을 써도 쉽게 `k`가 직, 간접적으로 호출하는 함수들을 알 수 있다. `k`에서 시작해서 도달하는 모든 메소드들은 'suspicious' 하기 때문에 방문 여부를 확인하는 배열을 그대로 사용하면 된다.

이후에 `k`를 제외한 다른 메소드가 'suspicious'한 메소드를 호출하는지 확인하면 된다. 'suspicious' 하지 않은 모든 노드들에서 BFS를 돌리는건 효율적이지 않다. (최악의 경우 BFS를 10만번 하게 된다.) 

다만, 주어진 `invocations` 배열에 모든 메소드들의 호출 관계가 있기 때문에 'suspicious' 하지 않은 노드가 'suspicious'한 노드를 호출하는지 바로 확인할 수 있다.

## 코드

```swift
class Solution {
    func remainingMethods(_ n: Int, _ k: Int, _ invocations: [[Int]]) -> [Int] {
        var graph = [[Int]](repeating: [], count: n)
        for invocation in invocations {
            let (a, b) = (invocation[0], invocation[1])
            graph[a].append(b)
        }

        struct Queue {
            private var container = [Int]()
            private var ptr = 0
            var isEmpty: Bool {
                ptr >= container.count
            }
            mutating func push(_ value: Int) {
                container.append(value)
            }
            mutating func pop() -> Int {
                let head = container[ptr]
                ptr += 1
                return head
            }
        }

        var suspicious = [Bool](repeating: false, count: n)
        var queue = Queue()
        queue.push(k)
        suspicious[k] = true
        while !queue.isEmpty {
            let current = queue.pop()
            for next in graph[current] where !suspicious[next] {
                suspicious[next] = true
                queue.push(next)
            }
        }

        for invocation in invocations {
            let (a, b) = (invocation[0], invocation[1])
            if !suspicious[a] && suspicious[b] {
                return Array(0..<n)
            }
        }
        return (0..<n).filter { !suspicious[$0] }
    }
}
```
