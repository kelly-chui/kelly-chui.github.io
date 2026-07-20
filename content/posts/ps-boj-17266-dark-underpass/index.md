---
title: "BOJ 17266. 어두운 굴다리"
date: 2024-05-06

categories:
  - PS
series:
  - Problem Solving
tags:
  - BOJ
  - Mathematics
  - Swift

draft: false
aliases:
  - "/posts/ps-boj-17266-어두운-굴다리/"

original: "https://junmusu.tistory.com/146"
---

## 문제

<https://www.acmicpc.net/problem/17266>

## 풀이

가로등 간의 최대 간격을 찾으면 되는 문제이다. 일반적인 가로등 간의 간격과, 시작점과 첫 가로등의 간격, 도착점과 마지막 가로등의 간격을 알아내면 된다.

가로등 사이의 간격은 양 사이드 모두가 가로등이기 때문에 간격에서 2를 나눠줄 필요가 있다.

이 문제에는 작은 함정이 하나 있는데, 가로등 사이의 간격이 만약 홀수인 경우에는 2로 나눴을 때 0.5가 내림 되기 때문에 주의해야 한다.

### 코드

```swift
import Foundation

let n = Int(readLine()!)!
let m = Int(readLine()!)!
let x = readLine()!.split(separator: " ").map { Int($0)! }

var answer = max(x.first!, n - x.last!)
for idx in 1..<m {
    let interval = Int(ceil(Double(x[idx] - x[idx - 1]) / 2.0))
    if interval > answer {
        answer = interval
    }
}
print(answer)
```
