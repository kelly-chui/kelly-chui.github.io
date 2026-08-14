---
title: "StackDay. UseCase와 Entity는 각각 어디까지 책임져야 할까"
date: 2026-08-14T16:31:52+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - iOS
  - Swift
  - Domain Modeling
  - Architecture

draft: false
original: ""
---

`CreateHabitUseCase`를 시작으로 여러 유즈케이스를 구현하면서, 도메인 규칙을 어디에 두어야 할지 계속 고민하게 됐다.

`Habit`을 생성할 때 이름의 유효성을 누가 검증해야 하는지, `Completion`을 남길 때 해당 날짜에 기록할 수 있는지는 누가 판단해야 하는지처럼 비슷한 문제가 반복해서 나타났다.

처음에는 유즈케이스가 사용자의 작업을 처리하니 이런 검증도 함께 담당하면 된다고 생각할 수 있었다. 하지만 구현을 진행할수록 엔티티가 스스로 보장해야 하는 규칙과 유즈케이스 작업의 흐름을 위해 판단해야 하는 규칙을 구분할 필요가 있었다.

이 포스트에서는 `Habit`의 생성과 `Completion` 기록을 중심으로 어떤 고민을 했는지와 어떻게 해결했는지를 정리한다.

## Habit의 생성 경로가 하나가 아니라고 가정해보기

현재 코드에서 `Habit`은 `CreateHabitUseCase`를 통해 생성된다. 그렇다면 `Habit`의 유효성 검증도 유즈케이스에서 처리할 수 있지 않을까 생각했고, 다른 생성 루트가 있는지 생각을 해봤다.

바로 떠오른건 Repository였는데, in-memory 구현체가 아닌 이상 Repository에 실제 저장소를 연결하면 `Habit`을 그대로 저장하기보다 (가칭)`HabitDTO`와 같은 별도의 저장 모델을 사용하게 된다.(내가 그렇게 만들 거니까)

그러면 `HabitDTO`와 `Habit`을 매칭하는 과정에서도 새로운 `Habit` 객체가 만들어진다.

물론 정상적인 흐름이라면 저장된 데이터 역시 처음에는 `CreateHabitUseCase`의 검증을 거쳤을 가능성이 높다. 하지만 Repository가 읽어오는 데이터는 파일, 데이터베이스, 서버 등 애플리케이션 외부의 저장소에서 온다.

앱 외부에서 항상 정상적인 경로를 거쳤다고 가정하고 `Habit`을 유효하지 않은 상태로 생성하는 방식은 좋아보이지 않는다. 하지만 `Habit` 자체에 검증 로직이 있으면 이런 의문부호가 사라진다.

## Habit은 항상 유효한 상태여야 한다

`Habit`의 이름은 공백만으로 구성될 수 없다. 앞뒤 공백을 제거하는 일도 단순한 화면 입력 보정이 아니라, StackDay에서 `Habit` 이름을 어떻게 다룰지에 대한 규칙이다.

그래서 `CreateHabitUseCase`가 이름을 검사하는 대신 `Habit` 생성자가 이름을 정규화하고 유효성을 확인하도록 했다. 이렇게 하면 생성 경로와 무관하게 유효하지 않은 Habit이 만들어지지 않는다.

```swift
init(
    id: UUID = UUID(),
    name: String,
    startedOn: Date,
    createdAt: Date
) throws {
    let trimmedName = name.trimmingCharacters(
        in: .whitespacesAndNewlines
    )
    guard !trimmedName.isEmpty else {
        throw HabitError.emptyName
    }

    self.id = id
    self.name = trimmedName
    self.startedOn = startedOn
    self.createdAt = createdAt
    self.updatedAt = createdAt
}
```

UseCase는 이름을 어떻게 검증하는지 알 필요가 없다. Habit을 만들고, 성공하면 저장하며, 실패하면 저장하지 않는 흐름만 조정하면 된다.

```swift
func execute(name: String, startedOn: Date) async throws -> Habit {
    let habit = try Habit(
        name: name,
        startedOn: startedOn,
        createdAt: now()
    )

    try await repository.insert(habit)
    return habit
}
```

## HabitEntry는 검증 객체가 아니다

완료 기록을 구현할 때는 기록할 날짜가 습관 시작일 이전인지, 미래인지, 보관 이후인지 검사해야 했다. 처음에는 화면에 표시할 항목인 `HabitEntry`를 만들어 보고 생성에 실패하면 날짜가 잘못된 것으로 처리했다.

```swift
_ = try HabitEntry(
    habit: habit,
    targetDate: completedOn,
    completion: nil,
    referenceDate: referenceDate
)
```

하지만 `HabitEntry`는 특정 날짜의 `Habit` 상태를 표현하는 파생 모델이다. 전체 `Completion`을 탐색하거나 생성 성공 여부로 도메인 규칙을 판정하는 역할까지 맡기면 모델의 책임이 이상해진다.

날짜가 해당 `Habit`에 기록 가능한 날인지 판단하는 규칙은 `Habit`에 속한다. 그래서 `Habit.validateDate(_:referenceDate:)`로 옮겼다. `RecordCompletionUseCase`와 `CancelCompletionUseCase`는 이 메서드로 규칙을 확인한 뒤 각각 저장 또는 삭제를 수행한다.

```swift
func validateDate(_ targetDate: Date, referenceDate: Date) throws {
    guard targetDate >= startedOn else {
        throw HabitDateError.beforeHabitStart
    }
    guard targetDate <= referenceDate else {
        throw HabitDateError.futureDate
    }
    if let archivedOn, targetDate > archivedOn {
        throw HabitDateError.afterHabitArchived
    }
}
```

완료 기록 유즈케이스는 검증 규칙을 직접 구현하지 않고, `Habit`에서 검증 로직을 실행한 뒤, 애플리케이션 흐름을 계속 진행한다.

```swift
guard let habit = try await habitRepository.fetch(id: habitID) else {
    throw RecordCompletionError.habitNotFound
}

let referenceDate = now()
try habit.validateDate(completedOn, referenceDate: referenceDate)

if try await completionRepository.fetch(
    habitID: habitID,
    completedOn: completedOn
) != nil {
    throw RecordCompletionError.alreadyCompleted
}

let completion = Completion(
    habitID: habitID,
    completedOn: completedOn,
    recordedAt: referenceDate
)
try await completionRepository.insert(completion)
```

## Entity와 UseCase의 경계

이번 구현을 통해 엔티티와 유즈케이스의 책임을 다음과 같이 정리했다.

- Entity: 자신의 상태가 유효함을 보장하고, 자신에 관한 도메인 규칙을 판단한다.
- UseCase: Entity와 Repository를 조합해 하나의 작업 흐름을 구성한다.
- Repository: Domain 객체의 저장과 조회를 추상화한다.

예를 들어 완료 기록에서 이 날짜에 `Habit`을 기록할 수 있는가?는 `Habit`이 판단한다. 반면 `Habit`을 조회하고, 날짜를 검증하고, 기존 `Completion`을 확인한 뒤 새로운 `Completion`을 저장하는 작업의 순서와 흐름은 유즈케이스가 담당한다.

## 정리

검증 규칙 자체를 엔티티나 유즈케이스 한곳에 몰아 넣을 수는 없다. 책임이 이리저리 섞이게 되어버린다.

그 규칙이 엔티티 자체의 유효한 상태와 의미를 설명한다면 엔티티에, 여러 객체를 조합해 사용자의 작업을 수행하는 절차를 설명한다면 유즈케이스에 두는 것으로 결정했다.

이렇게 나누면 `Habit`은 어떤 경로에서 생성되더라도 자신의 유효성을 보장할 수 있고, 유즈케이스는 도메인 검증 규칙보다는 앱 플로우에 집중할 수 있게 된다.
