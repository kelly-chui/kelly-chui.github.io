---
title: "BOJ 1049. 기타줄"
date: 2023-06-16

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Greedy
  - Swift

draft: false
original: "https://junmusu.tistory.com/95"
---

## 문제

<https://www.acmicpc.net/problem/1049>

## 풀이

6개 묶음 패키지의 가격과 낱개의 가격이 각각 여러 개가 주어졌을 때, 가장 적은 비용으로 n개 이상의 수를 채워야 하는 문제이다.

문제의 알고리즘은 다음과 같다.

1. 패키지의 가격과 낱개의 가격이 같이 들어오므로 현재 가장 싼 패키지와 낱개의 가격과, 입력으로 들어온 가격을 각각 비교해서 갱신한다.   
2. 패키지만 샀을때, 낱개만 샀을때, 패키지와 낱개를 동시에 샀을때 세가지 경우를 비교해서 가장 비용이 낮은 값을 출력한다.

이 문제에서 구매 수량에 제한을 두지 않았으므로, 굳이 배열을 만들고 정렬을 할 필요가 없다. 패키지든 낱개든 무조건 가장 싼 가격만 알고 있으면 된다.

또한 낱개의 가격이 패키지의 가격보다 싸다는 제한이 없고, 딱 n개가 아닌 최소 n개를 구매해야 하는 경우이므로, 패키지만 샀을 때, 낱개만 샀을 때, 그리고 패키지 + 낱개를 샀을 때 세가지 경우의 수가 존재하며, 이중 가장 낮은 값을 출력하면 된다.

### 코드

```swift
import Foundation

let nm = readLine()!.split(separator: " ").map { Int(String($0))! }
var package = 1000
var single = 1000
for _ in 0..<nm[1] {
    let price = readLine()!.split(separator: " ").map { Int(String($0))! }
    package = min(package, price[0])
    single = min(single, price[1])
}
let po = package * (nm[0] / 6) + package
let so = single * nm[0]
let ps = package * (nm[0] / 6) + single * (nm[0] % 6)
print(min(po, so, ps))
```
