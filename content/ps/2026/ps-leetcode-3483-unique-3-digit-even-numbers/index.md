---
title: "LeetCode 3483. Unique 3-Digit Even Numbers"
date: 2026-09-11T19:36:14+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Brute Force
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/unique-3-digit-even-numbers>

## 풀이

숫자가 담긴 배열 `digits`가 주어지고, 각 숫자를 한 번씩만 사용해서 만들 수 있는 서로 다른 세 자리 짝수의 개수를 리턴하면 된다.

세 자리 수의 백의 자리, 십의 자리, 일의 자리에 사용할 인덱스를 각각 순회했다. 백의 자리는 0이면 안 되고, 일의 자리는 짝수여야 하며, 세 인덱스는 모두 달라야 한다.

같은 숫자가 여러 번 주어질 수 있으므로 만들어진 수는 `set`에 넣어서 중복을 제거했다. 마지막에 set의 크기를 리턴하면 된다.

## 코드

```python
class Solution:
    def totalNumbers(self, digits: List[int]) -> int:
        answerSet = set()
        for first in range(len(digits)):
            if digits[first] == 0:
                continue
            for second in range(len(digits)):
                if first == second:
                    continue
                for third in range(len(digits)):
                    if digits[third] % 2 != 0:
                        continue
                    if third == first or third == second:
                        continue
                    answerSet.add(100 * digits[first] + 10 * digits[second] + digits[third])
        return len(answerSet)
```
