---
title: "StackDay. Date는 날짜가 아니다"
date: 2026-08-18T17:52:46+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - iOS
  - Swift
  - Domain Modeling
  - Date
  - TimeZone

draft: false
original: ""
---

StackDay는 일정 주기의 습관 수행 여부를 기록하는 앱이고, MVP에서는 그 주기를 매일로 고정했다.

지금까지 구현할 때, "어느 날에 수행했는가"와 "정확히 언제 기록했는가"를 모두 Foundation의 `Date`로 표현했다.

두 정보는 비슷해 보이지만 다르다. 이 차이를 타입으로 구분하지 않으면 날짜 검증, 중복 기록 검사, 통계 계산마다 같은 해석을 반복하게 된다.

이번 글에서는 그 문제가 실제 코드에서 어떻게 드러났고, `LocalDay`·`Clock`·TimeZone을 어떤 경계로 나눴는지 정리한다.

## Date타입이 저장하는 것은 순간

`Date`는 연, 월, 일이나 자정 같은 달력 개념을 저장하지 않는다. 

`Calendar`과 타임 존을 적용했을 때만 사람이 인식하는 날짜로 해석할 수 있는 하나의 절대적인 시점이다.

그래서 `Date` 하나만으로는 사용자가 완료를 기록한 정확한 순간을 알 수 없고, 습관을 시작한 달력상의 날짜도 알수 없고 통계를 계산할 기준 날짜도 알 수 없다.

## 같은 값을 서로 다르게 해석하고 있었다

### 통계에서는 날짜로 정규화한다

습관의 시작일과 통계 기준일은 시간보다 날짜가 중요하다. 기존 `HabitStatisticsCalculator`는 이 값을 비교하기 전에 기준 시점인 `startOfDay`로 정규화해야 했다.

```swift
let startDate = calendar.startOfDay(for: habit.startedOn)
let referenceDay = calendar.startOfDay(for: referenceDate)
let finalTrackingDate = min(
    referenceDay,
    habit.archivedOn.map(calendar.startOfDay(for:)) ?? referenceDay
)
```

완료 기록도 저장하기 전에 다시 자정으로 정규화했다. 날짜 단위 계산을 하려는 코드에 정규화가 계속 등장한 것이다.

```swift
let completedDay = calendar.startOfDay(for: completion.completedOn)
return completedDay
```

### Repository에서는 순간 그대로 비교한다

반면 Completion Repository는 `completedOn`을 `Date` 그대로 비교했다. 

같은 날 오전과 저녁에 만들어진 `Date`는 서로 다른 순간을 가리킨다. 따라서 "하루에 한 번만 완료를 기록한다"는 정책을 `Date`값 비교만으로 보장할 수 없다.

```swift
func fetch(
    habitID: Habit.ID,
    completedOn date: Date
) async throws -> Completion?
```

그렇다고 `Date`를 사용할 때마다 일 단위로 정규화해야할까? 그렇다면 정규화를 담당하는 `DateNormalizer` 같은 객체를 따로 두어야 하나?

딱 봐도 이상하다. 이 방식은 결국 "날짜"라는 도메인 값을 다루기 위해 변환 규칙을 계속 거쳐야 한다.

Stack Day에서 완료 기록의 기준은 특정 순간이 아니라 하루다.(이름부터 Stack "Day"다.) 그렇다면 `Date`를 하루처럼 사용하기보다, 하루를 표현하는 타입을 따로 만드는게 낫다.

Swift는 이런 값을 별도의 타입으로 만드는 것을 매우 좋아하는 언어다. 그래서 `LocalDay` 스트럭처를 만들었다.

### 문제는 규칙이 아니라 타입에 있었다

한쪽에서는 `Date`를 날짜처럼 정규화하고, 다른 쪽에서는 timestamp처럼 비교했다. 

어느 코드가 틀렸다기보다, 두 의미를 같은 타입에 담아 둔 것이 문제였다. 그러면 이 두 의미를 분리해보자.

## 도메인에 이미 있던 두 가지 시간 개념

StackDay에는 처음부터 서로 다른 시간 정보가 있었다.

| 의미 | 예시 | 타입 |
| --- | --- | --- |
| 정확히 언제 발생했는가 | `createdAt`, `updatedAt`, `recordedAt` | `Date` |
| 달력상 어느 날인가 | `startedOn`, `archivedOn`, `completedOn` | `LocalDay` |

예를 들어 Completion이 8월 18일의 수행 기록이라는 사실과, 사용자가 저녁 9시 3분에 그 기록을 남겼다는 사실은 다른 정보다. 

전자는 `LocalDay`, 후자는 `Date`가 담당해야한다.

## `LocalDay`는 날짜만 표현한다

`LocalDay`는 `year`, `month`, `day`로 이루어진 값 타입이다. 시각이나 TimeZone을 보관하지 않고, 두 날짜의 비교와 날짜 단위의 증감만 책임진다.

### 그레고리안 달력은 고정하고, 타임 존은 변환 경계에 둔다

Stack Day는 그레고리안 이외의 Calendar를 지원할 예정이 없다. 그래서 `LocalDay`의 달력 체계는 Gregorian으로 고정했다. 이럴땐 참 YAGNI가 편하다.

다만 같은 순간도 어느 타임존에서 해석하느냐에 따라 다른 날짜가 될 수 있기 때문에, `Date`를 `LocalDay`로 바꾸거나 `LocalDay`의 시작 시각을 만들 때는 타임 존이 필요하다.

```swift
struct LocalDay: Equatable, Hashable, Codable {
    let year: Int
    let month: Int
    let day: Int
}
```

`Date`에서 `LocalDay`를 만들 때만 타임 존을 받는다. `LocalDay` 자체는 어느 지역의 날짜인지 보관하지 않는다.

```swift
init(date: Date, timeZone: TimeZone) throws {
    let calendar = Self.gregorianCalendar(timeZone: timeZone)
    let components = calendar.dateComponents(
        [.year, .month, .day],
        from: date
    )

    guard let year = components.year,
          let month = components.month,
          let day = components.day
    else {
        throw LocalDayError.conversionFailed
    }

    try self.init(year: year, month: month, day: day)
}
```

날짜 더하고 빼는 작업에는 같은 그레고리안 규칙을 사용한다. `calendar.date(byAdding: value: to:)` 함수가 있는게 참 다행인게, 직접 구현하려면 코드가 많이 더러워질 것 같다...

```swift
func addingDays(_ value: Int) throws -> LocalDay {
    let calendar = Self.gregorianCalendar(timeZone: .gmt)
    let components = DateComponents(year: year, month: month, day: day)
    guard let date = calendar.date(from: components) else {
        throw LocalDayError.conversionFailed
    }
    guard let result = calendar.date(byAdding: .day, value: value, to: date) else {
        throw LocalDayError.arithmeticFailed
    }
    let resolved = calendar.dateComponents([.year, .month, .day], from: result)

    guard let year = resolved.year,
          let month = resolved.month,
          let day = resolved.day
    else {
        throw LocalDayError.conversionFailed
    }

    return try LocalDay(year: year, month: month, day: day)
}
```

## Clock은 현재 시점만 제공한다

현재 시각을 직접 `Date()`로 읽으면 테스트마다 시간이 달라지고, "오늘"을 재현하기도 어렵다. 그래서 현재 순간을 제공하는 `Clock`을 분리했다.

```swift
protocol Clock {
    var now: Date { get }
}
```

Clock이 제공하는 것은 `Date`, 즉 현재 순간이다. 그것을 오늘이라는 `LocalDay`로 해석하는 일은 유즈케이스가 타임 존과 함께 수행한다. `Clock`이 `Calendar`나 타임 존까지는 알아서는 안 된다.

## 타입 변경은 유즈케이스의 경계까지 이어진다

`LocalDay`를 추가하는 것만으로는 부족하다. 엔티티, 레포지토리, Calculator, 유즈케이스가 같은 의미를 사용하도록 모두 바뀌어야 한다.

### Domain 모델의 날짜를 바꾼다

- `Habit.startedOn`: `Date` → `LocalDay`
- `Habit.archivedOn`: `Date?` → `LocalDay?`
- `Completion.completedOn`: `Date` → `LocalDay`

반면 생성·수정·기록 시각은 계속 `Date`로 유지한다. 이 구분이 모델만 봐도 값의 의미를 알 수 있게 만든다.

```swift
struct Habit: Equatable, Identifiable {
    let startedOn: LocalDay
    private(set) var archivedOn: LocalDay?
    let createdAt: Date
    private(set) var updatedAt: Date
}

struct Completion: Equatable, Identifiable {
    let completedOn: LocalDay
    let recordedAt: Date
}
```

별개로 이번 작업에서 제일 귀찮은 작업이었다... `Date`를 사용하던 코드가 이미 여기저기 퍼져 있어서 생각보다 손댈 곳이 많았다. 

평소에는 코드 수정을 Codex에 잘 맡기지 않는 편인데, 이건 그냥 맡길 걸 조금 후회했다. 그래도 지금 발견했으니 이 정도라고 생각한다.

### UseCase는 현재 순간을 날짜로 해석한다

완료 기록 UseCase는 Clock에서 `now`를 한 번 읽는다. 

그 값은 `recordedAt`으로 그대로 저장하고, 같은 값을 TimeZone으로 해석한 `referenceDay`는 미래 날짜 검증에 사용한다.

```swift
let now = clock.now
let referenceDay = try LocalDay(
    date: now,
    timeZone: timeZone
)

try habit.validateDate(
    completedOn,
    referenceDay: referenceDay
)

let completion = Completion(
    habitID: habitID,
    completedOn: completedOn,
    recordedAt: now
)

try await completionRepository.insert(completion)
```

이렇게 하면 "오늘 이후에는 기록할 수 없다"는 규칙과 "언제 기록했는가"라는 이력 정보가 서로 다른 값으로 남는다.

## LocalDay가 해결하지 않는 것

이번 변경은 시간 관련 모든 문제를 한 번에 일반화하려는 시도가 아니다.

### 일정 정책은 별도 문제다

현재 MVP의 Habit은 `startedOn`부터 매일 수행하는 습관이다. 모든 Habit이 같은 규칙을 공유하므로 아직 `daily` 같은 Schedule 값을 따로 저장하지 않는다.

나중에 "매주 월/수/금", "매월 1일", "(가장 복잡할 것 같은)매월 마지막 날"처럼 수행 대상이 달라지면 Schedule이라는 도메인 개념이 필요하다. 그때도 역할은 구분된다.

- `LocalDay`: 어느 날짜인가?
- `Schedule`: 이 날짜가 Habit의 수행 대상인가?

### 행동 진행 상태도 별도 문제다

하루에 물을 8잔 마시는 습관처럼 목표에 도달하기 전의 진행 상태가 필요한 경우도 있다. 이때 `Progress`와 `Completion`의 관계를 별도로 설계해야 한다.

`LocalDay`는 `Completion`이 어느 날에 해당하는지를 표현할 뿐, count/quantity 습관의 진행 모델을 대신하지 않는다.

이 부분은 non-MVP라서 일단 개념정도만 정리했다. 실제 구현에 들어가기 전에 모델링을 제대로 할 생각이다.

## 정리

Stack Day에서 `Date`로 표현하던 값에는 두 가지 의미가 섞여 있었다. 

`createdAt`, `recordedAt`처럼 특정 순간을 나타내는 값과 `startedOn`, `completedOn`처럼 달력상의 날짜를 나타내는 값이다.

전자는 그대로 `Date`를 사용하고, 후자는 `LocalDay`로 분리했다. 타임 존도 `Date`와 `LocalDay`를 변환하는 경계에서만 사용한다.

결과적으로 날짜 비교를 위해 `Date`를 계속 정규화할 필요가 없어졌고, 하루에 한 번만 기록한다는 규칙도 `LocalDay`의 값 비교로 처리할 수 있게 됐다.

지금이라도 발견해서 정말 다행이었다. 계속 `Date`를 정규화해서 사용했다면 관련 코드가 더 퍼진 뒤에야 문제를 발견했을 수도 있다. 아직 MVP를 구현하는 단계라 변경 범위가 이 정도에서 끝났다고 생각한다.

별개로 이번에 테스트를 고치는 작업은 거의 직접 했다. Codex의 컨텍스트를 최대로 설정하고 마이그레이션을 맡겼는데도 Codex가 테스트를 다 박살냈다. 

`#Preview` 매크로 문제로 Codex가 테스트를 직접 실행하지 못하는 상황이라, 결국 Git으로 변경 사항을 복구하고 LocalDay를 하나씩 적용하면서 테스트를 고쳤다... 이것도 다시 한번 찾아봐야겠다.
