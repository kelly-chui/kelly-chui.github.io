---
title: "LeetCode 1872. Stone Game VIII"
date: 2026-08-24T10:24:55+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DP
  - Prefix Technique
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-viii>

## 풀이

정수 배열 `stones`가 주어진다. Alice와 Bob이 번갈아가며 `x`를 선택하고, `stones`에서 `x` 미만의 인덱스를 가진 원소들의 합을 자신의 점수에 더한다. 그 이후 점수에 더한 합 만큼의 값을 가진 원소를 `stones`의 왼쪽에 추가한다.

둘 다 최적으로 플레이할 때 Alice의 점수 - Bob의 점수의 최댓값을 리턴하면 된다.

2이상인 어떤 `x`를 선택하더라도 인덱스가 `x` 미만인 원소들의 합을 더한 만큼의 원소가 새로 추가되므로, 항상 시작부터 원소를 고르는 것과 같게 된다.

따라서 원소를 추가하고 제거하는 동작 자체를 제거하면 다음과 같이 게임을 재 모델링할 수 있다.

```text
매 턴마다 `x` 미만의 인덱스를 가진 원소들의 합을 더한다, `x`는 이전 턴의 `x`보다 커야한다.
```

`x` 미만의 인덱스를 가진 원소들의 합은 prefix sum을 만들면 매번 계산할 필요가 없다.

다음은 DP 모델링을 해야한다. 둘 다 최적의 플레이를 하기 때문에, Stone Game 시리즈에서 주로 사용하는 '현재 플레이어의 값을 최대화 하는 방향'으로 DP를 만든다.

`dp[i]`를 현재 플레이어가 `i` 이상의 prefix sum을 선택할 수 있을 때 얻을 수 있는 최대 점수 차이로 정의한다. 

`i`를 선택하면 현재 플레이어는 `prefix[i]`를 얻고, 이후 상대가 얻을 수 있는 최대 점수 차이는 `dp[i + 1]`이 된다. 아니면 `i`를 선택하지 않고 더 큰 prefix sum을 선택할 수 있다.

따라서 점화식은 다음과 같다.

$$
dp[i] = \max\left(dp[i + 1], \operatorname{prefix}[i] - dp[i + 1]\right)
$$

마지막 prefix sum을 선택하면 게임이 끝나므로 초기 상태는 다음과 같다.

$$
dp[n - 1] = \operatorname{prefix}[n - 1]
$$

`dp[i]`를 계산하기 위해 `dp[i + 1]`이 필요하므로, 역순으로 계산한다. 역순이기 때문에 위에서 말한 '`x`는 이전 턴의 `x`보다 커야한다'도 자연스럽게 만족하게 된다.

## 코드

```python
class Solution:
    def stoneGameVIII(self, stones: List[int]) -> int:
        n = len(stones)
        prefix = [0] * n
        prefix[0] = stones[0]
        for i in range(1, n):
            prefix[i] = prefix[i - 1] + stones[i]
        dp = [0] * n
        dp[n - 1] = prefix[n - 1]
        for i in range(n - 2, 0, -1):
            dp[i] = max(dp[i + 1], prefix[i] - dp[i + 1])
        return dp[1]
```
