---
title: "LeetCode 3518. Smallest Palindromic Rearrangement II"
date: 2026-07-29T10:36:59+09:00

categories:
  - Problem Solving
series:
tags:
  - Greedy
  - Permutation
features:
  - katex

draft: true
original: ""
---

## 문제

<https://leetcode.com/problems/smallest-palindromic-rearrangement-ii>

## 풀이

[1번 문제]({{< relref "posts/ps-leetcode-3517-smallest-palindromic-rearrangement-i" >}})와 마찬가지로 팰린드롬의 성질상 절반만 결정하면 전체가 결정된다. 따라서 이 문제는 절반 문자열의 `k`번째 사전순 순열을 구하는 문제로 단순화된다.

각 문자의 등장 횟수를 세고, 홀수 번 등장하는 문자는 팰린드롬의 가운데에 배치한다. 나머지는 2로 나눠 `halfTable`을 만든다. 절반 문자열에는 중복 문자가 있을 수 있으므로, 전체 순열 수는 단순히 $n!$이 아니라 중복 순열 공식으로 구해야 한다.

$$\frac{n!}{\prod_{i} n_i!}$$

여기서 `n`은 절반 문자열의 길이, `n_i`는 각 문자의 개수이다. 이 값이 `k`보다 작으면 `k`번째 순열이 존재하지 않으므로 빈 문자열을 반환한다.

순열을 앞에서부터 한 자리씩 결정한다. 사전순으로 가장 작은 문자부터 시도하면 자연스럽게 사전순으로 정렬된다! 지금 자리에 문자 `c`를 놓았을 때 나머지로 만들 수 있는 경우의 수는 다음과 같다.

$$\text{nextCount} = \text{totalCount} \times \frac{n_c}{n}$$

이 값이 `k` 이상이면 `c`를 이 자리에 확정하고, 그렇지 않으면 `k`에서 이 값을 빼고 다음 문자로 넘어가는 것을 반복하면 된다.

## 코드

```python
from math import factorial

class Solution:
    def smallestPalindrome(self, s: str, k: int) -> str:
        countTable = {}
        for char in s:
            countTable[char] = countTable.get(char, 0) + 1
        center = ""
        halfTable = {}
        for char, count in countTable.items():
            if count % 2 == 1:
                center = char
            if count // 2 > 0:
                halfTable[char] = count // 2
        halfLength = len(s) // 2
        totalCount = factorial(halfLength)
        for count in halfTable.values():
            totalCount //= factorial(count)
        if totalCount < k:
            return ""
        chars = sorted(halfTable)
        half = []
        for remaining in range(halfLength, 0, -1):
            for char in chars:
                charCount = halfTable.get(char, 0)
                if charCount == 0:
                    continue
                nextCount = totalCount * charCount // remaining
                if nextCount >= k:
                    half.append(char)
                    halfTable[char] -= 1
                    totalCount = nextCount
                    break
                k -= nextCount
        half = "".join(half)
        return half + center + half[::-1]

```