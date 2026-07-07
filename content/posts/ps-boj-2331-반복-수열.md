---
title: "BOJ 2331. 반복 수열"
date: 2022-11-07
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Python", "Simulation"]
draft: false
original: "https://junmusu.tistory.com/37"
---

## 문제

<https://www.acmicpc.net/problem/2331>

## 풀이

1. 수열을 만드는 반복문을 만든다.
2. 도중에 기존에 있는 원소와 같은 원소가 나오면 반복문을 종료한다.
3. 처음으로 나온 같은 원소의 인덱스를 출력한다. (인덱스는 0부터 시작이기에 더하고 뺄 필요가 없다.)

너무 간단하게 풀렸는데 시간복잡도가 별로 좋아보이진 않는다. 더 좋은 방법이 있을듯 싶다.

### 코드

```py
a, p = map(int, input().split())
seq = [a]

while True:
    element = 0
    for i in str(seq[-1]):
        element += (int(i) ** p)
    if element in seq:
        break
    seq.append(element)

print(seq.index(element))
```
