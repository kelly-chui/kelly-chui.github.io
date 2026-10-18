---
title: "Codeforces 478B. Random Teams"
date: 2026-08-19T20:48:30+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
  - Greedy
features:
  - katex
  - jsxgraph

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/478/B>

## 풀이

사람의 수 `n`과 팀의 수 `m`이 주어진다. 같은 팀이 된 사람들은 모두 친구가 되었다고 할 때, 만들 수 있는 친구의 쌍의 최대값과 최소값을 출력하면 된다.

한 팀에 사람이 `k`명 있다면, 그 팀에서 만들어지는 친구 쌍의 수는 다음과 같다.

$$
\binom{k}{2} = \frac{k(k - 1)}{2}
$$

따라서 팀별 인원 수에 대해 이 값을 모두 더한 결과의 최솟값과 최댓값을 구하면 된다. 친구 쌍의 수를 최소로 만들려면 사람을 팀에 최대한 고르게 나누면 된다.

팀 하나의 인원 수를 `k`라고 하면 친구 쌍의 수는 `k`에 대한 이차함수로 볼 수 있다.

$$
g(k) = \binom{k}{2} = \frac{k(k-1)}{2}
$$

`k`가 커질수록 새로 추가되는 사람은 기존 팀의 모든 사람과 친구가 되므로, 친구 쌍의 증가 폭도 점점 커진다.

{{< jsxgraph
  id="random-teams-pairs"
  functions="x * (x - 1) / 2"
  boundingbox="-1,50,11,-5"
  label="팀 인원 수에 따른 친구 쌍의 수"
>}}

문제를 풀면서 직관 덕분에 금새 풀 수 있었는데, 합이 정해져 있을 때 수를 고르게 나눌수록 좋은 결과를 얻는 [Programmers. 최고의 집합]({{< relref "ps/2025/ps-programmers-best-set" >}})와 거의 비슷한 직관 이었다.

팀 크기가 두 명 이상 차이 난다면, 큰 팀에서 한 명을 작은 팀으로 옮겼을 때 전체 친구 쌍의 수가 줄어든다. 따라서 최솟값일 때 각 팀의 인원 수 차이는 최대 1이다.

```text
q = n / m
r = n % m
```

`r`개의 팀에는 `q + 1`명, 나머지 `m - r`개의 팀에는 `q`명이 들어간다. 따라서 최소 친구 쌍의 수는 다음과 같다.

$$
(m - r) \times \binom{q}{2} + r \times \binom{q + 1}{2}
$$

친구 쌍의 수를 최대로 만들려면 가능한 한 많은 사람을 한 팀에 몰아넣으면 된다.

단, 팀이 `m`개여야 하므로 나머지 `m - 1`개 팀에는 한 명씩만 넣어야 한다. 그러면 한 팀의 인원 수는 `n - m + 1`명이 되고, 혼자 있는 팀에서는 친구 쌍이 만들어지지 않는다.

따라서 최대 친구 쌍의 수는 다음과 같다.

$$
\binom{n - m + 1}{2}
$$

## 코드

```cpp
#include <iostream>
using int64 = long long;

int main() {
    int64 n, m;
    std::cin >> n >> m;
    int64 perGroup = n / m;
    int64 remainder = n % m;
    int64 minK = ((perGroup * (perGroup - 1) / 2) * (m - remainder)) 
            + (((perGroup + 1) * perGroup / 2) * remainder);
    int64 maxK = (n - m + 1) * (n - m) / 2;
    std::cout << minK << " " << maxK << std::endl;
    return 0;
}
```
