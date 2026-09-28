---
title: "LeetCode 1614. Maximum Nesting Depth of the Parentheses"
date: 2026-09-28T12:33:43+09:00
categories:
  - Problem Solving
series:
tags:
psTags:
  - Stack
features:
  - katex
draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses>

## 풀이

유효한 괄호 스트링 `s`가 주어지고, 괄호의 최대 중첩 깊이를 리턴하면 된다.

여는 괄호를 만나면 현재 깊이를 1 증가시키고 최댓값을 갱신한다. 닫는 괄호를 만나면 현재 깊이를 1 감소시킨다. 문자열이 올바른 괄호 문자열이므로, 이 과정에서 가장 깊게 들어간 순간의 값이 답이 된다.

문자열을 한 번 순회하므로 시간 복잡도는 $O(n)$이다.

## 코드

```python
class Solution:
    def maxDepth(self, s: str) -> int:
        answer = 0
        depth = 0
        stack = []
        for c in s:
            if c == "(":
                stack.append(c)
                depth += 1
                answer = max(depth, answer)
            elif c == ")":
                stack.pop()
                depth -= 1
        return answer
```
