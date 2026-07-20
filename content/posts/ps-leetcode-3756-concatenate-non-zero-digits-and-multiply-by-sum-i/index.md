---
title: "LeetCode 3756. Concatenate Non-Zero Digits and Multiply by Sum II"
date: 2026-07-08T14:30:01+09:00

categories:
  - PS
series:
  - Problem Solving
tags:
  - LeetCode
  - Prefix Sum
  - Python

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/concatenate-non-zero-digits-and-multiply-by-sum-ii>

## 풀이

1번 문제와 로직은 동일하다. 차이점은 스트링 `s`의 서브스트링에 같은 작업을 `queries`마다 반복해야 한다는 점이다.
`queries`의 원소가 최대 10만 개이므로, 매 쿼리마다 부분 문자열을 슬라이싱해서 처리하면 시간 초과가 난다. 따라서 전처리를 통해 각 쿼리를 $O(1)$ 혹은 $O(n \log n)$에 처리할 수 있도록 해야 한다.

전처리 단계에서 네 가지 누적 배열을 만든다.

- `pow10`: $\text{pow10}[i] = 10^i \mod (10^9 + 7)$
- `preSum`: 각 인덱스까지 자릿수의 합
- `preConcat`: 각 인덱스까지 0이 아닌 숫자들을 이어붙인 값
- `nonZeroCount`: 각 인덱스까지 0이 아닌 숫자의 개수

쿼리 `[l, r]`이 들어오면 네 배열로 `x`와 `sum`을 $O(1)$에 구해 $x \times \text{sum} \mod (10^9 + 7)$를 리턴한다. 0이 아닌 숫자가 없는 경우는 수식이 자연스럽게 $0$을 리턴하게 된다.

## 코드

```py
class Solution:
    def sumAndMultiply(self, s: str, queries: List[List[int]]) -> List[int]:
        MOD = 10 ** 9 + 7
        m = len(s)
        pow10 = [1] * (m + 1)
        preSum = [0] * (m + 1)
        preConcat = [0] * (m + 1)
        nonZeroCount = [0] * (m + 1)
        for i, c in enumerate(s):
            d = int(c)
            pow10[i + 1] = pow10[i] * 10 % MOD
            preSum[i + 1] = preSum[i] + d
            nonZeroCount[i + 1] = nonZeroCount[i] + (d != 0)
            if d != 0:
                preConcat[i + 1] = (preConcat[i] * 10 + d) % MOD
            else:
                preConcat[i + 1] = preConcat[i]
        answer = []
        for l, r in queries:
            cnt = nonZeroCount[r + 1] - nonZeroCount[l]
            total = preSum[r + 1] - preSum[l]
            x = (preConcat[r + 1] - preConcat[l] * pow10[cnt]) % MOD
            answer.append(x * total % MOD)
        return answer
```
