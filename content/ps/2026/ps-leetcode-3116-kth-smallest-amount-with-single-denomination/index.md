---
title: "LeetCode 3116. Kth Smallest Amount With Single Denomination"
date: 2026-08-21T14:27:19+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Binary Search
  - DFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/kth-smallest-amount-with-single-denomination-combination>

## 풀이

각 동전의 액면가가 적힌 배열 `coins`가 주어지고, 동전의 개수가 무한히 많다. 한 종류의 동전만으로 만들 수 있는 조합 중 `k`번째로 작은 액수를 구하면 된다.

`k`가 최대 $2 \times 10^9$ 이므로 모든 액수를 직접 나열하는 건 불가능하다.

한 종류의 동전만 사용할 수 있으므로, `k`번째로 작은 값은 가장 작은 액면가의 동전을 `k`번 사용한 값보다 클 수 없다.

$$left = 1, \quad right = k \times \min(coins)$$

이제 정답의 범위를 알았으니 binary search로 이 정답이 맞는지 확인하면 된다.

특정 값 $x$를 우리가 확인하고자 하는 값이라고 해보자, 각 동전 $coins_{idx}$ 에 대해 $x$ 이하의 배수 개수는 $\lfloor x / c \rfloor$ 이다. 단순히 합산하면 여러 동전으로 동시에 만들 수 있는 액수가 중복 계산되므로, 동전들의 조합에 대한 최소공배수(LCM)를 이용해 중복을 제거해야 한다.

$$f(x) = \sum_{S \subseteq coins,\ S \neq \emptyset} (-1)^{|S|+1} \left\lfloor \frac{x}{\text{lcm}(S)} \right\rfloor$$

## 코드

```swift
class Solution {
    func findKthSmallest(_ coins: [Int], _ k: Int) -> Int {
        func gcd(_ a: Int, _ b: Int) -> Int {
            return b == 0 ? a : gcd(b, a % b)
        }
        func lcm(_ a: Int, _ b: Int) -> Int {
            return a / gcd(a, b) * b
        }
        func countValidAmounts(_ x: Int) -> Int {
            var result = 0
            func dfs(_ index: Int, _ currentLCM: Int, _ size: Int) {
                if index == coins.count { return }
                for i in index..<coins.count {
                    let newLCM = lcm(currentLCM, coins[i])
                    if size % 2 == 0 {
                        result += x / newLCM
                    } else {
                        result -= x / newLCM
                    }
                    dfs(i + 1, newLCM, size + 1)
                }
            }
            dfs(0, 1, 0)
            return result
        }
        var left = 1
        var right = k * coins.min()!
        while left < right {
            let mid = (left + right) / 2
            if countValidAmounts(mid) < k {
                left = mid + 1
            } else {
                right = mid
            }
        }
        return left
    }
}
```
