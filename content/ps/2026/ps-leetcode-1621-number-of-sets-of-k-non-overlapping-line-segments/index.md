---
title: "LeetCode 1621. Number of Sets of K Non-Overlapping Line Segments"
date: 2026-09-16T14:16:54+09:00

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

<https://leetcode.com/problems/number-of-sets-of-k-non-overlapping-line-segments>

## 풀이

$n$개의 점에서 겹치지 않는 선분 $k$개를 고르는 경우의 수를 리턴하면 된다. (선분끼리 끝점을 공유할 수 있다)

선분을 왼쪽부터 순서대로 놓았을 때, $i$번째 선분의 두 끝점에 각각 $i - 1$을 더해보자. 원래 인접한 두 선분이 끝점을 공유하더라도, 뒤쪽 선분은 한 칸 더 이동하므로 변환된 끝점들은 모두 서로 다르다.

반대로 변환된 끝점을 순서대로 짝지은 뒤, $i$번째 쌍의 두 끝점에서 $i - 1$을 빼면 원래의 겹치지 않는 선분 배치로 돌아갈 수 있다.

변환된 끝점은 $0$부터 $n + k - 2$까지, 총 $n + k - 1$개의 점 중에서 고른다. 이 중 $2k$개의 점을 선택하면 순서대로 두 개씩 짝지어 선분 $k$개를 만들 수 있으므로, 경우의 수는 다음과 같다:

$$\binom{n - 1 + k}{2k}$$

## 코드

```python
class Solution:
    def numberOfSets(self, n: int, k: int) -> int:
        MOD = 10 ** 9 + 7
        return math.comb(n - 1 + k, 2 * k) % MOD
```
