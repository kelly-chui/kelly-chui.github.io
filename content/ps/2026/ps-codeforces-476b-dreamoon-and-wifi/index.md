---
title: "Codeforces 476B. Dreamoon and WiFi"
date: 2026-08-25T11:03:48+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/476/B>

## 풀이

스트링 `s1`, `s2`가 주어진다. `s1`은 실제 명령이고, `s2`는 부정확하게 도착한 명령이다.

명령이 `+`일 때는, 한 칸 전진하고, `-`일 때는 한 칸 후진한다. `?`는 제대로 도착하지 않은 명령이다.

`?` 일 때, 동전을 던져서 전진한지, 후진할지 결정한다고 했을 때, 목표로 한 위치에 도착했을 확률을 구하면 된다.

우선 `s1`이 Source of Truth니까, `s1`의 명령대로 움직여서 목표 위치를 찾아야 한다.

그리고 `s2`도 `?`를 무시하고 움직여서 현재 위치를 결정해야한다. (어짜피 플러스 마이너스는 순서를 바꿔도 상관 없으니까)

그러면 '현재 위치'와 '목표 위치'가 명확하므로, `?`를 어떻게 조합해야 목표 위치에 도달할 수 있는지 알 수 있다.

예를 들어서 `?`가 n개고 그 중에 `k`개가 전진이어야 한다면, 그런 조합이 나올 확률은 다음과 같다.

$$\binom{n}{k} \times \left(\frac{1}{2}\right)^n$$

`?`가 $n$개라면 각 `?`는 `+` 또는 `-`가 될 수 있으므로 전체 경우의 수는 $2^n$이다. 그중 `+`가 정확히 $k$개인 경우의 수는 $n$개 중 $k$개를 고르는 경우의 수인 $\binom{n}{k}$이다. 

따라서 원하는 위치에 도착할 확률은 전체 경우의 수에서 원하는 경우의 수를 나누어 구할 수 있다.

## 코드

```cpp
#include <iostream>
#include <string>
#include <cmath>
#include <iomanip>

int combination(int n, int k) {
    int result = 1;
    for (int i = 0; i < k; i++) result = result * (n - i) / (i + 1);
    return result;
}

int main() {
    std::string s1, s2;
    std::cin >> s1 >> s2;
    int target = 0, current = 0, qMarkCount = 0;
    for (char command : s1) target += command == '+' ? 1 : -1;
    for (char command : s2) {
        if (command == '+') current++;
        else if (command == '-') current--;
        else qMarkCount++;
    }
    int plusRequired = target - current + qMarkCount;
    if (plusRequired < 0 || plusRequired % 2 == 1) std::cout << 0;
    else {
        plusRequired /= 2;
        if (plusRequired > qMarkCount) std::cout << 0;
        else std::cout << std::fixed << std::setprecision(10)
                       << combination(qMarkCount, plusRequired) / pow(2.0, qMarkCount);
    }
}
```
