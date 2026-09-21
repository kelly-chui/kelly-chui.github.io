---
title: "LeetCode 3524. Find X Value of Array I"
date: 2026-09-21T19:47:12+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DP
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-x-value-of-array-i>

## 풀이

수열 `nums`가 주어진다. `nums`에서 prefix와 suffix를 제거하고 남은 부분 배열의 곱을 `k`로 나눈 나머지가 `x`가 되는 경우의 수를 모든 `x`에 대해 배열로 만들어서 리턴하면 된다.

prefix와 suffix 모두 비어있을 수 있으므로, 결국 `nums`의 모든 부분 배열에 대해 곱의 나머지를 세는 문제가 된다.

부분 배열의 곱을 나머지 기준으로 관리하기 위해 DP를 사용한다. $dp[x]$를 현재 위치에서 끝나는 부분 배열 중 곱의 나머지가 $x$인 것의 개수로 정의한다. 

오른쪽 끝점 $r$을 고정하면, $l$을 $r$에서 $0$까지 줄여가며 다음 점화식으로 곱을 누적할 수 있다:

$$dp(l, r) = \begin{cases} \text{nums}[r] & (l = r) \\ dp(l+1, r) \cdot \text{nums}[l] & (l < r) \end{cases}$$

이를 모든 $r$에 대해 반복하면 $O(n^2)$에 `result`를 채울 수 있는데, $O(nk)$로 최적화할 수 있다.

$dp[x]$를 현재 위치에서 끝나는 부분 배열 중 곱의 나머지가 $x$인 것의 개수로 재정의하면, 새 원소 $v = \text{nums}[r]$에 대해 나머지가 $x$이던 부분 배열은 $(x \cdot v) \bmod k$로 전이된다:

$$dp_{\text{new}}[(x \cdot v) \bmod k] \mathrel{+}= dp[x]$$

$$dp_{\text{new}}[v \bmod k] \mathrel{+}= 1$$

## 코드

```python
class Solution:
    def resultArray(self, nums: List[int], k: int) -> List[int]:
        result = [0] * k
        dp = [0] * k
        for r in range(len(nums)):
            newDp = [0] * k
            for x in range(k):
                if dp[x]:
                    newDp[(x * nums[r]) % k] += dp[x]
            newDp[nums[r] % k] += 1
            dp = newDp
            for x in range(k):
                result[x] += dp[x]

        return result
```
