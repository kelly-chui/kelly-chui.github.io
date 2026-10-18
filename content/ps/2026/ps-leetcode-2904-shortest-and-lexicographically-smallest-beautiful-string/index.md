---
title: "LeetCode 2904. Shortest and Lexicographically Smallest Beautiful String"
date: 2026-08-26T10:27:09+09:00

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

<https://leetcode.com/problems/shortest-and-lexicographically-smallest-beautiful-string>

## 풀이

스트링 `s`가 주어지고, `s`의 서브스트링 중에서 `"1"`의 개수가 정확히 `k`개인 서브스트링중, 사전순으로 가장 작은 서브스트링은 리턴하면 된다.

서브스트링 내부의 특정 원소의 개수를 관리하는 문제이므로, 투 포인터를 사용하면 쉽게 풀린다.

투 포인터여서 $O(n)$ 같지만 실제로 서브스트링을 조립하는데도 $O(n)$가 걸리므로, 시간 복잡도는 $O(n^2)$이 된다.

## 코드

```swift
class Solution {
    func shortestBeautifulSubstring(_ s: String, _ k: Int) -> String {
        let chars = Array(s)
        var answer = "", start = 0, oneCount = 0
        for end in chars.indices {
            if chars[end] == "1" { oneCount += 1 }
            while oneCount > k {
                if chars[start] == "1" { oneCount -= 1 }
                start += 1
            }
            while oneCount == k && chars[start] == "0" { start += 1 }
            if oneCount == k {
                let candidate = String(chars[start...end])
                if answer.isEmpty || candidate.count < answer.count ||
                    (candidate.count == answer.count && candidate < answer) {
                    answer = candidate
                }
            }
        }
        return answer
    }
}
```
