---
title: "LeetCode 2265. Count Nodes Equal to Average of Subtree"
date: 2026-09-10T19:42:51+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/count-nodes-equal-to-average-of-subtree>

## 풀이

이진 트리의 루트가 주어지고, 자신의 서브트리에 있는 노드 값의 평균(소수점 이하를 버린 정수 평균)과 값이 같은 노드의 개수를 리턴하면 된다.

리프가 아닌 각 노드에서 자신을 루트로 하는 서브트리의 합과 노드의 수가 모두 필요하므로 재귀 순회할 때 루트를 마지막으로 봐야한다(후위 순회).

왼쪽, 오른쪽 서브트리에서 각각 노드 값의 합과 노드의 개수를 받은 뒤에, 현재 노드까지 더하면 서브트리의 합과 개수가 된다.

`합 / 개수`가 현재 노드 값과 같으면 `answer`를 1증가 시키고, 이 `answer`도 자식 서브트리의 정답과 함께 리턴한다. 이 과정을 재귀 반복하면 된다.

## 코드

```swift
class Solution {
    typealias TraversalNode = (sum: Int, count: Int, answer: Int)
    func averageOfSubtree(_ root: TreeNode?) -> Int {
        func traversalTree(_ current: TreeNode?) -> TraversalNode {
            guard let current else { return (0, 0, 0) }
            let left = traversalTree(current.left)
            let right = traversalTree(current.right)
            let totalCount = left.count + right.count + 1
            let totalSum = left.sum + right.sum + current.val
            let isMatch = (totalSum / totalCount) == current.val
            let answer = left.answer + right.answer + (isMatch ? 1 : 0)
            return (totalSum, totalCount, answer)
        }
        return traversalTree(root).answer
    }
}
```
