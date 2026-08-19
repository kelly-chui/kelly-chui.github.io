---
title: "TIL. Aug 16, 2026"
date: 2026-08-16T23:30:00+09:00

categories:
series:
tags:
  - Domain Modeling
  - Persistence

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [Codeforces 1360D. Buying Shovels]({{< relref "ps/2026/ps-codeforces-1360d-buying-shovels" >}})
- Stack Day
  - `CancelCompletionUseCase`, `ArchiveHabitUseCase`, `DeleteHabitUseCase` 구현
  - 완료 기록 삭제 테스트와 공통 테스트 Repository 정리
  - [StackDay. 완료 기록을 취소할 때 무엇을 삭제해야 할까]({{< relref "posts/stackday-dev-log-completion-identity" >}})

### in-memory Repository와 테스트 용도 Repository

프로덕션의 In-Memory Repository는 실제 저장 상태를 다루고, 테스트용 Repository는 호출과 오류를 관찰하는 Test Double이다. 같은 형태로 보이더라도 목적이 달라 분리했다.

### 조회 조건과 Entity ID

현재는 하나의 Habit에 하루 한 번만 완료를 기록하지만, `(habitID, completedOn)`은 현재 정책에서 사용하는 조회 조건일 뿐 Entity의 identity는 아니다. 나중에 하루에 여러 번 기록할 수 있게 되면 같은 조합으로도 여러 Completion이 존재할 수 있기 때문이다.

따라서 날짜 조건으로 Completion을 먼저 찾고, 실제 삭제는 `Completion.ID`로 수행하도록 Repository 계약을 나눴다. 조회에 사용하는 값과 기록 자체를 식별하는 값은 서로 다른 의미를 가진다.

### 없는 기록을 취소하는 경우

완료 기록이 없는데 취소 요청이 들어오면 성공으로 넘길 수도 있지만, 현재는 `notCompleted` 오류를 반환하기로 했다. 취소할 대상이 없다는 것은 화면 상태와 저장된 상태가 어긋났을 가능성을 알려주는 편이 더 유용하다고 판단했다.

자세한 구현 과정은 [개발일지]({{< relref "posts/stackday-dev-log-completion-identity" >}})에 정리했다.

## 다음에 할 것

- Swift Concurrency WWDC 세션 정리
- StackDay의 날짜 모델과 시간 처리 방식 정리
