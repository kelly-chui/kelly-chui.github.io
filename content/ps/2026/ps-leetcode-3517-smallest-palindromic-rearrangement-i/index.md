---
title: "Leetcode 3517. Smallest Palindromic Rearrangement I"
date: 2026-07-28T09:12:06+09:00

categories:
  - PS
series:
tags:
  - Hash Table
  - Sorting

algorithmTags:
  - Hash Table
  - Sorting

draft: false
original: ""
aliases:
  - /posts/ps-leetcode-3517-smallest-palindromic-rearrangement-i/
---

## 문제

<https://leetcode.com/problems/smallest-palindromic-rearrangement-i>

## 풀이

팰린드롬 스트링 `s`가 주어지고, 이 `s`의 원소들을 재배열 하여 만들 수 있는 팰린드롬중 가장 사전순으로 빠른 문자열을 리턴하는 문제이다.

`s`가 팰린드롬 스트링인것이 보장되니, 팰린드롬의 성질인 대칭을 이용하면 정렬 문제로 바꿀 수 있다. `s`의 원소 개수가 홀수인지 짝수인지만 주의하면 된다. 만약 홀수면 대칭의 중심이 존재하니, 원소 중 등장 횟수가 홀수인 원소가 존재한다.

1. `s`에서 등장하는 모든 원소의 등장 횟수를 센다.
2. `s`의 원소 개수가 홀수라면, 원소들 중 홀수번 등장하는 원소를 `center`를 찾는다. 이 원소가 팰린드롬의 중간에 들어가는 문자이다.
3. 원소들의 등장 횟수를 절반으로 줄인 다음, 사전 오름차순으로 정렬한 스트링 `half`를 만든다.
4. `half`와 `center` 그리고 `half`를 뒤집은 스트링을 합쳐서 결과를 만든다.

## 코드

```swift
class Solution {
    func smallestPalindrome(_ s: String) -> String {
        var countTable = [Character: Int]()
        var half = ""
        var center = ""
        for element in s {
            countTable[element, default: 0] += 1
        }
        for (element, count) in countTable.sorted(by: { $0.key < $1.key }) {
            if count % 2 == 1 {
                center = String(element)
            }
            half += String(repeating: element, count: count / 2)
        }
        return half + center + String(half.reversed())
    }
}
```
