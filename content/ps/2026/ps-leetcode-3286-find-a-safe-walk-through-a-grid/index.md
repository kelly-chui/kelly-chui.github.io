---
title: "LeetCode 3286. Find a Safe Walk Through a Grid"
date: 2026-07-02

categories:
series:
tags:

psTags:
  - 0-1 BFS

features:
  - katex

draft: false
original: ""
aliases:
  - /posts/ps-leetcode-3286-find-a-safe-walk-through-a-grid/
---

## 문제

<https://leetcode.com/problems/find-a-safe-walk-through-a-grid/>

`m x n` 이진 행렬과 체력 `health`가 주어진다. 왼쪽 위에서 오른쪽 아래까지 이동할 때, 값이 `1`인 칸에 들어가면 체력이 1 감소한다. 이동이 끝났을 때 체력이 1 이상 남아 있을 수 있는지 구하는 문제다.

## 풀이

각 칸을 정점으로 보고, 인접한 칸으로 이동하는 비용을 도착 칸의 값으로 생각한다. 그러면 이 문제는 간선 가중치가 0 또는 1인 그래프에서 시작점부터 도착점까지의 최단 경로를 구하는 문제가 된다.

0-1 BFS는 비용이 0인 칸은 덱의 앞에, 비용이 1인 칸은 덱의 뒤에 넣는다. 이 순서를 지키면 우선순위 큐 없이도 비용이 작은 경로부터 처리할 수 있다.

시작 칸도 비용에 포함되므로 시작점의 비용은 `grid[0][0]`으로 초기화한다. 도착점까지 필요한 최소 비용이 `health`보다 작으면 도착 시 체력이 1 이상 남는다.

그동안 거리 개념이 나오면 다익스트라를 먼저 떠올렸는데, 가중치의 범위를 확인하면 0-1 BFS로 더 적합하게 풀 수 있다는 점을 배웠다. 같은 문제를 Python에서는 다익스트라로, Swift에서는 0-1 BFS로 풀어보면서 두 접근의 차이도 비교했다.

Swift에서 0-1 BFS를 구현할 때는 양쪽 끝에서 원소를 넣고 뺄 수 있는 deque가 필요하다. 배열과 인덱스 포인터를 이용한 기존 BFS 큐로는 앞쪽 삽입을 자연스럽게 처리하기 어려워, Swift에 적합한 deque 구현이나 라이브러리를 더 확인해볼 필요가 있다.

격자의 각 칸과 네 방향 간선만 확인하므로 시간복잡도는 `O(mn)`, 공간복잡도는 `O(mn)`이다.

## 코드

```swift
class Solution {
    typealias Location = (row: Int, col: Int)
    func findSafeWalk(_ grid: [[Int]], _ health: Int) -> Bool {
        let (m, n) = (grid.count, grid.first!.count)
        func bfs(start: Location) -> Int {
            var queue = [Location]()
            var visited = [[Int]](repeating: [Int](repeating: -1, count: n), count: m)
            queue.append(start)
            visited[start.row][start.col] = grid[start.row][start.col]
            while !queue.isEmpty {
                let (row, col) = queue.removeFirst()
                for (dr, dc) in [(-1, 0), (0, 1), (1, 0), (0, -1)] {
                    let (newRow, newCol) = (row + dr, col + dc)
                    guard 0..<m ~= newRow && 0..<n ~= newCol else { continue }
                    guard visited[newRow][newCol] == -1 else { continue }
                    if grid[newRow][newCol] == 0 {
                        visited[newRow][newCol] = visited[row][col]
                        queue.insert((newRow, newCol), at: 0)
                    } else if grid[newRow][newCol] == 1 {
                        visited[newRow][newCol] = visited[row][col] + 1
                        queue.append((newRow, newCol))
                    }
                }
            }
            return visited[m - 1][n - 1]
        }
        return health > bfs(start: (0, 0))
    }
}
```
