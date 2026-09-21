---
title: "StackDay. Repository 오류를 UseCase 오류로 변환하기"
date: 2026-09-21T21:23:06+09:00
categories:
  - Project
series:
  - StackDay
tags:
  - Error Handling
  - Data Persistence
draft: false
original: ""
---

[devbox-light-server]({{< relref "posts/devbox-light-server-09-error-boundaries-and-tests" >}})에서 한 것과 같이, 각 계층에 발생하는 에러가 계층을 뚫고 그대로 통과하지 않도록 정리했다. 

다만 Stack Day에는 HTTP Route대신에 UI가 있다. devbox는 Mock 서버라서 에러를 표현하는 방식이 단순하지만, Stack Day 는 어떤 에러가 발생했고, 어떻게 처리해야 할지 정하는 방식이 단순하지 않다.

이 포스트에서는 에러를 UI에서 처리하는 부분은 나중에 다시 정리하고, 저장소 구현의 에러를 레포지토리에서 감추고, 유즈케이스가 사용자가 시도한 작업의 실패로 바꾸는 데까지만 다룬다.

## 레포지토리는 저장소 작업의 실패만 표현한다

파일이 JSON으로 파싱된다고 해서 StackDay의 데이터로 사용할 수 있는 것은 아니다. DTO를 도메인 값으로 바꿀 때 날짜 검증이 실패할 수 있고, 같은 `Habit.ID`나 `Completion.ID`가 중복될 수도 있다. 한 `Habit`이 같은 날에 `Completion`이 두 개 이상인 상태도 허용하지 않는다.

`FileHabitRepository`는 읽은 `State`를 도메인 값으로 복원한 뒤 이를 검사한다.

```swift
func toDomain() throws -> State {
    let state = State(
        habits: try habits.map { try $0.toDomain() },
        completions: completions.map { $0.toDomain() }
    )
    try state.validate()
    return state
}
```

디코딩과 검증을 포함한 읽기 실패는 `HabitRepositoryError.readFailed`로, 파일 교체 실패는 `writeFailed`로 변환한다. 

호출자는 `JSONDecoder`나 `FileManager`가 어떤 에러를 던졌는지 알 필요 없이, 저장소의 읽기와 쓰기 중 무엇이 실패했는지만 알면 된다.

```swift
func fetchAll() async throws -> [Habit] {
    do {
        return try readState().habits
    } catch {
        throw HabitRepositoryError.readFailed
    }
}
```

저장된 기록이 손상됐는데 `Habit`이 하나도 없는 것처럼 보이면, 데이터가 사라진 것처럼 보이기 때문이다. 읽기 실패를 빈 목록으로 바꾸지는 않았다.

## 유즈케이스는 사용자가 시도한 작업으로 바꾼다

레포지토리 에러는 저장소의 관점이고, 유즈케이스 에러는 사용자가 실행한 작업의 관점이다. `RecordCompletionUseCase`는 기록할 수 없는 날짜를 `dateNotRecordable`로, 이미 기록한 완료를 `alreadyCompleted`로 구분한다.

```swift
do {
    // Habit 조회
    // ...
    try habit.validateRecordableDate(completedOn, referenceDay: referenceDay)
    // 기존 Completion 확인
    // ...
    try await completionRepository.insert(completion)
} catch let error as RecordCompletionError {
    throw error
} catch HabitError.beforeHabitStart,
        HabitError.futureDate,
        HabitError.outsideTrackingPeriod {
    throw RecordCompletionError.dateNotRecordable
} catch CompletionRepositoryError.alreadyExists {
    throw RecordCompletionError.alreadyCompleted
} catch {
    throw RecordCompletionError.couldNotRecord
}
```

파일 쓰기 실패처럼, 상위 계층에서 의미를 더 부여할 수 없는 에러는 `couldNotRecord`가 된다. 

`Habit` 생성, 보관, 완료 기록처럼 작업이 달라지면 같은 저장소 에러도 각 유즈케이스의 에러로 바뀐다. 이미 유즈케이스 에러로 판단한 경우에는 그대로 전달한다.

## 정리

레포지토리는 저장소 작업이 실패했다는 사실을 표현하고, 유즈케이스는 사용자가 시도한 작업이 왜 실패했는지 표현한다. 

이 경계가 있으면 저장 방식을 바꾸더라도 상위 계층이 파일 시스템이나 JSON 구현의 세부 사항을 알 필요가 없다.

뷰 모델은 아직 에러를 `String(describing:)`으로 직접 표시한다. 에러 케이스별 문구를 사용자에게 어떻게 보여 줄지는 다음 단계로 넘기겠다. 결정해야 하는 부분이 너무 많다...
