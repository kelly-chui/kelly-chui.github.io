---
title: "Leetcode 3658. GCD of Odd and Even Sums"
date: 2026-07-15T10:32:37+09:00

categories:
  - Online Judge
series:
  - LeetCode
tags:
  - C++
  - GCD

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/gcd-of-odd-and-even-sums>

## 풀이

인티저 `n`이 하나 주어지고 작은 짝수 `n`개, 가장 홀수 `n`개를 각각 모두 더한 합 간의 GCD를 구하는 문제이다.

문제에서 요구하는 내용이 너무 간단해서, `gcd()`를 쓰지 않고, 유클리드 호제법을 직접 작성해서 GCD를 구했다.

## 코드

```c++
class Solution {
public:
    int gcdOfOddEvenSums(int n) {
        int sumOdd = 0;
        int sumEven = 0;
        for (int num = 1; num <= n * 2; num++) {
            if (num % 2 == 0) sumEven += num;
            else if (num % 2 != 0) sumOdd += num;
        }
        while(sumEven) {
            sumOdd %= sumEven;
            swap(sumOdd, sumEven);
        }
        return sumOdd;
    }
};
```
