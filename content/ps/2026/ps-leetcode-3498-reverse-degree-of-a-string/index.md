---
title: "LeetCode 3498. Reverse Degree of a String"
date: 2026-09-22T20:11:13+09:00
categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
features:
  - katex
draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/reverse-degree-of-a-string>

## 풀이

소문자로 이루어진 스트링 `s`가 주어지고, 각 문자의 역순 알파벳 값에 1부터 시작하는 위치를 곱한 합을 리턴하면 된다.

알파벳 순서가 `a = 1`, `z = 26`일 때 역순 알파벳 값은 `a = 26`, `z = 1`이다. 따라서 각 문자의 알파벳 순서를 뒤집은 테이블을 만들고, 스트링을 순회하면서 값을 더하면 된다.

뭔가 더 예쁜 방법이 있을 것도 같은데(C++ 이었다면 그냥 `char`로 ASCII값 쓰면 되니까...) 당장 떠오르는 방법은 `zip`이랑 딕셔너리여서 이렇게 해결했다.

## 코드

```python
class Solution:
    def reverseDegree(self, s: str) -> int:
        reversedTable = dict(zip("abcdefghijklmnopqrstuvwxyz", range(26, 0, -1)))
        answer = 0
        for i in range(len(s)):
            answer += ((i + 1) * reversedTable[s[i]])
        return answer
```
