---
title: "UIKit. 화면 전환 방식"
date: 2024-08-21
categories: ["iOS"]
series: ["UIKit"]
tags: ["iOS", "UIKit"]
draft: false
original: "https://junmusu.tistory.com/163"
---

UIKit에서는 화면을 전환하는 방법이 여러 가지 있지만, 실제로는 상황에 따라 적절한 방식을 선택하면 된다.
- 화면을 계층적으로 이동한다 → **Show**
- Split View의 Detail 화면을 변경한다 → **Show Detail**
- 현재 화면 위에 독립적인 화면을 띄운다 → **Present Modally**
- 큰 화면에서는 팝오버, 작은 화면에서는 모달로 표시한다 → **Present as Popover**

이번 글에서는 각각의 방식이 어떤 상황에서 사용되는지 간단히 정리해 보려고 한다.

## 화면 전환 방식

### Show

```swift
show(_:sender:)
```

내비게이션 컨트롤러를 사용하는 경우 새로운 뷰 컨트롤러를 **Push**하여 화면을 전환한다. 사용자가 계층 구조를 따라 이동하는 대부분의 화면 전환이 여기에 해당한다.

### Show Detail

```swift
showDetailViewController(_:sender:)
```

`UISplitViewController`에서 사용하는 화면 전환 방식이다. Master-Detail 구조에서 Detail(Secondary) 영역의 화면을 교체할 때 사용된다. iPad와 같이 Split View를 사용하는 환경에서 주로 볼 수 있다.

### Present Modally

```swift
present(_:animated:completion:)
```

현재 화면 위에 새로운 화면을 Modal 형태로 표시한다.

화면을 독립적으로 표시하거나, 작업을 완료한 뒤 다시 원래 화면으로 돌아와야 하는 경우에 자주 사용된다. `modalPresentationStyle`을 이용해 Full Screen, Page Sheet 등 다양한 표시 방식을 선택할 수 있다.

### Present as Popover

`present(_:animated:completion:)`을 이용해 화면을 표시하되, `popoverPresentationController`를 설정하여 팝오버 형태로 표시하는 방식이다. iPad처럼 화면이 넓은 환경에서는 팝오버로 표시되고, Compact Width(iPhone)에서는 자동으로 Modal 형태로 변경된다.

## 시연

### iOS
![](/images/ios-uikit-screen-transitions/image-001.gif) 

### iPadOS
![](/images/ios-uikit-screen-transitions/image-002.gif)
