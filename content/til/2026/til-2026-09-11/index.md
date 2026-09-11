---
title: "TIL. Sep 11, 2026"
date: 2026-09-11T21:43:09+09:00
categories:
  - TIL
series:
tags:
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 3483. Unique 3-Digit Even Numbers]({{< relref "/ps/2026/ps-leetcode-3483-unique-3-digit-even-numbers" >}})
  - [프로그래머스. 숫자의 표현]({{< relref "/ps/2026/ps-programmers-expression-of-number" >}})

## PS

### LeetCode 3483

주어진 숫자들을 각각 한 번씩 사용해 만들 수 있는 서로 다른 세 자리 짝수의 개수를 구해야 한다. 세 자리에 들어갈 인덱스를 직접 고르고, 백의 자리는 0이 아니고 일의 자리는 짝수인 경우만 선택했다.

같은 숫자가 여러 번 주어질 수 있으므로 만든 수를 집합에 넣어 중복을 제거했다.

### Programmers: 숫자의 표현

연속한 자연수의 합으로 `n`을 표현하는 경우의 수를 구해야 한다. 원소가 모두 양수라 구간을 늘리면 합이 커지고 줄이면 작아지므로 투 포인터를 사용했다.

합과 `n`을 비교해 어느 쪽 포인터를 움직일지 결정할 수 있다.
