---
title: "StackDay. App Router로 뷰 전환 상태 분리하기"
date: 2026-09-18T19:48:54+09:00
categories:
  - Project
series:
  - StackDay
tags:
  - SwiftUI
  - Software Architecture
draft: false
original: ""
---

기존 앱의 진입점과 뷰 전환 로직에서 찝찝함을 느끼는 부분이 있었다.

1. `RootTabViewModel`은 두 feature의 뷰 모델과 탭 선택을 함께 보관한다. 이 타입을 뷰 모델로 두는 것이 맞을까? - 애초에 뷰 모델이 맞긴 한가?
2. `RootTabView`는 탭 컨테이너인데, Daily와 Statistics의 뷰 모델을 직접 알아야 할까?
3. 뷰 전환 로직 자체가 뷰와 뷰 모델 코드 여기저기 흩어져 있다.

모든 문제점을 한 번에 정리하진 않았지만, 이번에 `AppRouter`를 도입하면서 정리할 수 있는 부분은 어느정도 정리했다.

## 기존 구조의 문제

### RootTabViewModel이 가진 책임

`RootTabViewModel`은 Daily와 Statistics 두 Feature의 뷰 모델, 선택된 탭을 함께 보관한다.

```swift
@MainActor
@Observable
final class RootTabViewModel {
    enum Tab: Hashable {
        case dailyEntries
        case statistics
    }
    let dailyEntriesViewModel: DailyEntriesViewModel
    let statisticsViewModel: StatisticsViewModel
    var selectedTab: Tab = .dailyEntries
}
```

이 뷰 모델은 특정 기능의 데이터나 동작을 다루지 않는다. 두 기능의 뷰 모델을 조립하고 탭 선택을 보관하는 앱 루트의 역할을 맡고 있다. 

즉, 이름은 뷰 모델이지만, 기능의 상태가 아니라 앱 조립과 탭 전환 상태를 함께 가지고 있다.

### Feature 뷰마다 다른 전환 처리

feature로 내려가보면, `DailyEntriesView`에는 `AddHabitView` 표시 상태가 `@State`로 있었고, `DailyEntriesViewModel.selectedHabit`은 `DailyHabitDetailView` 표시와 상세 데이터의 기준으로 쓰인다:

```swift
struct DailyEntriesView: View {
    private let viewModel: DailyEntriesViewModel
    @State private var isShowingAddHabit = false

    var body: some View {
        // ...
        .toolbar {
            Button { isShowingAddHabit = true } label: {
                Image(systemName: "plus")
            }
        }
        .fullScreenCover(isPresented: $isShowingAddHabit) {
            AddHabitView { name in
                Task {
                    await viewModel.habitCreated(name: name)
                    isShowingAddHabit = false
                }
            }
        }
        .sheet(item: $viewModel.selectedHabit) { habit in
            // DailyHabitDetailView 조립
        }
    }
}
```

`StatisticsView`는 더 많은 일을 맡고 있다. `NavigationLink` 안에서 `HabitStatisticsDetailView`를 만들고, 통계 조회·월 이동·Habit 생명주기 변경에 필요한 동작을 `StatisticsViewModel`에서 꺼내 전달한다:

```swift
private func summaryLink(_ summary: HabitStatisticsSummary) -> some View {
    NavigationLink {
        HabitStatisticsDetailView(
            summary: summary,
            statistics: viewModel.selectedHabitStatistics,
            calendar: viewModel.selectedHabitMonthlyCalendar,
            isLoading: viewModel.isLoading,
            onAppear: {
                await viewModel.habitStatisticsDetailRequested(for: summary)
            },
            onDelete: {
                await viewModel.habitDeleted(habitID: summary.id)
            },
            // archive, unarchive, month actions
        )
    } label: {
        HabitStatisticsSummaryCard(summary: summary)
    }
}
```

기존 구조에는 두 가지 문제가 있다.

- 뷰를 전환하는 상태와 도메인 데이터를 읽고 바꾸는 상태가 같은 뷰 모델 혹은 뷰 코드에 섞여 있다.
- `AddHabitView`, `DailyHabitDetailView`, `HabitStatisticsDetailView`를 여는 방식이 서로 달라 전환 규칙이 흩어져 있다.

특히 `StatisticsView`는 리스트를 보여주는 목적의 뷰인데도 `DailyHabitDetailView`를 조립까지 한다. 이러면 `DailyHabitDetailView`에 필요한 상태가 늘어날수록 목록의 책임도 함께 늘어난다.

## AppRouter 도입

### 앱 조립과 뷰 전환 상태의 경계

뷰 전환 상태를 먼저 분리하자. 앱 시작 시 객체를 조립하는 일, 현재 어느 뷰를 표시할지 나타내는 일, Habit과 통계를 변경하는 일은 변경 이유가 서로 다르다. 

각 책임의 위치를 분명히 하면 뷰 전환 규칙도 한 곳에서 확인할 수 있다.

- `AppRoot`는 앱 시작과 의존성 조립, SwiftUI 컨테이너 연결을 맡는다.
- `AppRouter`는 현재 표시 중인 탭·sheet·cover·navigation path를 보관한다.
- `DailyEntriesView`와 `StatisticsView`는 사용자의 전환 요청을 밖으로 전달한다.
- 뷰 모델과 유즈케이스는 Habit과 통계 데이터를 읽고 도메인 동작을 수행한다.

이렇게 분리하면 `RootTabViewModel`은 더 이상 필요하지 않다. `AppRoot`가 `AppModel`을 만들고, `AppRouter`와 두 feature의 뷰 모델을 연결하면 된다.

### AppRouter에 뷰 전환 상태 모으기

이제 `AppRouter`를 작성해보자. 앱 전반의 뷰 전환 로직을 담당한다:

```swift
@MainActor
@Observable
final class AppRouter {
    var selectedTab: Tab = .dailyEntries
    var dailySheet: DailySheet?
    var fullScreenCover: FullScreenCover?
    var statisticsPath: [StatisticsRoute] = []
}
```

각 프로퍼티는 SwiftUI의 표시 API와 직접 대응한다.

| AppRouter 상태 | SwiftUI 연결 | 표현하는 뷰 전환 |
| --- | --- | --- |
| `selectedTab` | `TabView(selection:)` | Daily / Statistics 탭 선택 |
| `fullScreenCover` | `fullScreenCover(item:)` | `AddHabitView` 표시 |
| `dailySheet` | `sheet(item:)` | `DailyHabitDetailView` 표시 |
| `statisticsPath` | `NavigationStack(path:)` | `HabitStatisticsDetailView` push / pop |

각 메소드도 뷰 전환 상태만 바꾼다:

```swift
extension AppRouter {
    func presentAddHabit() {
        fullScreenCover = .addHabit
    }

    func presentHabitDetail(habitID: Habit.ID) {
        dailySheet = .habitDetail(habitID: habitID)
    }

    func showHabitStatistics(habitID: Habit.ID) {
        statisticsPath.append(.habitDetail(habitID: habitID))
    }

    func popStatisticsDetail() {
        _ = statisticsPath.popLast()
    }
}
```

`Habit` 생성·이름 변경·삭제·통계 조회는 뷰 모델과 유즈케이스가 맡는다. 성공 여부에 따라 어느 뷰를 표시할지는 `AppRoot`가 router 메소드를 호출해 결정한다.

### Route에는 Habit.ID만 담기

`StatisticsRoute`와 `DailySheet`에는 `Habit` 전체가 아닌 `Habit.ID`만 담았다.

```swift
extension AppRouter {
    enum StatisticsRoute: Hashable {
        case habitDetail(habitID: Habit.ID)
    }

    enum DailySheet: Identifiable {
        case habitDetail(habitID: Habit.ID)

        var id: Habit.ID {
            switch self {
            case .habitDetail(let habitID): habitID
            }
        }
    }
}
```

Navigation Route는 어떤 `Habit`의 상세 뷰를 표시할지 식별만 하면 된다. `Habit` 이름, 보관 상태, 통계 데이터처럼 바뀔 수 있는 값은 뷰 모델이 조회한다.

path에 값이 추가되면 `navigationDestination(for:)`가 그 값을 목적지 뷰와 연결한다.

### AppRoot에서 뷰 전환 연결하기

`DailyEntriesView`와 `StatisticsView`는 router를 모르는 대신에, 필요한 전환 요청을 클로저로 받는다.

```swift
struct DailyEntriesView: View {
    private let viewModel: DailyEntriesViewModel
    private let onAddHabitRequested: () -> Void
    private let onHabitDetailRequested: (HabitEntry) async -> Void
}

struct StatisticsView: View {
    private let viewModel: StatisticsViewModel
    private let onHabitDetailRequested: (Habit.ID) -> Void
}
```

`AppRoot`는 이 요청을 ViewModel 작업과 router 상태 변경으로 연결한다:

```swift
@Bindable var router = app.router

NavigationStack(path: $router.statisticsPath) {
    StatisticsView(
        viewModel: app.statisticsViewModel,
        onHabitDetailRequested: router.showHabitStatistics
    )
    .navigationDestination(for: AppRouter.StatisticsRoute.self) { route in
        switch route {
        case .habitDetail(let habitID):
            habitStatisticsDetail(habitID: habitID, app: app)
        }
    }
}
```

`AppRoot`는 각 뷰 전환에서 다음 순서를 조립한다.

1. feature 뷰가 사용자 입력을 전환 요청으로 전달한다.
2. 필요한 도메인 작업이나 데이터 준비가 있으면 ViewModel을 호출한다.
3. 작업 결과에 맞춰 `AppRouter`의 상태를 바꾼다.
4. `NavigationStack`, `sheet`, `fullScreenCover`가 바뀐 router 상태를 표시한다.

#### DailyEntriesView의 요청 연결

`DailyEntriesView`에서 Habit 행을 누르면 먼저 `DailyEntriesViewModel`이 Habit을 조회한다. 조회 결과가 있을 때만 router에 `Habit.ID`를 넣어 `DailyHabitDetailView`를 표시한다.

```swift
DailyEntriesView(
    viewModel: app.dailyEntriesViewModel,
    onAddHabitRequested: router.presentAddHabit,
    onHabitDetailRequested: { entry in
        await app.dailyEntriesViewModel.habitDetailRequested(for: entry)
        guard app.dailyEntriesViewModel.selectedHabit != nil else { return }
        router.presentHabitDetail(habitID: entry.habitID)
    }
)
.fullScreenCover(item: $router.fullScreenCover) { cover in
    switch cover {
    case .addHabit:
        AddHabitView { name in
            Task {
                if await app.dailyEntriesViewModel.habitCreated(name: name) {
                    router.dismissFullScreenCover()
                }
            }
        }
    }
}
```

`onAddHabitRequested`는 cover 상태만 바꾸고, Habit 생성은 `DailyEntriesViewModel`이 수행한다. 

생성이 성공하면 `AppRoot`가 cover를 dismiss한다. 상세 뷰도 같은 방식으로 `dailySheet`와 연결한다.

```swift
.sheet(
    item: $router.dailySheet,
    onDismiss: app.dailyEntriesViewModel.dismissHabitDetail
) { sheet in
    switch sheet {
    case .habitDetail(let habitID):
        dailyHabitDetail(habitID: habitID, app: app)
    }
}
```

#### StatisticsView의 Route 연결

`StatisticsView`는 카드의 `Habit.ID`를 `onHabitDetailRequested`로 전달한다. `AppRouter`가 `statisticsPath`에 Route를 추가하면 `navigationDestination(for:)`가 `HabitStatisticsDetailView`를 만든다.

`Habit` 삭제 후, `summary`가 목록에서 사라진 뒤에도 상세 Route가 남는 상태를 막기 위해서 상세 뷰의 Route도 path에서 제거한다:

```swift
onDelete: {
    let didDelete = await viewModel.habitDeleted(habitID: habitID)
    if didDelete {
        app.router.popStatisticsDetail()
        _ = await viewModel.refreshSummaries()
    }
    return didDelete
}
```

이 연결 코드는 `AppRoot`에 남는다. feature 뷰와 뷰 모델은 다른 feature의 Route나 SwiftUI 컨테이너를 알 필요가 없다.

## 정리

앱 조립, 뷰 전환, Habit과 통계를 변경하는 동작은 같은 이유로 바뀌지 않는다. `AppRouter`는 이 중에서 현재 어떤 뷰를 표시할지 나타내는 상태만 맡는다.

StackDay에서는 `AppRoot`가 객체를 조립하고 SwiftUI 컨테이너와 연결한다. `AppRouter`는 탭, sheet, cover, navigation path를 보관하도록 하고, feature 뷰는 전환 요청을 전달하고, 뷰 모델과 유즈케이스는 `Habit`과 통계 데이터를 처리하도록 변경했다. 덕분에 feature 뷰는 다른 feature의 path나 sheet 상태를 알 필요가 없다.

모든 문제가 해결된건 아닌게, 아직도 `AppRoot`에는 Daily와 Statistics의 상세 뷰 조립 코드가 남아 있다. 

다음 리팩터링에서는 `AppRouter`에 모인 상태를 전역 상태와 피처 내부 상태로 나누고, 뷰 조립을 피처별로 분리할 예정이다... Coordinator를 써야하나?
