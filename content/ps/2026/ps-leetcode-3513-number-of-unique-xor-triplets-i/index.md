---
title: "Leetcode 3513. Number of Unique XOR Triplets I"
date: 2026-07-23T10:33:25+09:00

categories:
  - Problem Solving
series:
tags:
  - Bitwise Operation

algorithmTags:
  - Bitwise Operation
features:
  - katex

draft: false
original: ""
aliases:
  - /posts/ps-leetcode-3513-number-of-unique-xor-triplets-i/
---

## 문제

<https://leetcode.com/problems/number-of-unique-xor-triplets-i>

## 풀이

1에서 `n`까지의 모든 값이 들어있는 `n` 크기 배열 `nums` 배열이 주어지고, 그 배열에서 인덱스 3개 `i`, `j`, `k` (`i <= j <= k`)를 골라서 XOR 했을 때, 나올 수 있는 모든 값을 리턴하면 되는 문제이다.

`nums` 배열의 크기가 10만이고, 브루트 포스를하면 시간 복잡도가 $O(n^3)$ 이기 때문에 시간 내에 해결할 수 없다.

`nums`가 순열이라는 것과 XOR의 연산 특징을 알면 생각보다 간단한 공식으로 해결할 수 있다. 우선 인덱스 제약조건은 없는 것과 마찬가지인데, 등호를 포함한 대소관계이기 때문에, 인덱스를 중복해서 골라도 된다.

| A | B | A XOR B |
|:-:|:-:|:-------:|
| 0 | 0 |    0    |
| 0 | 1 |    1    |
| 1 | 0 |    1    |
| 1 | 1 |    0    |

`nums`가 순열이기 때문에 `n` 까지 나올 수 있는 모든 경우의 수가 나오게 된다.

예를 들어서 10진법 4는 2진법으로 '100' 즉, 3자리수로 표현되는데, 0부터4 까지의 수를 2진법으로 표기하면 각 자리수가 0 혹은 1을 가지는 모든 경우의 수를 가지게 된다.

```
000
001
010
011
100
```

모든 자리 수에서 0혹은 1을 가질 수 있으므로, 아무 수나 3개를 골라서 XOR 연산 한 것은 `nums`의 최대 값이 2진법으로 표현할 때 필요한 비트가 최대로 표현할 수 있는 수와 같다. 즉, 4를 기준으로 보면 000부터 111까지 총 8개의 숫자를 표현할 수 있다.

## 코드

```swift
class Solution {
    func uniqueXorTriplets(_ nums: [Int]) -> Int {
        let n = nums.count
        if n <= 2 {
            return n
        }
        var power = 1
        while power <= n {
            power *= 2
        }
        return power
    }
}
```
