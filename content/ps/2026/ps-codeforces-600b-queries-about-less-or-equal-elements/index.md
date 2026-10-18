---
title: "Codeforces 600B. Queries About Less or Equal Elements"
date: 2026-08-20T12:22:26+09:00

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

<https://codeforces.com/problemset/problem/600/B>

## 풀이

두 개의 수열 `a`와 `b`가 주어진다. `b`의 각 원소에 대해서 그 원소보다 작거나 같은 `a`의 원소의 개수를 출력하면 된다.

바이너리 서치를 사용하면 된다. '작거나 같은' 이므로 upper bound를 찾으면 된다.

upper bound는 해당 원소보다 처음으로 큰 원소의 인덱스를 리턴하지만 0-indexed 이므로 binary search로 찾은 인덱스가 바로 `b`의 각 원소보다 작거나 같은 `a`의 원소의 개수가 된다.

## 코드

```cpp
#include <iostream>
#include <algorithm>
#include <vector>

int upperBound(std::vector<int>& a, int b) {
    int start = 0;
    int end = a.size();
    while (start < end) {
        int mid = (start + end) / 2;
        if (a[mid] <= b) {
            start = mid + 1;
        } else {
            end = mid;
        }
    }
    return start;
}

int main() {
    int n, m;
    std::cin >> n >> m;
    std::vector<int> a(n);
    for (int &ai : a) {
        std::cin >> ai;
    }
    std::sort(a.begin(), a.end());
    for (int i = 0; i < m; i++) {
        int b;
        std::cin >> b;
        std::cout << upperBound(a, b) 
                  << (i == (m - 1) ? "\n" : " ");
    }
    return 0;
}
```
