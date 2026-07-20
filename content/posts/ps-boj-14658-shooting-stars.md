---
title: "BOJ 14658. 하늘에서 별똥별이 빗발친다"
date: 2024-04-07

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Brute Force
  - Python

draft: false
original: "https://junmusu.tistory.com/136"
---

## 문제

<https://www.acmicpc.net/problem/14658>

## 풀이

우선 최악의 경우를 생각해보자. N, M이 각각 500,000 이고, L은 1, K가 100일 때가 최악인 경우가 된다. 이 상태에서 모든 경우의 수를 확인하려면 별의 위치를 250,000,000,000,000번 확인해야 한다. 따라서 모든 경우의 수를 판단하는건 불가능 하다.

따라서 트램펄린을 설치할 위치를 합리적으로 정해야 한다. 주어진 조건을 보면 별이 최대 100개 까지밖에 없으므로 이를 활용하여 생각해본다.

우선 별 하나를 기준으로 보면 L * L 크기의 트램펄린이고, 별이 최대 100개 있으므로 확인해야 할 위치는 최악의 경우에 100,000,000,000,000개 이다. 사실상 위의 경우와 다를바가 없으므로 불가능하다.

별 두 개를 기준으로 보면 별이 최대 100개 있으므로 확인해야 할 위치가 1,000,000개가 된다. 두 개의 별을 각각 A와 B라고 정의하고 A의 row좌표, B의 column좌표 -혹은- A의 column좌표, B의 row좌표를 기준으로 트램펄린을 설치하면 된다. 여기서 유의할 점은 **기준이 된 A와 B가 트램펄린에 들어있지 않아도 확인한다.** 어짜피 A와 B를 선택하는 모든 경우의 수(하나의 별이 중복되서 선택되는 것 포함)을 탐색할 것이므로 상관 없다.

### 코드

```py
n, m, l, k = map(int, input().split())

stars = []
for _ in range(k):
    x, y = map(int, input().split())
    stars.append((x, y))

bounce = 0
for starA in stars:
    for starB in stars:
        count = 0
        for starC in stars:
            if starA[0] <= starC[0] and starC[0] <= starA[0] + l and\
            starB[1] <= starC[1] and starC[1] <= starB[1] + l:
                count += 1
            if count > bounce:
                bounce = count

print(k - bounce)
```
