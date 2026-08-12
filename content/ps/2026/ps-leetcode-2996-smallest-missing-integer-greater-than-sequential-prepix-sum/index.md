---
title: "LeetCode 2996. Smallest Missing Integer Greater Than Sequential Prefix Sum"
date: 2026-08-12T22:47:12+09:00

categories:
  - Problem Solving
series:
tags:
  - Hash Table
algorithmTags:
  - Hash Table
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/smallest-missing-integer-greater-than-sequential-prefix-sum>

## 풀이

정수 배열 `nums`가 주어진다. 배열의 첫 원소부터 연속해서 증가하는 부분의 합을 구한 뒤, 그 합보다 크거나 같으면서 배열에 존재하지 않는 가장 작은 정수를 찾으면 된다.

먼저 첫 번째 원소를 합에 더해두고, 현재 원소가 다음 조건을 만족하는지 확인한다.

$$
nums[i] = nums[i - 1] + 1
$$

조건을 만족하는 동안에는 현재 원소를 합에 더하고, 연속 조건이 깨지면 순회를 종료한다.

이제 구한 합을 후보값으로 두고, 후보값이 배열 안에 있으면 1씩 증가시킨다. 배열에 없는 첫 번째 값이 정답이다. 이 부분은 코드처럼 배열에 후보값이 존재하는 동안 반복하면 된다.

연속 부분을 확인하는 데 $O(n)$이 걸린다. 현재 구현은 후보값을 배열에서 직접 검색하므로 최악의 시간 복잡도는 $O(n^2)$이다.

## 코드

```python
class Solution:
    def missingInteger(self, nums: List[int]) -> int:
        answer = nums[0]
        for idx in range(1, len(nums)):
            if nums[idx - 1] + 1 == nums[idx]:
                answer += nums[idx]
            else:
                break
        while answer in nums:
            answer += 1
        return answer
```
