---
title: "Leetcode 3514. Number of Unique XOR Triplets II"
date: 2026-07-24T11:34:15+09:00

categories:
  - Problem Solving
series: []
tags:

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/number-of-unique-xor-triplets-ii>

## 풀이

`n` 길이의 배열 `nums`가 주어지고, 여기에서 3개의 인덱스 `i`, `j`, `k`를 (`i <= j <= k`) 뽑아서 XOR 했을 때, 얻을 수 있는 모든 결과의 수를 리턴하는 문제이다.

Leetcode 3513 문제와 다른 점은, `nums`가 순열이 아니다. 따라서, 자연스럽게 모든 경우의 수를 커버하지 못한다. 다만, 인덱스 제약조건이 저번과 같으므로 '값 3개를 무작위'로 뽑는다는 점은 같다. 여전히 `n`이 최대 1500이기 때문에, $O(n^3)$ 으로 풀기에는 무리가 있다.

우선, 값의 중복을 가리지 않고, 인덱스도 가리지 않으므로 배열의 순서가 중요하지 않다. 따라서 배열에 있는 모든 중복을 제거하는 전처리를 한다.

이 문제에선 XOR을 포함한 비트 연산의 특징을 알아야 한다, 비트 연산은 캐리가 존재하지 않는다. 즉 8비트 수끼리 연산을 하면 결과는 무조건 8비트 이하가 된다. 사칙연산의 경우에는 캐리가 존재해서 오버플로우가 일어날 수 있지만, 비트 연산에서는 그러지 않는다.

따라서 이 문제를 $O(n^2)$으로 근사시킬 수 있다.(정확하게 근사하진 못하지만) 원소의 크기가 최대 1500이기 때문에, 1500은 2진법으로 표기하면 $10111011100_{2}$, 11비트가 된다. 임의의 두 값을 XOR 했을때 얻을 수 있는 값의 범위가 최대 11비트라는 것이다.

11비트가 표시할 수 있는 최대 값은 2047이다. 그러면 이 값들을 또 다른 임의의 값(3번째 값)과 XOR하는 경우의 수는 2048 * 1500 이다. 이런 방식으로, 1500 * 1500 * 1500 번 연산을 하는게 아닌, 1500 * 1500 연산 한번, 2048 * 1500 연산 한번으로 줄여서 $O(n^2)$에 근접한 시간 복잡도를 얻을 수 있다.

## 코드

```swift
class Solution {
    func uniqueXorTriplets(_ nums: [Int]) -> Int {
        let distinctValues = Set(nums)
        var result = distinctValues
        var pairXORs = Set<Int>()
        let valuesArray = Array(distinctValues)
        for i in 0..<valuesArray.count {
            for j in i..<valuesArray.count {
                pairXORs.insert(valuesArray[i] ^ valuesArray[j])
            }
        }
        for p in pairXORs {
            for v in distinctValues {
                result.insert(p ^ v)
            }
        }
        return result.count
    }
}
```
