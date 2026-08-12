---
title: "Codeforces 489C. Given Length and Sum of Digits"
date: 2026-08-06T13:40:23+09:00

categories:
  - Problem Solving
series:
tags:
  - Greedy
algorithmTags:
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/489/C>

## 풀이

자리수가 `m`이고 각 자리수의 합이 `s`인 정수 중 가장 큰 수와 가장 작은 수를 찾는 문제이다.

처음에는 DP로 접근했는데, DP로는 수의 개수 정도만 구할 수 있고, 최대값과 최소값을 찾기는 힘들 것 같았다. 그래서 다시 그리디로 접근했다.

자리수가 `m`인데 $1 <= m <= 100$ 이기 때문에, `int` 타입으로 수를 다루는건 쉽지 않고, 배열이나 벡터로 다루는게 더 쉽다.

최대값은 계수가 높은 쪽에 큰 숫자를 배치하고, 최소값은 계수가 낮은 쪽에 큰 숫자를 배치하는 방법을 사용하자. 

- 최대값은 앞부터 `9`와 `s - 여기까지의 자리수의 합`중 작은 값으로 앞 자리를 채워나간다.
- 최소값은 반대로 뒤에서부터 `9`와 `s - 1 - 뒤에서부터의 자리수 합`중 작은 값으로 채워나간다.

최소값에서 1을 뺴는 이유는 이유는 제일 앞자리가 `0`일 수 없기 때문에, 최소한 `1`은 남겨두어야 한다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int m, s;
    std::cin >> m >> s;
    if (m == 1 && s == 0) {
        std::cout << "0 0" << std::endl;
        return 0;
    }
    if (9 * m < s || s == 0) {
        std::cout << "-1 -1" << std::endl;
        return 0;
    }
    std::vector<int> minVector(m, 0);
    std::vector<int> maxVector(m, 0);
    int remain = s;
    for (int idx = 0; idx < m; idx++) {
        int digit = std::min(9, remain);
        maxVector[idx] = digit;
        remain -= digit;
    }
    minVector[0] = 1;
    remain = s - 1;
    for (int i = m - 1; i >= 0 && remain > 0; --i) {
        int add = std::min(9 - minVector[i], remain);
        minVector[i] += add;
        remain -= add;
    }
    for (int digit : minVector) {
        std::cout << digit;
    }
    std::cout << " ";
    for (int digit : maxVector) {
        std::cout << digit;
    }
    std::cout << std::endl;
    return 0;
}
```
