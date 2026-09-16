---
title: "TIL. Sep 16, 2026"
date: 2026-09-16T23:21:54+09:00
categories:
  - TIL
series:
tags:
  - Software Architecture
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- DevBox
  - [devbox-light-server (11). DB 조회 필터링]({{< relref "posts/devbox-light-server-11-collection-filtering" >}})
- PS
  - [LeetCode 1621. Number of Sets of K Non-Overlapping Line Segments]({{< relref "ps/2026/ps-leetcode-1621-number-of-sets-of-k-non-overlapping-line-segments" >}})
  - [Programmers. 리프 노드 수 최대화]({{< relref "ps/2026/ps-programmers-리프-노드-수-최대화" >}})

## DevBox

매번 DB 전체를 요청할 수는 없으므로 필터 기능을 추가했다. MVP 완성 이후에 처음으로 추가한 기능이다.

가장 고민한 부분은 '레포지토리에 어떻게 필터 기능을 추가하느냐?' 였다 각 구현체에서 필터를 구현하는건 자유인데, 유즈케이스는 구현체가 아니라 인터페이스에 의존하니까. 

그런데 필터 기능과 조회 기능을 굳이 나눌 필요가 없다는 것을 알게 되고, 간단하게 조회에 필터 기능을 붙이는 정도로 해결했다.

`RecordStore`의 목록 조회 계약에 필터 옵션을 추가했다. 관련 부분만 보면 다음과 같다:

```ts
export type FilterValue = string | number | boolean | null;
export type RecordFilter = Record<string, FilterValue>;
export type ListRecordsOptions = {
  filter?: RecordFilter;
};

export interface RecordStore {
  list(
    collection: string,
    options?: ListRecordsOptions,
  ): Promise<StoredRecord[]>;
}
```

필터가 없으면 기존처럼 전체 목록을 조회하고, 필터가 있으면 같은 `list` 메소드에 옵션으로 전달한다.

필터 적용은 `RecordStore`가 담당하지만, 어떤 필터 형식을 HTTP로 노출할지는 Route의 책임으로 남겼다. 레포지토리 구현체를 교체해도 HTTP 파싱 규칙이 따라 들어가지 않고, 새 필터 조건도 유즈케이스에서 먼저 확인할 수 있다.

## PS

### LeetCode 1621

`n`개의 점에서 끝점을 공유할 수 있는 겹치지 않는 선분 `k`개의 배치 수를 구해야 한다. 선분에 길이 1의 패딩을 더해 끝점 공유를 겹치지 않는 배치로 바꾸고 콤비네이션으로 계산했다.

공유할 수 있는 경계를 따로 나누는 대신 배치 공간을 바꾸면 선분의 양 끝을 고르는 문제로 볼 수 있다.

### Programmers 리프 노드 수 최대화

`리프 노드 수 최대화`는 각 깊이에서 2분기 또는 3분기를 선택하는 구조로 바꿔 생각했다. 가능한 `2^a × 3^b` 조합을 열거하고, 분배 노드 제한과 리프 노드 제한을 만족하는 최댓값을 계산했다.

보고 조금 당황한 문제인데, 가질 수 있는 상태의 가지수가 적다는 것을 깨닫고, 브루트 포스로 해결할 수 있었다.
