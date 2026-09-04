---
title: "StackDay. 보관과 복원을 추적 구간으로 모델링하기"
date: 2026-09-04T21:46:28+09:00

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

기존 코드에서는 보관일의 마지막 추적일을 고정한 뒤에는 `Habit`의 생명주기를 다음처럼 표현할 수 있었다.

```swift
struct Habit {
    let startedOn: LocalDay
    private(set) var archivedOn: LocalDay?
}
```

`archivedOn == nil`이면 보관된 날짜가 없으므로 현재 활성화 되어있는 `Habit`이고, 값이 있으면 보관된 `Habit`이다.

하지만 MVP 스코프 안에 있는 '보관했다가 재개하기'와 정면으로 충돌하는 코드다. `archiveOn = nil` 하면 될 것 같지만, 이전에 정한 정책에서 '보관되어 있는 동안에는 통계 계산을 하지 않음'이 있다.

그러면 '보관되어 있는 기간'을 어떻게든 알아내야 하는데, `archiveOn`이라는 값으로는 과거의 상태를 표현할 수 없다.

따라서 `archivedOn`을 없애고, `Habit`이 실제로 추적 중이었던 구간들을 `TrackingPeriod`로 갖도록 바꿨다.

## archiveOn 덮어씀 문제

예를 들어 9월 1일에 습관을 만들고, 9월 10일에 보관한 뒤, 9월 20일에 다시 시작한다고 하자.

```text
9월 1일 - 9월 10일: 추적
9월 11일 - 9월 19일: 중단
9월 20일 - 현재: 추적
```

기존 모델에서 복원은 `archivedOn`을 다시 `nil`로 바꾸는 동작이 된다.

```text
startedOn: 9월 1일
archivedOn: nil
```

그러면 `Habit`은 현재 추적 중이라는 사실은 표현하지만, 9월 11일부터 19일까지는 추적하지 않았다는 이력을 잃는다.  그러면 통계에서는 '추적중이지 않았던 날짜'를 '추적중이었는데 누락된 날짜'로 본다. 

마찬가지로, 보관중인 기간에는 `Completion`을 새로 기록하는 것도 막아야 하는데 이것도 불가능하다.

## 추적기간을 구간으로 표현하기

따라서 추적 중인 구간을 따로 저장하기 위해서 `TrackingPeriod`라는 스트럭처를 만들었다:

```swift
struct TrackingPeriod: Equatable {
    let startedOn: LocalDay
    private(set) var endedOn: LocalDay?

    func contains(_ day: LocalDay) -> Bool {
        day >= startedOn && (endedOn.map { day <= $0 } ?? true)
    }
}
```

시작일은 항상 명확하게 존재하지만, 열린 기간(추적중인 기간)에는 종료일이 존재하지 않으므로 옵셔널 타입이 된다.

```text
Habit
└─ trackingPeriods
   ├─ 9월 1일 ~ 9월 10일
   └─ 9월 20일 ~ 진행 중
```

처음에는 `TrackingPeriod`를 `Completion`처럼 `Habit` 외부에서 별도로 관리하는 방법을 생각했다.

하지만 `TrackingPeriod`는 독립적으로 생성·수정·삭제되는 데이터가 아니다. `Habit`을 만들 때 시작되고, 보관할 때 닫히며, 복원할 때 다시 열리거나 새 기간이 추가된다. 

기간의 유효성도 다른 기간과의 관계 안에서만 판단할 수 있기 때문에 `TrackingPeriod`는 `Habit`의 생명주기를 표현하는 내부 값으로 뒀다. 

물론 DTO가 어떤 구조를 갖는지는 별개의 문제라서(도메인 구조와 DB 구조는 서로 알 필요가 없으니까) `TrackingPeriodRepository`를 만들 수도 있지만, `TrackingPeriod`만 필요한 경우가 거의 없기 때문에, 이것도 따로 작성하진 않았다.

반면 `Completion`은 기록과 취소라는 독립적인 동작이 있다. 날짜별·Habit별 조회가 필요하다. 앞으로 데이 뷰나 통계에서 날짜 기준으로 완료 기록을 읽게 될 가능성도 있으므로 별도 레포지토리로 두는 편이 더 자연스럽다.

## 새로운 아카이빙, 언아카이빙 로직

이제 아카이빙은 `archiveOn`을 변경시키는 동작이 아니라, `TrackingPeriod` 배열에서 마지막 열린 구간을 닫는 동작이 된다.

```swift
guard var period = trackingPeriods.last, period.endedOn == nil else {
    throw HabitError.alreadyArchived
}

if effectiveArchivedOn < period.startedOn {
    trackingPeriods.removeLast()
} else {
    try period.end(on: effectiveArchivedOn)
    trackingPeriods[trackingPeriods.count - 1] = period
}
```

복원할 때는 마지막 기간과 새 시작일 사이에 실제로 중단한 날짜가 있는지를 먼저 본다.

```swift
let dayAfterEnd = try endedOn.addingDays(1)

if day <= dayAfterEnd {
    try lastPeriod.reopen()
    trackingPeriods[trackingPeriods.count - 1] = lastPeriod
} else {
    trackingPeriods.append(try TrackingPeriod(startedOn: day))
}
```

기간이 9월 10일에 끝났고 9월 11일에 복원한다면, 9월 11일은 바로 다음 날이다. 중단한 날짜가 없으므로 새 기간을 추가하지 않고 기존 기간을 다시 연다.

```text
9월 1일 - 9월 10일
9월 11일에 복원
        ↓
9월 1일 - 진행 중
```

반대로 9월 20일에 복원한다면 9월 11일부터 19일까지 실제로 제외된 날짜가 있다. 이때만 새 기간을 시작한다.

```text
9월 1일 - 9월 10일
9월 20일 - 진행 중
```

같은 날 보관과 복원을 반복해도 기간이 불필요하게 쌓이지 않는 이유도 같다. 기간 사이에 제외된 날짜가 없다면, 이력으로 남길 중단 자체가 없었다.

## 엣지 케이스 처리

단순한 `archiveOn`말고, 구간으로 처리를 하므로, 구간 겹침과 같은 엣지 케이스들이 생긴다.

### 빈 추적 기간을 남기지 않기

먼저 `TrackingPeriod`는 종료일이 시작일보다 앞설 수 없다. 

실제로 가능한 케이스인가 싶지만, 현재 추적 종료 정책을 적용하면 시작한 당일에 완료하지 않고 보관하면 마지막 추적일이 시작일보다 앞서게 된다.

이때는 빈 기간을 남기지 않고, 막 만든 마지막 기간을 제거한다. Habit은 유효하지만 아직 추적한 날짜가 없는 보관 상태가 된다.

```swift
if effectiveArchivedOn < period.startedOn {
    trackingPeriods.removeLast()
}
```

### 현재 열린 기간보다 앞선 날짜로 보관하지 않기

보관 가능한 가장 이른 날짜도 `Habit`의 최초 시작일이 아니라 현재 열린 기간의 시작일을 기준으로 확인해야 한다.

```swift
guard archiveActionDay >= period.startedOn else {
    throw HabitError.archiveBeforeCurrentTrackingPeriod
}
```

예전에 보관했다가 다시 시작한 `Habit`에서, 과거 기간보다 이른 날짜로 현재 기간을 닫으려 하면 열린 기간을 통째로 잃을 수 있다. 

정상적인 화면 흐름에서는 현재 날짜만 보관에 사용하지만, 도메인 모델의 동작은 잘못된 입력에도 이력을 훼손하면 안 된다.

### 같은 이력은 하나의 배열 형태로만 표현하기

아래 두 기간은 겹치지 않지만, 실제로는 중단한 날짜가 없는 같은 이력이다:

```text
9월 1일 - 9월 7일
9월 8일 - 진행중
```

그래서 `Habit`을 만들 때 앞선 기간의 다음 날보다 이후 기간의 시작일이 반드시 더 뒤인지 검증한다.

```swift
let dayAfterEnd = try endedOn.addingDays(1)
guard dayAfterEnd < nextStart else {
    throw HabitError.invalidTrackingPeriods
}
```

이 검증은 인접한 기간과 겹치는 기간을 모두 막는다. 모델이 같은 추적 이력을 여러 배열 형태로 허용하면, 이후 상세 표시·통계·동등성 비교와 저장 형식이 모두 불필요하게 복잡해진다.

`trackingPeriods`가 유일한 이력이 되면서, Habit의 상태도 배열에서 계산할 수 있다.

```swift
var isArchived: Bool {
    trackingPeriods.isEmpty || trackingPeriods.last?.endedOn != nil
}

func isTracked(on targetDate: LocalDay) -> Bool {
    trackingPeriods.contains { $0.contains(targetDate) }
}
```

## 정리

`archivedOn`은 Habit이 지금 보관되었는지는 표현할 수 있었지만, 언제 추적을 멈췄고 다시 시작했는지는 표현할 수 없었다.

그래서 보관과 복원을 상태 전환으로 다루는 대신, Habit이 추적했던 날짜 구간을 `TrackingPeriod` 이력으로 갖도록 바꿨다. 

보관은 열린 기간을 닫고, 복원은 중단한 날짜가 있을 때만 새 기간을 만든다. 이제 Day 조회·Completion 변경·통계는 모두 같은 기간 이력을 기준으로 동작한다. 

특정일 조회는 기간 안의 날짜에만 `HabitEntry`를 만들고, `Completion` 변경은 기간 밖 날짜를 거절하며, 통계는 기간 안의 날짜만 추적 가능 일수와 스트릭에 포함해야 한다.

보관한 `Habit`의 과거 기록은 여전히 수정할 수 있다. 다만 어느 기간에도 속하지 않는 중단한 날짜에는 새 기록을 만들 수 없다. 

보관과 복원을 반복해도 중단한 날짜는 습관을 하지 못한 날로 세지지 않고, 실제로 추적했던 기간만 통계에 남는다.

별개로 이번에 다시 확인한 점은 도메인 모델과 데이터베이스나 파일의 저장 형태가 같을 이유는 없다는 것이다. `TrackingPeriod`가 `Habit` 내부 값이라는 사실은 `Habit`의 생명주기와 규칙을 표현하기 위한 선택이다. 

영속화할 때는 DTO와 레포지토리가 필요한 형태로 나눠 저장할 수 있고, 그 저장 구조가 도메인 모델을 결정할 필요는 없다. (레포지토리를 따로 분리하진 않았지만)
