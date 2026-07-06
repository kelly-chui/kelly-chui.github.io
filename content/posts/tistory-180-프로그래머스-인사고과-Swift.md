---
title: "[프로그래머스] 인사고과"
date: 2025-08-06
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Sorting"]
draft: false
original: "https://junmusu.tistory.com/180"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/152995>

## 풀이

정렬 문제다. 두 개의 수를 가진 튜플(혹은 배열)이 있고, 두 수의 합이 아닌, 각 수를 개별적으로 두 값이 모두 작거나 큰지 판단해야 하는 경우에는 첫 번째 기준이 되는 값은 오름차순, 그리고 두 번째 기준이 되는 값은 내림차순으로 정렬하는 것이 일반적이다. 반대도 가능하고, 이 문제에서도 첫 번째 기준이 되는 값을 내림차순, 두 번째 기준이 되는 값을 오름차순으로 정렬하는 것이 더 편하다.

순위를 셀 때도 조금은 최적화할 수 있다. 제거해야할 원소들을 제거하고 새로운 배열을 만드는 것이 아닌, 그냥 배열을 순회하면서, 기준이 되는 원소보다 큰 수를 카운트 하면 된다.

### 코드


```swift
import Foundation

func solution(_ scores:[[Int]]) -> Int {
    var answer = 1
    let w = scores.first!
    var scores = scores.sorted {
        if $0[0] != $1[0] {
            return $0[0] > $1[0]
        } else {
            return $0[1] < $1[1]
        }
    }
    var minB = scores[0][1]
    for score in scores {
        if minB > score[1] {
            if w == score { return -1 }
            continue
        }
        if score[0] + score[1] > w[0] + w[1] {
            answer += 1
        }
        minB = minB > score[1] ? minB : score[1]
    }
    return answer
}
```

