---
title: "Codeforces 1360D. Buying Shovels"
date: 2026-08-16T10:53:55+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1360/D>

## 풀이

정확히 `n`개의 삽을 사야 하고, 한 번에 살 수 있는 패키지 크기는 `1`부터 `k`까지이다. 또한 한 번 고른 패키지 크기만 계속 사야 하므로, 결국 `n`을 나누는 어떤 수 `x`를 골라 `n / x`개의 패키지를 사는 문제로 바뀐다.

패키지 개수를 최소화하려면 패키지 크기 `x`를 최대한 크게 잡아야 한다. 따라서 `n`의 약수 중에서 `k` 이하인 가장 큰 값을 찾으면 된다.

예를 들어 `n = 8`, `k = 7`이면 `8`의 약수는 `1, 2, 4, 8`인데, 이 중 `k` 이하인 가장 큰 약수는 `4`이다. 그래서 답은 `8 / 4 = 2`가 된다.

정리하면 답은 다음과 같다.

$$
answer = \frac{n}{\max \{ d \mid d \text{는 } n \text{의 약수이고 } d \leq k \}}
$$

`n`의 약수만 확인하면 되므로, `1`부터 `sqrt(n)`까지 순회하면서 약수 쌍 `i`와 `n / i`를 함께 검사하면 충분하다. 이때 `k` 이하인 값 중 가장 큰 값을 저장하면 된다.

## 코드

```cpp
#include <iostream>
#include <algorithm>
#include <cmath>
 
int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int n, k;
        std::cin >> n >> k;
        int answer = 1;
        for (int i = 1; i <= sqrt(n); i++) {
            if (n % i == 0) {
                if (i <= k) answer = std::max(answer, i);
                if (n / i <= k) answer = std::max(answer, n / i);
            }
        }
        std::cout << (n / answer) << std::endl;
    }
    return 0;
}
```
