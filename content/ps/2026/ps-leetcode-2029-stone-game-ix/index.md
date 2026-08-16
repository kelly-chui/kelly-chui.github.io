---
title: "LeetCode 2029. Stone Game IX"
date: 2026-08-16T10:22:55+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/stone-game-ix>

## 풀이

돌을 순서대로 가져가면서, 합이 `3`의 배수가 되지 않게 해야 하는 게임이다. Alice가 이길 수 있는지 리턴하는 문제이다.

각 돌의 값은 `3`으로 나눈 나머지만 보면 된다. 합이 `3`의 배수인지 아닌지만 중요하기 때문이다. 그래서 `0`, `1`, `2`의 개수만 세면 충분하다.

`0`은 합의 나머지를 바꾸지 않으므로, 실제 승부는 `1`과 `2`를 어떻게 번갈아 쓰느냐에 달려 있다. `count[0]`이 짝수인지 홀수인지에 따라 가능한 진행이 달라진다.

- `count[0]`이 짝수면 `1`과 `2`가 둘 다 있어야 한다.
- `count[0]`이 홀수면 `1`과 `2`의 개수 차이가 너무 크면 안 된다.

## 코드

```swift
class Solution {
    func stoneGameIX(_ stones: [Int]) -> Bool {
        var count = [Int](repeating: 0, count: 3)
        for stone in stones {
            count[stone % 3] += 1
        }
        let count0 = count[0]
        let count1 = count[1]
        let count2 = count[2]
        if count0 % 2 == 0 {
            return count1 > 0 && count2 > 0
        }
        return abs(count1 - count2) > 2
    }
}
```
