---
title: "Codeforces 1372B. Omkar and Last Class of Math"
date: 2026-08-24T11:35:40+09:00

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

<https://codeforces.com/problemset/problem/1372/B>

## 풀이

정수 $n$이 주어지고, $a + b = n$을 만족하는 정수 쌍 $(a, b)$ 중에서 LCM이 최소인 쌍을 출력하면 된다.

합이 고정되었다는 점에서 [최고의 집합]({{< relref "ps/2025/ps-programmers-best-set" >}})과 느낌이 비슷할 수 있는데, 이 문제는 곱의 최소를 구해야 하므로 산술 기하 평균을 못 쓴다.

다만, 두 수의 합이 고정되어 있으므로, 두 수의 최대공약수 $g$를 먼저 꺼내서 생각해보자.

그러면 $a = gp$, $b = gq$로 나타낼 수 있고, 다음 관계가 성립한다.

$$
\begin{aligned}
a + b &= n \\\\
a &= gp && \left(g = \gcd(a, b)\right) \\\\
b &= gq \\\\
\operatorname{lcm}(a, b) &= gpq \\\\
\frac{\operatorname{lcm}(a, b)}{g} &= pq \\\\
n &= g(p + q) \\\\
\frac{n}{g} &= p + q
\end{aligned}
$$

$g$가 정해지면 $p + q$도 정해진다. 이때 합이 같은 두 양의 정수의 곱 $pq$는 한쪽이 1일 때 가장 작다. 예를 들어 $p + q = 10$이면 $1 \times 9$가 $2 \times 8$보다 작다.

편의상 $m = p + q$라고 두면 다음과 같이 쓸 수 있다.

$$pq = p(m - p), \qquad 1 \leq p \leq m - 1$$

예를 들어 $m = 10$으로 고정하면 $pq = p(10-p)$가 된다. 정의역이 $1 \leq p \leq 9$로 제한되어 있으므로, 최솟값은 양 끝점인 $p = 1$ 또는 $p = 9$에서 나온다.

{{< jsxgraph
  id="omkar-last-class-product"
  function="x * (10 - x)"
  boundingbox="-1,26,11,-2"
  label="m = 10일 때 p(10-p)의 그래프"
>}}

따라서 $p = 1$, $q = m - 1$일 때 곱이 최소이고, 이때의 LCM은 다음과 같다.

$$
\operatorname{lcm}(a, b) = g(m - 1) = n - g
$$

결국 LCM을 최소화하려면 $g$를 최대화해야 한다. $p + q \geq 2$이므로 $g$는 $n$보다 작은 약수여야 한다. $n$의 가장 작은 약수를 $d > 1$이라고 하면 가장 큰 진약수는 $g = \frac{n}{d}$이고, 답은 다음과 같이 만들 수 있다.

$$
a = \frac{n}{d}, \qquad b = n - \frac{n}{d}
$$

따라서 $d$를 $2$부터 확인하면서 처음으로 $n$을 나누는 약수를 찾으면 된다. 그런 약수가 $\sqrt{n}$ 이하에 없다면 $n$은 소수이므로 $(1, n - 1)$을 출력한다.

## 코드

```cpp
#include <iostream>

int main() {
    int t;
    std::cin >> t;
    while(t--) {
        int n;
        std::cin >> n;
        bool found = false;
        for (int divisor = 2; divisor * divisor <= n; divisor++) {
            if (n % divisor == 0) {
                std::cout << n / divisor 
                          << " " 
                          << n - n / divisor 
                          << "\n";
                found = true;
                break;
            }
        }
        if (!found) {
            std::cout << 1 << " " << n - 1 << "\n";
        }
    }
    return 0;
}
```
