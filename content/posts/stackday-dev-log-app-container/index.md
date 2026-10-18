---
title: "StackDay. AppContainer로 의존성 생성과 조립을 한 곳으로 모으기"
date: 2026-08-25T18:43:28+09:00

categories:
  - Project
series:
  - StackDay
tags:
  - Software Architecture
  - Dependency Injection

draft: false
original: ""
---

유즈케이스가 늘어나면서 레포지토리와 같은 유즈케이스 작업에 필요한 객체는 많은데, 그 객체를 어디에서 만들고 연결할지는 정하지 않았다.

AI 에이전트가 유즈케이스 이니셜라이저에서 의존성을 기본 인자로 만들도록 코드를 작성하는데, 의존성 생성이 엄청나게 흩어지므로 절대로 좋은 코드는 아니다. 

의존성 생성과 조립을 한 곳에 모으는 컨테이너가 필요한 시점이 왔고, `AppContainer`를 만들었다.

## 도입 배경 1. UseCase가 구체 타입을 만든다.

완료 기록 유즈케이스에는 `Habit`과 `Completion`을 조회할 레포지토리와 현재 시간을 읽을 `Clock`, 현재 시점을 날짜로 해석할 `TimeZone`이 필요하다.

```swift
struct RecordCompletionUseCase {
    private let habitRepository: any HabitRepository
    private let completionRepository: any CompletionRepository
    private let clock: any Clock
    private let timeZone: TimeZone
}
```

유즈케이스에서 의존성을 받는 것은 당연하지만, 에이전트가 유독 `Clock`에만 기본 값을 넣으려고 했다:

```swift
init(
    habitRepository: any HabitRepository,
    completionRepository: any CompletionRepository,
    clock: any Clock = SystemClock(),
    timeZone: TimeZone = .current
) {
    // ...
}
```

왜 `Clock`만 기본 값을 넣으려고 하는지 잘 모르겠는데, 유즈케이스를 만들 때 마다 이래서 `AGENTS.md`에 직접적으로 의존성 생성을 내부에서 하지 말라고 명시했다.

```text
- Keep injected dependencies explicit; do not provide concrete implementations as default arguments.
```

아직 Skill로 뽑아낼 정도는 아닌 것 같아서, AGENTS에 작성했다. 이후에 작성한 유즈케이스들은 기본 값 문제가 없이 잘 작성된다.

## 도입 배경 2. 같은 Repository를 공유해야 한다

현재 구현은 in-memory 레포지토리를 사용한다.(영속성 구현은 맨 마지막에 할 예정)

사실 SniffMEET도 했던 거지만, 그 때는 각 라우터에 의존성 조립 책임을 뒀고, 이번에는 앱 전반적인 의존성 컨테이너를 만들었다. 

당연하지만 만들 때마다 Repository를 새로 생성하면 안 된다.

```text
CreateHabitUseCase
    └─ InMemoryHabitRepository A에 Habit 저장

LoadDayEntriesUseCase
    └─ InMemoryHabitRepository B에서 Habit 조회
```

즉, 필요한 것은 단순히 생성 코드의 중복을 줄이는 객체가 아니라, 앱 전체에서 공유할 의존성을 만들고 연결하는 위치였다.

## AppContainer에 의존성 조립 규칙 모으기

`AppContainer`는 앱이 사용할 구체 구현체를 한 번 생성해서 보관한다.

```swift
final class AppContainer {
    private let habitRepository: any HabitRepository
    private let completionRepository: any CompletionRepository
    private let clock: any Clock
    private let timeZone: TimeZone

    init() {
        habitRepository = InMemoryHabitRepository()
        completionRepository = InMemoryCompletionRepository()
        clock = SystemClock()
        timeZone = .current
    }
}
```

이제 UseCase는 필요한 의존성을 빠짐없이 받는다. 어떤 구현체를 쓸지는 `AppContainer`가 결정한다.

```swift
func makeRecordCompletionUseCase() -> RecordCompletionUseCase {
    RecordCompletionUseCase(
        habitRepository: habitRepository,
        completionRepository: completionRepository,
        clock: clock,
        timeZone: timeZone
    )
}
```

처음에는 `LoadTodayEntriesUseCase`를 포함해 유즈케이스들을 조립했다. 이후 오늘 기록 조회를 임의의 날짜를 조회하는 `LoadDayEntriesUseCase`로 일반화하면서, Container의 팩토리도 그 유즈케이스를 만들도록 바꿨다.

Create, Archive, Delete, 완료 기록, 월간 기록, 통계 조회도 같은 레포지토리와 `Clock`을 전달받는다. 유즈케이스들은 서로를 알 필요 없이, Container가 같은 앱 상태를 보도록 조립한다.

```text
AppContainer
├─ HabitRepository
├─ CompletionRepository
├─ Clock
├─ TimeZone
└─ UseCase factories
    ├─ CreateHabitUseCase
    ├─ ArchiveHabitUseCase
    ├─ DeleteHabitUseCase
    ├─ RecordCompletionUseCase
    ├─ CancelCompletionUseCase
    ├─ LoadDayEntriesUseCase
    ├─ LoadMonthlyEntriesUseCase
    └─ LoadHabitStatisticsUseCase
```

## AppContainer는 생성, 조립만

`AppContainer`가 생겼다고 해서 새로운 비즈니스 로직이 생긴 것은 아니니 별도의 동작 테스트를 추가하지 않았다. 

Container가 새로운 규칙을 만들지 않고, 이미 검증된 구현체를 연결만 하기 때문이다.

```swift
func makeLoadHabitStatisticsUseCase() -> LoadHabitStatisticsUseCase {
    LoadHabitStatisticsUseCase(
        habitRepository: habitRepository,
        completionRepository: completionRepository,
        clock: clock,
        timeZone: timeZone
    )
}
```

대신 각 UseCase는 필요한 의존성을 직접 주입받으므로, 테스트에서 원하는 구현체를 전달할 수 있다.

```swift
let useCase = RecordCompletionUseCase(
    habitRepository: RecordingHabitRepository(habits: [habit]),
    completionRepository: RecordingCompletionRepository(),
    clock: FixedClock(now: recordedAt),
    timeZone: .gmt
)
```

`FixedClock`을 사용하면 테스트마다 같은 날짜와 시각을 재현할 수 있고, Recording Repository를 사용하면 실제 저장소 없이도 어떤 Completion이 저장됐는지 확인할 수 있다.

## 아직 DI 프레임워크는 도입하지 않기로 결정

지금 당장 DI 프레임워크가 바로 필요하지는 않다. 아직은 앱이 가볍다.(YAGNI)

생성해야 할 객체 수가 많지 않고, 의존성 그래프도 단순하다. `AppContainer`의 팩토리 메서드만 봐도 어떤 UseCase가 무엇을 필요로 하는지 확인할 수 있다.

전역 싱글톤으로 두면 어디서든 접근할 수는 있지만, 객체가 어떤 의존성에 기대고 있는지가 생성자에 드러나지 않는다... 싱글톤 자체를 안티 패턴으로 생각하는건 아닌데 꺼려지는건 사실이니까.

지금은 필요한 의존성을 생성자 인자로 명시하고, 앱 시작점에서만 구체 타입을 선택하는 방식이 MVP에 맞다고 생각한다.

## 정리

유즈케이스는 자신의 작업에 필요한 의존성을 받아야 하지만, 그 의존성의 구체 구현을 선택할 필요는 없다.

StackDay에서는 `AppContainer`가 In-memory Repository, SystemClock, TimeZone을 한 번 생성해 공유하고, UseCase는 이를 생성자로 전달받도록 만들었다. 이렇게 하면 앱에서는 같은 상태를 공유하고, 테스트에서는 필요한 대역을 자유롭게 주입할 수 있다.

지금의 `AppContainer`는 아주 작다. 하지만 저장소를 in-memory 구현에서 로컬 저장소로 바꾸거나, 앱이 다른 Clock을 사용해야 할 때 수정할 위치를 한 곳으로 모아뒀다는 점에서 충분한 역할을 한다.
