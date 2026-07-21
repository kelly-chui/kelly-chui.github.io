---
title: "Codeforces 1A. Theatre Square"
date: 2026-07-21T10:28:57+09:00

categories:
    - Problem Solving
series:
tags:
    - C++
    - Math

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1/A>

## 풀이

Codeforces에서 푼 첫 문제.

$n \times m$ 크기의 직사각형 도시가 있고, 그 도시를 $a \times a$ 크기의 타일로 뒤덮는 문제이다. 타일은 도시 경계를 넘어가도 되지만, 잘라선 안되고 겹쳐도 안된다. 즉, 필요한 타일의 개수는 가로/세로 각각을 $a$로 나눈 값을 올림하여 곱하면 된다.

문제에 간단한 함정이 하나 있는데, `n`, `m`, `a`의 범위가 최대 $10^9$이라 곱셈 결과가 `int` 범위를 넘어갈 수 있으므로 `long long`을 사용을 사용해야 한다.

## 코드

```c++
#include <iostream>
#include <cmath>

int main() {
    long long n, m, a;
    std::cin >> n >> m >> a;
    std::cout << ((n + a - 1) / a) * ((m + a - 1) / a) << std::endl;
    return 0;
}
```