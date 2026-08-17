---
title: "LeetCode 1563. Stone Game V"
date: 2026-08-17T11:30:13+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-v>

## 풀이

돌이 일렬로 놓여 있고, 매 턴마다 현재 구간을 둘로 나눈 뒤 더 작은 합을 가진 쪽을 가져간다. Alice가 얻을 수 있는 최대 점수를 리턴하는 문제이다.

매 턴마다 현재 구간을 둘로 나눈 뒤 더 작은 합을 가진 쪽을 가져가므로, 구간 DP로 보는 게 자연스럽다.

`dp[left][right]`를 `stoneValue[left...right]` 구간에서 Alice가 얻을 수 있는 최대 점수라고 하자. 구간을 `split`으로 나눠서 왼쪽 합과 오른쪽 합을 비교하면 된다.

- 왼쪽 합이 더 작으면 왼쪽을 가져간다.
- 오른쪽 합이 더 작으면 오른쪽을 가져간다.
- 두 합이 같으면 둘 중 더 좋은 쪽을 선택한다.

구간 합은 Prefix Sum으로 미리 구해두면 되고, `dp`는 짧은 구간부터 채우면 된다. 각 구간마다 모든 분할을 확인하므로 전체 시간 복잡도는 $O(n^3)$이다.

## 코드

```python
class Solution:
    def stoneGameV(self, stoneValue: List[int]) -> int:
        n = len(stoneValue)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + stoneValue[i]
        dp = [[None] * n for _ in range(n)]
        def solve(left, right):
            if left == right:
                return 0
            if dp[left][right] is not None:
                return dp[left][right]
            best_score = 0
            for split in range(left, right):
                left_sum = prefix[split + 1] - prefix[left]
                right_sum = prefix[right + 1] - prefix[split + 1]
                if left_sum < right_sum:
                    score = left_sum + solve(left, split)
                elif left_sum > right_sum:
                    score = right_sum + solve(split + 1, right)
                else:
                    score = left_sum + max(
                        solve(left, split),
                        solve(split + 1, right)
                    )
                best_score = max(best_score, score)
            dp[left][right] = best_score
            return best_score
        return solve(0, n - 1)
```
