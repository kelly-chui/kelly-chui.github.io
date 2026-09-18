---
title: "LeetCode 1520. Maximum Number of Non-Overlapping Substrings"
date: 2026-09-18T17:14:36+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Greedy
  - String
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings>

## 풀이

문자열 `s`가 주어지고, 겹치지 않는 부분 문자열 중 조건을 만족하는 것을 최대한 많이 골라 리턴하면 된다.

조건은 부분 문자열에 등장하는 모든 문자 `c`에 대해, `s` 전체에서 `c`가 등장하는 범위를 완전히 포함해야 한다는 것이다.

각 문자의 첫/마지막 등장 위치로 초기 범위를 잡고, 범위 안의 문자들을 보며 필요한 만큼 오른쪽을 확장하면 해당 시작점에서 만들 수 있는 최소 유효 범위를 얻는다. 범위 안의 문자가 시작점 왼쪽에서 등장한다면 유효하지 않다.

이렇게 얻은 후보들에서 겹치지 않게 최대한 많이 고르려면, 직관적으로 끝 위치 오름차순으로 그리디하게 선택하면 된다.

## 코드

```python
class Solution:
    def maxNumOfSubstrings(self, s: str) -> list[str]:
        charRanges = {}
        for idx in range(len(s)):
            if s[idx] not in charRanges:
                charRanges[s[idx]] = (idx, idx)
            start = charRanges[s[idx]][0]
            charRanges[s[idx]] = (start, idx)
        candidates = []
        for char, (start, end) in charRanges.items():
            i = start
            curStart, curEnd = start, end
            valid = True
            while i <= curEnd:
                c = s[i]
                cStart, cEnd = charRanges[c]
                if cStart < curStart:
                    valid = False
                    break
                if cEnd > curEnd:
                    curEnd = cEnd
                i += 1
            if valid:
                candidates.append((curStart, curEnd))
        candidates.sort(key=lambda x: x[1])
        result = []
        lastEnd = -1

        for start, end in candidates:
            if start > lastEnd:
                result.append(s[start:end + 1])
                lastEnd = end

        return result
```
