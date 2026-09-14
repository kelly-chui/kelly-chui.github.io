---
title: "StackDay. 커스텀 캘린더 뷰로 통계 뷰 구성하기"
date: 2026-09-14T21:09:26+09:00
categories:
  - Project
series:
  - StackDay
tags:
  - Domain Modeling
  - SwiftUI
  - Calendar

draft: false
original: ""
---

원래 `HabitStatisticsDetailView`에는 히트맵이 들어가기로 했다.

{{< image src="image-001-optimized-image.webp" align="center" width="360" >}}

하지만 문제는 MVP에서 월간 단위로만 통계를 보여줄 계획이었는데, 28-31개짜리 히트맵은 너무 밀도가 얕다. 차라리 그 정도 규모라면 히트맵이 아닌 캘린더를 보여주는게 더 낫다고 판단했다.

UIKit에서 `UICalendarView`를 가져와서 사용할까 싶었는데, 달력 정도는 구현 난이도가 어렵다고 생각하지도 않아서 데이터와 레이아웃을 직접 만들기로 했다. 

캘린더 뷰는 다음 세 부분으로 나뉜다.

- 선택한 월의 연도·월과 이전/다음 이동 버튼
- 요일 헤더와 날짜 셀로 구성된 7열 캘린더
- 현재 스트릭, 최장 스트릭, 완료 일수, 완료율을 보여 주는 통계

## 캘린더 구현 상세

캘린더를 구현할 때는 날짜를 어떻게 표현할지보다 먼저, 어떤 데이터를 캘린더가 책임질지 정했다. 통계 전체를 담는 `HabitStatistics`와 선택한 달의 날짜를 담는 `HabitMonthlyCalendar`를 분리하고, 각 날짜의 상태는 UseCase에서 결정한 뒤 View에서는 배치와 표현만 담당하게 했다.

### 데이터 모델

캘린더 뷰에서 쓸 데이터 모델을 우선 만들었다.

`HabitMonthlyCalendar`는 선택한 월과 그 달의 모든 날짜를 가진다:

```swift
struct HabitMonthlyCalendar: Equatable {
    let year: Int
    let month: Int
    let days: [HabitMonthlyCalendarDay]
    let canMoveToNextMonth: Bool
}
```

`HabitMonthlyCalendarDay`에는 날짜, 완료 상태, 오늘 여부만 둔다:

```swift
struct HabitMonthlyCalendarDay: Equatable, Identifiable {
    enum State: Equatable {
        case completed
        case missed
        case pending
        case empty
    }

    let date: LocalDay
    let state: State
    let isToday: Bool
    var id: LocalDay { date }
}
```

### 날짜별 상태는 유즈케이스에서 넘겨주기

당연하지만 캘린더가 `HabitRepository`와 `CompletionRepository`를 이용해서 날짜별 상태를 가져오는 것이 아닌, 유즈케이스에서 해당 값들을 불러온 다음에, 캘린더에서 사용할 수 있도록 처리를 해줘야 한다.

각 날짜의 상태를 결정할 때는 현재 기준일과 `Habit`의 추적 기간, 완료 기록을 함께 본다.

```swift
let referenceDay = try LocalDay(date: clock.now, timeZone: timeZone)
let completedDays = Set(
    try await completionRepository.fetchAll(for: habitID)
        .map(\.completedOn)
)
var day = try LocalDay(year: year, month: month, day: 1)
var days: [HabitMonthlyCalendarDay] = []

while day.year == year && day.month == month {
    let state: HabitMonthlyCalendarDay.State
    if day > referenceDay || !habit.isTracked(on: day) {
        state = .empty
    } else if completedDays.contains(day) {
        state = .completed
    } else if day == referenceDay {
        state = .pending
    } else {
        state = .missed
    }

    days.append(
        HabitMonthlyCalendarDay(
            date: day,
            state: state,
            isToday: day == referenceDay
        )
    )
    day = try day.addingDays(1)
}
```

- `completed`: 추적 대상이고 완료 기록이 있다.
- `missed`: 추적 대상인 과거 날짜에 완료 기록이 없다.
- `pending`: 기준일인 오늘 아직 완료하지 않았다.
- `empty`: 미래 날짜이거나 추적 기간 밖에 있다.

특히 보관과 복원 사이의 공백은 `missed`로 계산하면 안 된다. `Habit.isTracked(on:)`이 `TrackingPeriod` 이력을 기준으로 판단하므로, 통계와 캘린더 모두 추적하지 않았던 날짜를 실패로 세지 않는다.

### `LazyVGrid`에서 `Grid`로 바꾸기

에이전트가 처음에는 요일 헤더와 날짜 셀을 각각 `LazyVGrid`로 배치했는데, 달력 모양이라는게 정적이기도 하고, 헤더와 셀이 각각 다른 `LazyVGrid`로 나눠지는 것 자체도 어색하게 느껴져서 (억지로 끼워 맞춘 느낌) 직접 `Grid`로 변경했다.

```swift
Grid(horizontalSpacing: 8, verticalSpacing: 8) {
    GridRow {
        ForEach(weekdaySymbols.indices, id: \.self) { index in
            Text(weekdaySymbols[index])
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity)
        }
    }

    ForEach(calendarGridRows.indices, id: \.self) { rowIndex in
        GridRow {
            ForEach(calendarGridRows[rowIndex].indices, id: \.self) { columnIndex in
                if let day = calendarGridRows[rowIndex][columnIndex] {
                    CalendarDayCell(day: day)
                } else {
                    Color.clear
                        .frame(height: 40)
                        .accessibilityHidden(true)
                }
            }
        }
    }
}
```

### 달력의 빈칸을 날짜와 분리하기

예를 들어 한 달의 첫날이 수요일이면 앞에 일·월·화 세 칸이 필요하다. 마지막 주도 7열을 채우기 위한 빈칸이 생길 수 있다. 이 칸들은 실제 날짜가 아니므로 `HabitMonthlyCalendarDay`로 만들지 않는다.

```swift
private var calendarGridRows: [[HabitMonthlyCalendarDay?]] {
    var cells = Array(
        repeating: HabitMonthlyCalendarDay?.none,
        count: leadingPlaceholderCount
    )
    cells.append(contentsOf: calendarMonth.days.map(Optional.some))

    let trailingPlaceholderCount = (7 - cells.count % 7) % 7
    cells.append(
        contentsOf: Array(
            repeating: HabitMonthlyCalendarDay?.none,
            count: trailingPlaceholderCount
        )
    )

    return stride(from: 0, to: cells.count, by: 7).map { startIndex in
        Array(cells[startIndex..<(startIndex + 7)])
    }
}
```

`nil`은 레이아웃을 맞추기 위한 자리이고, `.empty`는 실제 날짜의 상태다. 둘 다 화면에서는 배경이 없지만, `.empty`는 실제 날짜와 매핑되는 셀이고, `nil`은 진짜 날짜가 아니라 레이아웃 맞춤을 위한 플레이스홀더다.

날짜가 없는 플레이스홀더는 `accessibilityHidden(true)`로 숨기고, `.empty`인 날짜는 날짜와 `no completion state`를 접근성 레이블로 읽을 수 있게 했다.

### 셀로 해당 날짜의 상태 표현하기

처음에 고민을 많이 했는데, 내가 레퍼런스로 많이 보는 Strava나 Fitness와는 조금 다르게, 일자에 직접 동그라미를 치고, 색으로 상태를 표시하기로 했다.

이미 데이 뷰에서 색을 이용해서 `HabitEntry`의 상태를 표현하고 있으니, 통일성을 맞춰서 보여주면 된다고 판단했다.

{{< image-row width="fit-content" gap="1rem" >}}
{{< image src="image-002-optimized-image.webp" caption="completed" width="160px" >}}
{{< image src="image-003-optimized-image.webp" caption="missed" width="160px" >}}
{{< /image-row >}}

날짜 셀은 `HabitMonthlyCalendarDay`를 받아 상태를 색으로 바꿀 뿐, 습관의 추적 기간이나 완료 기록을 다시 해석하지 않는다.

{{< image src="image-004-optimized-image.webp" width="360" align="center" >}}

```swift
private var backgroundColor: Color {
    switch day.state {
    case .completed: .green
    case .missed: .orange
    case .pending, .empty: .clear
    }
}

private var foregroundStyle: Color {
    switch day.state {
    case .completed, .missed: .white
    case .pending: .accentColor
    case .empty: .secondary
    }
}
```

### 월 이동은 현재 월까지만

과거 월을 보는 것은 허용하지만 아직 오지 않은 미래 월로 이동할 수는 없다. 유즈케이스가 `canMoveToNextMonth`를 계산해 반환하고, ViewModel은 그 값을 이용해 다음 버튼을 비활성화한다.

```swift
let canMoveToNextMonth = year < referenceDay.year ||
    (year == referenceDay.year && month < referenceDay.month)
```

월 이동이 발생하면 선택한 월만 바꿔 `LoadHabitMonthlyCalendarUseCase`를 다시 호출한다. 통계 전체를 다시 계산하거나 상세 화면 모델을 새로 만들 필요는 없다.

```swift
private func loadMonthlyCalendar(
    habitID: Habit.ID,
    month: LocalDay
) async throws {
    selectedHabitMonthlyCalendar = try await loadHabitMonthlyCalendarUseCase.execute(
        habitID: habitID,
        year: month.year,
        month: month.month
    )
    selectedCalendarMonth = month
}
```

## 통계 그리드 구성

### 상세 화면에서 월간 캘린더를 읽기

그리드를 어떻게 배치해야 할까 고민했고, 처음에는 단순 그리드로 했지만 Fitness를 참고했다.

{{< image-row width="fit-content" gap="1rem" >}}
{{< image src="image-005-optimized-image.webp" width="240" align="center" caption="Apple Fitness" >}}
{{< image src="image-006-optimized-image.webp" width="240" align="center" caption="Stack Day" >}}
{{< /image-row >}}

상세 화면이 열리면 `StatisticsViewModel`은 통계 데이터와 캘린더를 요청한다.

```swift
private func loadHabitStatistics(for habitID: Habit.ID) async throws {
    selectedHabitStatistics = nil
    selectedHabitMonthlyCalendar = nil
    selectedCalendarMonth = initialCalendarMonth

    let statistics = try await loadHabitStatisticsUseCase.execute(
        habitID: habitID
    )
    let calendar = try await loadHabitMonthlyCalendarUseCase.execute(
        habitID: habitID,
        year: selectedCalendarMonth.year,
        month: selectedCalendarMonth.month
    )

    selectedHabitStatistics = statistics
    selectedHabitMonthlyCalendar = calendar
}
```

통계와 캘린더는 모두 같은 습관을 대상으로 하지만 질문은 다르다. 통계는 전체 기록을 요약하고, 캘린더는 선택한 월의 각 날짜를 표현한다. ViewModel은 두 UseCase를 조합해 상세 화면에 필요한 두 읽기 모델을 준비하고, 둘 중 하나의 계산 규칙을 직접 구현하지 않는다.

## 정리

{{< image src="image-007-optimized-image.webp" width="360" align="center" >}}

처음에는 히트맵을 만드려 했는데, 캘린더가 더 나을 것 같아서, SwiftUI로 직접 캘린더를 구현했다.

`DatePicker`나 `UICalendarView`를 사용할 수 있겠지만, 커스텀이 더 자유로웠으면 좋았어서 직접 구현했는데, 이 때 한 가지 인사이트를 얻었다. "순수한 캘린더 뷰가 가능한가?"

지금 캘린더 뷰는 Stack Day의 뷰 정책을 어느 정도 안다, 특정 날짜의 상태에 따라서 색을 바꾸고, 오늘 날짜에 하이라이팅을 한다. 만약 순수한 캘린더 뷰가 되려면, 모든 동작을 클로저로 받거나 UIKit이라면 Delegate로 받아야 할 것이다.

꼭 그렇게 해야하나? 아니다. 여기서 사용하는 캘린더 뷰는 어차피 Stack Day 내부에서만 쓴다. 무조건적인 범용성을 꼭 추구할 필요는 없다. 다만 너무 특정 뷰에만 특화되면 안되겠지만... (앱 내부 다른 뷰 다른 뷰에서도 쓸 수 있으니까.)

별개로, 각 달을 이동하는 부분을 스와이프로 둘려 했는데, 현재는 굳이 그러지 않았다. 아직 디자인이 확정된 것도 아니고, 지금 있는 기능으로도 충분하다.
