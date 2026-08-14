---
title: "StackDay. Repository의 save를 insert와 update로 나누기"
date: 2026-08-14T14:15:52+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - iOS
  - Swift
  - Architecture
  - Repository

draft: false
original: ""
---

유즈케이스를 구현하면서 `Habit`과 `Completion`을 저장할 Repository 계약을 좀 정리했다.

처음에는 create와 update 둘 다 `save` 하나로 저장하면 간단해 보였지만, 두 기능이 기대하는 실패 조건이 서로 다르다는 점에서 계약을 나눌 필요가 있었다.

## save는 어떤 동작인가

`save`를 upsert로 구현하면 호출하는 쪽은 편하다. ID가 없으면 삽입하고, 이미 있으면 갱신하면 된다.

```swift
protocol HabitRepository {
    func save(_ habit: Habit) async throws
}
```

문제는 이 동작이 실패해야 하는 상황까지 조용히 성공으로 바꾼다는 점이다.

(물론 UUID라 현실적으로 겹칠 일은 없지만) `Habit`을 생성하는 작업은 같은 ID가 이미 있으면 실패해야 하고, 보관처럼 기존 `Habit`을 바꾸는 작업은 대상이 없으면 실패해야 한다.

그런데 `save` 하나로 처리하면 존재하지 않는 `Habit`을 보관하려다 새 `Habit`이 생길 수도 있다.

그래서 Habit Repository는 `insert`와 `update`를 분리하기로 했다. 두 연산의 모양이 아니라, 각각 어떤 상태를 전제로 하는지를 계약에 남기기 위해서다.

```swift
protocol HabitRepository {
    func fetchAll() async throws -> [Habit]
    func fetch(id: Habit.ID) async throws -> Habit?
    func insert(_ habit: Habit) async throws
    func update(_ habit: Habit) async throws
    func delete(id: Habit.ID) async throws
}
```

예를 들어 `Habit`을 생성하는 유즈케이스는 `insert`만 호출하면된다.

대조적으로, 보관 유즈케이스는 조회한 `Habit`을 변경한 뒤 `update`를 호출한다. 둘이 기대하는 저장소 상태가 다르다는 점이 유즈케이스에도 드러난다.

```swift
guard var habit = try await repository.fetch(id: habitID) else {
    throw ArchiveHabitError.habitNotFound
}

try habit.archive(on: now())
try await repository.update(habit)
```

## Habit과 Completion은 같은 CRUD가 아니다

`Habit`은 이름이나 보관 상태처럼 변경되는 속성이 있으므로 `update`가 필요하다. 

반면 현재 `Completion`은 특정 Habit이 특정 날의 목표를 달성했다는 기록이다. 기록을 수정하기보다 생성하거나 삭제하는 편이 모델에 더 잘 맞는다.

따라서 Completion Repository에는 `insert`와 `delete`를 두고, Habit 삭제 시 연결된 Completion을 지우기 위한 `deleteAll(for:)`도 추가했다. 

모든 Repository가 같은 CRUD 모양을 가져야 할 이유는 없다.

```swift
protocol CompletionRepository {
    func fetchAll(for habitID: Habit.ID) async throws -> [Completion]
    func fetch(
        habitID: Habit.ID,
        completedOn date: Date
    ) async throws -> Completion?
    func insert(_ completion: Completion) async throws
    func delete(habitID: Habit.ID, completedOn date: Date) async throws
    func deleteAll(for habitID: Habit.ID) async throws
}
```

## UUID 대신 Habit.ID

처음에는 Repository의 인자로 `UUID`를 사용했다. 하지만 Repository가 필요한 것은 UUID라는 구현 방식이 아니라 Habit을 식별하는 값이다.

`Habit`이 `Identifiable`을 채택하고 `Habit.ID`를 사용하면 인터페이스가 더 의도를 드러낸다. 아직 별도의 `HabitID` 값 타입을 도입한 것은 아니다.

실제 타입은 UUID이므로 서로 다른 UUID를 잘못 전달하는 문제까지 막지는 못한다.

```swift
func fetch(id: Habit.ID) async throws -> Habit?
func delete(id: Habit.ID) async throws
```

그래도 Repository가 구체적인 저장 방식보다 도메인의 식별자에 의존한다는 점을 표현할 수 있다.

별도 ID 타입이 실제로 필요한 요구사항이 생기기 전까지는 이 정도가 현재 MVP에 맞는 선택이라고 생각한다.

## 정리

Repository를 단순한 데이터 접근 API로 보면 upsert 하나로도 충분할 수 있다. 실제로 내 DevBox Server의 CRUD도 upsert를 사용한다.

하지만 DevBox Server는 범용적으로 사용할 개발용 서버다. 서버 입장에서는 insert와 update를 구분하지 않아도 되고, 필요한 경우 클라이언트에서 해당 동작을 래핑해서 둘을 나눠 사용할 수 있다.

하지만 StackDay의 Repository는 계층과 목적이 다르다. 

생성 유즈케이스는 이미 존재하는 `Habit`을 덮어쓰는 것이 아니라 새로운 `Habit`을 저장해야 한다. 업데이트 유즈케이스라면 반대로 존재하지 않는 `Habit`을 새로 만들어서는 안 된다.

이처럼 앱 내부의 유즈케이스가 기대하는 성공과 실패의 조건까지 표현하려면, Repository 계약은 도메인 작업의 의미를 담아야 한다. 

그래서 이번에는 CRUD 메서드를 대칭적으로 맞추거나 모든 Repository에 적용할 수 있는 하나의 형태를 만드는 것보다는(잘못된 환상이었다) 각 도메인 작업이 요구하는 의미를 계약에 그대로 드러내는 쪽을 택했다.
