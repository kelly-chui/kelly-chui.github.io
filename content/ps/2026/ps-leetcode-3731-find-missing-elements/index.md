---
title: "LeetCode 3731. Find Missing Elements"
date: 2026-08-04T09:33:33+09:00

categories:
  - Problem Solving
series:
tags:
  - Sorting
algorithmTags:
  - Sorting
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-missing-elements>

## 풀이

연속된 정수 구간에 속한 모든 정수가 들어 있'던' 수열 `nums`가 주어진다. 일부 원소가 사라진 상태인 상태인데, 이 사라진 원소들을 배열에 오름차순으로 담아 리턴하면 된다.

최대값과 최소값은 사라지지 않았다고 하니까, 정수 구간의 크기를 구할 수 있다. 그 정수 구간을 순회하면서 빠진 원소들을 찾으면 된다.

정렬을 이용해서 풀 수도 있는데, 이러면 시간 복잡도가 평균 $O(n \times \log n)$이 된다. 큰 차이는 안나지만 Hast Set을 이용하면 평균 $O(n)$에 풀 수 있다.

## 코드

```python
class Solution:
    def findMissingElements(self, nums: List[int]) -> List[int]:
        numsSet = set(nums)
        answer = []
        for num in range(min(nums) + 1, max(nums)):
            if not num in numsSet:
                answer.append(num)
        return answer
```
