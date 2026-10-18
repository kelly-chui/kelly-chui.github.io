---
title: "LeetCode 2091. Removing Minimum and Maximum From Array"
date: 2026-08-30T10:14:26+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/removing-minimum-and-maximum-from-array>

## 풀이

수열 `nums`가 주어지고, `nums`의 원소중 최대값과 최소값을 제거하려고 할 때, (제거는 앞, 뒤에서만 가능) 필요한 제거 연산의 최소값을 리턴하면 된다.

언뜻 보면 분기가 많아보일 수 있는 문제지만, 이 문제의 케이스는 3개 밖에 없다.

1. 앞에서만 제거 연산
2. 뒤에서만 제거 연산.
3. 하나는 앞, 하나는 뒤에서 제거 연산.

세 가지를 모두 계산한 다음, 그 중 최소값을 리턴한다.

## 코드

```swift
class Solution {
    func minimumDeletions(_ nums: [Int]) -> Int {
        let minIdx = nums.firstIndex(of: nums.min()!)!
        let maxIdx = nums.firstIndex(of: nums.max()!)!
        var answer = max(minIdx, maxIdx) + 1
        answer = min(answer, nums.count - min(minIdx, maxIdx))
        return min(answer, min(minIdx, maxIdx) + 1 + nums.count - max(minIdx, maxIdx))
    }
}
```
