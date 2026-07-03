---
title: "[프로그래머스] 풍선 터트리기"
date: 2025-08-05
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Implementation"]
draft: false
original: "https://junmusu.tistory.com/179"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/68646>

## 풀이

문제의 조건은 쉬운데, 풀이 과정은 쉽지 않아보인다. 하지만 문제를 최대한 단순화해보자. 기본적으로, 인접한 두 풍선을 고를 수 있고 두 풍선중 번호가 더 큰 풍선을 터트려야 한다. 하지만 1회에 한정에서 번호가 더 작은 풍선을 터트릴 수 있다.

일단 기본적으로 마지막까지 남을 수 있는 풍선의 개수를 세야 하므로 모든 풍선에 대해 확인해봐야 한다. 그리고 마지막까지 남을 수 있는 풍선이라고 했으므로, 항상 마지막에 고르는 두 풍선들 중 하나는 현재 내가 확인하고 싶은 풍선일 것이다.

그러면 현재 풍선과 비교하게 되는 풍선은 현재 풍선과 인접해 있는, 즉 왼쪽 혹은 오른쪽에 있는 풍선이다. 따라서 마지막에 비교할때, 현재 풍선이 왼쪽 풍선과 오른쪽 풍선과 비교해서 살아남을 수 있으면 된다.

문제가 많이 간단해졌다. 그러면 알고리즘을 세워보자.

- 현재 확인하고 싶은 풍선을 기준으로 왼쪽 배열의 최소값을 찾아낸다.
- 마찬가지로 현재 확인하고 싶은 풍선을 기준으로 오른쪽 배열의 최소값을 찾아낸다.
- 현재 풍선이 두 최소값보다 작다면 이 풍선은 살아남을 수 있다.

이 알고리즘을 주어진 모든 풍선에 적용하면 된다. 그러면 조금 알고리즘을 최적화시킬 수 있다. 약간 DP의 컨셉을 빌려와서 왼쪽 배열의 최소값을 '정방향으로 순회했을 때, 현재 인덱스까지의 최소값을 저장한 배열', 그리고 오른쪽 배열의 최소값을 '역방향으로 순회했을 때, 현재 인덱스까지의 최소값을 저장한 배열'로 중복되는 연산을 한번만 해도 되도록 미리 연산해놓을 수 있다.

### 코드

```swift
import Foundation

func solution(_ a:[Int]) -> Int {
    var answer = 0
    var rightMin = a
    var leftMin = a
    for i in a.indices {
        guard i != 0 else { continue }
        leftMin[i] = min(leftMin[i - 1], leftMin[i])
    }
    for i in stride(from: a.count - 1, through: 0, by: -1) {
        guard i != a.count - 1 else { continue }
        rightMin[i] = min(rightMin[i + 1], rightMin[i])
    }
    for i in a.indices {
        if a[i] <= leftMin[i] || a[i] <= rightMin[i] {
            answer += 1
        }
    }
    return answer
}
```
