---
title: "The Swift Programming Language. Structures And Classes (1)"
date: 2023-06-01

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Structures and Classes

weight: 9

draft: false
original: "https://junmusu.tistory.com/79"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Structures and Classes

스트럭처와 클래스는 범용성 있는 유연한 구조이다. 상수, 변수, 함수를 작성하는 것 처럼 프로퍼티와 메소드를 작성하여 스트럭처와 클래스에 기능을 부여할 수 있다.

### Comparing Structures and Classes

스트럭처와 클래스는 많은 공통점을 가지고 있다. 둘 다 다음과 행동을 할 수 있다.

  - 값을 저장하기 위한 프로퍼티 정의
  - 기능(functionality)을 위한 메소드 정의
  - 서브스크립트 구문을 통하여 값에 접근할 수 있게 하는 서브스크립트 정의
  - 초기 값을 설정하기 위한 이니셜라이저 정의
  - 기본 구현보다 확장된 기능을 위한 확장성
  - 특정 종류에 대한 표준 기능을 제공하는 프로토콜 준수



클래스는 스트럭처가 없는 추가 기능들이 있다.

  - 상속을 통한 다른 클래스의 특성 상속
  - 타입 캐스팅을 통해 클래스 인스턴스의 타입을 런타임에 확인하고 해석할 수 있다.
  - 디이니셜라이저는 클래스 인스턴스가 할당하고 있는 모든 자원을 해제할 수 있게 한다.
  - 레퍼런스 카운팅은 클래스 인스턴스에 대한 참조를 하나 이상 가능하게 해준다.



클래스가 지원하는 추가 기능들은 복잡도를 증가시킨다. 따라서 일반적인 가이드라인은, 클래스가 필요한 상황이 아니라면 스트럭처를 사용하는 것을 권장한다.

### Definition Syntax

스트럭처와 클래스는 정의 구문이 비슷하다. 스트럭처는 struct 키워드로, 클래스는 class 키워드를 사용한다.


```swift
struct SomeStructure {
    // structure definition goes here
}
class SomeClass {
    // class definition goes here
}
```
 

> **Note**  
>  새로운 스트럭처나 클래스를 정의하는 것은 새로운 스위프트 타입을 만드는 것이므로 이름으로 UpperCamelCase를 사용하고, 프로퍼티나 메소드의 이름은 lowerCamelCase를 사용하자.


```swift
struct Resolution {
    var width = 0
    var height = 0
}
class VideoMode {
    var resolution = Resolution()
    var interlaced = false
    var frameRate = 0.0
    var name: String?
}
```
 

위의 예시는 Resolution이라는 새로운 스트럭처를 만든다. 이 스트럭처는 2개의 width와 height라는 두 개의 저장 프로퍼티를 가지고 있다. 저장 프로퍼티는 스트럭처나 클래스에 묶인 변수 혹은 상수이다.

또한 VideoMode라는 새로운 클래스도 정의한다. 이 클래스는 4개의 저장 프로퍼티를 가지고 있으며, 첫 번째 프로퍼티 resolution은 새로운 Resolution 스트럭처로 초기화 된다. name 프로퍼티는 옵셔널 타입이기 때문에 자동으로 디폴트 값으로 nil을 가진다.

### Structure and Class Instances

위 예시에 나온 정의들은 Resolution과 VideoMode가 어떤 구조를 가졌는지만을 나타낼 뿐, 스스로 특정한 값을 나타낼 수 없다. 따라서 특정한 값을 나타내기 위해서는 스트럭처나 클래스의 인스턴스를 만들어야 한다.

인스턴스를 만드는 것은 스트럭처와 클래스가 매우 유사하다.


```swift
let someResolution = Resolution()
let someVideoMode = VideoMode()
```
 

스트럭처 클래스 모두 다 새로운 인스턴스를 만들기 위해 이니셜라이저를 사용한다. 이니셜라이저의 가장 간단한 형태는 Resolution() 이나 VideoMode()처럼 이름 뒤에 빈 괄호를 붙이는 것이다. 이러한 이니셜라이저는 프로퍼티가 디폴트 값으로 초기화된 스트럭처나 클래스 인스턴스를 만든다.

#### Accessing Properties

닷(.) 구문(인스턴스 이름 바로 뒤에 공백 없이 점으로 구분하여 프로퍼티 이름을 작성)으로 프로퍼티에 접근 할 수 있다.


```swift
print("The width of someResolution is \(someResolution.width)")
// Prints "The width of someResolution is 0"
someVideoMode.resolution.width = 1280
print("The width of someVideoMode is now \(someVideoMode.resolution.width)")
// Prints "The width of someVideoMode is now 1280"
```
 

위 예시에서 someResolution.width는 someResolution의 width 프로퍼티를 참조한다. 또한 someVideoMode.resolution.width의 예시처럼 닷 구문으로 변수 프로퍼티에 새로운 값을 할당 할 수도 있다.

#### Memberwise Initilizer for Structure Types

모든 스트럭처는 새로운 인스턴스의 프로퍼티들을 초기화 시킬수 있는 멤버와이즈(Memberwise) 이니셜라이저를 자동적으로 가지게 된다. 새 인스턴스의 프로퍼티들의 초기 값은 멤버와이즈 이니셜라이저에 이름으로 전달된다.


```swift
let vga = Resolution(width: 640, height: 480)
```
 

스트럭처와 다르게 클래스 인스턴스는 기본 멤버와이즈 이니셜라이저를 가지고 있지 않다. 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
