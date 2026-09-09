---
title: "Codeforces 1915E. Romantic Glasses"
date: 2026-09-09T21:31:09+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Prefix Technique
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/1915/E>

## 풀이

수열 `a`가 주어질 때, 홀수 인덱스 원소의 합과 짝수 인덱스 원소의 합이 같은 연속 부분 수열이 있으면 `"YES"`, 없으면 `"NO"`를 출력하면 된다.

짝수 인덱스의 원소는 더하고 홀수 인덱스의 원소는 빼는 누적합을 만든다. 홀수 인덱스 원소 합과 짝수 인덱스 원소 합이 같으려면 차가 0이 되어야 한다.

그런데 시작 인덱스가 0이 아니므로, '같은 누적 합이 등장하는가'를 찾아야 한다. 그래서 누적합을 계속 map에 저장하면서, 만약 이전에 존재하는 누적합이 존재한다면, 그 부분 수열에서는 짝수 인덱스 원소 합과 홀수 인덱스 원소 합이 같다고 볼 수 있다.

각 원소를 한 번씩만 확인하므로 시간 복잡도는 $O(n)$이... 아니라 $(n \log n)$이다. map을 썼으니까...

## 코드

```cpp
#include <iostream>
#include <vector>
#include <map>

int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> a(n);
        for (int i = 0; i < n; i++) std::cin >> a[i];
        std::map<long long, int> prefixIndex;
        prefixIndex[0] = -1;
        long long prefix = 0;
        bool found = false;
        for (int idx = 0; idx < n; idx++) {
            prefix += idx % 2 == 0 ? a[idx] : -a[idx];
            if (prefixIndex.count(prefix)) {
                int start = prefixIndex[prefix] + 1;
                int end = idx;
                if (end - start + 1 >= 2) {
                    found = true;
                    break;
                }
            } else {
                prefixIndex[prefix] = idx;
            }
        }
        std::cout << (found ? "YES" : "NO") << "\n";
    }
    return 0;
}
```
