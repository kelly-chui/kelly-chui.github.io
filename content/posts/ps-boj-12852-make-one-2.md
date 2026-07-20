---
title: "BOJ 12852. 1로 만들기 2"
date: 2025-04-30

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Dynamic Programming
  - Swift

draft: false
original: "https://junmusu.tistory.com/156"
---

## 문제

<https://www.acmicpc.net/problem/12852>

## 풀이

DP를 사용해서 해결했다.

문제를 거꾸로 뒤집어보자. n에서 1을 가는 최단거리가 아니라, 1에서 n으로 가는 최단거리로 바꾸는 편이 편하다.

이렇게 뒤집으면 개별 숫자에서 다른 숫자로 갈 수 있는 방법은 3가지가 주어진다.

  - 1 더하기
  - 2 곱하기
  - 3 곱하기

쉽게 점화식을 만들 수 있다.

`dp[i] = max(dp[i - 1], dp[i / 2], dp[i / 3]) + 1`

하지만 경로도 트래킹 해야 하는데, 이건 각 개별 숫자에 도달하기 전에 어떤 수에서 왔는지를 저장하는 배열 하나를 만들고, 최종적으로 이 배열을 루프로 순회하거나, 재귀를 통해서 경로를 얻어낼 수 있다.

### 코드

```swift
func trackPath(_ startNode: Int) {
    var current = startNode
    print(current)
    while current != 1 {
        current = parent[current]
        print(current)
    }
}

let n = Int(readLine()!)!
var dp = [Int](repeating: 0, count: max(4, n + 1))
var parent = [Int](repeating: 0, count: max(4, n + 1))
dp[2] = 1
dp[3] = 1
parent[1] = 0
parent[2] = 1
parent[3] = 1
if n >= 4 {
    for i in 4...n {
        dp[i] = dp[i - 1]
        parent[i] = i - 1
        if i % 2 == 0 && dp[i / 2] < dp[i] { 
            dp[i] = dp[i / 2]
            parent[i] = i / 2
        }
        if i % 3 == 0 && dp[i / 3] < dp[i] { 
            dp[i] = dp[i / 3]
            parent[i] = i / 3
        }
        dp[i] += 1
    }
}
print(dp[n])
trackPath(n)
```
