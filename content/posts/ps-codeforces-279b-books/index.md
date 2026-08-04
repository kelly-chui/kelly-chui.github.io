---
title: "Codeforces 279B. Books"
date: 2026-07-30T23:08:53+09:00

categories:
  - Problem Solving
series:
tags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/279/B>

## 풀이

책을 읽는데 걸리는 시간이 담긴 크기 `n` 배열 `a`가 주어지고, 책을 읽을 수 있는 시간 `t`가 주어진다. 특정 인덱스를 정해서 그 인덱스부터 책을 순서대로 읽었을때, 최대로 읽을 수 있는 책의 개수를 출력하면된다.

모든 경우의 수를 탐색하려면 $O(n^2)$의 시간 복잡도를 가지는데 책의 개수가 10만개 이므로, 시간 내로 해결하기는 힘들다.

'순서대로'라는 조건이 있으므로, 투 포인터를 이용하면 쉽게 풀 수 있다.

단 배열 `a`의 원소의 크기가 `t`보다 클 수 있으므로, 단 한권의 책도 읽지 못하는 경우가 있다. 그래서 책을 0권 읽는 경우의 수도 생각해서 코드를 짜야 한다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n, t;
    std::cin >> n >> t;
    std::vector<int> a(n);
    for (int& i : a) {
        std::cin >> i;
    }
    int right = -1, left = 0;
    int timeSum = 0;
    int answer = 0;
    while (right < n - 1) {
        right++;
        timeSum += a[right];
        while (timeSum > t) {
            timeSum -= a[left];
            left++;
        }
        answer = std::max(answer, right - left + 1);
    }
    std::cout << answer << std::endl;
}
```
