---
title: "Codeforces 492B. Vanya and Lanterns"
date: 2026-07-24T02:34:52+09:00

categories:
  - Problem Solving
series:
tags:
  - Sorting

algorithmTags:
  - Sorting

draft: false
original: ""
aliases:
  - /posts/ps-codeforces-492b-vanya-and-lanterns/
---

## 문제

<https://codeforces.com/contest/492/problem/B>

## 풀이

길의 길이 `l`과 가로등의 위치 배열 `a`가 주어지고, 모든 가로등이 길 전체를 비춰야 할때, 가로등 하나가 비추는 거리 `d`를 출력하는 문제이다.

문제 풀이는 단순하다. 가로등 사이의 간격을 계산하고, 그 간격을 모두 채울수만 있으면 된다.

가로등이 길을 비추는 건 3가지 케이스로 생각해볼수 있다.

1. 시작 가로등
2. (양 옆에 가로등이 있는) 중간 가로등
3. 끝 가로동

1번 3번 케이스가 엣지 케이스인데, 중간 가로등은 가로등 사이의 거리의 절반 만큼만 비추면 되지만, 시작 가로등과 끝 가로등은 시작점과 자신의 위치까지를 모두 스스로 비춰야 해서, 따로 처리해줘야 한다.

문제에 함정이 하나 있는데, 소수점 정밀도를 요구한다. 따라서 `std::cout` 대신 `printf`를 사용했다.

## 코드

```c++
#include <cstdio>
#include <algorithm>

int main() {
    int n, l;
    scanf("%d %d", &n, &l);
    int *a = new int[n];
    for (int idx = 0; idx < n; idx++) {
        scanf("%d", &a[idx]);
    }
    std::sort(a, a + n);
    double d = std::max((double)a[0], (double)(l - a[n - 1]));
    for (int idx = 1; idx < n; idx++) {
        d = std::max(d, (double)(a[idx] - a[idx - 1]) / 2.0);
    }
    printf("%.10f", d);
    delete[] a;
    return 0;
}
```
