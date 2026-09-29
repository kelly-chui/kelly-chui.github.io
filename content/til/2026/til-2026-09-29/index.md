---
title: "TIL. Sep 29, 2026"
date: 2026-09-29T22:21:32+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - Swift Concurrency
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. 빠른 날짜 변경과 중복 완료 탭 처리하기]({{< relref "posts/stackday-dev-log-daily-async-interactions" >}})

## Stack Day

### 조회와 변경 상태를 이뉴머레이션으로 표현하기

어제 완료 기록을 저장하는 동안 날짜 조회가 먼저 끝나 입력 잠금이 풀리는 문제를 막기 위해, 조회와 변경 상태를 `isEntriesLoading`, `isPerformingMutation`으로 나눴다.

그런데 단순 플래그로 상태를 나타내는 것이 부족하다고 판단했다. '로딩 중'과 '변경 중' 뿐만 아니라, 로딩이 성공했는지 혹은 실패했는지. 이런 상태들은 플래그로 나타내기가 어렵다. 그래서 `LoadState`와 `MutationState`로 표현했다.

```swift
enum LoadState: Equatable {
    case idle
    case loading
    case loaded
    case failed
}

enum MutationState: Equatable {
    case idle
    case performing

    var isPerforming: Bool {
        if case .performing = self {
            return true
        }
        return false
    }
}
```

`DailyEntriesViewModel`은 각 상태를 따로 보관하고, 입력 잠금은 두 상태로 계산한다:

```swift
private(set) var entriesLoadState: LoadState = .idle
private(set) var mutationState: MutationState = .idle

var isEntryInteractionLocked: Bool {
    entriesLoadState == .loading || mutationState.isPerforming
}
```

엔트리를 불러오는 태스크와 엔트리 상태 변경 태스크는 서로 동시에 진행해도 되므로 별도의 상태로 유지하고, 둘 중 하나가 진행 중일 때 목록 입력을 잠그는 규칙도 유지했다. 조회가 실패하면 실패 상태를 표시하고 다시 시도할 수 있도록 했다.

### 불러온 엔트리의 날짜와 취소 상태 보존하기

예를 들어 9월 28일 엔트리를 보고 있다가 27일로 이동했는데 조회가 실패하면, 이전에 불러온 28일 엔트리가 메모리에 남아 있을 수 있다. `selectedDay`는 27일인데 28일의 엔트리를 27일의 조회 결과처럼 표시하면 안 된다.

그래서 엔트리와 조회한 날짜를 `DailyEntriesContent`로 함께 보관하고, `DailyEntriesView`에서 `loadedContent.day`가 `selectedDay`와 일치하는지 확인하도록 했다.

`DailyHabitDetailViewModel`, `HabitStatisticsDetailViewModel`, `StatisticsViewModel`에서는 조회가 취소됐을 때 로딩 상태를 `.failed`로 바꾸는 대신, 조회 전에 저장한 `previousLoadState`로 복원하도록 했다.
