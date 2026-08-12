---
title: "LeetCode 2958. Length of Longest Subarray With at Most K Frequency"
date: 2026-08-12T21:14:37+09:00

categories:
  - Problem Solving
series:
tags:
  - Two Pointers
algorithmTags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/length-of-longest-subarray-with-at-most-k-frequency>

## 풀이

정수 배열 `nums`와 정수 `k`가 주어질 때, 어떤 숫자도 `k`번보다 많이 등장하지 않는 가장 긴 연속 부분 배열의 길이를 구하면 된다.

연속 부분 배열이므로 슬라이딩 윈도우를 사용했다. `start`부터 `end`까지를 현재 윈도우로 두고, `end`를 오른쪽으로 이동하면서 숫자별 등장 횟수를 갱신한다.

새로 추가한 숫자의 등장 횟수가 `k`를 초과하면 조건을 만족할 때까지 `start`를 오른쪽으로 이동한다. 이때 윈도우의 가장 왼쪽 숫자부터 하나씩 제거하면 된다. 윈도우가 조건을 만족하는 상태가 되면 현재 길이로 정답을 갱신한다.

두 포인터 모두 배열을 최대 한 번씩 지나가므로 시간 복잡도는 $O(n)$이다.

## 코드

```python
class Solution:
    def maxSubarrayLength(self, nums: List[int], k: int) -> int:
        numFrequencies = {}
        start = 0
        end = 0
        answer = 0
        while end < len(nums):
            num = nums[end]
            numFrequencies[num] = numFrequencies.get(num, 0) + 1
            while numFrequencies[num] > k:
                numFrequencies[nums[start]] -= 1
                start += 1
            answer = max(answer, end - start + 1)
            end += 1
        return answer
```
