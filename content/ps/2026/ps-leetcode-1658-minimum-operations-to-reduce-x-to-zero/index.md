---
title: "LeetCode 1658. Minimum Operations to Reduce X to Zero"
date: 2026-09-23T19:42:16+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero>

## 풀이

수열 `nums`와 인티저 `x`가 주어진다. `x`에 수열 `nums`의 양 끝에서 원소 하나를 골라서 빼는 것을 연산 한 번이라고 할 때, `x`를 정확히 0으로 만들 수 있는 최소 연산 횟수를 리턴하면 된다.

문제를 뒤집어 생각해보자. 양 끝에서 원소를 제거하고 남은 원소들은 하나의 연속 부분 배열이다. 제거한 원소의 합이 `x`가 되려면, 남은 부분 배열의 합은 `sum(nums) - x`여야 한다. 제거 횟수를 최소화하려면 이 합을 가진 부분 배열 중 가장 긴 것을 찾으면 된다.

$1 \leq nums[i] \leq 10^4$이므로 오른쪽 포인터를 이동하면 구간 합이 커지고, 왼쪽 포인터를 이동하면 작아진다. 이 단조성을 이용해 투 포인터로 목표 합을 가진 가장 긴 구간을 찾는다.

전체 원소의 합이 `x`보다 작으면 불가능하다. 목표 합이 0이면 모든 원소를 제거하는 경우도 확인한다.

## 코드

```python
class Solution:
    def minOperations(self, nums: list[int], x: int) -> int:
        target = sum(nums) - x
        if target < 0:
            return -1
        maxSubarrayLeng = -1
        start = 0
        cur = 0
        for end in range(len(nums)):
            cur += nums[end]
            while cur > target:
                cur -= nums[start]
                start += 1
            if cur == target:
                maxSubarrayLeng = max(maxSubarrayLeng, end - start + 1)

        return len(nums) - maxSubarrayLeng if maxSubarrayLeng != -1 else -1
```
