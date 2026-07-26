---
title: "Leetcode 1464. Maximum Product of Two Element in an Array"
date: 2026-07-26T10:34:58+09:00

categories:
  - Problem Solving
series: []
tags:
  - LeetCode
  - Python
  - Sorting

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-product-of-three-numbers>

## 풀이

정수형 배열 `nums` 안에서 세 개의 수를 뽑아 곱한 값 중 최대값을 리턴하면 된다.

[LeetCode 3536]({{< relref "posts/ps-leetcode-3536-maximum-product-of-two-digits" >}}) 3536번 문제처럼 `nums` 배열을 정렬하면 된다. 다만 이번에는 3개의 수를 뽑아야 하기에, 음수, 음수, 양수도 정답의 후보가 될 수 있다.

따라서 정답의 후보는 다음과 같다.

- 가장 작은 값 2개와 가장 큰 값 1개를 곱한 값
- 가장 큰 값 3개를 곱한 값

이 두 수를 계산한 다음, 대소를 비교해서 리턴하면 된다.

## 코드

```python
class Solution:
    def maximumProduct(self, nums: List[int]) -> int:
        nums.sort()
        return max(nums[-1] * nums[-2] * nums[-3],nums[0] * nums[1] * nums[-1])
```
