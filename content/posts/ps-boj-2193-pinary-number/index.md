---
title: "BOJ 2193. 이친수"
date: 2025-04-30

categories:
  - PS
series:
  - Problem Solving
tags:
  - BOJ
  - Dynamic Programming
  - Swift

draft: false
aliases:
  - "/posts/ps-boj-2193-이친수/"

original: "https://junmusu.tistory.com/157"
---

## 문제

<https://www.acmicpc.net/problem/2193>

## 풀이

문제에서 명시적으로 두 가지 조건을 제공해준다.

  1. 0으로 시작하지 않는다.
  2. 1이 연속되지 않는다.

이진수라는 조건도 있으므로, 3가지 조건이 있다고 볼 수 있다.

케이스를 몇개 써보면 쉽게 DP로 풀 수 있는걸 알 수 있다.

```swift
dp[1] = 1 // 1
dp[2] = 1 // 10
dp[3] = 2 // 100, 101
dp[4] = 3 // 1000, 1001, 1010
```

2번째 조건 때문에, 0으로 끝나는 경우에는 1을 붙일 수 있지만, 1로 끝나는 경우에는 0으로 붙일 수 없는 것을 알 수 있다.

DP 테이블을 다음과 같이 정의하자.

`dp[i][j]`: 자리수가 i인 이진수 중 마지막 자리수가 `j`인 이친수의 개수

따라서 점화식은 다음과 같이 된다.
```
dp[i][0] = dp[i - 1][0] + dp[i - 1][1]
dp[i][1] = dp[i - 1][0]
```

코드를 구현할 때는, 2차원 배열을 사용하기 싫고, 어짜피 원소 수가 2인 배열이라서, 그냥 튜플로 대체했다. 튜플 인덱스도 0 혹은 1이라서 아주 직관적으로 작성할 수 있다.

### 코드

```swift
typealias DPElment = (Int, Int)
let n = Int(readLine()!)!
var dp = [DPElment](repeating: (0, 0), count: n + 1)
dp[1] = (0, 1)
if n > 1 {
    for digit in 2...n {
        dp[digit].0 = dp[digit - 1].0 + dp[digit - 1].1
        dp[digit].1 = dp[digit - 1].0
    }
}
print(dp[n].0 + dp[n].1)
```
