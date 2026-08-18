---
title: "TIL. Aug 18, 2026"
date: 2026-08-18T23:30:00+09:00
categories:
  - TIL
tags:
  - Swift
  - Domain Modeling
draft: false
---

## 오늘 한 내용

- Stack Day
  - `LocalDay` 날짜 모델 도입
  - `Clock`과 `FixedClock` 추가
  - 완료 기록·취소·보관·삭제 UseCase를 날짜 모델에 맞게 수정
  - `InMemoryHabitRepository`, `InMemoryCompletionRepository` 구현 및 테스트 추가
  - [StackDay. Date로 하루를 표현하면 생기는 문제]({{< relref "posts/stackday-dev-log-localday-time-boundary" >}})

## 배운 내용

### LocalDay 도입하기

Stack Day에서는 `Date` 하나로 특정 시점과 특정 날짜를 모두 표현하고 있었다. 그래서 달력상의 날짜만 필요한 값을 `LocalDay`로 분리했다.

- `LocalDay`: `startedOn`, `archivedOn`, `completedOn`
- `Date`: `createdAt`, `updatedAt`, `recordedAt`

현재 시각은 `Clock`이 제공하고, 그 시각을 어느 날짜로 해석할지는 TimeZone이 결정하도록 분리했다. 전체 설계와 구현 코드는 [개발일지]({{< relref "posts/stackday-dev-log-localday-time-boundary" >}})에 정리했다.

### 현재 MVP의 일정 정책

`LocalDay`는 날짜 표현을 위한 타입일 뿐이다. 일정 정책이나 count 기반 습관의 진행 상태는 실제 요구사항이 생길 때 별도 모델로 설계하기로 했다.

### 내일 할 것

- Stack Day MVP 완성하기
- 블로그 UI 정리하기
