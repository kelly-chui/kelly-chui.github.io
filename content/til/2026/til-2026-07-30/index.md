---
title: "TIL. Jul 30, 2026"
date: 2026-07-30T23:19:17+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
aliases:
  - /posts/til-2026-07-30/
---

## 오늘 한 내용

- [Codeforces 279B]({{< relref "ps/2026/ps-codeforces-279b-books" >}})
- [LeetCode 3014]({{< relref "ps/2026/ps-leetcode-3014-minimum-numbers-of-pushes-to-type-word-i" >}})
- 과거 Bicubic, Smart CCTV 프로젝트 정리
- 미방문록 회의, AGENTS 수정.

## 배운 내용

### SKILL 사용하기

프로젝트를 진행하면서 기본적인 개발 원칙은 AGENTS.md에 정리했다. 하지만 View, ViewModel, Test처럼 반복해서 만드는 코드까지 모두 AGENTS.md에 작성하는 것은 적절하지 않았다.

이런 작업은 프로젝트의 규칙이라기보다 반복 작업의 절차에 가깝기 때문이다.

예를 들어 View를 생성할 때는 ViewModel을 어떻게 주입할지, Preview를 어떻게 작성할지 등 항상 비슷한 패턴을 따른다. ViewModel이나 테스트 코드도 마찬가지다.

그래서 이러한 반복 작업은 Codex의 SKILL로 분리했다.

정리하면 역할은 다음과 같다.

- AGENTS.md: 프로젝트 전체에서 항상 지켜야 하는 규칙
- SKILL: 특정 작업을 수행하는 방법과 템플릿

이렇게 분리하니 AGENTS.md는 가볍게 유지하면서도, 반복되는 작업은 일관된 방식으로 생성할 수 있었다.

### 투 포인터 윈도우 크기와 컬렉션 원소 크기

투 포인터를 쓰면서 '단 한 개도 포함하지 못할 수 있다'를 생각해본 적이 많이 없는데, 
오늘 Codeforces 문제를 풀면서 유독 그런 생각이 들었다. 만약 컬렉션에 있는 모든 
원소의 값이 윈도우의 최대 크기보다 크다면 단 한 개의 원소도 포함할 수 없다. 그래서 
처음 한 개를 가지고 있는 초기화는 되게 위험하다.

예를 들어서 닫힌 범위고 (0, 0)으로 초기화 했다면, 윈도우 내부에 0번째 원소를 가지고 
있는 것이 되는데, 시작부터 조건에서 벗어나버릴 수 있다. 윈도우 내부의 크기가 크니까. 
시작 포인터가 커질려 할거고, 그러면 시작 포인터와 끝 포인터가 역전되어버린다.

이를 피하려면 아무것도 포함하지 않은 상태로 초기화하면 된다. 닫힌 범위라면 
`right = -1, left = 0` 처럼 역전된 상태에서 시작하는 것이다. 이렇게 하면 
첫 원소를 포함시키는 것이 루프 안에서 이루어지므로, 단 한 개도 포함 못하는 
경우도 자연스럽게 처리된다.

### Swift reduce 다양하게 활용하기.

평상시에 `reduce`를 주로 배열 속 원소들을 모두 무언가 연산 할때만 사용했는데, 좀 더 확장되어서 생각하게 되었다.

예를 들어서 다음과 같은 코드가 있으면

```swift
var frequencies = [Character: Int]()
for char in word {
    frequencies[char, default: 0] += 1
}
```

놀랍게도 `reduce(into:)`로 한줄로 처리할 수 있다.

```swift
let frequencies = word.reduce(into: [Character: Int]()) { $0[$1, default: 0] += 1 }
```

`reduce`는 초기값과 누적 클로저를 받아, 컬렉션의 원소를 하나씩 순회하며 결과를 만들어낸다. 

일반적인 `reduce`는 매번 새로운 값을 반환하는 반면, `reduce(into:)`는 누적값을 inout으로 직접 수정하기 때문에 딕셔너리나 배열처럼 복사 비용이 큰 타입을 다룰 때 더 효율적이다.

## 내일 할 것

async/await 관련 WWDC영상을 아직 보지 못했다. Behind the Scene은 봤는데, 기본 세션을 보지 않아서 놓친 부분이 있으면 더 학습해야 한다.

미방문록 프로젝트가 다시 본격적으로 시작되었다. AGENTS와 Skill을 다시 점검할 예정이다.
