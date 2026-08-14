---
title: "Leetcode 3090. Maximum Length Substring With Two Occurrences"
date: 2026-08-14T11:53:07+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - String
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-length-substring-with-two-occurrences>

## 풀이

스트링 `s`가 주어지고, 스트링 `s`의 서브스트링 중에서 같은 문자가 최대 2번 까지만 등장하는 서브스트링의 최대 길이를 리턴하는 문제이다.

투 포인터를 이용해서, 서브스트링 내부의 각 문자의 개수는 `frequencies` 딕셔너리로 추적하고, 같은 문자가 2개를 초과하면 `start`, 그렇지 않다면 `end`를 증가시키는 방향으로 `s`를 탐색하면 된다.

문제의 제약조건이 널널해서 $O(n^2)$ 방식의 브루트 포스로도 풀 수 있지만 투 포인터를 이용하면 $O(n)$으로 쉽게 풀 수 있다.

## 코드

```python
class Solution:
    def maximumLengthSubstring(self, s: str) -> int:
        frequencies = {}
        answer = 0
        start = 0
        for end in range(len(s)):
            frequencies[s[end]] = frequencies.get(s[end], 0) + 1
            while frequencies[s[end]] > 2:
                frequencies[s[start]] -= 1
                start += 1
            answer = max(answer, end - start + 1)
        return answer
```
