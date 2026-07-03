---
title: "[Swift] Extensions(익스텐션) - 1"
date: 2023-06-29
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Extensions"]
weight: 36

draft: false
original: "https://junmusu.tistory.com/109"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Extensions

익스텐션(Extensions)은 이미 존재하는 클래스, 스트럭처, 열거형, 프로토콜에 새로운 기능을 추가한다. 이는 원본 코드에 접근할 수 없는 타입(_retroactive modeling_ 라고도 함)에 대한 확장도 가능하다.

스위프트의 익스텐션은 다음과 같은 행동을 할 수 있다.

  - 컴퓨티드 인스턴스 프로퍼티 혹은 컴퓨티드 타입 프로퍼티 추가
  - 인스턴스 메소드 혹은 타입 메소드 정의
  - 새로운 이니셜라이저 제공
  - 서브스크립트 정의
  - 새로운 중첩 타입 정의 및 사용
  - 이미 존재하는 타입이 프로토콜 준수하도록 함



스위프트에서는 프로토콜도 확장(extend)하여 요구사항 구현을 제공하거나, 그 프로토콜을 준수하고 있는 타입들이 사용할 수 있는 추가 기능을 제공할 수도 있다.

> **Note**  
>  익스텐션은 타입에 새로운 기능을 추가할 수 있지만, 이미 존재하는 기능을 오버라이드할 수는 없다.

### Extension Syntax

익스텐션은 extension 키워드를 사용하여 선언한다:


```swift
extension SomeType {
    // new functionality to add to SomeType goes here
}
```
 

익스텐션은 이미 존재하는 타입이 하나 이상의 프로토콜을 더 도입할 수 있게 할 수 있다. 프로토콜을 준수하게 하기 위해, 프로토콜의 이름을 클래스나 스트럭처에서 작성한 것과 같은 방식으로 작성한다.


```swift
extension SomeType: SomeProtocol, AnotherProtocol {
    // implementation of protocol requirements goes here
}
```
 

Extending a Generic Type에 설명된 대로, 익스텐션은 존재하는 제네릭 타입을 확장하는데도 사용할 수 있다. 또한 제네릭 타입을 조건부 기능을 추가하여 확장할 수도 있다. 이는 Extensions with a Generic Where Clause에 설명되어 있다. (포스팅 예정)

> **Note**  
>  이미 존재하는 타입에 대한 익스텐션을 정의했을 때, 그 타입의 모든 인스턴스들은 익스텐션이 정의되기 전에 생성되었어도 (익스텐션에서 도입된) 새로운 기능을 사용할 수 있다.

### Computed Properties

익스텐션은 컴퓨티드 인스턴스 프로퍼티와 컴퓨티드 타입 프로퍼티를 이미 존재하는 타입에 추가할 수 있다. 다음 예시는 길이 단위에 대한 작업을 지원하기 위해, 5개의 컴퓨티드 인스턴스 프로퍼티를 스위프트의 빌트-인 타입인 Double 타입에 추가한다. 


```swift
extension Double {
    var km: Double { return self * 1_000.0 }
    var m: Double { return self }
    var cm: Double { return self / 100.0 }
    var mm: Double { return self / 1_000.0 }
    var ft: Double { return self / 3.28084 }
}
let oneInch = 25.4.mm
print("One inch is \(oneInch) meters")
// Prints "One inch is 0.0254 meters"
let threeFeet = 3.ft
print("Three feet is \(threeFeet) meters")
// Prints "Three feet is 0.914399970739201 meters"
```
 

이 컴퓨티드 프로퍼티들은 Double 값이 특정 길이 단위로 간주된다는 것을 표현한다. 컴퓨티드 프로퍼티로 구현되었지만, 이 프로퍼티들의 이름은 리터럴 값의 거리 변환을 수행하기 위해 부동소수점(floating-point) 리터럴 값 뒤에 닷 구문을 사용하여 붙을 수 있다(주: 위의 25.4.mm, 3.ft 처럼).

이 예시에서, Double 값 1.0은 "1미터"를 나타낸다. 이는 컴퓨티드 프로퍼티 m이 self를 리턴하는 것으로 알 수 있다. —1.m 표현식은 Double 값을 1.0으로 계산한다고 간주한다.

다른 단위는 미터 단위로 환산이 필요하다. 1 킬로미터는 1,000미터와 같으므로 km 컴퓨티드 프로퍼티는 값에 1_000.0을 곱하여 미터로 환산한다. 비슷하게 3.28084 피트는 1미터이므로, ft 컴퓨티드 프로퍼티는 기존에 Double 값에 3.28084를 나누어서 피트를 미터로 환산한다.

이 프로퍼티들은 read-only 컴퓨티드 프로퍼티들이므로 get 키워드 없이 간결하게 표현되어있다. 이 프로퍼티들의 리턴 타입은 Double이며, Double이 사용가능한 수학 계산에서 사용가능하다.


```swift
let aMarathon = 42.km + 195.m
print("A marathon is \(aMarathon) meters long")
// Prints "A marathon is 42195.0 meters long"
```
 

> **Note**  
>  익스텐션은 새로운 컴퓨티드 프로퍼티를 추가할 수는 있지만, 새로운 저장 프로퍼티나 이미 존재하는 프로퍼티에 프로퍼티 옵저버를 추가하지는 못한다.

### Initializers

익스텐션은 이미 존재하는 타입에 새로운 이니셜라이저를 추가할 수 있다. 이를 통해 사용자 지정 타입을 이니셜라이저 파라미터로 쓸 수 있도록 다른 타입을 확장할 수도 있고, 타입의 기존 구현에 포함되어 있지 않은 추가 이니셜라이저를 제공할 수 있다.

익스텐셔은 클래스에 새로운 컨비니언스 이니셜라이저를 추가할 수 있지만, 클래스에 새로운 데지그네이티드 이니셜라이저나 디이니셜라이저를 추가할 수 없다. 데지그네이티드 이니셜라이저와 디이니셜라이저는 반드시 클래스의 기존 구현에서 제공되어야 한다.

모든 저장 프로퍼티에 디폴트 값이 제공되고, 어떠한 커스텀 이니셜라이저도 제공하지 않은 값 타입에 익스텐션을 사용하여 이니셜라이저를 추가할 경우, 그 값 타입의 디폴트 이니셜라이저와 멤버와이즈 이니셜라이저를 익스텐션의 이니셜라이저에서 호출할 수 있다. 이는 그 값 타입의 기존 구현에 이니셜라이저가 존재한다면 불가능한 일이다(주: 커스텀 이니셜라이저가 하나라도 있으면 디폴트 이니셜라이저가 존재하지 않는다, 하지만 기존 구현에 이니셜라이저가 존재하지 않고 익스텐션에서만 이니셜라이저를 제공하는 상황에서는 디폴트 이니셜라이저를 사용할 수 있다.) 이는 Initializer Delegation for Value Types에 설명되어 있다.

다른 모듈에 선언되어 있는 스트럭처에 이니셜라이저를 추가하기 위해 익스텐션을 사용하면, 새로운 이니셜라이저는 정의된 모듈에서 이니셜라이저를 호출하기 전 까지 self에 접근하지 못한다.

아래의 예시는 기하학적인 직사각형을 표현하는 커스텀 Rect 스트럭처를 정의한다. 또한 두 개의 지원 스트럭처 Size와 Point를 정의한다. Size와 Point는 모든 프로퍼티에 디폴트 값 0.0을 제공한다.


```swift
struct Size {
    var width = 0.0, height = 0.0
}
struct Point {
    var x = 0.0, y = 0.0
}
struct Rect {
    var origin = Point()
    var size = Size()
}
```
 

Rect 스트럭처가 모든 프로퍼티에 디폴트 값을 제공하기 때문에, 기본 이니셜라이저와 멤버와이즈 이니셜라이저를 자동적으로 받게 된다. 이 이니셜라이저들은 새로운 Rect 인스턴스를 만들 때 사용할 수 있다.


```swift
let defaultRect = Rect()
let memberwiseRect = Rect(origin: Point(x: 2.0, y: 2.0),
   size: Size(width: 5.0, height: 5.0))
```
 

Rect 스트럭처가 센터 포인트과, 사이즈를 받는 추가 이니셜라이저를 제공하도록 확장할 수 있다.


```swift
extension Rect {
    init(center: Point, size: Size) {
        let originX = center.x - (size.width / 2)
        let originY = center.y - (size.height / 2)
        self.init(origin: Point(x: originX, y: originY), size: size)
    }
}
```
 

이 새 이니셜라이저는 제공된 center와 size를 이용하여 적합한 원점을 계산하는 것으로부터 시작하고, 스트럭처의 자동 멤버와이즈 이니셜라이저 init(origin:size:)를 호출하여 계산한 원점과 사이즈를 적합한 프로퍼티에 저장한다.


```swift
let centerRect = Rect(center: Point(x: 4.0, y: 4.0),
                      size: Size(width: 3.0, height: 3.0))
// centerRect's origin is (2.5, 2.5) and its size is (3.0, 3.0)
```
 

> **Note**  
>  익스텐션에 새 이니셜라이저를 제공해도, 그 이니셜라이저가 완료되었을 때 인스턴스를 완전히 초기화 시켜야 하는 책임은 여전히 있다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
