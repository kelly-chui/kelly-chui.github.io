---
title: "Codeforces 698A. Vacations"
date: 2026-08-21T14:44:15+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/698/A>

## 풀이

각 날에 대해서 콘테스트와 체육관의 일정 `a`가 주어진다. 이틀 연속으로 같은 활동을 하지 않을 떄, 아무 활동도 하지 않는 날의 최소값을 출력하면 된다.

각 날에는 4가지 케이스가 있다 (이건 문제에서 주어져 있다)

- 콘테스트 X, 체육관 X
- 콘테스트 O, 체육관 X
- 콘테스트 X, 체육관 O
- 콘테스트 O, 체육관 O

같은 활동을 이틀 연속으로 하지 않기 때문에, 어제의 활동이 오늘에 다음과 같이 영향을 끼친다.

1. 어제 콘테스트를 갔다면 오늘은 체육관을 가거나 아무 것도 안한다.
2. 어제 체육관을 갔다면 오늘은 콘테스트를 가거나 아무 것도 안한다.
3. 어제 아무 활동도 하지 않았다면 아무 활동도 안하는 것을 포함해서 무엇이든 할 수 있다.

DP 점화식으로 모델링하기 좋은 형태가 되었다. 모델링해보자.

$$
dp[i][activity] = \begin{cases}
\min(dp[i-1][0], dp[i-1][1], dp[i-1][2]) + 1 & activity = 0 \\\\
\min(dp[i-1][0], dp[i-1][2]) & activity = 1 \quad (a[i] \in \{1, 3\}) \\\\
\min(dp[i-1][0], dp[i-1][1]) & activity = 2 \quad (a[i] \in \{2, 3\})
\end{cases}
$$

각 $activity$에 대해서 0은 아무것도 하지 않음, 1은 체육관 2는 콘테스트를 의미한다.

최종적으로 `min(dp[n - 1])`을 출력하면 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

const int INF = 987654321;

int main(void) {
    int n;
    std::cin >> n;
    std::vector<int> a(n);
    for (int& ai : a) {
        std::cin >> ai;
    }
    std::vector<std::vector<int>> dp(n, {INF, INF, INF});
    dp[0][0] = 1;
    switch (a[0]) {
        case 3:
            dp[0][2] = 0;
        case 2:
            dp[0][1] = 0;
            break;
        case 1:
            dp[0][2] = 0;
            break;
    }
    for (int idx = 1; idx < n; idx++) {
        dp[idx][0] = std::min({dp[idx-1][0], dp[idx-1][1], dp[idx-1][2]}) + 1;
        switch (a[idx]) {
            case 3:
                dp[idx][2] = std::min(dp[idx-1][0], dp[idx-1][1]);
            case 2:
                dp[idx][1] = std::min(dp[idx-1][0], dp[idx-1][2]);
                break;
            case 1:
                dp[idx][2] = std::min(dp[idx-1][0], dp[idx-1][1]);
                break;
        }
    }
    std::cout << std::min(dp[n - 1][0], std::min(dp[n - 1][1], dp[n - 1][2])) << std::endl;;
    return 0;
}
```
