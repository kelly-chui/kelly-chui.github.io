---
title: "Leetcode 3532. Path Existence Queries in a Graph I"
date: 2026-07-10T09:21:23+09:00

categories:
  - PS
series:
  - Problem Solving
tags:
  - LeetCode
  - Swift
  - Union Find

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/path-existence-queries-in-a-graph-i>

## 풀이

그래프 각 노드의 연결 조건이 주어지고, 들어오는 쿼리들에 있는 두 노드들이 연결되어있는지 확인하는 문제이다.

`queries` 배열의 길이가 최대 10만이므로, BFS를 이용해서 풀기는 거의 불가능하다. BFS보다 더 빠르게 '연결 여부만' 확인하는 방법은 Union-Find Set을 사용하면 된다.

우선 연결 조건은 두 노드의 절대 차이(노드 번호의 차이의 절대값)가 `maxDiff` 이하여야 하는데, 문제에서 `nums` 배열이 오름차순으로 정렬되어 있다고 했으므로, `nums[j] - nums[i] <= maxDiff` 를 만족하는 연속된 범위를 투 포인터로 찾을 수 있다.

`start`와 `end` 포인터를 이용해서, end를 최대한 늘려가며 조건을 만족하는 노드들을 Union한다. `start`가 이동할 때 `end`는 절대 뒤로 가지 않으므로 투포인터 이므로 전체 배열을 $O(n)$에 볼 수 있다.

이렇게 Union-Find를 구성한 뒤, 각 쿼리에서 두 노드의 루트가 같은지만 확인하면 된다.

## 코드

```swift
// https://leetcode.com/problems/path-existence-queries-in-a-graph-i

class Solution {
    func pathExistenceQueries(_ n: Int, _ nums: [Int], _ maxDiff: Int, _ queries: [[Int]]) -> [Bool] {
        var parent = Array(0..<n)
        func find(_ a: Int) -> Int {
            if parent[a] != a {
                parent[a] = find(parent[a])
            }
            return parent[a]
        }
        func union(_ a: Int, _ b: Int) {
            parent[find(a)] = find(b)
        }
        var start = 0
        var end = 0
        while start < n {
            while end + 1 < n && nums[end + 1] - nums[start] <= maxDiff {
                union(start, end + 1)
                end += 1
            }
            start += 1
            if end < start {
                end = start
            }
        }
        return queries.map { find($0[0]) == find($0[1]) }
    }
}
```
