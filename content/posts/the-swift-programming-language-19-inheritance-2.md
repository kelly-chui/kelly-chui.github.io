---
title: "[Swift] Inheritance(상속) - 2"
date: 2023-06-08
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Inheritance"]
weight: 19

draft: false
original: "https://junmusu.tistory.com/89"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Overriding

서브클래스는 상속 받을 수 있는 인스턴스 메소드, 타입 메소드, 인스턴스 프로퍼티, 타입 프로퍼티, 서브스크립트에 자신만의 커스텀 구현을 할 수 있다. 이것을 _오버라이딩_ 이라고 한다.

상속될 수 있는 특성을 오버라이드 하려면, 오버라이드를 하고 있는 정의 앞에 override 키워드를 붙인다. 이렇게 하면 실수로 중복 정의를 한 것이 아닌 오버라이드 했다는 것을 명확하게 보여줄 수 있다. 실수로 오버라이드 하는 것은 예측하지 못한 결과를 가져온다. 따라서 override 키워드 없이 오버라이드를 하면 컴파일할 때 에러로 검출된다.

또한 override 키워드는 오버라이드 선언과 매치되는 선언이 슈퍼클래스에 있는지 확인한다. 이는 오버라이딩 정의가 제대로 동작하도록 보장한다.

#### Accessing Superclass Method, Properties, and Subscripts

서브클래스에 메소드, 프로퍼티, 서브스크립트를 오버라이드를 제공할 때, 오버라이드의 일부로 슈퍼클래스의 구현을 사용하는 것이 유용할 때가 있다. 예를 들어 이미 존재하는 구현을 구체화 하거나, 상속받은 변수를 수정할 때 유용하다.

이러한 경우에, super를 사용하여 슈퍼클래스에 구현되어있는 프로퍼티, 메소드, 서브스크립트에 접근할 수 있다.

  - 오버라이드 된 메소드 someMethod()는 오버라이드 된 구현 내부에 super.someMethod()를 호출하여 슈퍼클래스 버전의 someMethod()를 호출할 수 있다.
  - 오버라이드 된 프로퍼티 someProperty는 오버라이드 된 getter나 setter의 구현 내부에 super.someProperty를 통해 슈퍼클래스 버전의 someProperty에 접근할 수 있다.
  - 오버라이드 된 서브스크립트 someIndex는 서브스크립트 구현 내부에서 super[someIndex]를 통해 슈퍼클래스의 같은 서브스크립트에 접근할 수 있다.



#### Overriding Methods

상속받은 인스턴스 혹은 타입 메소드를 서브 클래스 내부에서 다시 구현하여 오버라이드를 할 수 있다.

다음의 예시는 makeNoise()메소드를 오버라이드하는 Vehicle의 새로운 서브클래스 Train의 정의다.


```swift
class Train: Vehicle {
    override func makeNoise() {
        print("Choo Choo")
    }
}
```
 

Train의 새 인스턴스를 만들고, makeNoise()를 호출한다면, Train 서브클래스 버전의 메소드가 호출되는 것을 볼 수 있다.


```swift
let train = Train()
train.makeNoise()
// Prints "Choo Choo"
```
 

#### Overriding Properties

상속받은 인스턴스 혹은 타입 프로퍼티를 getter나 setter를 커스텀하거나 프로퍼티 옵저버를(슈퍼클래스의 프로퍼티 값이 변하는 것을 관찰한다.) 추가하여 오버라이드할 수있다.

**Overriding Property Getters and Setters**

커스텀한 getter(필요하다면 setter도)를 소스(슈퍼클래스)에서 저장 프로퍼티인지, 컴퓨티드 프로퍼티인지 상관없이 상속 받은 어떠한 프로퍼티에도 제공할 수 있다. 프로퍼티를 상속받으면, 그 프로퍼티의 특성(저장된 값이나, 계산 방식)을 서브클래스는 모르고, 단지 프로퍼티의 이름과 타입만 상속되기 때문이다. 컴파일러가 오버라이드한 프로퍼티와 동일한 이름과 타입을 가진 프로퍼티가 슈퍼클래스에 있는지 확인하기 위해 항상 이름과 타입을 명시해야 한다.

상속된 read-only 프로퍼티를 서브클래스에서 getter와 setter를 모두 제공하면, read-write 프로퍼티로 오버라이드할 수도 있다. 하지만 상속받은 read-write프로퍼티를 read-only 프로퍼티로 오버라이드할 수는 없다.

> **Note**  
>  setter를 프로퍼티 오버라이드에 제공하면, getter도 오버라이드를 위해 제공해야 한다. getter를 수정하고 싶지 않다면, 단순히 super.someProperty를 리턴하면 된다.

다음 예시는 Vehicle의 새로운 서브클래스 Car를 정의한다. Car 클래스는 디폴트 값이 1인 새로운 저장 프로퍼티 gear를 가지고 있다. 또한 Car 클래스는 현재 기어의 상태를 나타내기 위해, 상속 받은 description 프로퍼티를 오버라이드 한다.


```swift
class Car: Vehicle {
    var gear = 1
    override var description: String {
        return super.description + " in gear \(gear)"
    }
}
```
 

description 프로퍼티의 오버라이드는 super.description을 호출하면서 시작한다. Car 클래스 버전의 description은 추가적인 텍스트를 super.description의 끝에 붙여 현재 기어의 정보를 나타낸다.

Car의 인스턴스를 만들고 gear와 currentSpeed 프로퍼티를 설정하면, description 프로퍼티가 Car 클래스에 맞게 텍스트를 리턴하는 것을 볼 수 있다.


```swift
let car = Car()
car.currentSpeed = 25.0
car.gear = 3
print("Car: \(car.description)")
// Car: traveling at 25.0 miles per hour in gear 3
```
 

**Overriding Property Observers**

상속된 프로퍼티에 프로퍼티 옵저버를 추가하여 프로퍼티 오버라이드를 할 수도 있다. 이렇게 하면 상속된 프로퍼티가 원래 어떻게 구현되었는지에 상관 없이 그 값의 변화를 알 수 있다.

> **Note**  
>  상속된 상수 저장 프로퍼티나 read-only 프로퍼티에는 프로퍼티 옵저버를 추가할 수 없다. 이 값들은 설정할 수 없기 때문에, willSet이나 didSet을 제공하는 것은 적절하지 않다.  
>   
> 또한 같은 프로퍼티에 오버라이딩 setter와 오버라이딩 프로퍼티 옵저버를 둘다 제공할 수 없다. 만약 프로퍼티 값이 변하는 것을 알고 싶다면, setter를 통해서 관찰하면 된다.

다음의 예시는 Car의 서브클래스로 AutomaticCar를 정의한다. AutomaticCar 클래스는 오토 기어 박스를 가지고 있는 차를 대표한다.


```swift
class AutomaticCar: Car {
    override var currentSpeed: Double {
        didSet {
            gear = Int(currentSpeed / 10.0) + 1
        }
    }
}
```
 

AutomaticCar 인스턴스의 currentSpeed를 설정할 때 마다, 프로퍼티의 didSet 옵저버가 인스턴스의 gear 프로퍼티의 값을 적합하게 재설정한다.


```swift
let automatic = AutomaticCar()
automatic.currentSpeed = 35.0
print("AutomaticCar: \(automatic.description)")
// AutomaticCar: traveling at 35.0 miles per hour in gear 4
```
 

#### Preventing Overrides

메소드, 프로퍼티, 서브스크립트를 파이널로 표시하여 오버라이드를 막을 수 있다. final을 메소드나 프로퍼티 서브스크립트의 인트로듀서 키워드 앞에 작성함으로써 가능하다.(final var, final func, final class, final subscript)

파이널 메소드, 프로퍼티, 서브스크립트를 오버라이드 하려 시도하면, 컴파일 타임 에러가 발생한다. 클래스 익스텐션의 정의에서 추가한 메소드, 프로퍼티, 서브스크립트도 파이널로 표시할 수 있다.

class 키워드 앞에 final을 작성하여 클래스 전체를 파이널로 표시할 수 있다.(final class) 이 클래스의 서브클래스를 만드려고 하면 컴파일 타임 에러가 발생한다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
