---
title: "Codeforces 189A. Cut Ribbon"
date: 2026-07-29T10:55:29+09:00

categories:
  - Problem Solving
series:
tags:
  - DP

algorithmTags:
  - DP
features:
  - katex

draft: false
original: ""
aliases:
  - /posts/ps-codeforces-189a-cut-ribbon/
---

## 문제

<https://codeforces.com/problemset/problem/189/A>

## 풀이

길이가 `n`인 리본이 하나 주어지고, 이를 `a`, `b`, `c` 의 크기로만 조각낼 수 있을 때, 최대로 만들 수 있는 조각의 개수를 출력하는 문제이다.

잘린 리본 조각의 크기가 정해져 있으므로, 그리디가 아니라 DP로 접근해야 한다. 그리디로 접근하면 마지막에 남은 리본 조각의 크기를 확정할 수 없기 때문이다. `dp[i]`를 길이 `i`인 리본을 조각냈을 때의 최대 조각 수로 정의하면, 점화식은 다음과 같다.

$$dp[i] = \max_{x \in \{a, b, c\}}(dp[i - x] + 1) \quad \text{if } i \geq x \text{ and } dp[i-x] \neq -1$$

단, `dp[0] = 0이고 나머지는 -1(불가능)로 초기화한다. 

`dp[i] = -1`이면 길이 `i`를 정확히 `a`, `b`, `c`로만 나눌 수 없다는 의미이므로, 점화식에서 해당 경우는 제외한다.

## 코드

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    int n, a, b, c;
    std::cin >> n >> a >> b >> c;
    std::vector<int> dp(n + 1, -1);
    dp[0] = 0;
    for (int length = 1; length <= n; length++) {
        for (int cut : {a, b, c}) {
            if (length >= cut && dp[length - cut] != -1) {
                dp[length] = std::max(dp[length], dp[length - cut] + 1);
            }
        }
    }
    std::cout << dp[n] << std::endl;
    return 0;
}
```
