---
title: "Leetcode 1406. Stone Game III"
date: 2026-08-03T12:31:05+09:00

categories:
  - Problem Solving
series:
tags:
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-iii>

## 풀이

번호가 적힌 돌이 있고, 두 명(Alice, Bob)이 번갈아 가면서 그 돌을 1개에서 3개까지 가져갈 수 있다. 2명 다 이상적으로 플레이 했을 때, 돌에 적힌 번호를 더한 합이 더 많이 가져간 사람의 이름을 리턴하면 된다. 항상 Alice가 먼저 시작한다.

약간 특이한 DP 문제이다. 점화식을 'Alice' 'Bob'을 특정하지 않고 '현재 차례인 사람이 상대보다 돌을 가질 수 있는 최대 개수'로 정의해야한다. 

점화식은 다음과 같다.

$$
dp[i] = \max \begin{cases} stoneValue[i] - dp[i+1] \\\\ stoneValue[i] + stoneValue[i+1] - dp[i+2] \\\\ stoneValue[i] + stoneValue[i+1] + stoneValue[i+2] - dp[i+3] \end{cases}
$$

`dp[i]`는 i번째 돌부터 시작할 때, 현재 차례인 플레이어가 상대보다 얼마나 더 많은 점수를 가져갈 수 있는지를 나타낸다. 돌은 앞에서부터만 가져갈 수 있으므로, `dp[i]`를 구하려면 `dp[i + 1]`, `dp[i + 2]`, `dp[i + 3]`이 먼저 계산되어 있어야 한다. 따라서 배열 끝에서부터 역순으로 계산한다.

## 코드

```swift
class Solution {
    func stoneGameIII(_ stoneValue: [Int]) -> String {
        let n = stoneValue.count
        var dp = [Int](repeating: 0, count: n)
        for i in stride(from: n - 1, to: -1, by: -1) {
            var best = stoneValue[i] - (i + 1 < n ? dp[i + 1] : 0)
            if i + 1 < n {
                best = max(best, stoneValue[i] + stoneValue[i + 1] - (i + 2 < n ? dp[i + 2] : 0))
            }
            if i + 2 < n {
                best = max(best, stoneValue[i] + stoneValue[i + 1] + stoneValue[i + 2] - (i + 3 < n ? dp[i + 3] : 0))
            }
            dp[i] = best
        }
        switch dp[0] {
        case let x where x > 0:
            return "Alice"
        case let x where x < 0:
            return "Bob"
        default:
            return "Tie"
        }
    }
}

```
