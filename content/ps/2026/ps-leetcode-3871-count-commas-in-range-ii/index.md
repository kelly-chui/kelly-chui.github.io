---
title: "LeetCode 3871. Count Commas in Range II"
date: 2026-09-09T20:04:37+09:00

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

<https://leetcode.com/problems/count-commas-in-range-ii>

## 풀이

정수 `n`이 주어질 때, `1`부터 `n`까지의 모든 수를 콤마 표기했을 때 들어가는 콤마의 총 개수를 리턴하면 된다.

콤마는 자릿수가 4자리 이상일 때 하나, 7자리 이상일 때 하나 더 생기는 식으로 3자리마다 추가된다. 따라서 $10^3$, $10^6$, $10^9$ ... 을 기준으로, 해당 자릿수 이상인 수의 개수를 모두 더하면 된다.

예를 들어 `n`이 $10^6$ 이상이면 $10^3$부터 $n$까지의 수는 각각 콤마를 하나씩 가지고, $10^6$부터 $n$까지의 수는 콤마를 하나 더 가진다. 이를 지수 `3`부터 3씩 증가시키며 계산했다.

파이썬이나 C++ 같은 경우에는 코드가 더 깔끔하게 나올 것 같은데, Swift에는 정수형 `pow`가 없어서, 직접 만들어야 했다.

## 코드

```swift
class Solution {
    func intPow(_ base: Int, _ exp: Int) -> Int {
        return Int(pow(Double(base), Double(exp)))
    }

    func countCommas(_ n: Int) -> Int {
        var exp = 3
        var answer = 0
        while n >= intPow(10, exp) {
            answer += n - intPow(10, exp) + 1
            exp += 3
        }
        return answer
    }
}
```
