---
title: "TIL. Sep 3, 2026"
date: 2026-09-03T23:13:35+09:00

categories:
  - TIL
series:
tags:
  - StackDay

draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. Daily List의 Detail View 만들기]({{< relref "posts/stackday-dev-log-daily-list-detail-view" >}})
- PS
  - [LeetCode 3876]({{< relref "ps/2026/ps-leetcode-3876-construct-uniform-parity-array-ii" >}})

## Stack Day

### 디테일 뷰

데이 뷰의 리스트는 특정 날짜에 보일 상태인 `HabitEntry`로 유지하고, 디테일 화면을 열 때만 `habitID`로 `Habit`을 다시 조회하도록 했다. 

리스트에 필요한 완료 상태와 디테일에 필요한 이름과 추적 기간은 서로 다른 관심사라서, `HabitEntry`에 상세 정보를 계속 추가하지 않는 편이 자연스러웠다.

디테일 화면에서는 완료 상태를 바꾸는 기준 날짜와 Habit 자체를 수정하는 동작을 분리했다.

### 디자인 맞추기

디테일 뷰와 생성 뷰의 디자인을 좀 맞췄다:

{{< image-row gap="1rem" >}}
{{< image src="image-001-optimized-image.webp" caption="디테일" width="240px" >}}
{{< image src="image-002-optimized-image.webp" caption="생성" width="240px" >}}
{{< /image-row >}}

생성 뷰에는 굳이 현재 지원 안하는 항목들을 넣지 않았는데, 넣기 시작하면 디테일 뷰랑 크게 다를것 같지 않다. 실제로 디테일 뷰에서 편집 작업도 지원하고.

그래서 그냥 하나로 합칠까? 라는 유혹이 좀 생겼는데, 일단 목적과 도달하는 경로 자체가 다르다. 잘못된 추상화가 되어서 나중에 분기 지옥이 될 것 같다는 생각이 강하게 들어서 분리한 상태로 두었다.

## PS

### LeetCode 3876

각 원소를 그대로 쓰거나 더 작은 원소를 빼서 양수를 유지하면서 홀짝을 통일해야 한다. 가장 작은 홀수와 짝수들의 크기를 비교해 가능한지 판단했다.

가장 작은 홀수는 더 작은 홀수를 빼서 짝수로 만들 수 없다. 따라서 홀수가 있다면 홀수로 통일해야 하고, 모든 짝수는 그 홀수보다 커야 한다.
