---
title: "SniffMEET. 여러 VIPER 구현에서 Router 구조 비교하기"
date: 2024-11-12

categories:
  - SniffMEET
series: []
tags:
  - iOS
  - Router
  - Software Architecture
  - VIPER

draft: false
original: "notion-export/블로그 이관/SniffMEET/코드 분석 0e9ade8f376582259cc301bb7d6558a3.md"
---

VIPER에서 Router가 화면 전환을 담당한다는 원칙은 분명하다. 하지만 현재 화면을 어떻게 참조하는지, 다음 모듈은 누가 만드는지, AppRouter가 반드시 필요한지는 구현마다 달랐다.

SniffMEET의 화면 구조를 정하기 전에 여러 VIPER 프로젝트를 비교하며 Router의 책임 범위를 확인했다.

## 무엇을 확인했나

분석 기준은 다음 세 가지였다.

- Router가 현재 ViewController를 어떻게 참조하는가
- 화면 전환 시 다음 VIPER 모듈을 누가 조립하는가
- 여러 모듈에 걸친 전환을 AppRouter가 담당하는가

## 구현 비교

| 구현 | 모듈 조립 | 화면 전환 | AppRouter |
| --- | --- | --- | --- |
| [iOS-Viper-Architecture](https://github.com/amitshekhariitbhu/iOS-Viper-Architecture) | WireFrame의 정적 메서드 | 출발 View를 인자로 전달 | 없음 |
| [ios-architecture](https://github.com/tailec/ios-architecture) | 정적 팩토리 메서드 | 전환 사례가 적음 | 없음 |
| [Viperit](https://github.com/ferranabello/Viperit) | 프레임워크가 모듈을 관리 | 모듈이 직접 자신을 표시 | `AppModules`로 모듈 관리 |
| [iOS-Architecture-Sample](https://github.com/giftbott/iOS-Architecture-Sample) | 모듈별 생성 | 앱 단위 Router가 화면 계층 관리 | 싱글톤 AppRouter |

구현은 달랐지만 공통점도 있었다. View나 Presenter가 직접 다음 화면을 생성하지 않았고, 화면 조립과 전환을 UI 바깥의 객체로 분리하고 있었다.

## VIPER는 Router의 형태를 정하지 않는다

VIPER는 Router가 화면 전환을 담당한다고 설명하지만 구체적인 구현 방식까지 규정하지는 않는다.

어떤 구현은 Router가 현재 ViewController를 프로퍼티로 보관했고, 어떤 구현은 전환 메서드의 인자로 받았다. 다음 모듈을 Router 안에서 조립하는 경우도 있었고 별도의 WireFrame이나 Builder를 사용하는 경우도 있었다.

따라서 특정 형태를 VIPER의 정답으로 보기보다, Router가 View와 Presenter에서 UIKit의 전환 책임을 분리하는지가 더 중요했다.

## 화면 전환과 모듈 조립은 다른 책임이다

화면 전환에는 두 작업이 포함된다.

1. 다음 화면의 View, Presenter, Interactor, Router를 생성하고 연결한다.
2. 완성된 ViewController를 `push`하거나 `present`한다.

두 작업을 Router가 모두 담당하면 구조가 단순해진다. 반면 별도의 Builder를 사용하면 Router는 전환에 집중하고 객체 생성과 의존성 주입을 분리할 수 있다.

SniffMEET에서는 모듈을 조립하는 규칙을 명확히 드러내기 위해 Builder를 두고, Router는 완성된 모듈을 화면에 표시하는 역할에 집중하는 편이 적합하다고 판단했다.

## AppRouter가 항상 필요한 것은 아니다

분석한 프로젝트 중에는 AppRouter가 없는 사례도 많았다. 일반적인 화면 이동은 각 모듈의 Router만으로 처리할 수 있기 때문이다.

AppRouter가 필요한지는 아키텍처 이름이 아니라 전환의 범위로 판단해야 했다. 로그인 전환이나 앱 전체에 영향을 주는 화면처럼 특정 모듈에 소유권을 주기 어려운 흐름이라면 앱 수준의 Router가 자연스럽다.

반대로 한 화면에서 상세 화면으로 이동하는 동작까지 AppRouter가 처리하면 모든 전환이 하나의 객체에 집중된다.

## 모듈 재생성과 데이터 수명은 별개의 문제다

화면 전환마다 Builder가 모듈을 새로 만든다고 해서 데이터까지 반드시 사라지는 것은 아니다.

화면 내부의 일시적인 상태는 ViewController와 함께 사라질 수 있다. 하지만 데이터베이스, 캐시, 세션처럼 모듈 밖에서 관리하는 데이터는 새 모듈에서도 다시 사용할 수 있다. 유지해야 할 상태가 있다면 Router를 없애거나 `UIWindow`를 유지하는 방식보다 상태를 소유할 객체의 수명을 먼저 정해야 한다.

## SniffMEET에서 정한 기준

SniffMEET에서는 다음과 같이 역할을 나누기로 했다.

- 모듈 내부의 화면 전환은 각 모듈의 Router가 담당한다.
- VIPER 구성 요소의 생성과 의존성 주입은 Builder가 담당한다.
- 탭 바는 비즈니스 로직을 가진 VIPER 모듈보다 여러 모듈을 담는 UIKit 컨테이너로 취급한다.
- 특정 모듈에 속하지 않는 전역 화면은 앱 수준의 전환 객체가 담당한다.
- 일반적인 전환에서는 `UIWindow`를 교체하지 않고 현재 화면 계층에서 `push` 또는 `present`한다.

여러 구현을 비교하고 얻은 결론은 VIPER Router에 고정된 형태가 없다는 점이었다. 중요한 것은 클래스 이름이나 파일 구조가 아니라 화면 전환, 모듈 조립, 전역 흐름의 책임을 어느 범위에 둘지 명시하는 것이었다.
