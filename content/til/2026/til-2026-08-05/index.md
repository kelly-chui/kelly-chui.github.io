---
title: "TIL. Aug 5, 2026"
date: 2026-08-05T21:30:22+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘 한 내용

- [LeetCode 3310]({{< relref "ps/2026/ps-leetcode-3310-remove-methods-from-project" >}})
- [Codeforces 451B]({{< relref "ps/2026/ps-codeforces-451b-sort-the-array" >}})
- Stack day 코드 뒤엎기

## 배운 내용

### Swift BFS에서 조금 더 쉽게 큐 사용하기

Swift에서 BFS 문제를 풀 때, 대부분 함수로 분리하고, `struct Queue { ... }` 처럼 헤더 포인터 변수를 사용하는 유사 큐를 만들어서 썼다. 

```swift
struct Queue { 
    //... 
}
func bfs(start: Int) { 
    //... 
}
```

오늘 LeetCode 3310번 문제를 풀면서, 방문 체크 배열을 외부에서도 확인해야 하는 문제여서 `inout`으로 넘기기 보다는, BFS 로직을 인라인으로 쓰는 방법을 했는데, 생각해보니 큐도 그냥 BFS 로직 안에 인라인으로 쓰면 되지 않나 라는 생각이 들었다.

```swift
// before
while !queue.isEmpty { // queue는 직접 만든 Queue 타입
    // ...
}

// after
while ptr >= queue.count { // queue를 그냥 배열로 써도 된다.
    // ...
}
```

BFS만을 위한 유사 큐인데, 항상 스트럭처로 분리 해야하나 싶기도 하고, 차라리 BFS안에 녹여버리는게 코드도 더 깔끔할 것 같다. 의례적으로 `Queue`... `func bfs()`... 하던건 좀 반성해야 할 것 같다.

### Stack Day

프로젝트 코드를 한 번 뒤엎었다. 단순하게 View -> ViewModel -> UseCase -> Repository 구조로 구현하려고 했고, 빠르게 MVP를 뽑아내서 실제 동작하는 앱을 보고 싶었다.

그러다 보니까 도메인 규칙도 아직 명확하지 않고, SOLID와 추상화를 강하게 적용시켜고 하는 것 까지 시너지가 겹쳐서 코덱스가 엄청나게 타입들을 쏟아내기 시작하고, 나도 코드를 이해하지 못하는 수준까지 갔다.

Xcode가 컴파일 에러를 여러개 내고, 수정하려고 할 때 쯤, 잠시 멈춰야겠다고 생각했다. 너무 확장성과 유연함을 주문하다 보니 코드가 말도 안되게 복잡해지고 있었고, 내가 작성하는 프롬프트도 '무슨 에러가 나왔는데 해결 바람' 처럼 되고있었다.

그래서 잠시 멈추고 코덱스한테 진지하게 말했다. (지금 보니 좀 웃기다)

{{<image src="image-001-optimized-image.webp">}}

에러들과 타입들을 보면서 프로젝트가 실시간으로 망가지고 있다고  그래서 '지금 무엇이 안되었는가'를 생각했는데.

- 아직 데이터 모델이 명확하지 않다.
- 유즈케이스도 너무 대략적으로 정해놨음. (데이터 플로우가 명확하지 않음)
- 앱 내부의 용어도 애매모호함.

코드를 작성하기엔 아직 기획이 너무 추상적이었다. 그래서 코드를 갈아 엎었다. 기획을 다시 한번 확실하게 하고 제대로 문서화 해서 `docs` 디렉토리라도 만들어서 전달해야겠다.

이 과정에서 배운 점은

- 구현을 하기 전에 앱 기획부터 확실히.
- 구현 순서는 데이터 모델 -> 레포지토리 -> 뷰모델 -> 뷰 순서로... (이건 당연한거긴 한데, 직접 체감했다. 데이터 모델을 얼렁뚱땅 넘어가니 뒤가 무너진다.)

AGENTS나 SKILL은 잘 작성되어 있어서, 완전히 이상한 코드는 없었다. 너무 과도한 추상화를 요구해서 앱이 말도 안되게 어려워졌을 뿐.

## 해결 내용

### VSCode 파일 추적 문제, 맥 초기화

그저께 맥 Trash에서 파일 하나가 디스크 유틸리티나 안전 모드에서도 삭제되지 않는 문제가 있어서, 맥을 재설치 했는데 또 뭐가 꼬였는지 VSCode에서 깃이 제대로 파일 변경을 추적하지 못했다. 여러 해결방법을 시도해봤는데 안되어서 결국 맥을 재설치까진 아니더라도, 초기화했다.

맥을 초기화 하면서 다시 설치해야 할 것들을 정리했다.

- Homebrew
- 터미널 `~/.zshrc` 스크립트 복원
- IDE 설치 (Xcode, VSCode, Antigravity)
- 에이전트 설치 (Codex, Claude, Ollama)
- 기타 보조 툴 설치 (Docker, Figma, Microsoft Edge...)

OS 재설치 하면서 Apple git의 문제인가 싶어서, 몇년만에 Homebrew에서 Git을 다운받아서 설치했다. Python도 이번 기회에서 brew에서 다운받았다.

결론적으로 이제 VSCode에서 변경 추적이 매우 잘 된다. 두 번하니까 복구하기도 어렵지 않더라.

## 내일 할 것

- Stack day 도메인 규칙을 확실하게 정하자. 코드로 구현하기 전에.
- 저번에 본 effectful property 라는 주제에 대해서 글 하나 작성하기.
- 로컬 LLM 시리즈 완성하기.
- WWDC21 Protect mutable state with Swift actors 시청 후 정리하기.
- Github Actions 붙여서 블로그 배포하기
