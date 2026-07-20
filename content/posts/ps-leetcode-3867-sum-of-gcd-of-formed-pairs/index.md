---
title: "Leetcode 3867. Sum of GCD of Formed Pairs"
date: 2026-07-16T10:29:15+09:00

categories:
  - Online Judge
series:
  - LeetCode
tags:
  - GCD
  - Swift
  - Two Pointers

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/sum-of-gcd-of-formed-pairs>

## 풀이

문제에서 지시한 내용을 그대로 구현하면 되는 문제다. 문제의 지시사항은 다음과 같다:

1. 인티저 배열 `nums`의 누적 최대값 배열 `mx`를 만든다.
2. `prefixGcd[i] = gcd(nums[i], mx[i])` 으로 이루어진 배열을 만든다.
3. `prefixGcd`를 오름차순 정렬한다.
4. `prefixGcd`의 제일 큰 값과 제일 작은 값의 쌍을 만들어, GCD를 구하는 것을 더 이상 만들지 못할 때 까지 반복한다. 만약 `prefixGcd`의 원소의 개수가 홀수라서 페어을 만들지 못한 하나가 남는다면 무시한다.
5. '4'에서 구한 모든 GCD 값의 합을 리턴한다.

페어을 만드는건 간단한 형태의 투 포인터로 해결했다. 정렬과 유클리드 호제법을 제외하곤 모두 $O(n)$에 해결되기 때문에, 시간복잡도는 $O(n \log n + n \log V) = O(n \log (nV))$이다.

## 코드

```swift
class Solution {
    func gcdSum(_ nums: [Int]) -> Int {        
        func gcd(a: Int, b: Int) -> Int {
            var a = a
            var b = b
            while b != 0 {
                (a, b) = (b, a % b)
            }
            return a
        }
        var currentMax = 0
        var prefixGcd = nums.indices.map { idx in
            currentMax = max(currentMax, nums[idx])
            return gcd(a: nums[idx], b: currentMax)
        }
        prefixGcd.sort { $0 < $1 }
        var answer = 0
        var right = prefixGcd.count - 1
        var left = 0
        while right > left {
            answer += gcd(a: prefixGcd[right], b: prefixGcd[left])
            right -= 1
            left += 1
        }
        return answer
    }
}
```
