---
title: "TIL. Aug 24, 2026"
date: 2026-08-24T23:21:08+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 1872. Stone Game VIII]({{< relref "ps/2026/ps-leetcode-1872-stone-game-viii" >}})
  - [Codeforces 1372B. Omkar and Last Class of Math]({{< relref "ps/2026/ps-codeforces-1372b-omkar-and-last-class-of-math" >}})
- Stack Day
  - 월간 기록을 조회하는 유스케이스 추가
  - 습관 통계 조회 유스케이스 추가

### Stack Day

월간 화면에서 특정 달의 습관 기록을 조회할 수 있도록 월간 기록 조회 유스케이스를 추가했다. 한 달 전체를 그대로 보여주는 것이 아니라, 습관의 시작일 전·보관일 후·기준 날짜 이후의 날짜는 제외해야 한다.

그래서 해당 월의 첫날부터 `LocalDay`로 하루씩 순회하면서 추적 가능한 날짜만 골랐다. 각 날짜의 상태를 유즈케이스에서 다시 계산하지 않고, 완료 기록을 연결한 뒤 `HabitEntry`가 `Pending`, `Missed`, `Completed` 상태를 만들도록 했다. 

월 경계와 윤년의 2월 29일도 `LocalDay`의 날짜 연산으로 처리했다.

습관별 통계를 계산하는 유스케이스도 추가했다. `Habit`과 완료 기록을 조회하고, 주입받은 `Clock`과 `TimeZone`으로 기준 날짜를 만든 뒤 기존 `HabitStatisticsCalculator`에 계산을 맡겼다.
