---
title: "Leetcode 3014. Minimum Numbers of Pushes to Type Word I"
date: 2026-07-30T22:58:21+09:00

categories:
  - Problem Solving
series:
tags:
  - Greedy

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-i>

## 풀이

휴대전화의 2에서 8까지의 숫자에 문자를 배치할 수 있고, 2개 이상의 수가 배치되었을 땐 여러번 눌러야 뒤에 있는 숫자를 타이핑 할 수 있다. 스트링 `word`가 주어졌을 때, 버튼을 가장 적게 눌러 `word`를 타이핑 했을 때의 타이핑 수를 리턴하면 된다.

각 키의 첫 번째 문자는 1번, 두 번째는 2번... 눌러야 하므로 많이 등장하는 문자일수록 누름 횟수가 적은 앞자리에 배치해야 한다.

빈도수 내림차순 정렬 후, 인덱스를 8로 나눈 몫 + 1이 해당 문자의 누름 횟수가 된다.

- index 0 - 7 → 1번
- index 8 - 15 → 2번
- index 16 - 23 → 3번

## 코드

```swift
class Solution {
    func minimumPushes(_ word: String) -> Int {
        var frequencies = [Character: Int]()
        for char in word {
            frequencies[char, default: 0] += 1
        }
        
        return frequencies.values
            .sorted { $0 > $1 }
            .enumerated()
            .reduce(0) { $0 + ($1.offset / 8 + 1) * $1.element }
    }
}

```
