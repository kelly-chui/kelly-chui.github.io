---
title: "TIL. Aug 17, 2026"
date: 2026-08-17T23:30:00+09:00
categories:
  - TIL
tags:
  - Swift
  - Architecture
draft: false
---

## 오늘 한 내용

- PS
  - [LeetCode 1563. Stone Game V]({{< relref "ps/2026/ps-leetcode-1563-stone-game-v" >}})
- WWDC
  - [Swift Concurrency. Explore Structured Concurrency in Swift (2) - WWDC21]({{< relref "posts/wwdc-swift-concurrency-explore-structured-concurrency-in-swift-2" >}})
- 마이그레이션
  - [Algorithm. Kadane's Algorithm]({{< relref "posts/cs-algorithm-kadanes-algorithm" >}}) 마이그레이션
  - [미방문록. 대표 색상 추출 Picker 만들기]({{< relref "posts/mibangmurok-dev-log-colorpicker" >}}) 마이그레이션

## 배운 내용

### Unstructured Task

WWDC21 Explore Structured Concurrency in Swift 세션을 정리를 마무리했다. 

1편과 다르게 구조화된 task tree에 속하지 않는 unstructured task와 detached task를 정리했다.

`Task { ... }`로 만든 unstructured task는 생성한 scope가 끝나도 계속 실행될 수 있다. 생성 지점의 actor, priority, task-local value를 상속한다.

`Task.detached`는 생성한 문맥을 상속하지 않고 완전히 독립해서 실행된다. 가장 중요한건 액터가 상속되지 않는다는 것 같다. UI 작업이 아닌데 메인 액터를 상속받을 필요가 없으니까.

### LeetCode 1563. Stone Game V

돌이 일렬로 놓여 있고, 현재 구간을 둘로 나눈 뒤 두 부분의 합 중 작은 쪽을 선택하는 게임이다. Alice가 얻을 수 있는 최대 점수를 구하는 문제라서 구간 DP로 접근했다.

반복문으로도 풀 수 있는 문제긴 한데, 재귀가 좀 더 자연스러워서 재귀로 풀었다.

## 해결한 내용

### 마이그레이션

티스토리 비공개 포스트나 노션 구석에 숨어있던 글들이 아직 다 마이그레이션 되지 않았다.

특히 미방문록 개발일지가 심한데, 너무 파편화가 심하고(팀 노션과 개인 노션에, Note 심지어는 맥북 스티키에 나눠져있다.) 프로젝트가 중간에 몇번 멈췄어서 앱 진척도 자체도 크게 높지 않다.

티스토리 비공개 포스트에선 카데인 알고리즘 관련 글하나와 개인 노션에서 미방문록 PoC 개발일지 하나를 마이그레이션 했다.

카데인 알고리즘은 글이 90%쯤 써진 상태로 완성되지 않은 상태라서, 완성시키는 김에 공부도 했다... 요즘 부쩍 '구간'에 관련된 코드들을 많이 보는 것 같다.

## 내일 할 것

- StackDay의 날짜 모델과 시간 처리 방식 정리
- `LocalDay`와 `Clock` 적용
