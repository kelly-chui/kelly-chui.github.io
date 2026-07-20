---
title: "BOJ 14226. 이모티콘"
date: 2024-04-09

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BFS
  - BOJ
  - Swift

draft: false
original: "https://junmusu.tistory.com/137"
---

## 문제

<https://www.acmicpc.net/problem/14226>

## 풀이

현재 상태를 나타내는 변수를 화면에 있는 이모티콘의 개수, 클립보드에 저장되어 있는 이모티콘의 개수로 나타낼 수 있다. 각각의 연산이 모두 1초가 걸리므로 BFS를 사용할 수 있다.

BFS를 사용하려면 노드에 방문했는지를 판별할 방법이 필요한데, 여기에선 `Array`보다는 `Set`을 쓰는것이 효율적이다. 두 개의 정수가 노드를 구성하므로 2차원 배열을 만들면 되겠지만, 이런 방식으로 한다면 배열의 크기가 너무 커질 뿐더러 효율적인 배열의 크기를 정하기도 머리가 복잡해진다. 따라서 방문한 노드를 `Set`에 저장해서 `contains()`함수로 방문 여부를 판단하는 방식을 이용한다.

![](/images/ps-boj-14226-emoticon/image-002.png)

`Set`에는 `Hashable`한 타입의 값만 넣을 수 있으므로, 스트럭처를 하나 만들어서 현재 상태를 관리한다. 이 스트럭처는 방문 여부를 판단할 때만 쓰이고 실제 BFS에서는 `((Int, Int), Int)`꼴의 튜플만 사용한다.

![](/images/ps-boj-14226-emoticon/image-003.png)

BFS 함수 내부에서 각 연산을 구현하고 배열에 담아 관리한다. 주어진 그래프가 2차원 배열로 구현된 그래프도 아니고, 딕셔너리로 구현된 그래프도 아니므로 반복문 연산을 위해 클로저로 생성하여 담아놓는다.

### 코드

```swift
import Foundation

struct State: Hashable {
    var display: Int
    var clipboard: Int

    init(_ tuple: (Int, Int)) {
        self.display = tuple.0
        self.clipboard = tuple.1
    }
}

struct Queue {
    var queue = [((Int, Int), Int)]()
    var ptr = 0
    var isEmpty: Bool { ptr >= queue.count }
    
    mutating func push(_ v: ((Int, Int), Int)) {
        queue.append(v)
    }

    mutating func pop() -> ((Int, Int), Int) {
        let firstValue = queue[ptr]
        ptr += 1
        if ptr > 100_000 {
            queue = Array(queue[ptr...])
            ptr = 0
        }
        return firstValue
    }
}

func bfs(_ start: (Int, Int)) {
    
    let moves = [
        { (_ tuple: (Int, Int)) -> (Int, Int) in return (tuple.0, tuple.0) },
        { (_ tuple: (Int, Int)) -> (Int, Int) in return (tuple.0 + tuple.1, tuple.1) },
        { (_ tuple: (Int, Int)) -> (Int, Int) in return (tuple.0 - 1, tuple.1) }
    ]
    
    var isVisited: Set<State> = []
    var queue = Queue()
    queue.push((start, 0))
    isVisited.insert(State(start))

    while !queue.isEmpty {
        let current = queue.pop()
        for move in moves {
            let next = move(current.0)
            let nextState = State(next)
            if isVisited.contains(nextState) {
                continue
            }
            if next.0 == s {
                print(current.1 + 1)
                exit(0)
            }
            queue.push((next, current.1 + 1))
            isVisited.insert(nextState)
        }
    }
}

let s = Int(readLine()!)!
bfs((1, 0))
```
