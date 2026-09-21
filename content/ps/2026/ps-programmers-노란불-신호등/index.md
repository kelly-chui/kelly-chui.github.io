---
title: "Programmers. 노란불 신호등"
date: 2026-09-21T20:13:48+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - GCD
  - Simulation
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/468371>

## 풀이

신호등 배열 `signals`가 주어지고, 각 신호등은 `[G, Y, R]` 각 색깔의 지속 시간을 나타낸다. 모든 신호등이 동시에 노란불일 때의 최초 시각 $t$를 리턴하면 된다.

시각 $t$에서 신호등 하나의 상태를 알려면, 그 신호등의 한 사이클 $c = g + y + r$ 안에서 $t$가 어느 구간에 있는지 보면 된다. 

사이클 내부 위치를 다음과 같이 정의한다:

$$\text{pos} = (t - 1) \bmod c$$

그러면 $g \leq \text{pos} < g + y$일 때 노란불임을 알 수 있다.

탐색 범위를 정해야 한다. 모든 신호등은 각자의 주기 $c_i$마다 상태가 반복되므로, 전체 시스템의 상태는

$$L = \text{lcm}(c_1, c_2, \ldots, c_n)$$

마다 반복된다. 따라서 $t = 1$부터 $L$까지만 탐색하면 충분하다. 이 범위 안에 답이 없으면 영원히 존재하지 않으므로 $-1$을 리턴한다.

## 코드

```swift
import Foundation

func solution(_ signals: [[Int]]) -> Int {
    func isYellow(_ t: Int, _ signal: [Int]) -> Bool {
        let green = signal[0], yellow = signal[1]
        let cycle = signal[0] + signal[1] + signal[2]
        let pos = (t - 1) % cycle
        return pos >= green && pos < green + yellow
    }

    func lcm(_ a: Int, _ b: Int) -> Int {
        return a / gcd(a, b) * b
    }

    func gcd(_ a: Int, _ b: Int) -> Int {
        return b == 0 ? a : gcd(b, a % b)
    }

    let cycleLCM = signals.reduce(1) { lcm($0, $1[0] + $1[1] + $1[2]) }

    for t in 1...cycleLCM {
        if signals.allSatisfy({ isYellow(t, $0) }) {
            return t
        }
    }

    return -1
}
```
