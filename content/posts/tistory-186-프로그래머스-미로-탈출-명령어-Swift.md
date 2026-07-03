---
title: "[프로그래머스] 미로 탈출 명령어"
date: 2025-08-23
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Backtracking"]
draft: false
original: "https://junmusu.tistory.com/186"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/150365>

## 풀이

분명히 배열(문자열)의 원소를 하나씩 채워나가야 하는 DFS 완전 탐색 스타일의 문제인데 k의 최대값이 2,500으로 너무 크다. 하지만 문제에서 주어진 조건들을 읽어보면 프루닝을 통해 백트래킹 문제로 만들 수 있다.

- 현재 위치와 종료 위치 사이의 맨하탄 거리가 남은 이동 횟수보다 적으면, 더 이상 탐색할 필요가 없다. 
    - 목표에 도달하지 못하는 분기이기 때문에, 분기를 버려야 한다.
- 남은 이동 횟수와 현재 위치와 종료 위치 사이의 맨하탄 거리의 차가 홀수인 경우에도 더 이상 탐색할 필요가 없다. 
    - 이동 횟수는 고정이고, 두 위치의 거리보다 크다면 이동 횟수를 어딘가에서 소모해야한다. 그런데 다른 위치로 갔다가, 다시 현재 위치로 돌아올때 소모하는 값은 2이므로, 홀수인 경우에는 목적지에 절대 도달할 수 없게 된다.
- 마지막으로, 탐색 순서를 잘 정했다면 처음으로 성공한 케이스가 곧 사전순에서 가장 앞선 순서가 된다. 한 번만 성공하게 되면 그 뒤의 모든 분기는 의미가 없어진다.

이렇게 프루닝을 하면 완전 탐색으로 절대로 해결 불가능한 문제를 풀 수 있게 된다.

이 문제를 푸는 알고리즘은 다음과 같다.

1. 사전 순으로 가장 앞에 오는 정답을 원하기 때문에, 이동 순서를 `d`, `l`, `r`, `u`로 한다.  
2. 위에서 언급한 목적지에 도달할 가능성이 없는 분기들을 프루닝 한다.  
3. DFS 탐색으로 배열을 채운다  
4. 처음으로 조건에 맞는 배열을 완성했다면, DFS 탐색을 종료한다. (아래 코드에서는 플래그를 사용했다.)

지금까지 백트래킹 문제와 DFS를 이용한 완전탐색 문제를 딱히 구분하지 않고 풀었다. 여태껏 풀어온 대부분의 경우는 완전 탐색을 해도 가능하도록 적은 경우의 수를 제시하기 때문이다. 이 문제를 풀면서 프루닝의 중요성을 다시 알게 되었다.

### 코드

```swift
import Foundation

func solution(_ n:Int, _ m:Int, _ x:Int, _ y:Int, _ r:Int, _ c:Int, _ k:Int) -> String {
    func calDist(_ current: (Int, Int)) -> Int {
        return abs(r - current.0) + abs(c - current.1)
    }
    func dfs(_ current: (x: Int, y: Int)) {
        let dist = calDist(current)
        let remain = k - commands.count
        guard !isFinished else { return }
        guard remain >= dist && (dist - remain) % 2 == 0 else { return }
        if remain == 0 {
            if current == (r, c) { 
                answer = String(commands)
                isFinished = true
            }
            return
        }
        for (command, move) in zip(["d", "l", "r", "u"].map { Character($0) }, [(1, 0), (0, -1), (0, 1), (-1, 0)]) {
            let newX = current.x + move.0
            let newY = current.y + move.1
            guard 1...n ~= newX && 1...m ~= newY else { continue }
            commands.append(command)
            dfs((newX, newY)) 
            commands.removeLast()
        }
    }
    var isFinished = false
    var answer: String? = nil
    var commands = [Character]()
    dfs((x, y))
    return answer ?? "impossible"
}
```
