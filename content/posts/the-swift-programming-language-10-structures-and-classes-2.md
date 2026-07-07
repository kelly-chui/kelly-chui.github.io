---
title: "[Swift] Structures and Classes(스트럭처와 클래스) - 2"
date: 2023-06-01
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Structures and Classes"]
weight: 10

draft: false
original: "https://junmusu.tistory.com/80"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Structures and Enumerations Are Value Types

값 타입은 변수나 상수에 할당되거나 함수에 전달될 때, 값이 복사되는 타입이다. 스위프트의 정수, 실수, 부울, 문자열, 배열, 딕셔너리와 같은 기본 타입들은 모두 값 타입이고 실제로 스트럭처로 구현되어있다.

스위프트에서 모든 스트럭처와 열거형과 그 값 타입 프로퍼티들은 코드 안에서 복사되어 전달된다.

> **Note**  
>  배열, 딕셔너리, 문자열과 같은 콜렉션은 전달(혹은 할당)될 때, 즉시 복사되지 않고 수정 작업이 이루어졌을때 복사를 하는 최적화가 되어있다.


```swift
let hd = Resolution(width: 1920, height: 1080)
var cinema = hd
```
 

이 예시는 [앞선 예시](<https://junmusu.tistory.com/79> "앞선 예시")에 나온 스트럭처 Resolution의 상수 인스턴스 hd를 선언하고 프로퍼티를 초기화한다.

그리고 cinema라는 변수를 선언하고 hd의 현재 값으로 설정한다. Resolution이 스트럭처이기 때문에 기존 인스턴스(hd)의 복사본이 만들어지고, 그 복사본은 cinema에 할당된다. hd와 cinema가 같은 width와 height값을 가지지만 둘은 보이는 것과 다르게 완벽하게 다른 인스턴스가 된다.


```swift
cinema.width = 2048
print("cinema is now \(cinema.width) pixels wide")
// Prints "cinema is now 2048 pixels wide"
print("hd is still \(hd.width) pixels wide")
// Prints "hd is still 1920 pixels wide"
```
 

다음에 cinema의 width값을 변경시키고 hd와 cinema의 width 프로퍼티의 값을 확인하면, cinema의 width값은 변경되었지만 hd의 width값은 변경되지 않은 것을 확인 할 수 있다.

cinema에 hd의 값을 주었을때, hd의 값이 복사되어 cinema에 저장된다. 결과로 같은 프로퍼티 값을 가진 두개의 완전히 분리된 인스턴스가 된다. 둘은 다른 인스턴스이기 때문에 cinema 프로퍼티의 값을 변경해도 hd에 아무런 영향을 끼치지 않게 된다.

똑같은 원리가 열거형에도 적용된다.


```swift
enum CompassPoint {
    case north, south, east, west
    mutating func turnNorth() {
        self = .north
    }
}
var currentDirection = CompassPoint.west
let rememberedDirection = currentDirection
currentDirection.turnNorth()

print("The current direction is \(currentDirection)")
print("The remembered direction is \(rememberedDirection)")
// Prints "The current direction is north"
// Prints "The remembered direction is west"
```
 

rememberDirection이 currentDirection에 할당되었을 때, 사실은 그 값의 복사본을 할당한 것이다. 그 후에 currentDirection의 값을 변경시켜도 rememberDirection에 저장되어 있는 값은 변경되지 않는다.

### Classes Are Refernce Types

값 타입과 다르게, 레퍼런스 타입은 변수나 상수를 할당하거나 함수에 전달될 때 복사되지 않고, 동일한 인스턴스에 대한 참조를 하게 된다.


```swift
class VideoMode {
    var resolution = Resolution()
    var interlaced = false
    var frameRate = 0.0
    var name: String?
}

let tenEighty = VideoMode()
tenEighty.resolution = hd
tenEighty.interlaced = true
tenEighty.name = "1080i"
tenEighty.frameRate = 25.0
```
 

이 예시에서 tenEighty라는 상수를 선언하고 VideoMode 클래스의 인스턴스를 참조하도록 설정하고, 프로퍼티의 값을 초기화 시킨다.

다음에 alsoTenEighty라는 새로운 상수에 tenEighty를 할당하고, alsoTenEighty의 frameRate 프로퍼티를 30.0으로 수정한다.


```swift
let alsoTenEighty = tenEighty
alsoTenEighty.frameRate = 30.0
```
 

클래스가 레퍼런스 타입이기 때문에 tenEighty와 alsoTenEighty는 똑같은 VideoMode의 인스턴스를 참조하게 되기 때문에, 사실상 똑같은 하나의 인스턴스에 대한 다른 이름이 된다.

따라서 tenEighty의 frameRate 프로퍼티 값을 확인하면 수정한 frameRate값 30.0이 나오는 것을 볼 수 있다.


```swift
print("The frameRate property of tenEighty is now \(tenEighty.frameRate)")
// Prints "The frameRate property of tenEighty is now 30.0"
```
 

tenEighty와 alsoTenEighty가 상수로 선언되었지만, tenEighty와 alsoTenEighty의 실제 상수 값은 변하지 않기 때문에 tenEighty.frameRate와 alsoTenEighty.frameRate의 값을 수정할 수 있었다. tenEighty와 alsoTenEighty는 VideoMode의 인스턴스를 저장하지 않고, VideoMode 인스턴스를 참조만 하기 때문에 VideoMode의 인스턴스의 프로퍼티 값이 변경되어도 그들이 참조하는 VideoMode의 인스턴스 자체가 다른 인스턴스로 변하지 않았으므로 가능하다.

#### Identity Operators

클래스는 레퍼런스 타입이기 때문에 하나의 클래스 인스턴스에 여러개의 변수나 상수가 참조할 수 있다. 이 때 그 변수나 상수가 같은 인스턴스를 참조하는지 확인하는 두 가지 연산자가 있다.

  - 동일(indentical)함 (===)
  - 동일하지 않음 (!==)


```swift
if tenEighty === alsoTenEighty {
    print("tenEighty and alsoTenEighty refer to the same VideoMode instance.")
}
// Prints "tenEighty and alsoTenEighty refer to the same VideoMode instance."
```
 

#### Pointers

C, C++ 혹은 Objective-C에서는 메모리 주소를 참조하기 위해 포인터를 쓴다. 스위프트의 레퍼런스 타입 인스턴스에 대한 참조는 비슷해 보이지만, 메모리 주소를 직접 참조하지 않고, 참조라는 것을 보이기 위해 애스터리스크(*)를 작성할 필요도 없다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
