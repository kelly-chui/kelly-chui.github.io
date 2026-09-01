---
title: "TIL. Sep 1, 2026"
date: 2026-09-01T21:31:09+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘의 기록

- StackDay
  - 보관한 Habit의 추적 기간 경계 고정
- PS
  - [LeetCode 3568]({{< relref "ps/2026/ps-leetcode-3568-minimum-moves-to-clean-the-classroom" >}})

## StackDay

### 보관한 Habit의 추적 기간 경계 고정

기존에는 보관일에 `Completion`이 있으면 그날까지, 없으면 전날까지 추적 기간으로 보는 규칙을 조회할 때마다 다시 계산했다.

문제는 기록 하나를 수정했을 뿐인데도 이미 끝난 추적 기간도 달라지게 된다는 것이다. 예를 들어 9월 10일에 완료한 뒤에 보관하고, 나중에 그 완료 기록을 취소하면 조회 로직이 추적 기간 종료일을 9월 9일로 변경시켰다.

해결을 위해서 보관할 때 보관일을 포함할지 결정하고, 마지막 추적일을 `Habit`의 `archivedOn`에 저장하도록 바꿨다.

```swift
let archiveDay = try LocalDay(date: now, timeZone: timeZone)
let effectiveArchivedOn = if try await completionRepository.fetch(
    habitID: habitID,
    completedOn: archiveDay
) != nil {
    archiveDay
} else {
    try archiveDay.addingDays(-1)
}

try habit.archive(
    on: archiveDay,
    effectiveArchivedOn: effectiveArchivedOn,
    updatedAt: now
)
try await habitRepository.update(habit)
```

`Habit`은 이 값을 `archivedOn`에 저장하고, 이후 추적 여부를 판단할 때 저장된 날짜를 기준으로 사용한다.

```swift
archivedOn = effectiveArchivedOn
```

이제는 보관일의 완료 기록을 변경해도 완료 여부만 바뀌고, 보관할 때 고정한 마지막 추적일은 바뀌지 않는다.

## PS

### LeetCode 3568. Minimum Moves to Clean the Classroom

LeetCode 3568은 모든 쓰레기를 수거하는 최소 이동 횟수를 구하는 문제였다. 

위치뿐 아니라 수거한 쓰레기의 집합과 남은 에너지에 따라 다음에 어떤 노드로 가야할지 달라지게 된다. 인접 노드간 이동 비용이 같으므로 BFS를 사용했고, 노드에 도달했을때의 상태를 `(row, col, mask, energy)`로 뒀다.
