---
title: "LeetCode 1140. Stone Game II"
date: 2026-08-10T22:18:06+09:00

categories:
  - Problem Solving
series:
tags:
  - DP
algorithmTags:
  - DP
features:
  - katex

draft: true
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-ii>

## 풀이

돌이 일렬로 놓여 있고, 현재 `M`일 때 `1`개부터 `2M`개까지 가져갈 수 있다. 돌을 가져간 뒤에는 `M`이 `max(M, 가져간 개수)`로 바뀐다. Alice가 항상 먼저 시작하고, Alice가 얻을 수 있는 돌의 최대 개수를 구하면 된다.

현재 차례인 사람이 상대보다 얼마나 더 많이 가져갈 수 있는지로 DP를 정의할 수도 있지만, 이 문제에서는 현재 상태에서 현재 플레이어가 최대로 가져갈 수 있는 돌의 수를 저장하는 방식이 더 직관적이다.

`dp[i][m]`을 `i`번째 돌부터 시작하고 현재 `M`이 `m`일 때, 현재 플레이어가 얻을 수 있는 최대 돌의 수라고 하자. `suffix[i]`는 `i`번째 돌부터 끝까지 남은 돌의 합이다.

현재 플레이어가 `x`개를 가져가면 상대는 `dp[i + x][max(m, x)]`만큼 가져갈 수 있다. 따라서 현재 플레이어가 가져갈 수 있는 양은 전체 남은 돌에서 상대의 최댓값을 뺀 값이다.

```text
dp[i][M] = max(suffix[i] - dp[i + x][max(M, x)])
```

뒤에서부터 `i`를 채우면 더 뒤의 상태를 먼저 계산할 수 있다. 선택 가능한 `x`를 `1`부터 `2M`까지 모두 확인하고, 끝까지 가져갈 수 있는 경우에는 남은 돌 전체를 얻는다.

돌의 뒤쪽 상태부터 계산해야 하므로 `i`를 끝에서부터 역순으로 순회한다. 상태는 `i`, `m` 두 개이므로 시간 복잡도는 $O(n^3)$이다.

## 코드

```swift
class Solution {
    func stoneGameII(_ piles: [Int]) -> Int {
        let suffix = piles.indices.reversed().reduce(
            into: [Int](repeating: 0, count: piles.count + 1)
        ) { acc, i in
            acc[i] = acc[i + 1] + piles[i]
        }
        var dp = [[Int]](
            repeating: [Int](
                repeating: 0, count: piles.count + 1
            ),
            count: piles.count
        )
        for i in (0..<piles.count).reversed() {
            for m in 1...piles.count {
                for x in 1...(2 * m) {
                    guard i + x < piles.count else { 
                        dp[i][m] = max(dp[i][m], suffix[i])
                        break 
                    }
                    dp[i][m] = max(dp[i][m], suffix[i] - dp[i + x][max(m, x)])
                }
            }
        }
        return dp[0][1]
    }
}
```
