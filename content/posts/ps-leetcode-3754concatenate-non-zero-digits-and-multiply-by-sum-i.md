---
title: "LeetCode 3754. Concatenate Non-Zero Digits and Multiply by Sum I"
date: 2026-07-07T14:30:01+09:00

categories: 
    - "Online Judge"
series: 
    - Problem Solving
tags: 
    - LeetCode
    - Python
    - String

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/concatenate-non-zero-digits-and-multiply-by-sum-i>

## 풀이

문제에서 주어진 조건에 따라서 스트링을 조작하면 되는 간단한 문제이다. 인티저에서 스트링으로, 스트링에서 인티저로 타입 컨버전만 조심하면된다.

1. 주어진 정수 n을 스트링으로 변환한 다음, 앞에서부터 순회하여 `"0"`을 제거한 스트링 `filtered`를 만든다.
2. `filered`를 인티저로 타입 컨버전 해서 `x`를 구한다.
3. `filered`의 각 원소를 인티저로 컨버전 한 다음, 합을 구해서 `sum`을 구한다.
4. `x * sum`을 리턴한다.

## 코드

```py
class Solution:
    def sumAndMultiply(self, n: int) -> int:
        filtered = "".join(char for char in str(n) if char != "0")
        if not filtered:
            return 0
        return int(filtered) * sum(map(int, filtered))
```