---
title: "LeetCode 3734. Lexicographically Smallest Palindromic Permutation Greater Than Target"
date: 2026-08-28T10:36:51+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Backtracking
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/lexicographically-smallest-palindromic-permutation-greater-than-target>

## 풀이

스트링 `s`와 `target`이 주어진다. `s`의 원소들을 재배열 해서 만든 팰린드롬 중에 `target`보다 사전순으로 크면서도 가장 작은 스트링을 리턴하면 된다.

[LeetCode 3720]({{< relref "ps/2026/ps-leetcode-3720-lexicographically-smallest-permutation-greater-than-target" >}})와 
[Leetcode 3517]({{< relref "ps/2026/ps-leetcode-3517-smallest-palindromic-rearrangement-i" >}})을 합친 문제이다.

3720에서 했던 방식인 `target`과 비교하면서 백트래킹으로 스트링을 만들고, 3517처럼 팰린드롬은 좌우 대칭이니까, 문자열의 절반만 만드는 것을 그대로 사용하면 된다.

당연히 팰린드롬 문자열에서는 같은 원소의 개수가 홀수개인 원소는 1개로 제한된다는 점으로, 미리 전처리를 하면, 백트래킹이 절대 실패할 일이 없다.

## 코드

```swift
class Solution {
    func lexPalindromicPermutation(_ s: String, _ target: String) -> String {
        let chars = Array("abcdefghijklmnopqrstuvwxyz")
        let index = [Character: Int](uniqueKeysWithValues: zip(chars, 0...25))
        var freq = [Int](repeating: 0, count: 26)
        s.forEach { freq[index[$0]!] += 1 }
        guard freq.filter({ $0 % 2 == 1 }).count <= 1 else { return "" }
        let middle = freq.firstIndex(where: { $0 % 2 == 1 }).map { chars[$0] }
        var left = [Character](), targetChars = Array(target)
        func backtrack(_ i: Int, _ greater: Bool) -> Bool {
            if i == s.count / 2 { return greater }
            let targetIndex = index[targetChars[i]]!
            for c in (greater ? 0 : targetIndex)..<26 where freq[c] >= 2 {
                left.append(chars[c]); freq[c] -= 2
                if backtrack(i + 1, greater || c > targetIndex) { return true }
                left.removeLast(); freq[c] += 2
            }
            return false
        }
        guard backtrack(0, false) else { return "" }
        return String(left + (middle.map { [$0] } ?? []) + left.reversed())
    }
}
```
