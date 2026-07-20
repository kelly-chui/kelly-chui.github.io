---
title: "BOJ 2493. 탑"
date: 2023-07-10

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Stack
  - Swift

draft: false
aliases:
  - "/posts/ps-boj-2493-탑/"

original: "https://junmusu.tistory.com/122"
---

## 문제

<https://www.acmicpc.net/problem/2493>

## 풀이

스택을 사용하면 쉽게 풀 수 있는 문제이다. 각 탑에서 왼쪽에 신호를 발사하므로, 현재 인덱스보다 앞에 있는 인덱스중 가장 먼저 나오는 값이 더 큰 인덱스를 찾으면 된다.

현재 인덱스의 탑과 스택의 top에 있는 인덱스의 탑을 비교한다. top 인덱스의 탑이 더 크면 이 인덱스에 있는 탑은 처음으로 신호를 받는 탑이므로, `answer` 배열에 추가한다. 그렇지 않다면, 해당 인덱스에 있는 탑은 신호를 받지 못하는 탑 이므로 스택에서 제거한다. 현재 인덱스가 다음 인덱스들의 신호를 받을 수 있으므로 스택에 현재 인덱스를 추가한다.

### 코드

```swift
import Foundation

let n = Int(readLine()!)!
let towers = readLine()!.split(separator: " ").map { Int(String($0))! }
var stack: [Int] = []
var answer: [Int] = []
for towerIdx in 0..<towers.count {
    while !stack.isEmpty && towers[stack.last!] < towers[towerIdx] {
        stack.removeLast()
    }
    if let top = stack.last {
        answer.append(top + 1)
    } else {
        answer.append(0)
    }
    stack.append(towerIdx)
}
for answerIdx in 0..<answer.count {
    print(answer[answerIdx], terminator: answerIdx == answer.count - 1 ? "\n" : " ")
}
```
