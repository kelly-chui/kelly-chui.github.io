---
title: "StackDay. 조회할 수 있는 날짜와 기록할 수 있는 날짜는 다르다"
date: 2026-08-26T20:39:24+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - Domain Modeling
  - Software Architecture

draft: false
original: ""
---

Stack Day는 과거의 기록을 수정할 수 있다. 그래서 메인 뷰는 단순히 오늘의 습관만 보여주는 화면이 아니라, 특정 날짜의 `HabitEntry`를 조회하고 완료 기록을 수정할 수 있는 화면으로 바뀌었다.

그러면 과거 시점으로도 가서 과거에 어떤 `Entry`가 생성되었는지 조회할 수 있어야 하고, 미래 시점으로 가서 어떤 `Habit`들이 예약되어 있는지도 확인할 수 있어야 한다.

그런데 `HabitEntry`는 생성될 때 이니셜라이저에서 `Habit.validateDate`를 호출한다. 미래 날짜에 `Completion`을 기록하지 못하게 하려고 만든 검증 로직이었다:

```swift
func validateDate(
    _ targetDay: LocalDay,
    referenceDay: LocalDay
) throws {
    guard targetDay >= startedOn else {
        throw HabitDateError.beforeHabitStart
    }
    guard targetDay <= referenceDay else {
        throw HabitDateError.futureDate
    }
    if let archivedOn, targetDay > archivedOn {
        throw HabitDateError.afterHabitArchived
    }
}
```

문제는 미래 날짜를 조회할 때도 같은 `HabitEntry` 생성 경로를 거친다. 단순히 미래의 `Habit`을 보려고 날짜를 이동했을 뿐인데, `futureDate` 오류가 발생하면서 화면 전체가 실패하게 된다.

{{< image src="image-001-optimized-image.webp" width="360" align="center" >}}

이번에는 `HabitEntry`가 화면에 표시할 상태를 계산하는 책임과, `Habit`이 Completion을 기록할 수 있는 날짜를 검증하는 책임을 분리했다.

## 날짜 검증을 Habit으로 옮겼다

`HabitEntry`는 특정 `Habit`의 특정 일에 대한 추적 상태를 표현한다.

반면 '특정 날짜에 `Completion`을 생성하거나 취소해도 되는가?'는 `Habit`의 시작일과 보관일, 그리고 현재 기준 날짜에 따라 결정된다. 이는 특정 일에 대한 추적이 아니라 `Habit`의 추적 기간 안에서 기록을 변경할 수 있는지에 대한 규칙이다:

| 질문 | 책임 |
| --- | --- |
| 이 날짜의 Habit을 어떤 상태로 보여줄 것인가? | `HabitEntry` |
| 이 날짜에 Completion을 기록하거나 취소할 수 있는가? | `Habit` |

하지만 원래는 `HabitEntry`가 이니셜라이저에서 검증 로직을 통해 두 역할을 모두 가지고 있었다.

```swift
init(
    habit: Habit,
    targetDay: LocalDay,
    completion: Completion?,
    referenceDay: LocalDay
) throws {
    guard targetDay >= habit.startedOn else {
        throw HabitEntryError.beforeHabitStart
    }
    guard targetDay <= referenceDay else {
        throw HabitEntryError.futureDate
    }
    // ...
}
```

하지만 미래 날짜는 에러가 아니라 `.future` 상태로 화면에 표시해야 하는 정상적인 값이다. `HabitEntry`가 `Completion`의 생성하거나 변경할 수 있는지까지 검증하면, 조회 작업과 변경 작업이 하나에 묶이게 된다. (SRP를 위반하고 있는 상태다!)

`Habit`의 시작일과 보관일은 `Habit` 자신의 생명주기 정보이므로, 이러한 검증 로직은 `Habit`으로 옮겼다. `referenceDay`는 현재 시점을 기준으로 판단하기 위해 호출하는 쪽에서 전달한다.

```swift
func validateDate(
    _ targetDay: LocalDay,
    referenceDay: LocalDay
) throws {
    guard targetDay >= startedOn else {
        throw HabitDateError.beforeHabitStart
    }
    guard targetDay <= referenceDay else {
        throw HabitDateError.futureDate
    }
    if let archivedOn, targetDay > archivedOn {
        throw HabitDateError.afterHabitArchived
    }
}
```

이제 `HabitEntry`는 상태를 계산하고, `Habit`은 `Completion` 변경이 허용되는 날짜를 판단한다. 다만 검증을 `Habit`으로 옮긴 뒤에도 `HabitEntry`를 생성할 때 이 메서드를 호출하는 구조는 그대로 남아 있었다.

## 그냥 검증을 미래 날짜일때만 하면 되지않나?

처음에는 미래 날짜일 때만 검증을 호출하지 않는 방법을 생각했다.

```swift
if targetDay <= referenceDay {
    try habit.validateDate(
        targetDay,
        referenceDay: referenceDay
    )
}
```

동작은 잘 하겠지만, 하지만 `HabitEntry` 생성자가 여전히 기록 가능성 검증을 알고있다. 미래 날짜라는 예외만 조건문으로 우회하는 구조다.

`HabitEntry`가 알아야 하는 것은 이 날짜의 화면 상태다. 반대로 이 날짜에 실제 Completion을 생성하거나 삭제할 수 있는지는 Completion을 변경하려는 작업이 확인해야 한다.

## 미래 날짜도 Entry 상태로 표현한다

이제 `HabitEntry`에서는 기록 가능 여부를 검증하지 않고 전달받은 `Habit`, `Completion` 날짜로 상태만 계산한다.

```swift
enum State: Equatable {
    case pending
    case completed
    case missed
    case future
}
```

미래 날짜는 더 이상 `futureDate` 오류가 아니라 `.future`라는 표시 상태가 된다:

```swift
init(
    habit: Habit,
    targetDay: LocalDay,
    completion: Completion?,
    referenceDay: LocalDay
) throws {
    habitID = habit.id
    habitName = habit.name
    self.targetDay = targetDay

    if completion != nil {
        state = .completed
    } else if targetDay > referenceDay {
        state = .future
    } else if targetDay == referenceDay {
        state = .pending
    } else {
        state = .missed
    }
}
```

뷰가 `.future` 상태의 Entry를 Upcoming 섹션으로 보여주고, 완료 버튼은 비활성화 하도록 작성했다.

{{< image src="image-002-optimized-image.webp" width="360" align="center" >}}

뷰 모델에서도 Upcoming 섹션에 있는 엔트리를 탭해도 아무 작업도 수행하지 않는다.

```text
Habit + targetDay + Completion + refer
enceDay
                    ↓
               HabitEntry.future
                    ↓
          Upcoming으로 표시, 탭 비활성화
```

## 기록 가능한 날짜는 기록할 때 검증한다

기존 `validateDate`는 이름만으로 무엇을 검증하는지 조금 모호했다. 이 메서드는 모든 날짜의 유효성을 확인하는 것이 아니라, Completion을 기록하거나 취소할 수 있는 날짜인지 판단한다.

그래서 `validateRecordableDate`로 이름을 바꿨다.

```swift
func validateRecordableDate(
    _ targetDay: LocalDay,
    referenceDay: LocalDay
) throws {
    guard targetDay >= startedOn else {
        throw HabitDateError.beforeHabitStart
    }
    guard targetDay <= referenceDay else {
        throw HabitDateError.futureDate
    }
    if let archivedOn, targetDay > archivedOn {
        throw HabitDateError.afterHabitArchived
    }
}
```

이 검증은 `RecordCompletionUseCase`와 `CancelCompletionUseCase`에서만 호출한다.

```swift
let referenceDay = try LocalDay(date: now, timeZone: timeZone)

try habit.validateRecordableDate(
    completedOn,
    referenceDay: referenceDay
)
```

조회는 미래 날짜를 상태로 표현하고, 기록과 취소는 미래 날짜를 오류로 처리한다. 같은 날짜를 다루지만 작업의 목적이 다르기 때문에 결과도 달라진다.

## 정리

미래 날짜를 기록할 수 없다는 규칙을 가지고 있다고 해서 미래 날짜를 조회할 수도 없는 것은 아니다.

처음에는 `HabitEntry` 생성 과정에서 `Habit`의 날짜 검증을 호출했다. 그 결과 미래 날짜를 화면에 보여주는 작업도 `futureDate` 오류로 실패했다.

`HabitEntry`는 특정 날짜의 화면 상태를 계산하고, `Habit`은 Completion을 변경할 수 있는 날짜를 판단하도록 책임을 나눴다. 미래의 Habit은 `.future` 상태로 조회할 수 있고, 실제 기록과 취소 요청만 `validateRecordableDate`에서 막는다.

처음에는 괜찮게 설계했다 생각했는데도, 이렇게 설계 변경이 꽤 등장한다. 그래도 지금 발견한게 다행이다. 부스트캠프에서도 완벽한 설계는 거의 불가능하다 했으니까....
