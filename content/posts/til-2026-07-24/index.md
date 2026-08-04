---
title: "TIL. Jul 24, 2026"
date: 2026-07-24T21:23:17+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 키워드

- XOR 비트연산
- Observation
- 블로그 스크립트 정리, git hook

## 내용

### XOR 연산

LeetCode에 어제에 이어서 XOR 연산 문제가 나왔다. 일반적인 사칙연산과 다른 특징들을 사용해야하는 문제들이었다. 가장 큰 특징은 비트 연산은 비트 수가 고정되어 있어서 연산의 결과가 엄청나게 많은 경우의 수를 만들지 않는다.

예를 들어서, 곱셉의 경우에는 $10^3$ 미만의 두 수를 곱하면 최대 999 * 999 = 약 100만이 되어서 거의 7자리수의 경우의 수가 되는데, 비트연산은 더 이상 자리수의 확장이 일어나지 않는다.

- [LeetCode 3513. Number of Unique XOR Triplets I]({{< relref "posts/ps-leetcode-3513-number-of-unique-xor-triplets-i" >}})
- [LeetCode 3514. Number of Unique XOR Triplets II]({{< relref "posts/ps-leetcode-3514-number-of-unique-xor-triplets-ii" >}})

### Observation

Observation 관련 WWDC 세션을 봤다. 예전부터 Observation이 Combine을 래핑한 것이 아닐까? 라는 생각을 종종 했었는데, WWDC 세션을 다 보고 난뒤 더 찾아보니, 이제는 SwiftUI가 Combine에서 거의 독립한 상태라고 한다.

- [Discover Observation in SwiftUI - WWDC23](https://developer.apple.com/videos/play/wwdc2023/10149/)
- [Observation 정리 노트]({{< relref "posts/wwdc-swiftui-discover-observation-in-swiftui" >}})

### 블로그 스크립트 정리

블로그 git에 hook을 달고, 기존 스크립트를 깃헙 액션과 연동했다.

이미지와 동영상을 원본 그대로 올리는 것은 비효율적이니, Wepb와 mp4로 파일을 변환하고, 다시 올리는 스크립트들은 hook에 연동했고, EOF 확인이나 이미지 정합성 같은 부분은 깃헙 액션에 연동했다.

### 다음에 해야 하는 것

- WWDC SwiftConcurrency 부분을 다시 보고 정리하기
- 블로그 구조 정리하기 (파일 구조가 아닌, 포스트 보여주는 구조)
