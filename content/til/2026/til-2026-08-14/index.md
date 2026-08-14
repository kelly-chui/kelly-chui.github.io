---
title: "TIL. Aug 14, 2026"
date: 2026-08-14T23:30:00+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘 한 내용

- PS
  - [Codeforces 550A. Two Substrings]({{< relref "ps/2026/ps-codeforces-550a-two-substrings" >}})
  - [LeetCode 3090. Maximum Length Substring With Two Occurrences]({{< relref "ps/2026/ps-leetcode-3090-maximum-length-substring-with-two-occurrences" >}})
- Stack Day
  - `HabitRepository`, `CompletionRepository` 인터페이스 추가
  - `CreateHabitUseCase`와 `RecordCompletionUseCase` 구현
  - [StackDay. UseCase와 Entity는 각각 어디까지 책임져야 할까]({{< relref "posts/stackday-dev-log-usecase-entity-responsibilities" >}})
  - [StackDay. Repository의 save를 insert와 update로 나눈 이유]({{< relref "posts/stackday-dev-log-repository-contracts" >}})

## 배운 내용

### UseCase와 Entity의 책임

`CreateHabitUseCase`와 `RecordCompletionUseCase`를 구현하면서, Entity가 스스로 유효한 상태를 보장하고 UseCase는 객체를 조합해 작업 흐름을 만드는 쪽으로 책임을 나눴다.

이름 정규화와 유효성 검증은 `Habit`에, 저장 순서와 중복 확인은 UseCase에 뒀다. 자세한 고민은 [개발일지]({{< relref "posts/stackday-dev-log-usecase-entity-responsibilities" >}})에 정리했다.

### Repository 계약

`save` 하나로 삽입과 갱신을 처리하면 Create와 Update가 기대하는 실패 조건이 흐려진다. 그래서 `HabitRepository`는 `insert`와 `update`를 구분하고, `Habit.ID`로 도메인의 식별자 의미를 드러내도록 했다. 자세한 내용은 [개발일지]({{< relref "posts/stackday-dev-log-repository-contracts" >}})에 정리했다.

### Substring, Subsequence, Subarray의 차이

LIS나 LCS같은 알고리즘에서도 마찬가지고, PS 하다 보면 이 3개는 개념이 다르다는 것을 알 수 있다.

문제에서 주어진 예시나 조건을 기준으로 생각하게 되어서 딱히 크게 구분짓지 않았는데, (문제 푸는건 달라져도 그냥 서로 매칭해서 생각하지 않았다.) 이번에 Subseqeunce를 Substring으로 착각하고 풀어서 풀이를 한번 뒤엎었다.

생각난 김에서 한번 제대로 정리했다. 일반적으로 Substring과 Subsequence는 크게 구분하지 않는 느낌이다.

- Substring: 문자열에서 연속된 일부
- Subarray: 배열에서 연속된 일부
- Subsequence: 기존 순서를 유지하면서 일부 원소를 선택한 것. 연속될 필요는 없다.

예를 들어 `"ABCDE"`에서 `"BCD"`는 Substring이면서 Subsequence지만, `"ACE"`는 Subsequence일 뿐 Substring은 아니다.
