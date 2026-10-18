---
title: "TIL. Aug 27, 2026"
date: 2026-08-27T23:11:54+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [LeetCode 3720. Lexicographically Smallest Permutation Greater Than Target]({{< relref "ps/2026/ps-leetcode-3720-lexicographically-smallest-permutation-greater-than-target" >}})
- Stack Day
  - [StackDay. 보관일과 추적 기간 정책 정리하기]({{< relref "posts/stackday-dev-log-archive-date-tracking-policy" >}})
  - MVP 범위와 Habit 추적 정책 문서 정리
  - 보관일 Completion 유무에 따른 마지막 추적일 규칙 적용
  - Day·월간 조회·통계가 같은 보관일 경계를 사용하도록 수정

### Stack Day

#### 도메인 정책 다듬기

보관한 Habit의 추적 기간을 어디까지로 볼지 먼저 정책 문서에서 정리했다. 

보관일에 `Completion`이 있으면 그날까지 추적하고, 없으면 전날에 추적을 끝내기로 했다. 보관 뒤에도 과거 기록은 추가·취소할 수 있지만, 그 변경이 통계와 조회 결과에 같은 방식으로 반영돼야 한다.

#### 문서 정리하기

MVP 범위도 함께 다듬었다. `Habit` 이름 변경과 `Statistics` 탭의 통계·월간 히트맵은 MVP에 포함하고, 시작일 변경은 제외했다.

이 기준을 바탕으로 `Habit`에 보관일 규칙을 모으고 Day 조회, 월간 조회, 통계 계산이 모두 같은 마지막 추적일을 사용하도록 정리했다.

코드에 적용되었지만, 문서에 작성하지 않은 정책도 다시 다듬어서 문서에 추가했다.
