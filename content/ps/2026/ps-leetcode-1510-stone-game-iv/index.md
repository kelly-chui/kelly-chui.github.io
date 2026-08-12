---
title: "LeetCode 1510. Stone Game IV"
date: 2026-08-10T20:32:58+09:00

categories:
  - Problem Solving
series:
tags:
  - DP
algorithmTags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-iv>

## 풀이

돌이 `n`개 있고, 매 턴마다 제곱수만큼의 돌을 가져간다. 마지막 돌을 가져가는 사람이 이긴다고 할 때, Alice가 이길 수 있는지 구하면 된다.

`dp[i]`를 돌이 `i`개 남았을 때 현재 차례인 사람이 이길 수 있는지로 정의한다. 어떤 제곱수 $r^2$을 가져간 뒤 상대 차례의 상태가 패배라면, 현재 플레이어는 그 선택으로 이길 수 있다.

따라서 점화식은 다음과 같다.

$$
dp[i] = \text{true} \quad \text{if there exists } r \text{ such that } dp[i - r^2] = \text{false}
$$

반대로 가능한 모든 제곱수를 확인했는데 다음 상태가 전부 승리라면 어떤 선택을 해도 상대가 이기므로 현재 상태는 패배다. `dp[0]`은 가져갈 돌이 없으므로 패배 상태로 두고, `1`부터 `n`까지 순서대로 계산한다.

시간 복잡도는 각 상태에서 제곱수를 확인하므로 $O(n\sqrt{n})$이다.

## 코드

```swift
class Solution {
    func winnerSquareGame(_ n: Int) -> Bool {
        var dp = [Bool](repeating: false, count: n + 1)
        dp[0] = false
        for remain in 1...n {
            var root = 1
            while root * root <= remain {
                if !dp[remain - root * root] {
                    dp[remain] = true
                    break
                }
                root += 1
            }
        }
        return dp[n]
    }
}
```
