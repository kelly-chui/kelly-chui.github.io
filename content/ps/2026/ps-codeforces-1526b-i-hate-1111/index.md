---
title: "Codeforces 1526B. I Hate 1111"
date: 2026-08-31T11:07:58+09:00

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

<https://codeforces.com/problemset/problem/1526/B>

## 풀이

`11`, `111`, `1111`, `11111`... 로만 이루어진 수를 더해서 `x`를 만들 수 있으면 `"YES"`를 출력한다.

길이가 4 이상인 수들도 `11`과 `111`의 합으로 표현할 수 있다. `1`이 짝수 개 있는 수는 `11`의 배수이고, `1`이 홀수 개이면서 3개 이상 있는 수는 `111`을 뺀 나머지가 `11`의 배수이기 때문이다. 따라서 `11`과 `111`만 사용해 `x`를 만들 수 있는지를 확인하면 충분하다.

`111`을 `b`번 사용한다고 하면 나머지는 `11`이어야 하므로 다음 조건을 만족해야 한다.

$$
x - 111b \geq 0, \qquad (x - 111b) \bmod 11 = 0
$$

여기서 `111`을 11번 사용하는 것은 `11`을 111번 사용하는 것으로 바꿀 수 있다.

$$
11 \times 111 = 111 \times 11
$$

따라서 `111`의 사용 횟수는 0부터 10까지만 확인하면 된다. 코드에서는 각 횟수 `b`에 대해 `x - 111b`가 11의 배수인지 검사하고, 조건을 만족하는 경우가 하나라도 있으면 `"YES"`를 출력한다.

## 코드

```cpp
#include <iostream>

int main() {
    int t;
    std::cin >> t;
    while (t--) {
        int x; bool possible = false;
        std::cin >> x;
        for (int b = 0; b < 11 && x - b * 111 >= 0; b++) {
            if ((x - b * 111) % 11 == 0) { possible = true; break; }
        }
        std::cout << (possible ? "YES" : "NO") << std::endl;
    }
}
```
