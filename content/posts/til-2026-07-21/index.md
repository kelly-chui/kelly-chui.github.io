---
title: "TIL. Jul 21, 2026"
date: 2026-07-21T23:59:22+09:00

categories:
  - TIL
series:
tags:
  - 
  - Hugo

draft: false
original: ""
---

## 키워드

- Codeforces 가입
- 로컬 LLM opencode에 연결하고 ACP로 Xcode에 연동하기
- SwiftUI WWDC 세션, 특히 View Value와 View Identity

## 내용

### PS 풀기, Codeforces 가입

LeetCode에서만 문제를 푸는게 조금 시야가 좁아지나 싶어서, Codeforces에 가입했다. Swift 지원이 없지만, PS 문제를 풀 때 특정 언어에 종속되지 않으려고 꾸준히 Swift, Python, C++를 돌아가면서 풀고 있으니 큰 문제는 없다.

가장 풀이 수가 많은 문제 하나를 풀었다. 매일 LeetCode 오늘의 문제를 푸는 것이 루틴 중 하나인데, Codeforces, 삼성 SW Expert Academy 등 온라인 저지 사이트 여럿 돌아다니면서 풀어보려 한다. BOJ가 사라진 이후로 LeetCode 의존이 꽤 심해졌는데, 다양하게 풀어봐야겠다.

### 로컬 LLM Opencode에 연결하고 ACP로 Xcode에 연동하기

블로그에 로컬 LLM으로 개발 환경 구축하는 글들을 몇개 쓰고 있는데, Ollama에서 모델을 받아와 Xcode에서 연동하는 것이 목표였다. 이 과정에서 Xcode의 AI 연동에 대해서 알게된 것이 있는데,

- Xcode에서는 Agent와 Chat을 구분한다. (AGENTS는 프로젝트를 전반적으로 읽고 수정할 수 있는 권한이 있고, Chat은 제안만 한다.)
- Xcode 자체적으로 AI 서비스를 오케스트레이션 하는 능력은 없다.
- 그래서 Xcode에서는 ACP라는 독자 규격으로 외부 서비스를 끌어와서 사용한다. 연동 난이도는 매우 쉬운 편이다.

그리고 Opencode라는 오케스트레이터에 대해 알게되었다. Codex나 Claude Code 같은 코딩 에이전트와 같은데 도커로 내려받을 수도 있고, Ollama와 연동도 쉽다.

그래서 Ollama 모델 -> Opencode와 연동 -> Xcode와 연동 순서대로 했는데, 자주 쓰던 qwen 2.5 coder 7B 모델은 VSCode에서부터 종종 보여주던 도구 호출부터 제대로 못하는 모습을 그대로 보여주고, gemma4는 Context 사이즈가 작으니 삽입된 rule에 너무 끌려가는 느낌이 들었다. 그렇다고 Context 사이즈를 늘리니까 답변 하나를 하는데 4분이 걸렸다.

소득이 없는건 아닌데, 우선 Opencode의 무료 cloud 모델인 big-pickle의 성능이 괜찮았다. 나중에 SwiftUI 앱 구조 이리저리 실험해볼 장난감 앱을 big-pickle로 순식간에 만들었다.

![](image-001.gif#center)
{ width = "240" }

포스트를 다 작성하진 못했다, 중간에 시행 착오도 꽤 많았고, 스크린샷도 많아서 정리하는데 시간이 좀 들 듯 하다.

### SwiftUI View의 Lifetime

어제 보던 WWDC 세션을 이어서 봤는데, 중간에 이해가 되지 않는 부분이 있었고, 더 찾아보고 공부하니 개념들이 이어지는 느낌이 들었다.

- Data Identity와 View Identity의 연결점
- View 인스턴스는 계속 생성되고 사라지는건 맞는데 `State`가 왜 꼭 필요해? 그냥 '상속' 해버리면 되잖아.
- 왜 `Equable`이 아니라 `Hashable`을 요구하나?

우선 UIKit스러운 마인드를 버려야 했다. SwiftUI에선 UIKit처럼 하나의 인스턴스가 쭉 가는게 아닌, 일회용이다. 값 타입이기도 하고. 그러면 이 View 인스턴스가 계속해서 사라지고 생성되는데, 그러면 'View'의 연속성은 어떻게 지킬 것인가? 그게 바로 Identity다... 여기까지가 어제 본 내용이고

오늘은 Identity가 왜 View의 Lifetime을 결정하는지에 대해 봤는데, SwiftUI에서 'View'의 정체성이란 메모리에 있는 인스턴스가 아니라 'Identity' 인걸 알았으니, 어떻게 보면 당연한 이야기다.

계속 든 생각은 `@State`를 쓰지 말고 그냥 이전 View Value가 새 View Value에 데이터를 전달하면 되지 않을까? 였다. SwiftUI의 구조에 대한 기본 이해가 낮아서 든 의문인데, 이전 View Value는 상태 저장소가 아니라 비교용 재료에 가깝다. SwiftUI가 이전 값을 잠깐 보관하는 이유는 새 값과 비교해서 실제 화면에 어떤 변경을 적용할지 판단하기 위해서이지, 다음 View Value에 상태를 물려주기 위해서가 아니다. (즉 SwiftUI의 기본 모델을 부정하는 말이다...)

SwiftUI에서 View Value는 상태를 물려받는 객체가 아니라, 현재 상태와 데이터로부터 새로 만들어지는 일회용이다. 유지되어야 하는 값은 View Value가 아니라 View Identity에 연결된 저장소, 즉 `@State`나 `@StateObject`에 둔다.

하나더, View Identity에 `Hashable`을 요구하는건 성능상 중요하다. List같이 여러 뷰들이 있을때 비교를 해야하는데, 만약 `Equatable`이었으면 비교야 가능하지만, $O(n)$ 시간이 걸린다. `Hashable`이면 해시 테이블 처리가 가능해서 $O(1)$ 시간에 처리가 가능하다.

## 다음에 할 것

- WWDC 21세션 Dependency까지 보고 마무리하기
- StackDay 아키텍처 정하기
- 로컬 LLM 연동 및 정리 완료하기
- 아직 남아있는 마이그레이션 완료하기...
