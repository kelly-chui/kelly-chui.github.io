---
title: "Programmers. 바이러스 파이프"
date: 2026-09-23T20:06:39+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - BFS
  - DFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/468373>

## 풀이

트리 형태의 배양체 그래프가 주어지고, 초기 감염 노드 `infection`이 주어진다. 파이프를 열 때마다 감염된 배양체에 인접해 있는 배양체가 감염된다고 할 때, 파이프를 최대 `k`번 열었다 닫아서 감염시킬 수 있는 배양체의 최대 개수를 리턴하면 된다.

파이프의 종류가 `A`, `B`, `C`로 3개, 그리고 `k`의 제약조건이 $1 \leq k \leq 10$ 이고, 연속적으로 파이프를 선택할 수 없으므로, 모든 경우의 수는 $3 \times 2^9 = 1536$개밖에 되지 않는다.

그러면 '한 번의 행동'을 했을 때, 그 행동의 결과는 어떻게 계산할까? '인접 노드로 퍼져나가는 것'이기 때문에 BFS다. 

BFS의 시간 복잡도는 $O(V + E)$인데, 노드의 개수가 `n`개고, 트리 구조 이므로 결국 $O(2 \times n + 1) = O(n)$이다.

`n`의 제약조건은 $2 \leq n \leq 100$ 이므로 (거의) 상수 시간이나 마찬가지다. 따라서 DFS로 브루트 포스를 해도 전혀 부담이 없다.

DFS 탐색 중 매 노드에서 현재 감염된 배양체 수의 최댓값을 갱신한다. 만약 모든 배양체가 감염되었거나 k번을 모두 소진했다면 탐색을 종료한다.

## 코드

```swift
import Foundation

func solution(_ n: Int, _ infection: Int, _ edges: [[Int]], _ k: Int) -> Int {
    func dfs(lastSelection: Int? = nil) {
        answer = max(answer, infectedNodes.count)
        if typeOrders.count == k {
            return
        }
        if infectedNodes.count == n {
            return
        }
        for selectedType in 1...3 where selectedType != lastSelection {
            let temp = infectedNodes
            infectedNodes = bfs(infections: infectedNodes, selectedType: selectedType)
            typeOrders.append(selectedType)
            dfs(lastSelection: selectedType)
            typeOrders.removeLast()
            infectedNodes = temp
        }
    }

    func bfs(infections: Set<Int>, selectedType: Int) -> Set<Int> {
        var queue = Array(infections)
        var isVisited = infections
        while !queue.isEmpty {
            let cur = queue.removeFirst()
            for (pipeType, next) in tree[cur, default: []] {
                guard pipeType == selectedType else { continue }
                guard !isVisited.contains(next) else { continue }
                queue.append(next)
                isVisited.insert(next)
            }
        }
        return isVisited
    }

    var tree = [Int: [(type: Int, node: Int)]]()
    edges.forEach { edge in
        tree[edge[0], default: []].append((edge[2], edge[1]))
        tree[edge[1], default: []].append((edge[2], edge[0]))
    }
    var typeOrders = [Int]()
    var infectedNodes = Set<Int>([infection])
    var answer = 1
    dfs()

    return answer
}
```
