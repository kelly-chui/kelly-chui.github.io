---
title: "Programmers. 합승 택시 요금"
date: 2025-08-14
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Floyd-Warshall"]
draft: false
original: "https://junmusu.tistory.com/181"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/72413>

## 풀이

문제를 간단히 하는 것이 중요하다. 이 문제에서 원하는 것은 S에서 시작해서 A와 B 노드로 가야하는데, 그 최단 거리를 요구하고 있다. 그러면 둘이 헤어지는 지점이 존재할 것이고, 이 헤어지는 지점은 S일 수도 있다(문제에서 주어진 내용이다). 그러면 헤어지는 지점을 M이라고 했을때, 우리가 구해야 하는 것은 S → M, M → A, M → B의 최단거리들의 합이다.

문제가 최단거리를 구하는 문제로 단순화 되었다. 음수 사이클이 존재하지 않으므로, 다익스트라 알고리즘이나 플로이드 워셜 알고리즘을 사용하면 된다. 만약 다익스트라를 사용한다면 M을 우리가 모르므로 모든 노드에 대해서 다익스트라 알고리즘을 적용해보고 M을 찾아야 한다. 플로이드 워셜은 모든 노드 상호간의 최단거리를 알 수 있고, 노드의 개수도 200개가 상한이기 때문에 플로이드 워셜을 쓰는 것이 훨씬 간단하게 풀 수 있다.

이 문제를 푸는 알고리즘은 다음과 같다.

1. 파라미터로 들어온 `fares` 배열로 `distances` 배열을 초기화한다.  
2. 플로이드 워셜 알고리즘을 적용해서 모든 노드 간의 최단거리를 구한다  
3. 모든 노드를 `M`이라고 가정하고 순회한다. 이 때 구한 최단 거리를 리턴한다.

### 코드

```swift
import Foundation

typealias Route = (to: Int, cost: Int)

func solution(_ n:Int, _ s:Int, _ a:Int, _ b:Int, _ fares:[[Int]]) -> Int {
    var distances = [[Int]](repeating: [Int](repeating: 987_654_321, count: n + 1), count: n + 1)
    for i in 1...n {
        distances[i][i] = 0
    }
    fares.forEach { fare in
        distances[fare[0]][fare[1]] = fare[2]
        distances[fare[1]][fare[0]] = fare[2]
    }
    for mid in 1...n {
        for start in 1...n {
            guard distances[start][mid] != 987_654_321 else { continue }
            for end in 1...n {
                guard distances[mid][end] != 987_654_321 else { continue }
                distances[start][end] = min(
                    distances[start][end],
                    distances[start][mid] + distances[mid][end]
                )
            }
        }
    }
    var answer = 987_654_321
    for m in 1...n {
        answer = min(answer, distances[s][m] + distances[m][a] + distances[m][b])
    }
    return answer
}
```
