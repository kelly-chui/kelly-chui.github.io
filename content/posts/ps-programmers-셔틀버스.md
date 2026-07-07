---
title: "Programmers. 셔틀버스"
date: 2025-08-03
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Implementation", "Simulation"]
draft: false
original: "https://junmusu.tistory.com/177"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/49191>

## 풀이

단순 구현으로 풀 수 있는 문제다. 문제를 단순화하면 조건에 맞는 최대 값을 구하는 문제이므로 바이너리 서치도 쓸 수 있겠다.

우선 시간을 다루는 문제에서는 시간, 분을 분으로 통일하는 경우가 더 시간을 다루기 쉬워지는 경우가 많다. 예를 들어서 셔틀의 첫 도착 시간인 9:00을 540으로 바꾸는 것이다.

그리고 `timetable` 배열의 길이가 최대 2000이므로 모든 배열을 순회해도, 심지어 O(n²)시간으로 순회해도 아무런 걱정이 없다. 따라서 앞 번호부터 순서대로 버스에 태우면 된다. 이제 마지막 버스인 경우에 콘이 탈 수 있는 여유가 있다면, 마지막 버스의 도착 시간을 리턴하면 되고, 만약 여유가 없다면, 마지막 버스에 마지막으로 타는 사람보다 '1분' 일찍 나오면 된다.

### 코드

```swift
func solution(_ n:Int, _ t:Int, _ m:Int, _ timetable:[String]) -> String {
    var crew: [Int] = timetable.map { time in
        let tokens = time.split(separator: ":").compactMap { Int($0) }
        return tokens[0] * 60 + tokens[1]
    }.sorted()
    var currentTime = 540 // 09:00
    var crewIndex = 0
    for i in 0..<n {
        var cnt = 0
        while cnt < m && crewIndex < crew.count && crew[crewIndex] <= currentTime {
            crewIndex += 1
            cnt += 1
        }
        if i == n - 1 {
            if cnt < m {
                return String(format: "%02d:%02d", currentTime / 60, currentTime % 60)
            } else {
                let time = crew[crewIndex - 1] - 1
                return String(format: "%02d:%02d", time / 60, time % 60)
            }
        }
        currentTime += t
    }
    return ""
}
```
