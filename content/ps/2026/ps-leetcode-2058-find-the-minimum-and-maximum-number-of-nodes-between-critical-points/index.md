---
title: "LeetCode 2058. Find the Minimum and Maximum Number of Nodes Between Critical Points"
date: 2026-08-31T10:22:13+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Linked List
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-the-minimum-and-maximum-number-of-nodes-between-critical-points>

## 풀이

링크드 리스트의 시작 `head`가 주어진다. 양 옆 노드 둘 다보다 크거나 혹은 작은 노드를 Critical Point라고 했을때, Critical Points 사이의 최대 거리와 최소 거리를 리턴하면 된다.

링크드 리스트를 순회하면서 Critical Point를 따로 배열 `criticalPoints`에 저장하고, 거기서 최대값과 최소값을 찾으면 된다.

최대값은 단순히 마지막 인덱스 - 처음 인덱스로 나오지만, 최소값은 `criticalPoints`를 순회하면서 $O(n)$에 구할 수 있다. 

## 코드

```swift
class Solution {
    func nodesBetweenCriticalPoints(_ head: ListNode?) -> [Int] {
        var points = [Int](), prev = head, current = head?.next, index = 2
        while let cur = current, let next = cur.next, let pre = prev {
            if (pre.val < cur.val && next.val < cur.val) ||
               (pre.val > cur.val && next.val > cur.val) { points.append(index) }
            prev = current; current = next; index += 1
        }
        guard points.count >= 2 else { return [-1, -1] }
        let minDistance = zip(points, points.dropFirst()).map { $1 - $0 }.min()!
        return [minDistance, points.last! - points.first!]
    }
}
```
