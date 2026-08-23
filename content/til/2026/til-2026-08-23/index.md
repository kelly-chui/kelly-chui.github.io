---
title: "TIL. Aug 23, 2026"
date: 2026-08-23T23:17:03+09:00

categories:
  - TIL
series:
tags:
  - Bit Masking
  - Bitwise Operation
features:
  - katex
draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 1927. Sum Game]({{< relref "ps/2026/ps-leetcode-1927-sum-game" >}})

### 유클리드 호제법

주말에 문제를 풀면서 외워서 사용하던 것들을 조금 더 이해해보려 했다. GCD를 구할 때 사용하는 유클리드 호제법은 두 수 $a$, $b$의 최대공약수가 $b$와 $a \bmod b$의 최대공약수와 같다는 성질을 이용한다.

$a$를 $b$로 나누었을 때의 나머지를 $r$이라고 하면, $a$와 $b$의 공약수는 $b$와 $r$의 공약수이기도 하다. 따라서 문제를 더 작은 수의 쌍으로 바꿔가며 나머지가 0이 되는 순간의 값이 GCD가 된다.

```swift
func gcd(_ a: Int, _ b: Int) -> Int {
    b == 0 ? a : gcd(b, a % b)
}
```

예를 들어 $\gcd(48, 18)$은 $\gcd(18, 12)$, $\gcd(12, 6)$, $\gcd(6, 0)$으로 바뀌고, 결과는 $6$이다. 매 단계에서 수가 줄어들기 때문에 모든 약수를 확인하는 것보다 효율적이다. LCM을 구할 때도 다음 식으로 GCD를 함께 사용한다.

$$
\operatorname{lcm}(a, b) = \frac{a}{\gcd(a, b)} \times b
$$

### Swift에서 비트마스킹

Swift에서 비트마스킹을 다시 찾아보다가, 여러 플래그를 이름 있는 집합으로 관리하는 `OptionSet`을 알게 됐다. 알고리즘 문제에서 정수 하나로 부분집합이나 상태를 표현하는 비트마스킹과는 쓰임새가 조금 달랐다.

`OptionSet`과 기존에 정리했던 [비트마스킹 글]({{< relref "posts/cs-algorithm-bit-masking" >}})은 각각 별도 글로 정리했다. [Swift에서 OptionSet 사용하기]({{< relref "posts/swift-option-set" >}})

다만 오늘 푼 문제에서는 비트마스킹을 억지로 적용하지 않고, 문제의 구조에 맞춰 단순한 계산과 그리디한 관찰로 해결했다. 알고 있는 기법을 바로 적용하기보다 문제의 구조를 먼저 보는 습관이 필요하다는 생각도 들었다.

## 다음에 할 것

- devbox-light-server 아키텍처 수정하기
