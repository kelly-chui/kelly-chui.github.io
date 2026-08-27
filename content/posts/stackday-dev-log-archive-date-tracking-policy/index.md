---
title: "StackDay. 보관일과 추적 기간 정책 정리하기"
date: 2026-08-27T18:47:31+09:00

categories:
  - Project
series:
  - StackDay
tags:

draft: false
original: ""
---

`Habit`을 보관하면 그 이후에는 `Entry`가 생성되지 않아서 `Completion`을 기록할 수 없다. 그렇다면 보관한 날짜 자체는 추적 기간에 포함해야 할까?

처음에는 보관일을 항상 마지막 추적일로 처리했다. 하지만 보관일에 `Completion` 기록이 없다면, 실제로 그날 습관을 추적했다고 보기에는 애매하다. 반대로 `Completion`이 존재한다면, 그 기록과 통계에서 보관일을 빼면 안 된다.

보관일은 `Completion` 유무에 따라 추적 기간에 포함하기로 했다.

- 보관일에 `Completion`이 있으면 보관일까지 추적한다.
- `Completion`이 없으면 보관 전날에서 추적을 끝낸다.

## 보관일 규칙을 Habit에 모으기

이 규칙을 일간 조회, 월간 조회, 통계 계산이 각각 구현하면 쉽게 달라진다. 그래서 `Habit`이 특정 날짜가 추적 기간 안에 있는지 판단하도록 했다.

```swift
func isTracked(
    on targetDate: LocalDay,
    hasCompletionOnArchiveDay: Bool
) -> Bool {
    guard targetDate >= startedOn else { return false }
    guard let archivedOn else { return true }
    guard targetDate <= archivedOn else { return false }
    return targetDate < archivedOn || hasCompletionOnArchiveDay
}
```

보관되지 않은 `Habit`은 시작일 이후라면 계속 추적한다. 보관된 `Habit`은 보관일 이후를 제외하고, 보관일만 `Completion` 유무에 따라 결정한다.

통계에는 마지막 추적일 자체가 필요하므로 같은 정책을 별도 메서드로 표현했다.

```swift
func finalTrackingDate(
    hasCompletionOnArchiveDate: Bool
) throws -> LocalDay? {
    guard let archivedOn else { return nil }
    return hasCompletionOnArchiveDate
        ? archivedOn
        : try archivedOn.addingDays(-1)
}
```

## 조회 전에 Completion을 먼저 확인하기

방금 결정한 정책에서 추적 종료일을 결정하려면 `Completion`이 있는지 먼저 알아야 한다. 그래서 일간 조회와 월간 조회는 `Habit`이 추적 중인지 확인하기 전에 완료 기록을 조회한다.

```swift
let completion = try await completionRepository.fetch(
    habitID: habit.id,
    completedOn: targetDay
)

guard habit.isTracked(
    on: targetDay,
    hasCompletionOnArchiveDay: completion != nil
) else {
    continue
}
```

이후에만 `HabitEntry`를 만든다. 보관일에 완료하지 않은 Habit은 조회 결과에 나타나지 않고, 완료한 Habit은 `.completed` 상태로 남는다.

## 통계도 같은 마지막 날짜를 사용한다

통계에서 보관일을 다르게 처리하면 완료율과 스트릭이 조회 화면과 어긋난다. `HabitStatisticsCalculator`도 `Completion` 목록에서 보관일의 기록 여부를 확인하고, 같은 마지막 추적일을 계산한다.

```swift
let finalTrackingDate = min(
    referenceDay,
    try habit.finalTrackingDate(
        hasCompletionOnArchiveDate: hasCompletionOnArchiveDay
    ) ?? referenceDay
)
```

이 날짜를 기준으로 추적 가능 일수, 완료 일수, 완료율, 현재·최고 스트릭을 계산한다.

## 정리

원래 정책에서 애매모호했던 추적 종료일 정책을 다시 정리했다. 아키텍처 문제는 아니고, 도메인을 결정하는 문제다.

보관일 규칙은 화면에 보일 항목 하나를 고르는 조건처럼 보이지만, 조회와 통계가 공유해야 하는 도메인 정책이다.

`Habit`에 추적 기간 규칙을 모으고, Day 조회·월간 조회·통계 계산이 모두 그 규칙을 사용하도록 했다. 이제 보관일에 `Completion`을 추가하거나 취소해도, 화면과 통계가 같은 기준으로 함께 바뀐다.
