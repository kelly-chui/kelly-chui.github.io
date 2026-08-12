---
title: "Codeforces 1294C. Product of Three Numbers"
date: 2026-08-08T22:41:23+09:00

categories:
  - Problem Solving
series:
tags:
  - Math
algorithmTags:
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1294/C>

## 풀이

테스트 케이스가 `t`개 존재한다. 먼저, 정수 `n`이 주어진다. 각 `n`에 대해 $n = a \times b \times c, \ a, b, c > 1, \ a \neq b, b \neq c, a \neq c$를 만족하는 세 정수 `a`, `b`, `c`가 존재하면 `"YES"`와 세 수를 출력하고, 그렇지 않으면 `"NO"`를 출력하면 된다.

인수 분해 문제이다. `n`이 3개의 정수의 곱으로 표현되어야 하는데, 3개의 정수가 서로소라는 제약조건은 없다. `64`처럼 지수가 6이면 $64 = 2^1 \times 2^2 \times 2^3$ 처럼 표현할 수 있기 때문에 인수와 지수 둘 다 중요하다.

그리고 `n`을 완전히 소인수분해할 필요는 없다. 필요한 것은 서로 다른 세 약수 `a`, `b`, `c`를 찾는 것이기 때문에, 먼저 가장 작은 약수 하나를 `a`로 선택하고 `n`에서 나눈다.

그 다음 남은 값에서 `a`와 다른 약수 하나를 `b`로 찾는다. 첫 번째 반복에서 `a`는 가장 작은 약수였으므로, 두 번째 약수는 `a + 1`부터 찾아도 된다.

두 약수를 찾았다면 남은 값은 자동으로 $c = \frac{n}{a \times b}$가 된다. 이렇게 구한 `c`가 제약조건에 맞는지(1보다 크고, `a`, `b`와 달라야 한다.) 확인하면 된다.

## 코드

```cpp
#include <iostream>

int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int n;
        std::cin >> n;
        int a = 0;
        int b = 0;
        int c = n;
        for (int divisor = 2; divisor * divisor <= c; divisor++) {
            if (c % divisor == 0) {
                a = divisor;
                c /= divisor;
                break;
            }
        }
        for (int divisor = a + 1; divisor * divisor <= c; divisor++) {
            if (c % divisor == 0 && divisor != a) {
                b = divisor;
                c /= divisor;
                break;
            }
        }
        if (a && b && c > 1 && c != a && c != b) {
            std::cout << "YES" << "\n"
                      << a << " "
                      << b << " "
                      << c << std::endl;
        } else {
            std::cout << "NO" << std::endl;
        }
    }
    return 0;
}
```
