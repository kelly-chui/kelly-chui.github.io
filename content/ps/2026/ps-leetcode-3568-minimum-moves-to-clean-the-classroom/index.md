---
title: "LeetCode 3568. Minimum Moves to Clean the Classroom"
date: 2026-09-01T16:38:26+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - BFS
  - Bit Masking
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/minimum-moves-to-clean-the-classroom>

## 풀이

교실 격자에서 시작점 `S`에서 출발해 모든 쓰레기 `L`을 수거하는 최소 이동 횟수를 리턴하면 된다. `R` 칸에 도착하면 에너지가 최대치까지 회복된다. 벽 `X`는 지나갈 수 없다. 불가능 하다면 `-1`을 리턴한다.

최소 이동 횟수이므로 BFS를 사용하면 되지만, 같은 칸에 도착했더라도 어떤 쓰레기를 수거했는지, 에너지가 얼마나 남았는지에 따라 다음에 갈 수 있는 경로가 달라질 수 있으므로, 4차원(위치 2차원 + 쓰레기 상태 + 에너지 상태) BFS가 된다.

따라서 BFS의 상태를 다음처럼 정의했다.

```text
(row, col, mask, energy)
```

- `row`, `col`: 현재 위치
- `mask`: 수거한 쓰레기들의 비트마스크
- `energy`: 현재 남은 에너지

쓰레기의 개수가 최대 10개이므로, 비트마스크로 관리하는게 좋다. 쓰레기 칸마다 인덱스를 부여하고, 해당 칸에 들어갈 때 `mask`의 비트를 켠다. 

모든 쓰레기를 수거한 상태는 다음과 같다.

$$
fullMask = 2^{litterCount} - 1
$$

여기서 남은 에너지를 상태에 그대로 포함하면 같은 위치와 `mask` 조합을 에너지마다 따로 방문하게 된다. 같은 위치에서 같은 쓰레기를 수거한 상태라면, 더 많은 에너지를 가진 상태가 항상 더 유리하다. 그래서 `bestEnergy[row][col][mask]`에 그 상태로 도착했을 때의 최대 에너지만 기록했다.

새로 이동한 상태의 에너지가 기존 최대 에너지보다 작거나 같으면, 이후에 할 수 있는 이동도 기존 상태보다 많을 수 없으므로 탐색안해도 된다.

```swift
if newE <= bestEnergy[newRow][newCol][newMask] {
    continue
}
bestEnergy[newRow][newCol][newMask] = newE
```

`R` 칸은 이동 비용을 먼저 차감한 뒤 에너지를 회복한다. 에너지가 0이 된 상태는 더 이동할 수 없지만, 그 이동으로 마지막 쓰레기를 수거했다면 정답이 될 수 있다.

격자의 크기를 $m \times n$, 쓰레기 개수를 $l$, 최대 에너지를 $E$라고 하자. 상태 조합은 $O(mn2^l)$개이고, 한 상태의 최대 에너지가 갱신될 수 있는 횟수까지 고려하면 시간복잡도는 $O(mn2^lE)$이다. 공간복잡도는 `bestEnergy` 배열 기준 $O(mn2^l)$이다.

## 코드

```swift
class Solution {
    typealias QueueElement = (x: Int, y: Int, mask: Int, e: Int, steps: Int)
    typealias Location = (row: Int, col: Int)
    func minMoves(_ classroom: [String], _ energy: Int) -> Int {
        let m = classroom.count
        let n = classroom.first!.count
        let graph = classroom.map { Array($0) }
        var litters = [Location]()
        var start: Location = (-1, -1)
        for row in 0..<m {
            for col in 0..<n {
                if graph[row][col] == "L" {
                    litters.append((row, col))
                } else if graph[row][col] == "S" {
                    start = (row, col)
                }
            }
        }
        var litterIdx = [[Int]](repeating: [Int](repeating: -1, count: n), count: m)
        for (idx, value) in litters.enumerated() {
            litterIdx[value.row][value.col] = idx
        }
        
        struct Queue {
            var container = [QueueElement]()
            var ptr = 0
            var isEmpty: Bool { ptr >= container.count }

            mutating func push(_ v: QueueElement) {
                container.append(v)
            }
            mutating func pop() -> QueueElement {
                let head = container[ptr]
                ptr += 1
                return head
            }
        }

        func bfs(start: Location) -> Int {
            var queue = Queue()
            queue.push((start.row, start.col, 0, energy, 0))
            let fullMask = (1 << litters.count) - 1

            var bestEnergy = [[[Int]]](
                repeating: [[Int]](
                    repeating: [Int](repeating: -1, count: fullMask + 1),
                    count: n
                ),
                count: m
            )
            bestEnergy[start.row][start.col][0] = energy
            
            while !queue.isEmpty {
                let current = queue.pop()
                if current.mask == fullMask {
                    return current.steps
                }
                for (dr, dc) in [(-1,0),(1,0),(0,-1),(0,1)] {
                    let newRow = current.x + dr
                    let newCol = current.y + dc
                    var newE = current.e - 1
                    var newMask = current.mask
                    guard newRow >= 0, newRow < m,
                          newCol >= 0, newCol < n,
                          graph[newRow][newCol] != "X",
                          newE >= 0 else { 
                        continue 
                    }
                    if graph[newRow][newCol] == "L" {
                        let idx = litterIdx[newRow][newCol]
                        newMask = current.mask | (1 << idx)
                    }
                    if graph[newRow][newCol] == "R" {
                        newE = energy
                    }
                    if newE <= bestEnergy[newRow][newCol][newMask] {
                        continue
                    }
                    bestEnergy[newRow][newCol][newMask] = newE
                    queue.push((newRow, newCol, newMask, newE, current.steps + 1))
                }
            }
            return -1
        }
        return bfs(start: start)
    }
}

```
