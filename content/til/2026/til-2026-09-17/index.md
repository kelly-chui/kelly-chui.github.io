---
title: "TIL. Sep 17, 2026"
date: 2026-09-17T23:31:55+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - Data Persistence
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. Habit과 Completion 관계에서 원자성 확보하기]({{< relref "posts/stackday-dev-log-atomic-habit-store" >}})
- PS
  - [LeetCode 1477. Find Two Non-overlapping Sub-arrays Each With Target Sum]({{< relref "ps/2026/ps-leetcode-1477-find-two-non-overlapping-sub-arrays-each-with-target-sum" >}})

## Stack Day

### Day 관련 네이밍 통일

선택한 날짜의 기록을 다루는 화면인데도 `Today`, `Day`처럼 이름이 섞여 있어서, 화면과 뷰 모델 이름을 `DailyEntries` 기준으로 통일했다. 

예를 들어 `DayView`와 `DayViewModel`을 각각 `DailyEntriesView`와 `DailyEntriesViewModel`로 바꾸고, 탭 이름도 `today`에서 `dailyEntries`로 변경했다.

유즈케이스도 조회 대상을 이름에서 구분할 수 있도록 `LoadDayEntriesUseCase`는 `LoadEntriesForDayUseCase`로, `LoadMonthlyEntriesUseCase`는 `LoadEntriesForMonthUseCase`로 정리했다.

### Habit 삭제 무결성

`Habit`을 삭제할 때 연결된 `Completion`도 함께 지워야 한다. 두 레포지토리를 순서대로 호출하면 앞선 삭제만 성공하고 다음 작업이 실패하는 순간 데이터가 어긋날 수 있다.

Habit/Completion JSON 레포지토리 구현체를 하나의 구현체로 만들고, 앱 코드에서는 같은 구현체 인스턴스를 `habitRepository`와 `completionRepository`가 보도록 했고, JSON 파일 자체도 하나만 쓰도록 해서, 원자적으로 `Habit`과 `Completion`이 삭제될 수 있게 했다.

### Repository가 실제 DB를 반영할 필요는 없다

실제 DB에 데이터가 어떤 형태로 저장되어 있든, 레포지토리의 경계를 DB 구조가 결정할 필요는 없다고 생각했다. 

레포지토리는 저장소의 물리 구조를 그대로 드러내는 타입이 아니라, 도메인과 유즈케이스가 필요한 조회, 저장 계약이다. 따라서 서로 다른 컬렉션에 저장된다고 반드시 레포지토리를 나눌 필요는 없고, 반대로 하나의 컬렉션을 여러 레포지토리 계약으로 나누는 것도 가능하다.

이전에 Domain Model과 DTO를 분리했던 것처럼, 레포지토리 계약과 DB 구조도 서로 완전히 대응할 필요가 없다.

### 추가 의문: Completion과 Habit 레포지토리가 꼭 분리되어야 할까?

레포지토리가 DB 구조를 반영할 필요가 없다는 점에서 추가된 의문이다. 일단 이 문제는 JSON 레포지토리 구현체의 문제지, 앱 데이터 구조 자체의 문제는 아니다. 

하지만, `Completion`과 `Habit` 레포지토리가 분리되어야 하는가는 다시 한번 생각을 했다.

1. `Completion`이 `Habit`의 생명주기, 의미와 분리되어서 독자적으로 사용되는 경우가 없다.
2. `TrackingPeriod`는 이미 `Habit` 내부에 통합되어서 잘 사용되고 있다.

처음에 분리한 이유는 `Completion`들만 따로 조회하는 경우를 예상했다. 예를 들어서 '9월 17일에 완료한 `Habit`'의 개수만 알려면, `Habit`이 필요하지 않다.

그런데 막상 앱 코드에선 그런 부분이 없고, 필요하지도 않게 느껴진다. 현재 앱 코드에서는 그 날에 해결한 `Habit`을 보여주지, 개수만 따로 보여주지 않는다.

이 부분에 있어선 생각을 좀 더 해봐야겠다...

## PS

### LeetCode 1477

모든 원소가 양수인 배열에서 합이 `target`인 두 부분 배열을 겹치지 않게 골라 길이의 합을 최소화해야 한다. 양수로 이루어진 구간의 합은 포인터 이동에 따라 단조성을 가지므로, 투 포인터를 사용했다.

두 구간이 겹치지 않는 조건은 하나의 경계를 기준으로 왼쪽과 오른쪽에 각각 구간을 두는 방식으로 생각할 수 있다.
