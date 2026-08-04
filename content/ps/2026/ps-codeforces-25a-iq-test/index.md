---
title: "Codeforces 25A. IQ Test"
date: 2026-07-27T16:26:14+09:00

categories:
  - Problem Solving
series:
tags:
  - Implementation

algorithmTags:
  - Implementation

draft: false
original: ""
aliases:
  - /posts/ps-codeforces-25a-iq-test/
---

## 문제

<https://codeforces.com/problemset/problem/25/A>

## 풀이

`n` 개의 원소를 가진 수열이 입력으로 들어오고 입력으로 들어온 숫자 중 홀/짝이 다른 하나의 숫자의 인덱스(1-base 인덱스)를 출력하면 된다.

수열이 들어올 때마다 홀/짝 각각의 마지막 인덱스를 저장하고, 홀수의 개수, 짝수의 개수를 세면된다.

마지막 이렇게 얻어진 개수로 홀/짝인지 판별을 한 뒤에, 홀수면 짝수의, 짝수면 홀수의 마지막 인덱스를 출력하면 된다.

## 코드

```c++
#include <iostream>

int main() {
    int n;
    std::cin >> n;
    int oddCount = 0;
    int evenCount = 0;
    int oddIndex = 0;
    int evenIndex = 0;
    for (int i = 1; i <= n; ++i) {
        int number;
        std::cin >> number;
        if (number % 2 == 0) {
            evenCount++;
            evenIndex = i;
        } else {
            oddCount++;
            oddIndex = i;
        }
    }
    std::cout << (oddCount == 1 ? oddIndex : evenIndex) << std::endl;
}
```
