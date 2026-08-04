---
title: "Codeforces 230B. T-Primes"
date: 2026-07-28T10:39:27+09:00

categories:
  - Problem Solving
series:
tags:
  - Math
  - Sieve of Eratosthenes
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/230/B>

## 풀이

T-Prime을 약수가 3개인 수라고 정의하고, $n$개의 크기의 수열 $x$의 원소 각각에 대해서 그 수가 T-Prime인지 확인하는 문제이다.

약수가 3개라는 뜻은, $1$과 자기 자신 그리고 $\sqrt{x_i}$만을 약수로 가진다는 뜻이다. 즉, T-Prime은 어떤 수의 제곱이어야 한다.

그 '어떤 수'의 조건은 무엇일까? 약수의 약수는 결국 약수이다. T-Prime은 $1$, '어떤 수', 자기 자신만을 약수로 가지므로, '어떤 수'는 소수여야 한다. 결국 이 문제는 소수 판별 문제로 단순화된다.

$x_i$의 최댓값이 $10^{12}$이지만, T-Prime 여부를 판별하려면 $\sqrt{x_i}$가 소수인지만 확인하면 되므로 체는 $\sqrt{10^{12}} = 10^6$까지만 구성하면 충분하다. 에라토스테네스의 체의 시간복잡도는 (거의) $O(N)$이고, 이후 각 쿼리는 $O(1)$에 처리되므로, $n \leq 10^5$인 입력 전체에 대해 전처리 $O(10^6)$ + 쿼리 $O(n)$으로 풀 수 있다.

## 코드

```cpp
#include <iostream>
#include <cstring>
#include <cmath>

int main() {
    int n;
    std::cin >> n;
    long long *x = new long long[n];
    for (int i = 0; i < n; i++) {
        std::cin >> x[i];
    }
    bool *isPrime = new bool[1'000'001];
    memset(isPrime, true, sizeof(bool) * 1'000'001);
    isPrime[0] = false;
    isPrime[1] = false;
    for (long long i = 2; i < 1'000'001; i++) {
        if (isPrime[i]) {
            for (long long j = i * i; j < 1'000'001; j += i) {
                isPrime[j] = false;
            }
        }
    }
    for (int i = 0; i < n; i++) {
        long long sqrtX = (long long)sqrt((double)x[i]);
        if ((sqrtX + 1) * (sqrtX + 1) == x[i]) {
            sqrtX++;
        }
        if (isPrime[sqrtX] && sqrtX * sqrtX == x[i]) {
            std::cout << "YES" << std::endl;
        }
        else {
            std::cout << "NO" << std::endl;
        }
    }
    delete[] x;
    delete[] isPrime;
    return 0;
}
```
