---
title: "The Swift Programming Language. Inheritance (1)"
date: 2023-06-08

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Inheritance

weight: 18

draft: false
original: "https://junmusu.tistory.com/88"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Inheritance

클래스는 메소드, 프로퍼티등 클래스의 특성들을 다른 클래스에서 상속 받을 수 있다. 한 클래스가 다른 클래스로부터 상속을 받았을 상속 받은 클래스를 _서브클래스_ 라고 하고, 상속 해준 클래스를 _슈퍼클래스_ 라고 한다. 상속은 클래스가 다른 타입들과 구별되는 중요한 특성이다.

스위프트에서 서브클래스는 슈퍼클래스의 메소드, 프로퍼티, 서브스크립트를 접근하고, 호출할 수 있다. 그리고 이러한 메소드, 프로퍼티, 서브스크립트를 오버라이딩 하여 자신에 적합하게 동작을 수정할 수도 있다. 스위프트는 오버라이드한 정의가 슈퍼 클래스의 정의에 매치되는지 확인함으로써 오버라이드가 정확하게 되도록 도와준다.

상속 받은 프로퍼티가 저장 프로퍼티인지 컴퓨티드 프로퍼티인지 상관 없이 프로퍼티 옵저버를 추가할 수 있다.

### Defining a Base Class

다른 어떤 클래스에게서도 상속받지 않은 클래스를 _베이스 클래스_ 라고 한다.

> Note  
> 스위프트의 클래스는 유니버설 베이스 클래스를 상속받지 않는다. 특정한 슈퍼클래스로부터의 상속 없이 정의한 클래스는 자동적으로 베이스 클래스가 된다. (주: 자바와 같은 경우는 모든 클래스가 기본적으로 Object 클래스를 상속받는데, 스위프트는 그러한 클래스와 상속이 존재하지 않는다는 것을 말하는 것 같음)

아래의 예시는 Vehicle이라는 베이스 클래스를 정의한다. 이 베이스 클래스는 디폴트 값으로 0.0을 가지고 있는 currentSpeed라는 프로퍼티를 가지고 있다. currentSpeed 프로퍼티의 값은 String 타입 read-only 컴퓨티드 프로퍼티인 description이 차량을 묘사하는데 사용된다.

또한 Vehicle 클래스는 makeNoise라는 메소드를 정의한다. 이 메소드는 Vehicle의 인스턴스에선 아무런 행동을 하지 않지만, Vehicle의 서브클래스들에서 나중에 커스터마이징 될 것이다.


```swift
class Vehicle {
    var currentSpeed = 0.0
    var description: String {
        return "traveling at \(currentSpeed) miles per hour"
    }
    func makeNoise() {
        // do nothing - an arbitrary vehicle doesn't necessarily make a noise
    }
}
let someVehicle = Vehicle()
print("Vehicle: \(someVehicle.description)")
// Vehicle: traveling at 0.0 miles per hour
```
 

Vehicle 클래스는 임의의 차량들의 공통적인 특성을 정의하지만, 그 자체로 많이 사용되진 않을 것이다. 좀 더 의미있게 만들려면 더 특정한 종류의 차량들을 묘사하도록 다듬어야 한다.

### Subclassing

_서브클래싱_ 은 이미 존재하는 클래스에 새로운 클래스를 베이싱 하는 작업이다. 서브클래스는 이미 존재하는 클래스에서 더 다듬을 수 있는 특성들을 상속받는다. 또한 새로운 특성등를 서브클래스에 추가 할 수도 있다.

서브클래스가 슈퍼클래스의 존재를 나타내기 위해 슈퍼클래스 이름 뒤에 서브클래스의 이름을 콜론(:)으로 구분하여 적는다.


```swift
class SomeSubclass: SomeSuperclass {
    // subclass definition goes here
}
```
 

다음 예시는 슈퍼클래스가 Vehicle인 서브클래스 Bicycle의 정의이다.


```swift
class Bicycle: Vehicle {
    var hasBasket = false
}
```
 

Bicycle 클래스는 자동적으로 currentSpeed, description 프로퍼티나 makeNoise()와 같은 Vehicle 클래스의 모든 특성들을 얻는다.

상속받은 특성들 이외에도, Bicycle 클래스는 새로운 Bool 타입 저장 프로퍼티 hasBasket을 정의한다.

hasBasket의 기본값이 false 이므로, Bicycle의 인스턴스를 새로 만들면 basket을 가지고 있지 않을 것(hasBasket의 값이 false 일 것) 이다. Bicycle의 인스턴스가 생성된 이후에 hasBasket의 프로퍼티를 true로 바꿔줄 수 있다.


```swift
let bicycle = Bicycle()
bicycle.hasBasket = true
```
 

Bicyle 인스턴스가 상속받은 currentSpeed 프로퍼티도 수정할 수 있고, 상속받은 description 프로퍼티를 쿼리할 수도 있다.


```swift
bicycle.currentSpeed = 15.0
print("Bicycle: \(bicycle.description)")
// Bicycle: traveling at 15.0 miles per hour
```
 

서브클래스를 서브클래싱할 수도 있다. 다음의 예시는 Bicycle의 서브클래스 Tandem을 만드는 예시이다.


```swift
class Tandem: Bicycle {
    var currentNumberOfPassengers = 0
}
```
 

Tandem은 Bicycle로부터 모든 프로퍼티와 메소드를 상속받는다. 차례로 (Bicycle이 Vehicle의 서브클래스니까) Vehicle의 모든 속성과 메소드도 상속받는다. 또한 Tandem 서브클래스는 새로운 디폴트 값이 0인 저장 프로퍼티 currentNumberOfPassengers를 추가한다.

Tandem의 인스턴스를 만들면 새로운 프로퍼티뿐만 아니라 Vehicle로부터 상속받은 description와 같이 상속받은 프로퍼티도 사용할 수 있다.


```swift
let tandem = Tandem()
tandem.hasBasket = true
tandem.currentNumberOfPassengers = 2
tandem.currentSpeed = 22.0
print("Tandem: \(tandem.description)")
// Tandem: traveling at 22.0 miles per hour
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
