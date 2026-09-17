---
title: "LeetCode 1477. Find Two Non-overlapping Sub-arrays Each With Target Sum"
date: 2026-09-17T14:52:32+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-two-non-overlapping-sub-arrays-each-with-target-sum>

## 풀이

모든 원소가 자연수인 수열 `nums`와 정수 `target`이 주어진다. 합이 `target`인 부분 배열 두 개를 겹치지 않게 골랐을 때, 길이의 합의 최솟값을 리턴하면 된다.

모든 원소가 자연수이므로 오른쪽 포인터를 늘리면 구간 합이 커지고, 왼쪽 포인터를 늘리면 작아진다. 따라서 투 포인터로 합이 `target`인 모든 부분 배열을 구할 수 있다.

각 시작 위치에 대해 조건을 만족하는 구간의 길이를 `startLength`에 기록하고, 이를 끝 위치 기준의 `endLength`로 옮긴다. 이후 `pre[i]`에는 인덱스 `i` 앞에서 끝나는 구간 중 최단 길이, `suf[i]`에는 인덱스 `i`부터 시작하는 구간 중 최단 길이를 저장한다.

두 부분 배열이 겹치지 않으려면 어떤 경계 `i`를 기준으로 하나는 `i` 앞에서 끝나고 다른 하나는 `i` 이후에 시작해야 한다. 따라서 모든 경계에 대해 `pre[i] + suf[i]`의 최솟값을 구하면 된다. 

포인터와 각 배열을 한 번씩만 순회하므로 시간 복잡도는 $O(n)$이다.

## 코드

```swift
class Solution {
    func minSumOfLengths(_ arr: [Int], _ target: Int) -> Int {
        let n = arr.count
        var start = 0
        var sum = 0
        var startLength = [Int](repeating: Int.max, count: n)
        for end in 0..<n {
            sum += arr[end]
            while sum > target && start <= end {
                sum -= arr[start]
                start += 1
            }
            if sum == target {
                startLength[start] = end - start + 1
            }
        }
        var endLength = [Int](repeating: Int.max, count: n)
        for s in 0..<n where startLength[s] < Int.max {
            let e = s + startLength[s] - 1
            endLength[e] = startLength[s]
        }
        var pre = [Int](repeating: Int.max, count: n + 1)
        for i in 0..<n {
            pre[i + 1] = min(pre[i], endLength[i])
        }
        var suf = [Int](repeating: Int.max, count: n + 1)
        for i in stride(from: n - 1, through: 0, by: -1) {
            suf[i] = min(suf[i + 1], startLength[i])
        }
        var answer = Int.max
        for i in 0...n {
            if pre[i] < Int.max && suf[i] < Int.max {
                answer = min(answer, pre[i] + suf[i])
            }
        }
        return answer == Int.max ? -1 : answer
    }
}
```
