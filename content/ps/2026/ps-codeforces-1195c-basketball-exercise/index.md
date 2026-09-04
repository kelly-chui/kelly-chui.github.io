---
title: "Codeforces 1195C. Basketball Exercise"
date: 2026-09-04T20:30:21+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1195/C>

## 풀이

두 줄로 배치된 수가 주어진다. 한 칸을 선택하면 같은 열과 인접한 열의 두 칸은 선택할 수 없다. 선택한 수의 합의 가능한 최대값을 출력하면 된다.

현재 열에서 위쪽 수를 선택했다면 직전 열에서는 아래쪽 수만 함께 선택할 수 있다. 반대로 아래쪽 수를 선택했다면 직전 열에서는 위쪽 수만 함께 선택할 수 있다.

따라서 현재 열까지의 최댓값을 다음 두 상태로 둔다.

```text
dpTop: 현재 열의 위쪽 수를 선택한 최댓값
dpBottom: 현재 열의 아래쪽 수를 선택한 최댓값
```

점화식은 다음과 같다.

$$
newTop = top[i] + dpBottom
$$

$$
newBottom = bottom[i] + dpTop
$$

어느 열도 선택하지 않는 경우는 이전 최댓값을 유지하면 된다. 

직전 열의 두 상태만 필요하므로 배열 없이 두 변수로 DP를 진행할 수 있다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using int64 = long long;

int main() {
    int n;
    std::cin >> n;
    std::vector<int64> top(n), bottom(n);
    for (int64& x : top) std::cin >> x;
    for (int64& x : bottom) std::cin >> x;
    int64 dpTop = 0;
    int64 dpBottom = 0;
    for (int i = 0; i < n; ++i) {
        int64 newTop = top[i] + dpBottom;
        int64 newBottom = bottom[i] + dpTop;
        dpTop = std::max(dpTop, newTop);
        dpBottom = std::max(dpBottom, newBottom);
    }
    std::cout << std::max(dpTop, dpBottom) << std::endl;
}
```
