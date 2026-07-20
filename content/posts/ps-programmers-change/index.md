---
title: "Programmers. 거스름돈"
date: 2025-08-03

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - Dynamic Programming
  - Programmers
  - Python

draft: false
aliases:
  - "/posts/ps-programmers-거스름돈/"

original: "https://junmusu.tistory.com/176"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/12907>

## 풀이

DP 문제다. 순열인지 조합인지 조심하면 쉽게 풀 수 있다. 문제에서 예시로 든 1, 2, 5원이 있을 때를 생각해보자. (5도 마찬가지지만) 2는 1의 배수이다. 따라서 순열로 하면 '3'을 만드는 경우에 1+1+1, 1+2, 2+1 이라는 세 가지 방법이 나오게 된다. 하지만 이 문제는 조합 문제이므로 중복을 제거해야한다.

그러면 중복을 어떻게 제거해야 할까? 작은 동전부터 순서대로 만들면 된다. 이 방법이 조합 DP의 가장 기본적인 방법이다.

- 가장 작은 동전을 써서 만들 수 있는 조합을 다 만든 다음 DP 테이블에 저장한다.
- 작은 순서대로 (오름차순으로) 조합을 더한다.

이런 식으로 하면 중복을 방지할 수 있다. 위 예제로 따지면 1원짜리 동전을 먼저 써서 1+1+1을 우선 만들고, 다음에 2원을 써서 1+2를 만든다. 작은 순서대로 하므로 알고리즘 상에서 2+1 같은 방법을 만들지 않는다.

### 코드

```py
def solution(n, money):
    mod = 1000000007
    dp = [0] * (n + 1)
    dp[0] = 1
    
    for coin in money:
        for amount in range(coin, n + 1):
            dp[amount] = (dp[amount] + dp[amount - coin]) % mod
    return dp[n]
```
