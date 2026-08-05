---
title: "Codeforces 451B. Sort the Array"
date: 2026-08-05T21:03:54+09:00

categories:
  - Problem Solving
series:
tags:
  - Two Pointers
algorithmTags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/451/B>

## 풀이

`n` 크기 수열 `a`가 주어진다. 이 수열의 특정 구간을 선택해서 뒤집는 것을 1번 했을 때, 이 수열이 오름차순으로 정렬되어 있다면 `"yes"`와 그 구간을, 불가능하면 `"no"`를 출력하면 된다.

`n`의 제약 조건이 $1 <= n <= 10^5$ 이기 때문에, 브루트 포스로는 시간 내에 풀기 힘들다.

특정 구간을 선택해서 뒤집는 행동을 1번만 한다는 것이 힌트인데, 구간 하나를 1번 뒤집어서 수열 전체가 오름차순이 된다는 것은, 수열의 일부 구간만 내림차순 이라는 것이다.

내림차순 구간의 시작과 끝을 투 포인터로 찾는다. 이후 해당 구간을 실제로 뒤집은 뒤, 전체 수열이 오름차순인지 확인하면 된다.

## 코드

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;
    std::vector<int> a(n);
    for (int& ai : a) {
        std::cin >> ai;
    }
    int left = 0;
    for (; left < n - 1; left++) {
        if (a[left] > a[left + 1]) break;
    }
    if (left == n - 1) {
        std::cout << "yes\n" << "1 1" << std::endl;
        return 0;
    }
    int right = left;
    for (; right < n - 1; right++) {
        if (a[right] <= a[right + 1]) break;
    }
    std::reverse(a.begin() + left, a.begin() + right + 1);
    for (int i = 0; i + 1 < n; i++) {
        if (a[i] > a[i + 1]) {
            std::cout << "no\n";
            return 0;
        }
    }
    std::cout << "yes\n" << left + 1 << ' ' << right + 1 << std::endl;
    return 0;
}
```
