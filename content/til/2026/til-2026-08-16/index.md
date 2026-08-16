---
title: "TIL. Aug 16, 2026"
date: 2026-08-16T23:30:00+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘 한 내용

- PS
  - [Codeforces 1360D. Buying Shovels]({{< relref "ps/2026/ps-codeforces-1360d-buying-shovels" >}})
- Stack Day
  - `CancelCompletionUseCase`, `ArchiveHabitUseCase`, `DeleteHabitUseCase` 구현
  - 완료 기록 삭제 테스트와 공통 테스트 Repository 정리
  - [StackDay. 완료 기록을 취소할 때 무엇을 삭제해야 할까]({{< relref "posts/stackday-dev-log-completion-identity" >}})

## 배운 내용

### in-memory Repository와 테스트 용도 Repository

프로덕션의 In-Memory Repository는 실제 저장 상태를 다루고, 테스트용 Repository는 호출과 오류를 관찰하는 Test Double이다. 같은 형태로 보이더라도 목적이 달라 분리했다.

### ID와 Business Key

`Completion.ID`는 기록 자체를 식별하고, `(habitID, completedOn)`은 현재 정책에서 해당 날짜의 기록을 찾는 조건으로 분리했다. 없는 기록 취소를 성공으로 넘기지 않은 이유까지 [개발일지]({{< relref "posts/stackday-dev-log-completion-identity" >}})에 정리했다.
