---
title: "Leetcode 3345. Smallest Divisible Digit Product I"
date: 2026-08-06T13:32:20+09:00

categories:
  - Problem Solving
series:
tags:
  - Brute Force
algorithmTags:
  - Brute Force
features:
  - katex

draft: true
original: ""
---

## 문제

<https://leetcode.com/problems/smallest-divisible-digit-product-i>

## 풀이

`n`보다 큰 수 중에서 각 자리수의 곱이 `t`로 나눌 수 있는(나머지가 0인 ) 가장 작은 수를 리턴해야 한다.

문제의 제약조건이 $1 <= n <= 100$, $1 <= t <= 10$ 이라서 모든 수를 찾아봐도 된다.

정수의 각 자리수를 모두 곱한 수를 구하는 로직만 구현한 후에, `n` 부터 시작해서 숫자를 1씩 증가시키면서 `t`로 나눈 나머지를 구해서 찾으면 된다.

## 코드

```python
class Solution:
    def smallestNumber(self, n: int, t: int) -> int:
        def productDigits(x: int) -> int:
            product = 1
            while x > 0:
                product *= x % 10
                x //= 10
            return product
        answer = n
        while productDigits(answer) % t != 0:
            answer += 1
        return answer
```
