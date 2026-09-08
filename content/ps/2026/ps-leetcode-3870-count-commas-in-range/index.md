---
title: "LeetCode 3870. Count Commas in Range"
date: 2026-09-08T19:27:45+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/count-commas-in-range>

## 풀이

정수 `n`이 주어질 때, `1`부터 `n`까지의 모든 수를 콤마 표기했을 때 들어가는 콤마의 총 개수를 리턴하면 된다.

$1 \leq n \leq 10^5$ 이므로 콤마가 최대 하나 이상 들어가지를 않는다... 따라서 `n`이 1,000 이상이면 `1,000`부터 `n`까지의 수의 개수인 `n - 1,000 + 1`을 리턴한다.

## 코드

```swift
class Solution {
    func countCommas(_ n: Int) -> Int {
        var answer = 0
        if n >= 1000 {
            answer += (n - 1000 + 1) * 1
        }
        return answer
    }
}
```
