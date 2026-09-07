---
title: "Codeforces 1201C. Maximum Median"
date: 2026-09-07T20:16:33+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Binary Search
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1201/C>

## 풀이

수열 `a`가 주어지고, `a`의 원소중 하나를 골라서 그 값을 1만큼 증가시키는 연산을 `k`번 할 수 있다고 할 때, 만들 수 있는 `a`의 중앙값의 최대를 출력하면 된다.

우선 중앙값을 얻기 위해서 `a`를 정렬하고, 한 번도 연산을 하지 않았을 때의 중앙 값을 구한다.

조금만 생각해보면, 중앙 값의 최대를 얻기 위해서, 현재 중앙 값 보다 작은 원소들의 값을 늘릴 필요가 없다. 얘네들은 원래부터 중앙 값보다 작고, 크기를 늘려서 (현재) 중앙 값 보다 크게 해봤자. 그 효율이 중앙 값보다 원래 큰 숫자들의 값을 늘리는 것 보다 좋지 않다.

그러면 중앙 값을 어떻게 구해야 할까? 우리가 만들고 싶은 중앙 값(`target`)을 정해서, 그 중앙 값을 만들 수 있는지 확인해 볼 수 있다. 

`target`이 높아질수록 필요한 연산의 횟수가 무조건 증가하므로, 단조 증가를 하기 때문에, 바이너리 서치를 사용할 수 있다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using int64 = long long;

bool check(int64 target, int n, int k, std::vector<int>& a) {
    int64 require = 0;
    for (int idx = n / 2; idx < n; idx++) {
        require += target - a[idx] > 0 ? target - a[idx] : 0;
    }
    return require <= k;
}

int64 upperBound(int64 low, int64 high, int n, int k, std::vector<int>& a) {
    while (low < high) {
        int64 mid = low + (high - low) / 2;
        if (check(mid, n, k, a)) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return high - 1;
}

int main() {
    int n, k;
    std::cin >> n >> k;
    std::vector<int> a(n);
    for (int& ai : a) std::cin >> ai;
    std::sort(a.begin(), a.end());
    std::cout << upperBound(a[n / 2], static_cast<int64>(a[n / 2]) + k + 1, n, k, a);
    return 0;
}
```
