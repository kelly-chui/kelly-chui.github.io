---
title: "[UIKit] UIView와 CALayer 사용하기"
date: 2024-09-17
categories: ["iOS"]
series: ["UIKit"]
tags: ["iOS", "UIKit"]
draft: false
original: "https://junmusu.tistory.com/166"
---

`UIView`는 화면의 직사각형 영역을 나타내고, 그 안에 콘텐츠를 관리하는 객체이다. 대부분의 UI 요소가 `UIView`를 상속받으며, 화면에 콘텐츠를 보여주고 터치나 제스처를 감지하는 역할을 한다.

## UIView로 콘텐츠 표시하기

`UIView`는 UIKit에서 제공하는 메소드나 Core Graphics를 이용해 직사각형 영역에 콘텐츠를 그릴 수 있다. 배경색만 있는 간단한 `UIView`를 만들어보자.


```swift
var magentaRectView: UIView = {
    let magentaRectView = UIView()
    magentaRectView.backgroundColor = .magenta
    return magentaRectView
}()
```

오토레이아웃 제약은 임의로 정했다.

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-001.png)

`UIView`는 내부에 다른 `UIView`를 포함할 수 있다. 상위 뷰에 포함된 뷰를 서브 뷰라고 한다. `UIViewController`의 `view` 프로퍼티도 `UIView` 인스턴스이기 때문에, 위 마젠타 사각형도 `UIView` 내부의 `UIView`이다. 좀 더 직관적으로 확인하려면, 마젠타 사각형 안에 검은색 사각형을 추가해보자.

```swift
var blackRectSubView: UIView = {
    let blackRectSubView = UIView()
    blackRectSubView.backgroundColor = .black
    return blackRectSubView
}()
```
 

서브 뷰를 추가하려면 `addSubview(_:)` 메소드를 사용한다. 오토레이아웃 제약도 임의로 정했다.


```swift
    private func setupConstraints() {
        magentaRectView.addSubview(blackRectSubView) // 마젠타 사각형 뷰에 서브 뷰 추가
        view.addSubview(magentaRectView) // 뷰 컨트롤러 기본 뷰에 마젠타 사각형 뷰 추가
        magentaRectView.translatesAutoresizingMaskIntoConstraints = false
        blackRectSubView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            // 오토레이아웃 제약
        ])
    }
```
 

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-002.png)

UIKit에서 기본 제공하는 `UIStackView`, `UITableView`, `UIImageView` 등 대부분의 뷰가 `UIView`를 상속받는다. UIKit에서 시각적으로 콘텐츠를 보여주는 역할을 `UIView`가 맡고 있기 때문이다.

## CALayer

`CALayer`는 이미지 기반 콘텐츠를 관리하고 애니메이션을 수행하는 객체이다.

`UIView`가 화면에 콘텐츠를 보여주는 역할을 하지만, 실제로 콘텐츠를 그리는 것은 `CALayer`가 담당한다. 두 객체의 역할을 구분해보자.

  - `CALayer`는 그래픽 렌더링과 애니메이션을 처리한다.
  - `UIView`는 레이아웃 작업과 터치 이벤트 처리 등 그 외 역할을 담당한다.



`UIViewController`가 `view` 프로퍼티에 `UIView`를 가지고 있듯, `UIView`도 `layer` 프로퍼티에 `CALayer` 인스턴스를 기본으로 가지고 있다.

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-003.png)

### 계층 구조

`UIView`가 서브 뷰를 가질 수 있듯, `CALayer`도 서브 레이어를 가질 수 있다. 아까 만든 사각형 안의 사각형을 서브 뷰 없이 레이어 계층 구조만으로 그려보자.


```swift
let blackRectSublayer: CALayer = {
    let blackRectSublayer = CALayer()
    blackRectSublayer.frame = CGRect(x: 25, y: 25, width: 50, height: 50)
    blackRectSublayer.backgroundColor = UIColor.black.cgColor
    return blackRectSublayer
}()
```
 

레이어를 생성한 후 `addSublayer(_:)` 메소드를 호출해 서브 레이어를 추가할 수 있다.


```swift
magentaRectView.layer.addSublayer(blackRectSubLayer)
```
 

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-004.png)

서브 뷰를 추가하지 않고도 같은 형태를 만들 수 있다.

### CALayer와 UIView의 관계

`UIView`는 `layer` 프로퍼티에 `CALayer`를 가지고 있고, `UIView`가 `CALayer`의 동작을 위임받는 델리게이트 패턴으로 연결되어 있다. 대표적인 예가 `draw(_:)` 메소드이다. UIKit은 오픈 소스가 아니어서 내부 코드를 직접 볼 수 없다. 대신 instrument를 통해 확인해보자.

커스텀 뷰를 하나 만들고,


```swift
let log = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.kelly.uikitexample", category: .pointsOfInterest)

final class LayerView: UIView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .white
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func draw(_ rect: CGRect) {
        os_signpost(.event, log: log, name: "draw(_:)")
    }
}
```
 

instruments에서 호출 부분을 찾기 쉽게 signpost를 지정했다. 이 뷰를 뷰 컨트롤러에 추가하고 콜 트리를 보면,

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-005.png)

`draw(_:)`가 실행되면 `CALayer`가 Objective-C 브릿징을 거쳐 델리게이트 메소드를 호출하는 과정을 확인할 수 있다.

## CALayer에서 그래픽, 애니메이션 처리하기

지금까지 `UIView` 인스턴스의 시각적인 부분은 `CALayer`가 처리한다는 걸 알았다. 이제 `UIView`가 아닌 실제 `CALayer` 인스턴스를 조작해 그래픽을 처리해보자.

### 그림자 넣어보기

`CALayer`는 그림자를 추가하는 프로퍼티를 직접 제공한다.


```swift
layerView.backgroundColor = .magenta
let layer = layerView.layer
layer.shadowColor = UIColor.black.cgColor
layer.shadowOpacity = 1
layer.shadowOffset = CGSize(width: 5, height: 5)
layer.shadowRadius = 10
layer.cornerRadius = 12
```
 

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-006.png)

각 프로퍼티에 대한 자세한 설명은 생략한다. 핵심은 UIView에서 시각적인 부분을 담당하는 게 `CALayer`라는 점이다.

### 애니메이션 처리하기

`UIView`에서도 애니메이션을 처리하지만, 실제로는 `CALayer` 애니메이션을 감싸는 역할이다. `CALayer`에 직접 애니메이션을 추가해보자.


```swift
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    let startPosition = layerView.layer.position
    let animation = CABasicAnimation(keyPath: "position.x")
    animation.fromValue = startPosition.x
    animation.toValue = startPosition.x + 100
    animation.duration = 1.0
    animation.autoreverses = true
    animation.repeatCount = .infinity
    layerView.layer.add(animation, forKey: "horizontalMove")
}
```
 

![](/images/tistory/tistory-166-UIKit-UIView와-CALayer-사용하기/image-007.gif)

잘 동작하는 것을 확인할 수 있다.

## 정리

`UIView`는 화면에 콘텐츠를 보여주고 사용자 입력을 처리하는 역할을 한다. 반면 `CALayer`는 실제 그래픽 렌더링과 애니메이션을 담당한다. 

`UIView`는 내부에 `CALayer`를 가지고 있고, 이를 통해 시각적인 작업을 위임한다. 따라서 복잡한 그래픽 효과나 애니메이션을 구현할 때는 `CALayer`를 직접 다루는 것이 효과적이다.
