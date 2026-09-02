---
title: "Codeforces 2254E. Chronostasis"
date: 2026-09-02T15:23:01+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Greedy
  - Binary Search
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/2254/E>

## 풀이

입력으로 수열 `b`가 들어온다. `b`는 $b_1 = a_1, \\: b_i = a_i - a_{i-1}$의 방식으로 구성되는데, 막 섞여버린 상태로 들어온다. 이때, 가능한 수열 `a` 중 사전순으로 가장 작은 것을 출력하면 된다. (`a`의 모든 원소는 자연수)

`b`의 순서를 정하면, `a`를 누적합으로 쉽게 구할 수 있다:

$$
\begin{aligned}
a_1 &= b_1 \\\\
a_2 &= a_1 + b_2 = b_1 + b_2 \\\\
a_3 &= a_2 + b_3 = b_1 + b_2 + b_3 \\\\
a_4 &= a_3 + b_4 = b_1 + b_2 + b_3 + b_4 \\\\
\end{aligned}
$$

즉, $a_i = \sum_{j=1}^{i} b_j$가 된다. 이제 문제가 `b`의 순서를 찾는 문제로 변했다. 

수열 `a`의 모든 원소가 자연수이므로, 현재까지의 누적합을 `currentSum`이라고 하면, 다음 `b`를 선택한 뒤에도 자연수를 유지해야 한다.

즉, 사용할 수 있는 값은 $b \ge 1-currentSum$을 만족하는 값이다. 여기에 더해 사전순으로 가장 작은 `a`를 만들려면 이 조건을 만족하는 `b` 중 가장 작은 값을 골라야 한다.

첫 번째 값은 곧 `a_1`이므로 양수인 `b` 중 가장 작은 값을 선택한다. 이후에는 남은 `b`를 셋에 넣고 `lower_bound(1-currentSum)`으로 조건을 처음 만족하는 값을 찾으면 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <set>

int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> b(n);
        for (int& bi : b) std::cin >> bi;

        std::vector<long long> a(n);
        int currentIdx = 0;
        long long currentSum = 0;
        int start = INT_MAX;
        for (int bi : b) {
            if (bi >= 1 && bi < start) start = bi;
        }
        if (start == INT_MAX) {
            std::cout << -1 << '\n';
            continue;
        }

        a[currentIdx++] = start;
        currentSum += start;
        std::multiset<long long> setB(b.begin(), b.end());
        setB.erase(setB.find(start));
        bool isPossible = true;

        while (!setB.empty()) {
            auto it = setB.lower_bound(1 - currentSum);
            if (it == setB.end()) {
                isPossible = false;
                break;
            }
            currentSum += *it;
            a[currentIdx++] = currentSum;
            setB.erase(it);
        }

        if (!isPossible) {
            std::cout << -1 << '\n';
            continue;
        }
        for (int i = 0; i < n; i++) {
            std::cout << a[i] << (i == n - 1 ? "\n" : " ");
        }
    }
    return 0;
}
```
