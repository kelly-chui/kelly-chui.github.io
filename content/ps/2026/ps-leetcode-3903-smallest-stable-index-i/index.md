---
title: "LeetCode 3903. Smallest Stable Index I"
date: 2026-09-04T22:17:58+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Prefix Technique
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/smallest-stable-index-i>

## 풀이

수열 `nums`가 주어지고, `nums`의 각 인덱스 `i`의 불안정도는 왼쪽 구간의 최댓값과 오른쪽 구간의 최솟값의 차이라고 했을 때, 불안정도가 `k` 이하인 가장 작은 인덱스를 리턴하면 된다.

왼쪽에서 누적 최대값, 오른쪽에서 누적 최소값을 미리 계산하자.

```swift
prefixMax[i] = max(nums[0...i])
suffixMin[i] = min(nums[i...n-1])
```

그 뒤 왼쪽부터 순회하며 `prefixMax[i] - suffixMin[i] <= k`를 처음 만족하는 인덱스를 리턴하면 쉽게 풀린다.

## 코드

```swift
class Solution {
    func firstStableIndex(_ nums: [Int], _ k: Int) -> Int {
        let n = nums.count
        var prefixMax = [Int](repeating: 0, count: n)
        var suffixMin = [Int](repeating: Int.max, count: n)
        prefixMax[0] = nums.first!
        suffixMin[n - 1] = nums.last!
        for idx in 1..<n {
            prefixMax[idx] = max(prefixMax[idx - 1], nums[idx])
            suffixMin[n - idx - 1] = min(suffixMin[n - idx], nums[n - idx - 1])
        }
        var answer = -1
        for idx in 0..<n {
            let instabilityScore = prefixMax[idx] - suffixMin[idx]
            if instabilityScore <= k { 
                answer = idx
                break 
            }
        }
        return answer
    }
}

```
