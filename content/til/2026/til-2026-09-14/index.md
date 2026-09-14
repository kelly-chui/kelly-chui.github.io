---
title: "TIL. Sep 14, 2026"
date: 2026-09-14T23:26:30+09:00
categories:
  - TIL
series:
tags:
  - StackDay
  - SwiftUI
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Stack Day
  - [StackDay. 커스텀 캘린더 뷰로 통계 뷰 구성하기]({{< relref "/posts/stackday-dev-log-monthly-calendar-empty-days" >}})
  - [StackDay. JSON 파일로 로컬 저장소 만들기]({{< relref "/posts/stackday-dev-log-file-persistence-source-data" >}})
- PS
  - [Codeforces 2172M. Maximum Distance To Port]({{< relref "/ps/2026/ps-codeforces-2172m-maximum-distance-to-port" >}})
  - [LeetCode 835. Image Overlap]({{< relref "/ps/2026/ps-leetcode-835-image-overlap" >}})
  - [LeetCode 836. Rectangle Overlap]({{< relref "/ps/2026/ps-leetcode-836-rectangle-overlap" >}})
  - [프로그래머스. 구명보트]({{< relref "/ps/2026/ps-programmers-lifeboat" >}})

## StackDay

### 커스텀 캘린더 뷰

깃허브 히트맵 방식이 30일을 추적하는데 생각보다 되게 별로라서 히트맵 대신 한 달의 흐름을 바로 읽을 수 있는 커스텀 캘린더를 만들었다.

캘린더에는 날짜와 상태만 전달하고, 완료·미완료·오늘·추적 대상 아님을 판단하는 일은 유즈케이스에서 끝내도록 분리했다.

{{< image src="image-001-optimized-image.webp" align="center" width="360" >}}

레이아웃을 위한 빈칸과 실제 날짜의 `.empty` 상태도 구분했다. 전자는 달력의 7열을 맞추기 위한 플레이스홀더이고, 후자는 추적 기간 밖이거나 미래인 실제 날짜다. 화면에서 비슷해 보여도 데이터 의미와 접근성 처리가 달라진다.

### 작은 인사이트

본 포스팅에도 적어놨지만, 내가 만든 커스텀 캘린더 뷰가 `UICalendarView` 처럼 완전히 Domain-free 할 수 있을까? 그럴수야 있겠지만, 그럴 이유가 없다.

물론 통계 디테일 뷰에 완전히 붙은 코드는 아니지만, 이 캘린더 뷰는 어디까지나 Stack Day 내부에서 쓰인다. 어느 정도의 Stack Day 특유의 뷰 정책을 알고, Stack Day에서 필요한 기능만 제공한다.

굳이 모든 케이스를 대비하고 코드를 작성할 필요가 없다. 당장 패키지로 배포할 생각도 없고... 과도한 추상화보다는 앱에서 필요한 정도만 추상를 하는게 맞다는 생각이 들었다.

물론 완전히 뷰에 붙어버리면, 내부에서 재사용 하는 것도 힘들어지므로 그렇게 하진 않았다.

### 로컬 영속성

in-memory만 쓰다가 드디어 영속성 레포지토리를 `FileManager`와 JSON 기반으로 구현했다. 동시에 도메인 모델을 직접 저장하지 않도록 DTO를 따로 만들었다.

DTO를 따로 만들면서 새삼 느끼게 된게, 도메인 모델과 저장 모델은 형태가 같을 필요가 전혀 없다는 것을 직접 느끼게 되었다.

SniffMEET에서는 거의 1:1 대응이었는데, 덕분에 엄청나게 고생했지만, (개발일지에 엔티티 고치는게 따로 2편있다)

지금 필요한 규모에서는 단순하지만, 파일 손상 복구나 여러 파일의 원자적 갱신 같은 것은 아직 지원하지 않는다. FileManager를 제대로 구현하던가 (기술이 간단하다 해서 후진건 아니니까) 아니면 내가 예전부터 쓰고 싶었던 Swift Data를 쓰던가 할 것 같다. WWDC 세션부터 보고 와서.

## PS

### Codeforces 2172M

항구에서 각 노드까지의 최단 거리를 구한 뒤 물건 종류별로 가장 먼 거리를 찾아야 한다. 모든 간선의 이동 비용이 같으므로 항구에서 BFS를 수행하고, 결과를 종류별로 모아 최댓값을 구했다.

### LeetCode 835

두 이미지를 평행 이동했을 때 겹치는 1의 최대 개수를 구해야 한다. 각 이미지의 1인 좌표 쌍이 겹치기 위해 필요한 이동 벡터를 세고, 가장 자주 등장한 벡터를 선택했다.

같은 이동 벡터를 가진 좌표 쌍은 한 번의 이동으로 동시에 겹친다.

### LeetCode 836

축에 평행한 두 직사각형이 양의 넓이로 겹치는지 판단해야 한다. 겹치는 모양을 나누는 대신 한쪽이 다른 쪽의 왼쪽, 오른쪽, 위, 아래에 있어 겹치지 않는 경우를 확인했다.

경계만 닿는 경우도 넓이가 없으므로 겹치지 않는 경우에 포함한다.

### 프로그래머스: 구명보트

보트에 최대 두 명까지 탈 수 있고 무게 제한을 지키면서 필요한 보트 수를 최소화해야 한다. 몸무게를 정렬하고 가장 무거운 사람과 가장 가벼운 사람을 비교하는 투 포인터를 사용했다. (가장 가벼운 사람도 함께 탈 수 없다면, 가장 무거운 사람은 다른 누구와도 탈 수 없다.)
