---
title: "StackDay. 비즈니스 규칙과 Entity Identity 분리하기"
date: 2026-08-16T15:23:36+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - iOS
  - Swift
  - Domain Modeling
  - Repository

draft: false
original: ""
---

현재 StackDay MVP에서는 하나의 `Habit`에 대해 하루 한 번만 `Completion`을 기록할 수 있다. 

그래서 처음에는 `(habitID, completedOn)` 조합을 Completion의 identity처럼 사용해도 될 것 같았고, 실제로 그런 코드도 있었다. 

하지만 `Completion` 삭제를 구현하면서 이 둘을 분리해야 한다는 점을 알게 되었다.

```swift
struct Completion: Equatable, Identifiable {
    let id: UUID
    let habitID: UUID
    let completedOn: Date
    let recordedAt: Date
}
```

## 같은 날의 기록을 찾는 조건

같은 `Habit`의 같은 날 `Completion`을 찾는 데에는 `habitID`와 `completedOn`이 필요하다. 현재 정책에서는 이 조건으로 중복 기록도 막을 수 있다.

하지만 이것은 현재 정책에서 필요한 조회 조건이다. 이후 시간 단위로 습관을 기록하거나, 하루에 여러 번 수행하는 `Habit`이 생기면 같은 조합으로 여러 `Completion`이 존재할 수 있다.

현재의 비즈니스 규칙을 엔티티의 identity로 고정하면 모델을 확장할 때 삭제 방식까지 바꿔야 한다.

처음 Repository의 삭제 메서드는 날짜 조건을 그대로 받았다.

```swift
func delete(
    habitID: Habit.ID,
    completedOn date: Date
) async throws
```

## 삭제는 Completion.ID로 한다

Completion을 먼저 조회한 뒤 `Completion.ID`로 삭제하도록 바꿨다. `Completion.ID`는 기록 자체를 식별하고, `(Habit.ID, completedOn)`은 특정 날짜의 기록을 찾기 위한 조건으로 남긴다.

```swift
protocol CompletionRepository {
    func fetch(
        habitID: Habit.ID,
        completedOn date: Date
    ) async throws -> Completion?
    func delete(id: Completion.ID) async throws
}
```

이렇게 하면 기록 취소 유즈케이스는 날짜 조건으로 대상을 찾고, 실제 삭제는 찾은 엔티티의 id로 수행해서 조회 조건과 id가 각각 무엇을 설명하는지 분명해진다.

```swift
guard let completion = try await completionRepository.fetch(
    habitID: habitID,
    completedOn: completedOn
) else {
    throw CancelCompletionError.notCompleted
}

try await completionRepository.delete(id: completion.id)
```

## 없는 기록을 취소하면 성공일까

완료 기록이 없을 때 취소를 성공으로 처리하는 방법도 있다. 하지만 StackDay의 취소는 이미 기록된 완료를 되돌리는 작업이다.

되돌릴 대상이 없다면 사용자가 요청한 작업이 실제로 처리되지 않은 것이므로, 현재는 `notCompleted` 오류를 반환하기로 했다.

```swift
guard let completion = try await completionRepository.fetch(
    habitID: habitID,
    completedOn: completedOn
) else {
    throw CancelCompletionError.notCompleted
}
```

즉, 반복 호출을 허용하는 것보다 `CancelCompletionUseCase`가 의미하는 작업의 성공과 실패를 구분하는 쪽을 택했다.

정상적인 화면 흐름이라면 완료 기록이 없는 항목에 취소 동작이 노출될 이유도 없다. 이런 요청이 들어왔다는 것 자체가 화면의 상태와 실제 저장된 상태가 일치하지 않는다는 뜻이다!

## 정리

`(Habit.ID, completedOn)`은 현재 정책에서 `Completion`을 찾기 위한 조건이고, `Completion.ID`는 `Completion` 자체를 식별하는 값이다.

둘의 역할이 다르므로 Repository에서도 조회는 날짜 조건으로, 삭제는 `Completion.ID`로 처리하도록 나눴다.

없는 기록의 취소도 성공으로 넘기지 않는다. 취소할 `Completion`이 없다면 정상적인 화면 흐름과 저장된 상태가 일치하지 않는 경우이므로 `notCompleted` 오류로 처리한다.
