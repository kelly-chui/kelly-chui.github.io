---
title: "LeetCode 3876. Construct Uniform Parity Array II"
date: 2026-09-03T17:54:08+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/construct-uniform-parity-array-ii>

## 풀이

서로 다른 정수 배열 `nums1`의 각 원소를 그대로 사용하거나, 더 작은 다른 원소를 빼서 양수로 만들 수 있다. 이렇게 만든 `nums2`의 모든 원소를 홀수 또는 짝수로 통일할 수 있으면 `true`, 없으면 `false`를 리턴하면 된다.

[1번 문제]({{< relref "ps/2026/ps-leetcode-3875-construct-uniform-parity-array-i" >}})와 달리 뺀 결과가 양수여야 한다. 따라서 짝수 원소를 홀수로 바꾸려면 그보다 작은 홀수 원소가 필요하다.

홀수로 통일하는 경우를 보자. 가장 작은 홀수는 그대로 두고, 그보다 큰 짝수는 이 홀수를 빼서 홀수로 만들 수 있다.

$$
even - odd = odd
$$

하지만 가장 작은 홀수보다 작은 짝수가 하나라도 있으면 바꿀 방법이 없다. 그 짝수보다 작은 홀수를 찾을 수 없고, 짝수에서 짝수를 빼면 짝수가 되기 때문이다.

짝수로 통일하는 경우는 원래 모든 원소가 짝수일 때만 가능하다. 홀수 원소가 있다면 가장 작은 홀수는 더 작은 홀수를 빼서 짝수로 만들 수 없기 때문이다.

따라서 가장 작은 홀수를 찾고, 모든 짝수가 그보다 큰지 확인하면 된다.

## 코드

```python
class Solution:
    def uniformArray(self, nums1: list[int]) -> bool:
        smallestEven = float("inf")
        smallestOdd = float("inf")
        for num in nums1:
            if num % 2 == 0 and num < smallestEven:
                smallestEven = num
            elif num % 2 != 0 and num < smallestOdd:
                smallestOdd = num
        isOddPossible = True
        isEvenPossible = True
        for num in nums1:
            if num % 2 != 0:
                if num <= smallestOdd:
                    isEvenPossible = False
                    break
        for num in nums1:
            if num % 2 == 0:
                if num < smallestOdd:
                    isOddPossible = False
        return isEvenPossible or isOddPossible
```
