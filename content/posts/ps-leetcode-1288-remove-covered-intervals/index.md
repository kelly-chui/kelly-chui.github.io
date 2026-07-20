---
title: "LeetCode 1288. Remove Covered Intervals"
date: 2026-07-07T12:33:49+09:00

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - LeetCode
  - Sorting
  - Swift

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/remove-covered-intervals>

## 풀이

여러 개의 구간이 주어지고, 다른 구간에 완전히 포함되는 구간을 제거한 이후, 남은 구간의 개수를 리턴하면 되는 문제이다.

가장 쉬운 방법은 브루트 포스이다. 구간의 개수가 최대 1000개이기 때문에, O(n^2) 방식을 사용해도 충분히 통과 가능하다. 

하지만 정렬을 이용하면 쉽게 O(n * log(n)) 으로 풀 수 있다.

1. 구간 시작 부분을 기준으로 오름차순 정렬한다. 시작 부분이 같은 경우엔 끝 부분을 기준으로 내림차순 정렬한다.
2. 정렬된 배열을 앞에서부터 순회하며, 지금까지 등장한 끝 부분의 최대값(maxEnd)을 추적한다.
3. 현재 구간의 끝이 maxEnd보다 크면, 이전 어떤 구간에도 포함되지 않는 새로운 구간이므로 카운트하고 maxEnd를 갱신한다.
4. 현재 구간의 끝이 maxEnd보다 작거나 같으면, 이전 구간에 완전히 포함되는 구간이므로 제거한다. 

1번에서 시작 부분 기준으로 정렬했기 때문에, 시작 조건은 자동으로 만족되어 끝 부분만 비교하면 충분하다. 

## 코드

```swift
class Solution {
    func removeCoveredIntervals(_ intervals: [[Int]]) -> Int {
        let n = intervals.count
        let sortedIntervals = intervals.map { ($0[0], $0[1]) }.sorted {
            if $0.0 != $1.0 {
                return $0.0 < $1.0
            } else {
                return $0.1 > $1.1
            }
        }
        var answer = 0
        var maxEnd = 0
        for interval in sortedIntervals where interval.1 > maxEnd {
            answer += 1
            maxEnd = interval.1
        }
        return answer
    }
}
```
