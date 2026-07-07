---
title: "BOJ 1520. 내리막 길"
date: 2023-07-06
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "DP"]
draft: false
original: "https://junmusu.tistory.com/119"
---

## 문제

<https://www.acmicpc.net/problem/1520>

## 풀이

dfs를 이용하면 쉽게 풀 수 있는 문제일 것 같지만, 주어지는 그래프의 크기가 커서 시간초과가 나오는 문제이다. 하지만 이러한 문제들은 중첩되는 연산이 많으므로 DP를 이용하면 시간초과 없이 해결할 수 있는 경우가 흔하다.

DP의 컨셉은 다음과 같다.

1. 그래프의 특정 칸에서 목적지로 도착하는 경우의 수는 앞선 경로에 상관없이 항상 같다.  
2. 따라서 각 칸에서 목적지로 가는 경로의 수를 dp테이블에 메모이제이션 한다면 불필요한 연산을 하지 않아도 된다.

따라서 점화식을 dp[x][y] = dp[x - 1][y] + dp[x + 1][y] + dp[x][y - 1] + dp[x][y + 1]로 일반화 할 수 있다. 각 항에서 탐색이 불가능한 칸((x, y)보다 높은 칸, 존재하지 않는 칸) 에 대응되는 항은 제외해야하기 때문에 엄밀히 말해서는 틀리지만, 이해하는데는 충분하다.

이를 dfs와 합치면 다음과 같은 알고리즘을 세울 수 있다.

> 1\. dp 테이블의 각 원소를 -1로 초기화 해서 만든다(탐색 여부를 판단하기 위해서, isVisited를 쓰면 칸에 접근하기 힘들어진다).  
>   
> 2\. dfs 탐색을 한다.  
> 2-1. 탐색 하려는 칸에 대응하는 dp 테이블의 값이 -1 이라면 (그 칸에서 목적지로 가는 경로의 수가 dp 테이블에 저장되어 있지 않다면) 주변 칸들을 탐색하여 위의 점화식을 통해 경로의 수를 구하고, dp 테이블에 메모이제이션 한다.  
> 2-2. dp 테이블의 값이 -1이 아니라면 이미 2-1을 거친 칸이므로 그대로 dp 테이블의 값을 리턴하면 된다(메모이제이션을 했으니까 꺼내다 쓴다).  
>   
> 3\. 최종적으로 dp[0][0]의 값을 출력한다.

### 코드


```swift
import Foundation

func dfs(location: (Int, Int)) -> Int {
    if location == (m - 1, n - 1) {
        return 1
    }
    if dp[location.0][location.1] == -1 {
        dp[location.0][location.1] = 0
        for move in [(-1, 0), (1, 0), (0, -1), (0, 1)] {
            let newLocation = (location.0 + move.0, location.1 + move.1)
            if newLocation.0 < 0 || newLocation.0 >= m || newLocation.1 < 0 || newLocation.1 >= n { continue }
            if graph[newLocation.0][newLocation.1] >= graph[location.0][location.1] { continue }
            dp[location.0][location.1] += dfs(location: newLocation)
        }
    }
    return dp[location.0][location.1]
}

let mn = readLine()!.split(separator: " ").map { Int(String($0))! }
let (m, n) = (mn[0], mn[1])
var graph: [[Int]] = []
for _ in 0..<m {
    graph.append(readLine()!.split(separator: " ").map { Int(String($0))! })
}
var dp = [[Int]](repeating: [Int](repeating: -1, count: n), count: m)
print(dfs(location: (0, 0)))
```

