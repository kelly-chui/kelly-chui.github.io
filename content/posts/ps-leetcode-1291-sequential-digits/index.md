---
title: "Leetcode 1291. Sequential Digits"
date: 2026-07-13T10:59:57+09:00

categories:
  - PS
series:
  - Problem Solving
tags:
  - Backtracking
  - LeetCode
  - Python

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/sequential-digits>

## 풀이

`low`와 `high` 사이의 수 중, 각 자릿수가 123, 3456 처럼 연속으로 이어지는 수를 모두 리턴하는 문제이다

문제와 제약조건을 보고 바로 DFS 백트래킹로 풀어야겠다는 생각을 했다. 구간의 크기가 최대 1억이기 때문에, 하나하나 확인하는 것은 무리가 있다. 따라서 수를 하나씩 붙여나가면서 확인하고, 조건에 벗어나면 프룬닝 하면 되는 전형적인 문제로 생각했다.

백트래킹으로도 충분히 빠른 속도로 문제를 풀 수 있지만, 문제를 제출하고 난 뒤 효율성을 검증해보니. `high` 크기가 최대 1억이기 때문에, 후보들의 수가 몇개 되지 않기 때문에, 실제로 자리수가 연속되는 모든 숫자들을 만들고 확인하는 방식이 더 빠를수도 있다고 한다.

## 코드

```py
class Solution:
    def sequentialDigits(self, low: int, high: int) -> List[int]:
        answer = []
        seq = []
        def dfs(n: int):
            if n > 9:
                return
            seq.append(str(n))
            intSeq = int("".join(seq))
            if intSeq <= high:
                if low <= intSeq:
                    answer.append(intSeq)
                dfs(n = n + 1)
            seq.pop()
        for i in range(1, 10):
            dfs(n = i)
        return sorted(answer)
```
