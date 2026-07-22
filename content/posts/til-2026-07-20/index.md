---
title: "TIL. Jul 20, 2026"
date: 2026-07-20T22:18:49+09:00

categories:
  - TIL
tags:
  - Python
  - Hugo

draft: false
original: ""
---

## 키워드

- 단조 스택
- Hugo Flat Post -> Page Bundle
- 블로그 스크립트는 어떤 언어로?
- Xcode 프로젝트명 바꾸기
- SwiftUI Identity

## 내용

### LeetCode 1081, Substring, Subsequence, Monotonic Stack

[LeetCode 1081]({{< relref "posts/ps-leetcode-1081-smallest-subsequence-of-distinct-characters" >}}) 

PS 문제를 풀면서, 처음에 Medium 문제인데 좀 해맸다, LCS 두 개를 하면서 Substring이랑 Subsequence 차이를 분명히 알았는데, Substring으로 생각하고 풀어서 스택을 써야 할 곳에 투 포인터를 썼다.

단조 스택(Monotonic Stack) 문제인데, 사실 이런 스택이 있는지 오늘 처음 알았다. 그냥 스택은 스택으로 생각했으니까, 마치 Binary Search와 Parametric Search같은 느낌인가.

단조 스택은 아무렇게나 push하고 pop하는 스택이 아니라, 스택 내부가 항상 일정한 순서를 유지하도록 관리하는 스택이다. 

새로운 원소를 넣기 전에 단조성을 깨는 원소들을 pop하는 것이 핵심 로직이다. 이 문제에서는 '사전순' 이라는 조건이 단조 조건이 된다.

### 블로그 관리하기

블로그 정리가 거의 끝이 보인다, 노션에서 구석구석 숨어있는 애들이 나오긴 하지만, 대부분의 마이그레이션이 끝났다.(티스토리 비공개 포스트가 남아있긴 하다)

#### Page Bundle로 구조 변경하기

오늘은 마이그레이션보다는 블로그 구조를 좀 변경시켰다. `/content/posts/` 에는 마크다운 파일이, `/static/images/`에는 이미지가 들어가던 구조에서(찾아보니 Flat이라고 함), 하나의 폴더에 마크다운과 이미지가 동시에 들어있는 방식(Page Bundle이라고 함)으로 바꿨다.

![](image-001-optimized-image.webp#center)
{ width="480" }

장점은 크게 두개인데, 첫 번째로 포스트와 이미지가 너무 다른 경로라서 일관성을 유지하기 힘든 문제가 사라졌다. 파일명만 바꾸려고 하면, `/static/images/`에 있는 폴더도 똑같이 파일명을 바꿔야 했고, 이때 몇개 놓쳐서 이미지 일관성이 몇번 깨졌었다. Page Bundle 방식으로는 같은 디렉토리 안에 마크다운과 이미지가 동시에 들어있어서 그럴 가능성이 많이 줄어든다.

![](image-002-optimized-image.webp#center)
{ width="480" }

두 번째로는 VSCode에서 미리보기 할때, 이미지가 제대로 로드된다. Hugo에서 `static` 파일명은 때고 써서, VSCode에서 제대로 이미지 경로를 잡지 못해 프리뷰에서 이미지가 다 깨져서 나왔는데, 이제 미리보기할 때 이미지가 제대로 나온다.

#### 자동화 스크립트 언어 정하고 작성하기

블로그에서 자동화 스크립트도 몇개 작성했는데, 후보군을 몇 개 적어놓고 분석했다.

- Python
  - 장점: 가장 일반적인 자동화 스크립트, 이미지 처리 강함
  - 단점: 지금 Hugo 프로젝트에 새로운 Python 의존성이 생김
- TypeScript
  - 장점: 이미 블로그에 Node 의존성이 존재함, 최근에 Express 짜면서 좀 흥미롭게 본 언어
  - 단점: 자동화 스크립트로 좋은지 의문점이 좀 듦
- Shell: 분위기는 있어보일것 같은데 이미지 처리가 힘들다. Mac에서는 뭐 있었던 것 같은데, 아무래도 스크립트는 일반 리눅스 기준으로 짜야한다.

결론은 TypeScript로 정했다. 좀 하다가 별로인 것 같으면 Python으로 바꾸면 되니까...

스크립트를 이용해서 Flat -> Page Bundle 방식으로 변환했고, 이미지 정합성 확인 부분도 추가했다.

### Xcode 프로젝트명 변경

![](image-003-optimized-image.webp#center)
{ width="480" }

StackDay 프로젝트의 Xcode 프로젝트 명이 stack-day였다. 케밥 케이스를 자주 쓰는 편이긴 한데, Git이나 마크다운 파일명에서나 쓰고 프로젝트명까지 쓰는건 좀 아닌 것 같아서 StackDay 처럼 카멜 케이스로 바꿨다.

### SwiftUI Identity

WWDC를 다시 보고 정리하려고 했고, 처음에 볼 것으로 Demystify SwiftUI를 정했다. 다 보진 않았고, Identity 부분은 다 봤는데, 마치 새로 본 것 처럼 느껴졌다. 조금 더 알게 되어서 그런걸까.

일단 View Builder 자체가 일종의 DSL이라는 사실, 그리고 Opaque 타입에 대해서 안 이후에 본 것이라, 처음에 봤을 때에 비해 느낌이 꽤 달랐다. 이번에 보면서 가장 신기한건 Structural Identity, 제네릭과 그 구조 자체만으로 View를 구분할 수 있다는 것이 가장 새롭게 느껴졌다.

[Demystify SwiftUI 정리 노트 1]({{< relref "posts/ios-swiftui-wwdc-demystify-swiftui-1" >}}) 

이전처럼 세션을 보면서 중간에 든 의문은 Note에 적고, 다 끝난 후에 다시 그 부분으로 돌아가서 공부하는 방식으로 정리했다.

## 다음에 할 것

- Demystify SwiftUI WWDC 세션 마무리하기. (다음은 Discover Observation in SwiftUI)
- dayStack 아키텍처 결정하기.
- Swift 문법에 맞게 하이라이팅이 제대로 될 수 있도록, 블로그 코드블록 정리하기
