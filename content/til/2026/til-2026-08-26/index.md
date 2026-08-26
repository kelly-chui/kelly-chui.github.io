---
title: "TIL. Aug 26, 2026"
date: 2026-08-26T23:26:19+09:00

categories:
  - TIL
series:
tags:
features:
  - katex

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 2904. Shortest and Lexicographically Smallest Beautiful String]({{< relref "ps/2026/ps-leetcode-2904-shortest-and-lexicographically-smallest-beautiful-string" >}})
- Stack Day
  - Today 화면과 습관 추가·완료 기록·취소 상호작용 연결
  - 미래 날짜는 조회하되, 완료 기록과 취소는 막도록 날짜 규칙 분리
  - 앱의 첫 화면을 위한 탭 구조 추가

### Stack Day

Today 화면을 만들면서 미래 날짜의 `Habit`도 조회 대상이 됐다. 그런데 `HabitEntry`를 만들 때 완료 기록 가능 여부까지 검증하고 있어서, 미래 날짜를 열기만 해도 `futureDate` 오류가 발생했다. 막아야 했던 것은 미래의 `HabitEntry` 조회가 아니라, 미래 날짜에 Completion을 기록하거나 취소하는 작업이었다.

그래서 `HabitEntry`는 특정 날짜의 추적 상태만 계산하고, Completion을 기록하거나 취소할 수 있는 날짜인지는 `Habit`이 검증하도록 책임을 분리했다. 미래 날짜는 `.future` 상태로 표시하고, 실제 변경 요청만 막으니 조회 가능한가와 기록 가능한가를 같은 규칙으로 처리하지 않게 됐다.

### 투 포인터

투 포인터는 특별한 내용은 아니지만, 인사이트가 하나 있었다. 릿코드 2904 문제에서 투 포인터를 사용해서 당연히 $O(n)$라고 생각했는데, 이 문제에서는 포인터를 한칸 이동할 때마다 검증을 위해서 스트링을 만들어야 하므로 $O(n^2)$가 된다.

알고리즘에서 $O(n)$ 이렇다 해도 생각보다 숨어져 있는 복잡도가 있다는 것을 느꼈다...

## 다음에 할 것

- Stack Day 문서 정리 (정책, AGENTS...등)
