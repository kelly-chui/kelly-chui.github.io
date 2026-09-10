---
title: "Codeforces 1538C. Number of Pairs"
date: 2026-09-10T21:08:24+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Sorting
  - Binary Search
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1538/C>

## 풀이

원소의 개수가 `n`개인 수열 `a`가 주어진다. `a`의 원소 중 두 개(각각 $a_{i}$, $a_{j}$)를 골라서, 그 합이 `l`보다 크거나 같고 `r`보다 작거나 같은($l \leq a_{i} + a_{j} \leq r$) 원소 쌍의 개수를 출력하면 된다.

두 원소 중 하나를 고정하자. 고정된 원소를 $a_{i}$라고 하면, $a_{j}$가 될 수 있는 원소의 개수를 바이너리 서치를 이용해서 구할 수 있다.

이전에 [이 포스팅]({{< relref "posts/cs-algorithm-binary-search" >}})에서 말했듯이, upper bound 결과에 lower bound 결과를 빼서 조건에 맞는 원소의 개수를 구하는 방법을 쓰면 된다.

바이너리 서치를 하니까, 당연히 정렬을 해야하고, 각 원소마다 바이너리 서치를 적용하니까 시간 복잡도는 $O(n \log n)$이 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int lowerBound(int target, int low, int high, int i, std::vector<int>& a) {
    while (low < high) {
        int mid = (low + high) / 2;
        if (a[i] + a[mid] >= target) high = mid;
        else low = mid + 1;
    }
    return high;
}

int upperBound(int target, int low, int high, int i, std::vector<int>& a) {
    while (low < high) {
        int mid = (low + high) / 2;
        if (a[i] + a[mid] > target) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    return high;
}

int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int n, l, r;
        std::cin >> n >> l >> r;
        std::vector<int> a(n);
        for (int& ai : a) std::cin >> ai;
        std::sort(a.begin(), a.end());
        long long answer = 0;
        for (int i = 0; i < n; i++) {
            answer += upperBound(r, i + 1, n, i, a) - lowerBound(l, i + 1, n, i, a);
        }
        std::cout << answer << std::endl;
    }
    return 0;
}
```
