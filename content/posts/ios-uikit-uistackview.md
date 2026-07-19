---
title: "UIKit. UIStackView 레이아웃"
date: 2024-08-27

categories:
  - iOS
series:
  - UIKit
tags:
  - Auto Layout
  - Intrinsic Content Size
  - UIStackView

draft: false
original: "https://junmusu.tistory.com/165"
---

`UIStackView`는 여러 뷰를 한 방향으로 묶어 배치할 수 있는 컨테이너 뷰다. 직접 서브뷰마다 제약 조건을 하나씩 걸지 않아도, 스택 뷰에 arranged subview로 추가하면 스택 뷰가 내부 뷰들의 배치를 관리한다.

스택 뷰는 기기의 방향, 화면 크기, 그리고 `axis`, `alignment`, `distribution`, `spacing` 같은 프로퍼티를 바탕으로 내부 뷰의 레이아웃을 결정한다.

이 글에서는 스택 뷰의 주요 프로퍼티가 레이아웃에 어떤 영향을 주는지 정리한다.

## intrinsicContentSize

스택 뷰의 레이아웃을 이해하려면 먼저 `intrinsicContentSize`를 알아야 한다.

`intrinsicContentSize`는 뷰가 자신의 내용만을 기준으로 자연스럽게 가지는 크기다. 대표적인 예시는 `UILabel`이다.

![](/images/ios-uikit-uistackview/image-001.png)

`UILabel`은 별도의 width 제약을 주지 않으면 내부 텍스트 길이에 따라 자연스럽게 가로 크기가 정해진다. 위 캡처에서도 두 레이블은 텍스트 길이에 따라 서로 다른 크기를 가진다.

스택 뷰도 마찬가지다. 스택 뷰 자체의 크기를 명시적으로 제한하지 않으면, 내부 arranged subview들의 크기와 간격을 바탕으로 자신의 크기를 계산할 수 있다.

## 서브뷰 배치하기

먼저 스택 뷰와 세 개의 컬러 뷰를 만든다.

```swift
private let stackView = UIStackView()
let redView = CustomColorView(color: .red, preferredWidth: 50)
let greenView = CustomColorView(color: .green, preferredWidth: 50)
let blueView = CustomColorView(color: .blue, preferredWidth: 50)
```

스택 뷰에 뷰를 추가할 때는 `addArrangedSubview(_:)`를 사용한다.

```swift
stackView.addArrangedSubview(redView)
stackView.addArrangedSubview(greenView)
stackView.addArrangedSubview(blueView)
```

![](/images/ios-uikit-uistackview/image-002.png)

`redView`, `greenView`, `blueView` 순서로 추가했기 때문에 실제 화면에서도 같은 순서로 배치된다.

여기서 두 가지 규칙을 확인할 수 있다.

1. 스택 뷰는 `arrangedSubviews` 배열의 순서대로 뷰를 나열한다.
2. 스택 뷰는 축 방향을 기준으로 첫 번째 뷰와 마지막 뷰를 양 끝에 맞춰 배치한다.
   - 가로 스택 뷰라면 첫 번째 뷰는 leading, 마지막 뷰는 trailing 쪽에 배치된다.
   - 세로 스택 뷰라면 첫 번째 뷰는 top, 마지막 뷰는 bottom 쪽에 배치된다.

이번에는 `blueView`, `greenView`, `redView` 순서로 넣어보자.

![](/images/ios-uikit-uistackview/image-003.png)

예상대로 추가한 순서에 맞춰 `blueView`, `greenView`, `redView` 순서로 배치된다.

## axis

`axis`는 스택 뷰의 축을 결정하는 프로퍼티다. 즉, 내부 뷰들을 가로로 나열할지 세로로 나열할지 정한다. `axis`는 두 가지 값을 가진다.

- `.horizontal`: 서브뷰를 가로 방향으로 배치한다. 스택 뷰의 기본값이다.
- `.vertical`: 서브뷰를 세로 방향으로 배치한다.

![](/images/ios-uikit-uistackview/image-004.png)

## distribution

`distribution`은 스택 뷰의 축 방향으로 arranged subview들을 어떻게 분포시킬지 결정하는 프로퍼티다. 기본값은 `.fill`이다.

여기서 중요한 점은 `distribution`이 주로 스택 뷰의 축 방향 크기가 제한되어 있을 때 의미를 가진다는 것이다.

예를 들어 가로 스택 뷰의 leading과 trailing을 safe area에 고정하면, 스택 뷰의 가로 길이는 화면 너비로 제한된다. 이때 내부 뷰들의 원래 크기 합이 스택 뷰의 너비와 딱 맞지 않으면, 스택 뷰는 `distribution` 설정에 따라 뷰를 늘리거나 줄이거나 간격을 조정한다.

반대로 스택 뷰의 크기를 내부 뷰들에 맞게 자연스럽게 계산하게 둔다면, 뷰를 억지로 조정할 필요가 적다. 다만 `.equalSpacing`, `.equalCentering`처럼 간격을 다루는 방식은 여전히 영향을 줄 수 있다.

아래 예제들은 스택 뷰의 leading과 trailing을 safe area에 고정해서, 스택 뷰의 축 방향 길이가 제한된 상태를 기준으로 설명한다.

### fill

`.fill`은 서브뷰의 크기를 스택 뷰의 크기에 맞게 조절하는 방식이다.

공간이 남아서 뷰를 늘려야 할 때는 content hugging priority를 기준으로 어떤 뷰를 늘릴지 결정한다. 반대로 공간이 부족해서 뷰를 줄여야 할 때는 compression resistance priority를 기준으로 어떤 뷰를 줄일지 결정한다.

![](/images/ios-uikit-uistackview/image-005.png)

`ColorView`의 기본 intrinsic size를 `(100, 100)`으로 설정했지만, 스택 뷰의 가로 길이에 맞추기 위해 `redView`의 길이가 늘어난 것을 볼 수 있다.

![](/images/ios-uikit-uistackview/image-006.png)

어떤 뷰가 늘어나거나 줄어들지는 hugging priority와 compression resistance priority에 따라 결정된다. 만약 모든 서브뷰의 우선순위가 같다면, 스택 뷰는 내부 기준에 따라 특정 뷰의 크기를 조정한다. 보통은 앞쪽 또는 뒤쪽 뷰가 조정되는 것처럼 보일 수 있다.

우선순위를 직접 조절해서 어떤 뷰가 늘어날지 지정할 수도 있다.

```swift
redView.setContentHuggingPriority(.defaultHigh, for: .horizontal)
greenView.setContentHuggingPriority(.defaultLow, for: .horizontal)
blueView.setContentHuggingPriority(.defaultHigh, for: .horizontal)
```

![](/images/ios-uikit-uistackview/image-007.png)

`greenView`의 hugging priority를 가장 낮게 설정했기 때문에, 남는 공간을 채우기 위해 `greenView`가 늘어난다.

### fillEqually

`.fillEqually`는 축 방향의 길이를 모든 서브뷰가 동일하게 가지도록 조정한다.

`.fill`과 달리 모든 뷰의 크기를 같게 만들기 때문에 hugging priority나 compression resistance priority의 영향을 받지 않는다.

### fillProportionally

`.fillProportionally`는 서브뷰의 축 방향 길이를 원래 크기의 비율에 맞춰 조정한다. 즉, 원래 더 긴 뷰는 더 길게, 짧은 뷰는 짧게 유지된다.

앞선 예제는 모든 컬러 뷰의 너비가 같기 때문에 `.fillEqually`와 차이를 보기 어렵다. 그래서 각 뷰의 선호 너비를 다르게 설정한다.

```swift
let redView = ColorView(color: .red, preferredWidth: 50)
let greenView = ColorView(color: .green, preferredWidth: 100)
let blueView = ColorView(color: .blue, preferredWidth: 150)
```

![](/images/ios-uikit-uistackview/image-008.png)

`redView`, `greenView`, `blueView`의 너비를 각각 50, 100, 150으로 설정했기 때문에 비율은 1:2:3이다.

![](/images/ios-uikit-uistackview/image-009.png)

스택 뷰의 크기에 맞춰 전체 길이는 늘어났지만, 각 뷰의 비율은 1:2:3으로 유지된다. 이것이 `.fillProportionally`의 동작이다.

이후 예제에서도 각 뷰의 너비는 50, 100, 150으로 유지한다. 그래야 각 distribution의 차이를 더 쉽게 볼 수 있다.

### equalSpacing

`.equalSpacing`은 서브뷰 사이의 간격을 동일하게 조정한다.

가로 스택 뷰라면 앞 뷰의 trailing과 다음 뷰의 leading 사이 간격이 같아진다.

![](/images/ios-uikit-uistackview/image-010.png)

서브뷰의 높이나 너비는 그대로 두고, 뷰 사이의 간격만 조정된다.

### equalCentering

`.equalCentering`은 서브뷰들의 중심점 사이의 간격을 동일하게 조정한다.

![](/images/ios-uikit-uistackview/image-011.png)

겉보기에는 뷰 사이 간격이 일정하지 않은 것처럼 보인다. 하지만 `redView`, `greenView`, `blueView`의 중심점 사이 거리는 동일하다.

이 방식도 서브뷰의 너비는 그대로 두고, 중심점 간격을 기준으로 배치만 조정한다.

## alignment

`alignment`는 스택 뷰의 축과 수직인 방향에서 서브뷰를 어떻게 정렬할지 결정하는 프로퍼티다.

가로 스택 뷰라면 세로 방향 정렬을 결정하고, 세로 스택 뷰라면 가로 방향 정렬을 결정한다.

각 상태를 더 잘 보기 위해 뷰들의 선호 높이를 다르게 설정하고, `distribution`은 `.equalSpacing`으로 설정한다.

```swift
let redView = ColorView(color: .red, preferredWidth: 50, preferredHeight: 50)
let greenView = ColorView(color: .green, preferredWidth: 100, preferredHeight: 100)
let blueView = ColorView(color: .blue, preferredWidth: 150, preferredHeight: 150)
```

`alignment`는 `distribution`과 달리 스택 뷰의 크기가 명시적으로 제한되어 있든, 내부 서브뷰에 의해 자연스럽게 정해지든 영향을 준다.

기본값은 `.fill`이다.

### fill

`.fill`은 스택 뷰의 축과 수직인 방향의 크기에 맞춰 서브뷰를 늘린다.

예를 들어 가로 스택 뷰라면 스택 뷰의 높이에 맞춰 모든 서브뷰의 높이를 조정한다.

![](/images/ios-uikit-uistackview/image-012.png)

서브뷰들의 선호 높이는 각각 다르게 설정했지만, 최종적으로 모두 스택 뷰의 높이인 150에 맞춰진다. 스택 뷰의 높이가 150이 되는 이유는 뒤에서 다시 정리한다. 간단히 말하면, 가로 스택 뷰의 높이는 내부 서브뷰 중 가장 큰 높이를 기준으로 계산된다.

![](/images/ios-uikit-uistackview/image-013.png)

### center, leading, trailing, top, bottom

`.center`, `.leading`, `.trailing`, `.top`, `.bottom`은 이름 그대로 해당 방향으로 서브뷰를 정렬한다.

주의할 점은 `UIStackView.Alignment`에서 `.leading`과 `.top`, `.trailing`과 `.bottom`이 사실상 대응된다는 것이다. 가로 스택 뷰에서는 `.top`과 `.bottom`을 쓰는 편이 의미가 더 명확하고, 세로 스택 뷰에서는 `.leading`과 `.trailing`을 쓰는 편이 자연스럽다.

#### center

![](/images/ios-uikit-uistackview/image-014.png)

#### top / leading

![](/images/ios-uikit-uistackview/image-015.png)

#### bottom / trailing

![](/images/ios-uikit-uistackview/image-016.png)

## spacing

`spacing`은 arranged subview 사이의 기본 간격을 지정하는 프로퍼티다.

이번에는 모든 서브뷰의 크기를 동일하게 바꾸고, `alignment`는 `.fill`, `distribution`은 `.fillEqually`로 설정한다.

`spacing`을 20으로 설정하면 다음과 같이 뷰 사이에 간격이 생긴다.

![](/images/ios-uikit-uistackview/image-017.png)

여기서 두 가지를 확인해볼 수 있다.

- `distribution`이 `.equalSpacing`일 때 `spacing`은 어떻게 동작할까?
- 서브뷰의 선호 크기와 간격의 합이 스택 뷰의 크기를 넘으면 어떻게 될까?

개발자 문서에 따르면 `.equalSpacing`이나 `.equalCentering`에서는 `spacing`이 최소 간격으로 동작한다.

`spacing`을 100으로 설정해보자.

![](/images/ios-uikit-uistackview/image-018.png)

뷰들이 수축되는 현상이 일어난다. 뷰 사이의 간격이 정말 100인지 확인해보면 다음과 같다. iPhone SE 3의 가로 길이는 375pt이다.

![](/images/ios-uikit-uistackview/image-019.png)

간격 200pt와 RGB 뷰의 전체 너비 175pt를 더하면 375pt가 된다. 즉, `spacing`은 최소 간격으로 유지되고, 남은 공간에 맞춰 서브뷰의 크기가 줄어든다.

따라서 두 번째 질문의 답도 알 수 있다. 서브뷰의 선호 크기와 간격의 합이 스택 뷰의 크기를 넘으면, 스택 뷰는 서브뷰의 크기를 줄여서 전체 크기에 맞춘다.

### 간격 커스터마이징하기

`setCustomSpacing(_:after:)`를 사용하면 특정 arranged subview 뒤의 간격만 따로 지정할 수 있다.

예를 들어 기본 간격은 10으로 두고, `greenView`와 `blueView` 사이의 간격만 30으로 설정하고 싶다면 다음과 같이 작성한다.

```swift
stackView.setCustomSpacing(30, after: greenView)
```

![](/images/ios-uikit-uistackview/image-020.png)

`greenView` 뒤의 간격만 다르게 적용된 것을 확인할 수 있다.

## 스택 뷰의 크기 지정하기

앞에서는 고정된 제약 조건을 가진 스택 뷰에서 서브뷰가 어떻게 배치되는지 살펴봤다.

하지만 스택 뷰는 내부 서브뷰들의 크기와 간격을 바탕으로 자신의 크기를 자동으로 계산할 수도 있다.

### 크기 제약 조건이 있는 스택 뷰

스택 뷰의 크기를 명시적으로 제한할 수 있다. 예를 들어 스택 뷰의 상하좌우를 safe area에 고정하면, 스택 뷰의 크기는 safe area와 같아진다.

```swift
stackView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor)
stackView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
stackView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor)
stackView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor)
```

![](/images/ios-uikit-uistackview/image-021.png)

이 경우 내부 서브뷰들은 스택 뷰의 크기에 맞춰 늘어나거나 줄어든다.

그래서 `distribution`은 스택 뷰의 축 방향 크기가 제한되어 있을 때 특히 중요하다. 내부 컨텐츠의 자연스러운 크기와 스택 뷰의 실제 크기가 다르면, 그 차이를 어떻게 처리할지 `distribution`이 결정하기 때문이다.

### 크기 제약 조건이 없는 스택 뷰

스택 뷰 내부의 서브뷰들은 직접 오토 레이아웃으로 배치할 필요가 없다. 하지만 스택 뷰 자체는 오토 레이아웃으로 화면 어딘가에 배치해야 한다.

일반적으로는 스택 뷰의 위치만 정하고, 크기는 내부 서브뷰에 의해 결정되게 둘 수 있다. 예를 들어 centerX와 centerY만 잡으면 스택 뷰의 위치는 화면 중앙으로 정해지고, 크기는 arranged subview들의 크기와 간격으로 계산된다.

```swift
stackView.centerXAnchor.constraint(equalTo: view.centerXAnchor)
stackView.centerYAnchor.constraint(equalTo: view.centerYAnchor)
```

개발자 문서에서 설명하는 스택 뷰의 크기 계산 방식은 다음과 같다.

- 축 방향 크기: 모든 arranged subview의 축 방향 길이 합 + 뷰 사이 간격의 합
- 축과 수직인 방향의 크기: arranged subview 중 가장 큰 뷰의 크기
- `isLayoutMarginsRelativeArrangement`가 `true`이면 layout margins까지 포함해서 계산

![](/images/ios-uikit-uistackview/image-022.png)

뷰들이 선호 크기에 맞게 그려지고, 간격도 지정된 값에 맞게 적용된다. 스택 뷰의 크기가 내부 뷰들을 기준으로 자동 계산된 것이다.

다만 크기 제약 조건이 없다고 해서 `distribution`이 완전히 의미 없어지는 것은 아니다. 예를 들어 `.equalSpacing`은 최소 `spacing`을 지키면서 스택 뷰의 배치에 영향을 줄 수 있다.

![](/images/ios-uikit-uistackview/image-023.png)

## 정리

`UIStackView`는 arranged subview들을 단순히 순서대로 나열하는 뷰처럼 보이지만, 실제로는 여러 레이아웃 규칙이 함께 동작한다.

핵심은 다음과 같다.

- `axis`는 서브뷰를 가로로 쌓을지 세로로 쌓을지 결정한다.
- `distribution`은 스택 뷰의 축 방향에서 서브뷰의 크기와 간격을 어떻게 조정할지 결정한다.
- `alignment`는 축과 수직인 방향에서 서브뷰를 어떻게 정렬할지 결정한다.
- `spacing`은 서브뷰 사이의 기본 간격이며, `.equalSpacing`, `.equalCentering`에서는 최소 간격으로 동작한다.
- 스택 뷰의 크기를 명시적으로 제한하면 내부 뷰들이 그 크기에 맞춰 조정된다.
- 스택 뷰의 크기를 제한하지 않으면 내부 arranged subview들의 크기와 간격을 기준으로 스택 뷰의 크기가 계산된다.

스택 뷰를 사용할 때는 먼저 축 방향 크기가 제한되어 있는지 확인하는 것이 좋다. 같은 `distribution` 설정이라도 스택 뷰의 크기가 고정되어 있는지, 내부 컨텐츠로 결정되는지에 따라 결과가 달라질 수 있기 때문이다.