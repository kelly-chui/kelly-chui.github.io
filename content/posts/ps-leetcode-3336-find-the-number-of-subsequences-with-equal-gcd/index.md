---
title: "Leetcode 3336. Find the Number of Subsequences With Equal GCD"
date: 2026-07-14T09:28:12+09:00

categories:
  - Online Judge
series:
  - LeetCode
tags:
  - Dynamic Programming
  - GCD
  - Python

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-the-number-of-subsequences-with-equal-gcd>

## 풀이

수열 `nums`이 주어지고, `nums`에서 서로 원소가 겹치지 않게 부분 수열을 두 개 만든 뒤, 각 부분 수열(이하 A, B라 함)의 GCD가 같은 경우의 수를 찾는 문제이다.

만약 브루트 포스를 시도한다면, 원소의 개수 `n`, 각 원소가 가질 수 있는 상태가 3개(부분 수열 A, 부분 수열 B, 아예 미포함)이므로, 시간 복잡도가 $O(n \times 3^n)$ 이 되는데, `nums`의 최대 크기가 200이므로 유효한 시간 내에 해결할 수 없다.

하지만 부분 수열을 점점 채워나가면서 두 부분 수열을 비교할 수 있으므로, DP를 사용하면 O(n * 부분 수열A의 최대 gcd * 부분 수열B의 gcd 최대값)이 된다. 문제의 제약조건에서 원소의 최대 크기는 200이고, GCD는 원소보다 클 수 없으므로, $O(n \times 200 \times 200)$으로 줄일 수 있다.

dp테이블 `dp[g1][g2]`를 '지금까지 만난 원소들로 만들 수 있는 부분 수열 A의 GCD가 `g1`이고, B의 GCD가 `g2`인 서로소 쌍의 수로 정의하자. 각 원소 `num`은 기존 상태에서 3가지의 상태로 변할 수 있다:

점화식은 다음과 같다:

```
newDP[g1][g2] += dp[g1][g2] // 원소 num을 아무 곳에도 포함 안 시킬 때
newDP[gcd(g1, num)][g2] += dp[g1][g2] // 원소 num을 부분 수열 A에 포함시킬 때
newDP[g1][gcd(g2, num)] += dp[g1][g2] // 원소 num을 부분 수열 B에 포함시킬 때
```

{{< callout type="warning" title="주의" >}}
`dp[0][0] = 1`로 초기화 해줘야 한다, 문제에서 '각 부분 수열이 비어있지 않다' 라고 되어있지만, 아무것도 시작하지 않은 상태를 표현해야, DP를 시작할 수 있다.
{{< /callout >}}

이 세 가지 경우를 동시에 계산해야하는데, 하나의 원소가 다른 부분수열들에 중첩되어 포함될 수 없으므로, 임시 배열을 만들어서 계산 한 다음, 원본 DP 테이블에 복사해줘야 한다.

최종적으로 `g1`과 `g2`가 같은 dp 테이블의 모든 값의 합을 리턴하면 된다. `dp[0][0]`과 같은 경우에는 문제 제약조건에서 비어있는 부분수열은 없다 했으니, 제외한다.

## 코드

```python
class Solution:
    def subsequencePairCount(self, nums: List[int]) -> int:
        MOD = 10 ** 9 + 7
        dp = [[0] * 201 for _ in range(201)]
        dp[0][0] = 1
        for num in nums:
            newDP = [[0] * 201 for _ in range(201)]
            for g1 in range(201):
                for g2 in range(201):
                    if dp[g1][g2] == 0:
                        continue
                    newDP[g1][g2] = (newDP[g1][g2] + dp[g1][g2]) % MOD
                    newDP[gcd(g1, num)][g2] = (newDP[gcd(g1, num)][g2] + dp[g1][g2]) % MOD
                    newDP[g1][gcd(g2, num)] = (newDP[g1][gcd(g2, num)] + dp[g1][g2]) % MOD
            dp = newDP
        return sum(dp[i][i] for i in range(1, 201)) % MOD
```
