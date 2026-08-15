---
title: "Codeforces 276C. Little Girl and Maximum Sum"
date: 2026-08-15T12:48:53+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - Greedy
  - Sorting
  - Prefix Sum
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/276/C>

## 풀이

크기 `n`인 수열 `a`와 쿼리 `q`개가 주어진다. 각 쿼리는 인덱스 $[l, r]$ 범위를 지정하며, 해당 범위의 원소 합을 구한다. 수열 `a`를 적절히 재배열하여 모든 쿼리의 합의 총합을 최대화 한 수를 출력하면 된다.

쿼리가 여러번 나오고 어떤 원소들은 쿼리 안에 중복되어서 포함되어 있을 수 있다. 쿼리의 범위 안에 가장 많이 포함된 원소의 순서대로, 높은 값을 배치하는 정렬 문제로 환원된다.

어떤 원소 $a_i$가 쿼리 내부에 포함되어 있는지를 일반적으로 판단하게 되면 $O(q \times n)$이 되는데, `q`, `n`의 범위가 $1 \leq q 2 \times 10^5$ 이므로, 시간 안에 문제를 해결하기 어려워진다.

따라서 Prefix Sum을 이용한 테크닉인 Difference Array를 이용해서 판단해야 한다. 쿼리의 시작 원소에 `+ 1`, 끝 원소(포함되지 않은)에 `- 1`을 하고, 이의 Prefix Sum을 구하면 특정 원소 $a_i$가 몇번 쿼리에 포함되어 있는지를 알 수 있게 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n, q;
    std::cin >> n >> q;
    std::vector<int> a(n);
    long long answer = 0;
    for (int& ai : a) {
        std::cin >> ai;
    }
    std::vector<int> diff(n + 1, 0);
    while(q--) {
        int l, r;
        std::cin >> l >> r;
        diff[l - 1]++;
        diff[r]--;
    }
    for (int idx = 1; idx < n; idx++) {
        diff[idx] += diff[idx - 1];
    }
    sort(diff.begin(), diff.end(), std::greater<int>());
    sort(a.begin(), a.end(), std::greater<int>());
    for (int idx = 0; idx < n; idx++) {
        answer += ((long long)diff[idx] * (long long)a[idx]);
    }
    std::cout << answer << std::endl;
    return 0;
}
```
