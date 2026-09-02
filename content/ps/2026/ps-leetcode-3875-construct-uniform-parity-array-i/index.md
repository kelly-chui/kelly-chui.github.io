---
title: "LeetCode 3875. Construct Uniform Parity Array I"
date: 2026-09-02T22:22:09+09:00

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

<https://leetcode.com/problems/construct-uniform-parity-array-i>

## 풀이

서로 다른 정수 배열 `nums1`이 주어진다. 각 원소는 그대로 사용하거나, 다른 원소 하나를 빼서 새 배열 `nums2`의 원소로 만들 수 있다. `nums2`의 모든 원소를 홀수 또는 짝수로 통일할 수 있으면 `true`, 없으면 `false`를 리턴하면 된다.

우선 유일하게 할 수 있는 사칙연산이 뺄셈인데, 이 뺄셈 연산에 대해서 표를 그려보자.

| $a$ | $b$ | $a - b$ |
| --- | --- | --- |
| 짝 | 짝 | 짝 |
| 홀 | 홀 | 짝 |
| 홀 | 짝 | 홀 |
| 짝 | 홀 | 홀 |

여기서 케이스를 여러개 생각해볼 수 있다.

`nums` 원소가:

1. 모두 홀인 경우: 처음부터 통일되어있음
2. 모두 짝인 경우: 처음부터 통일되어있음
3. 홀/짝이 적절하게 섞인 경우: 짝수는 그대로, 홀수는 다른 홀수를 빼면 모두 짝수가 된다. 혹은 홀수는 그대로, 짝수는 다른 홀수를 빼면 모두 홀수가 된다.
4. 홀 1개 나머지가 모두 짝: 홀수는 그대로, 나머지 짝수는 그 1개 있는 홀수를 빼면 모두 홀수가 된다.
5. 짝 1개 나머지가 모두 홀: 마찬가지로, 홀수 그대로 하고, 나머지 짝수들에 홀수 1개 있는걸 빼면 모두 홀수가 된다.

즉, 모든 케이스가 가능하다

## 코드

```python
class Solution:
    def uniformArray(self, nums1: list[int]) -> bool:
        return True
```
