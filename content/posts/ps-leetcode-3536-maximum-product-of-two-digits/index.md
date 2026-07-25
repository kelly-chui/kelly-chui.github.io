---
title: "Leetcode 3536. Maximum Product of Two Digits"
date: 2026-07-25T21:13:47+09:00

categories:
  - Problem Solving
series:
tags:
  - LeetCode
  - Python
  - Sort

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-product-of-two-digits>

## 풀이

10 이상 10억 이하의 정수 `n`이 주어지고, 각 자리수 중 두 개를 골라서 곱한 값중 가장 큰 수를 리턴하면 되는 문제이다.

문제의 힌트에선 브루트 포스를 사용하라 했는데, 정렬하면 더 쉽게 풀 수 있다.

## 코드

```python
class Solution:
    def maxProduct(self, n: int) -> int:
        digits = sorted(str(n), reverse=True)
        return int(digits[0]) * int(digits[1])
```
