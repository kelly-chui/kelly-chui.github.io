---
title: "Leetcode 1979. Find Greatest Common Divisor of Array"
date: 2026-07-31T20:36:12+09:00

categories:
  - Problem Solving
series:
tags:
  - GCD

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-greatest-common-divisor-of-array>

## 풀이

수열 `nums`의 원소 중 가장 큰 원소의 가장 작은 원소의 GCD를 리턴하면 된다.

처음에 `max()`와 `min()`을 썼는데, 제출 시간이 거의 최하위권이길래 for loop로 다시 작성했다.

GCD 자체는 유클리드 호제법을 이용해서 구한다.

## 코드

```swift
class Solution {
    func findGCD(_ nums: [Int]) -> Int {
        func gcd(_ a: Int, _ b: Int) -> Int { 
            b == 0 ? a : gcd(b, a % b)
        }
        var min = Int.max
        var max = 0
        for num in nums {
            min = min > num ? num : min
            max = max < num ? num : max
        }
        return gcd(min, max)
    }
}
```
