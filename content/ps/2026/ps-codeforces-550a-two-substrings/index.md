---
title: "Codeforces 550A. Two Substrings"
date: 2026-08-14T12:17:14+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - String
  - Implementation
features:

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/550/A>

## 풀이

스트링 `s`가 주어지고, 이 `s` 안에서 서브스트링 `"AB"`와 `"BA"`가 겹쳐지지 않은 상태로 존재하면 `"YES"` 아니라면 `"NO"` 출력하면 된다.

문제에서 주어진 예시인 `"ABA"` 같은 경우는 `"NO"`가 된다. `"AB"`와 `"BA"`가 서로 따로 존재하지 않기 때문이다. 하지만 `"ABCABA"` 같은 경우에는 `"AB"`와 `"BA"`가 `"BA"`는 겹쳐져 있지만 이미 앞에서 `"AB"`가 존재하기 때문에, `"YES"`가 된다.

이런 예외들을 알아내면, 문제를 푸는 방식은 단순하다. `"AB"`를 찾은 후, 그 이후(`"B"` 이후)에 있는 인덱스부터 `"BA"`를 찾고, 만약 존재한다면 `"YES"`, 존재하지 않는다면 다시 `"BA"`를 먼저 찾은 후, `"A"`의 인덱스 이후에 있는 인덱스부터 `"AB"`를 찾으면 된다. 둘 다 불가능하다면 `"NO"`가 된다.

## 코드

```cpp
#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    auto ab = s.find("AB");
    if (ab != std::string::npos) {
        auto ba = s.find("BA", ab + 2);
        if (ba != std::string::npos) {
            std::cout << "YES" << std::endl;
            return 0;
        }
    }
    auto ba = s.find("BA");
    if (ba != std::string::npos) {
        auto ab = s.find("AB", ba + 2);
        if (ab != std::string::npos) {
            std::cout << "YES" << std::endl;
            return 0;
        }
    }
    std::cout << "NO" << std::endl;
    return 0;
}
```
