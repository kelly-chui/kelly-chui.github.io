---
title: "Codeforces 455A. Boredom"
date: 2026-07-31T20:22:51+09:00

categories:
  - Problem Solving
series:
tags:
  - DP
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/455/A>

## 풀이

풀이

배열`a`에서 얻을 수 있는 최대 점수를 구하는 DP 문제이다. 어떤 값 `x`를 선택하면 `x`만큼의 점수를 얻고, 배열에 있는 x - 1과 x + 1은 모두 제거된다.

여기서 중요한 점은 같은 값을 여러 개 가지고 있다면 하나씩 선택할 이유가 없다는 것이다. `x`를 선택하는 순간 `x - 1`과 `x + 1`은 모두 사용할 수 없으므로, 선택한다면 값이 `x`인 원소는 모두 선택하는 것이 항상 이득이다.

따라서 입력 배열의 순서는 의미가 없어지고, 각 숫자가 몇 번 등장하는지만 알면 된다. 값 `x`가 `frequencies[x]`번 등장한다면, x를 선택했을 때 얻는 점수는 `x * frequencies[x]`이다.

이제 문제는 각 값마다 얻을 수 있는 점수가 주어졌을 때, 서로 인접한 값은 함께 선택할 수 없는 문제로 바뀐다.

`dp[i]`를 0부터 i까지의 값만 고려했을 때 얻을 수 있는 최대 점수라고 정의하자.

값 i를 선택하지 않는다면 `dp[i - 1]`을 그대로 사용할 수 있다. 반대로 i를 선택한다면 i - 1은 선택할 수 없으므로 dp[i - 2]에 `i * frequencies[i]`를 더한 값이 된다.

따라서 점화식은 다음과 같다.

$$
dp[i] = \max(dp[i - 1],\ dp[i - 2] + i \times frequency[i])
$$

입력을 한 번 순회하며 각 값의 등장 횟수를 계산한 뒤, 입력에서 등장한 최댓값까지 DP를 수행하면 답을 구할 수 있다.

입력 원소의 개수를 $N$, 입력값의 최댓값을 $M$이라 하면 시간복잡도는 빈도 계산에 $O(N)$, DP에 $O(M)$으로 전체 $O(N + M)$이다.

## 코드

```cpp
#include <iostream>
#include <vector>
using int64 = long long;

int main() {
    int n;
    std::cin >> n;
    std::vector<int> a(n);
    std::vector<int> frequencies(100'001, 0);
    int maxValue = 0;
    for (int &ak : a) {
        std::cin >> ak;
        maxValue = maxValue > ak ? maxValue : ak;
        frequencies[ak]++;
    }
    std::vector<int64> dp(maxValue + 1);
    dp[0] = 0;
    dp[1] = frequencies[1];
    int64 answer = dp[1];
    for (int value = 2; value < maxValue + 1; value++) {
        int64 minus1 = dp[value - 1];
        int64 minus2 = dp[value - 2] + (int64)frequencies[value] * (int64)value;
        dp[value] = minus1 > minus2 ? minus1 : minus2;
        answer = answer > dp[value] ? answer : dp[value];
    }
    std::cout << answer << std::endl;
    return 0;
}
```
