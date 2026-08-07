---
title: "Codeforces 459B. Pashmak and Flowers"
date: 2026-08-07T20:55:17+09:00

categories:
  - Problem Solving
series:
tags:
  - Math
algorithmTags:
  - Math
features:
  - katex

draft: true
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/459/B>

## 풀이

`n`의 원소가 있는 수열 `b`가 주어진다. `b`의 원소 두 개를 짝지었을 때, 두 원소의 차이가 가장 클때의 그 차이와, 그 경우의 원소짝의 개수 출력하면 된다.

경우의 수를 구하기 위해 '가장 큰 값'을 가진 원소의 개수와 '가장 작은 값'을 가진 원소의 개수를 구해야 한다. 가장 큰 값을 가진 원소의 개수를 $maxCount$, 가장 작은 값을 가진 원소의 개수를 $minCount$ 라고 했을 때, 경우의 수는 $maxCount \times minCount$로 어렵지 않게 구할 수 있다.

다만, 예외 케이스가 하나 있는데 $minValue = maxValue$인 경우이다. 이 경우 수열 `b`의 모든 원소의 값이 같아야 한다. 따라서 최댓값을 가진 원소와 최솟값을 가진 원소를 서로 다른 집합처럼 곱해서 셀 수 없고, `n`개의 원소 중 서로 다른 두 원소를 고르는 경우의 수를 구해야 한다.

따라서 `n`개 중에서 2개를 고르는 경우의 수. 즉 조합이 된다.

$$
\text{pairCount} =
\begin{cases}
\binom{n}{2}, & \text{if } \max = \min,\\
\text{maxCount}\times\text{minCount}, & \text{otherwise.}
\end{cases}
$$

정렬을 사용해도 최댓값과 최솟값을 구할 수 있지만 $O(n \log n)$의 시간이 필요하다. 반면 최댓값과 최솟값, 각각의 개수를 직접 구하면 전체 시간 복잡도는 $O(n)$이다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
 
int main() {
    int n;
    std::cin >> n;
    std::vector<int> b(n);
    for (int &bi : b) {
        std::cin >> bi;
    }
    int maxBeauty = *std::max_element(b.begin(), b.end());
    int minBeauty = *std::min_element(b.begin(), b.end());
    int maxCount = std::count(b.begin(), b.end(), maxBeauty);
    int minCount = std::count(b.begin(), b.end(), minBeauty);
    long long pairCount = maxBeauty == minBeauty ? (long long)n * (long long)(n - 1) / 2 : (long long)maxCount * (long long)minCount;
    std::cout << maxBeauty - minBeauty << " " << pairCount << std::endl;
    return 0;
}
```
