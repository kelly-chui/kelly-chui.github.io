---
title: "LeetCode. Smallest Subsequence of Distinct Characters"
date: 2026-07-20

categories:
  - PS
series:
tags:
  - LeetCode
  - Python
  - Stack

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/smallest-subsequence-of-distinct-characters>

## 풀이

문자열 `s`에 있는 모든 개별 문자를 정확히 한 번씩 포함하는 부분수열 중, 사전순으로 가장 작은 것을 리턴하면 된다.

처음에 투 포인터를 생각했는데, 원소가 굳이 쭉 이어질 필요가 없으니 스택을 활용했다. 처음에 전처리로 각 문자의 마지막 등장 인덱스를 구해둔다.

스택 top의 마지막 인덱스가 현재 인덱스보다 크면 뒤에 또 나온다는 뜻이므로 제거할 수 있다. 스택에 문자를 추가하기 전, 아래 세 조건을 모두 만족할 때 top을 pop하면 된다.

1. 스택이 비어있지 않다
2. 스택 top이 현재 문자보다 크다 (사전순으로 뒤에 있다)
3. 스택 top 문자가 뒤에 또 등장한다 (`lastIndice[stack[-1]] > idx`)

## 코드

```py
class Solution:
    def smallestSubsequence(self, s: str) -> str:
        stack = []
        lastIndice = {}
        for idx, c in enumerate(s):
            lastIndice[c] = idx
        for idx, c in enumerate(s):
            if c in stack:
                continue
            while stack and c < stack[-1] and lastIndice[stack[-1]] > idx:
                stack.pop()
            stack.append(c)
        return "".join(stack)
```
