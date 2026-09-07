---
title: "LeetCode 940. Distinct Subsequences II"
date: 2026-09-07T21:02:58+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/distinct-subsequences-ii>

## 풀이

스트링 `s`가 주어지고, 비어 있지 않은 서로 다른 부분 수열의 개수를 리턴하면 된다. (서브스트링 아님)

문자 하나를 새로 붙일 때마다 기존의 모든 부분 수열에 그 문자를 붙인 경우를 만들 수 있으므로, 가능한 부분 수열의 개수는 붙이거나 혹은 안붙이거나 해서 2배가 된다.

당연히 이전에 같은 문자가 이전에 등장했다면, 그 문자가 직전에 추가됐을 때 이미 만들어진 부분 수열과 중복된다.

중복을 제거하기 위해서 현재 처리하는 문자가 이전에 나왔을 때, 부분 수열의 총 개수를 저장한다. 그 이후, 현재 문자를 처리할 때 전체 개수를 두 배로 만들고, 이전에 저장했던 값을 빼서 중복을 제거한다. 

점화식은 다음과 같다:

$$
dp_i = 2 \cdot dp_{i-1} - last[s[i]]
$$

빈 부분 수열까지 포함해 계산했으므로 마지막에 1을 빼서 리턴했다.

## 코드

```swift
class Solution {
    func distinctSubseqII(_ s: String) -> Int {
        let MOD = 1_000_000_007
        var dp = 1
        var last = [Character: Int]()
        for c in s {
            let doubled = (dp % MOD) * 2 % MOD
            let newDp: Int
            if let prev = last[c] {
                newDp = (doubled - prev + MOD) % MOD
            } else {
                newDp = doubled
            }
            last[c] = dp % MOD
            dp = newDp
        }
        return (dp - 1 + MOD) % MOD
    }
}
```
