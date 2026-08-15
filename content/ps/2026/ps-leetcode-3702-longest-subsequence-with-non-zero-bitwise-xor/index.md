---
title: "Leetcode 3702. Longest Subsequence With Non-Zero Bitwise XOR"
date: 2026-08-15T12:38:30+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - Math
  - Bitwise Operation
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/longest-subsequence-with-non-zero-bitwise-xor>

## 풀이

수열 `nums`가 주어지고, 이 `nums`의 서브시퀀스 중, 모든 원소를 XOR해서 0이 아니게 되는 서브시퀀스의 최대 길이를 리턴하면 된다.

이 문제는 XOR 연산의 특성을 잘 알아야 한다. 만약 XOR이 아니라 $+$이었다면, 모든 $\text{nums}$의 원소들을 더해보고, 0이 아니라면 $\text{nums}$ 전체를, 0이라면 원소 중 0이 아닌 것 하나를 제외하면 된다. $+$의 역연산은 $-$이므로, 어떤 원소 $x$를 제외했을 때 다음과 같이 된다.

$$\sum \text{nums} - x \neq 0$$

만약 모든 원소가 0이라면 답은 0이 된다. 

XOR 연산도 마찬가지다. 모든 $\text{nums}$의 원소들을 XOR 해본다:

$$X = a_1 \oplus a_2 \oplus \cdots \oplus a_n$$

만약 $X \neq 0$이라면 $\text{nums}$ 전체가 답이다. $X = 0$이라면 0이 아닌 원소 $x$를 하나 제외하면 된다. XOR의 역연산은 XOR 자신이므로 ($x \oplus x = 0$), 원소 $x$를 제외한 XOR은 다음과 같이 된다.

$$X \oplus x = 0 \oplus x = x \neq 0$$

마찬가지로, 모든 원소가 0이라면 답은 0이 된다.

## 코드

```swift
class Solution {
    func longestSubsequence(_ nums: [Int]) -> Int {
        let xor = nums.reduce(0, ^)
        if xor != 0 {
            return nums.count
        }
        return nums.contains { $0 != 0 } ? nums.count - 1 : 0
    }
}
```
