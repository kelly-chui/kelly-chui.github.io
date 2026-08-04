---
title: "Codeforces 4C. Registration System"
date: 2026-07-27T11:07:19+09:00

categories:
  - Problem Solving
series:
tags:
  - Hash Table

algorithmTags:
  - Hash Table

draft: false
original: ""
aliases:
  - /posts/ps-codeforces-4c-registration-system/
---

## 문제

<https://codeforces.com/problemset/problem/4/C>

## 풀이

데이터베이스를 흉내내는 문제이다. `n` 개의 스트링이 입력으로 주어지고(각각의 스트링을 `name` 이라고 한다), 그 스트링이 만약 등록된 이름이면 이름 + 번호를 붙여서 출력하고 등록되지 않은 이름이면 `'OK'`를 출력하면 된다.

딕셔너리를 쓰면 가장 쉽게 해결 가능하다. 딕셔너리에 `name`을 키로, 그리고 등장한 횟수를 값으로 저장하면 쉽게 존재 판별과 번호 붙이기 둘 다 가능하다.

## 코드

```c++
#include <iostream>
#include <map>

int main() {
    int n;
    std::cin >> n;
    std::map<std::string, int> db;
    while (n--) {
        std::string name;
        std::cin >> name;
        if (db.find(name) != db.end()) {
            db[name]++;
            std::cout << name << db[name] << std::endl;
        } else {
            db[name] = 0;
            std::cout << "OK" << std::endl;
        }
    }
    return 0;
}
```
