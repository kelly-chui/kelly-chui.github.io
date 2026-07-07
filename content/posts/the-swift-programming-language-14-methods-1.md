---
title: "[Swift] Methods(메소드) - 1"
date: 2023-06-06
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Methods"]
weight: 14

draft: false
original: "https://junmusu.tistory.com/84"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Methods

메소드는 특정 타입에 연관된 함수이다. 클래스, 스트럭처, 열거형은 인스턴스로 작업하기 위한 기능이나 작업은 캡슐화 하기 위해 인스턴스 메소드를 선언할 수 있고, 타입 그 자체에 연관된 타입 메소드도 선언할 수 있다.

### Instance Methods

인스턴스 메소드는 특정 클래스, 스트럭처, 열거형에 속하는 함수이다. 인스턴스 프로퍼티에 접근, 수정하는 방법을 제공하거나 인스턴스의 목적에 맞는 기능을 제공하여 인스턴스가 기능을 가지게 한다. 인스턴스 메소드는 함수와 똑같은 구문을 사용한다.

인스턴스 메소드는 자신이 선언되어 있는 타입의 인스턴스 메소드나 타입에 암시적으로 접근 권한을 가지고 있다. 인스턴스 메소드는 자신이 선언되어 있는 타입의 인스턴스에서만 호출할 수 있으며, 밖에서 독립적으로 사용할 수 없다.

다음은 간단한 Counter 클래스의 예시이다.


```swift
class Counter {
    var count = 0
    func increment() {
        count += 1
    }
    func increment(by amount: Int) {
        count += amount
    }
    func reset() {
        count = 0
    }
}
```
 

Counter는 세개의 인스턴스 메소드를 정의한다.

  - increment() 카운터를 1만큼 증가시킨다.
  - increment(by:Int) 카운터를 들어온 정수만큼 증가시킨다.
  - reset() 카운터를 0으로 초기화시킨다.



인스턴스 메소드는 프로퍼티처럼 닷(.)구문을 통해 호출할 수 있다.


```swift
let counter = Counter()
// the initial counter value is 0
counter.increment()
// the counter's value is now 1
counter.increment(by: 5)
// the counter's value is now 6
counter.reset()
// the counter's value is now 0
```
 

함수처럼 메소드도 파라미터가 이름과 아규먼트 레이블을 가질 수 있다. 이는 메소드가 단지 특정 타입에 연관된 함수이기 때문이다.

#### The Self Property

모든 인스턴스는 암시적으로 자기 자신과 완전히 같은 self라는 프로퍼티를 가지고 있다. 인스턴스 메소드 내부에서 self 프로퍼티를 이용하여 자기 자신(인스턴스)을 참조할 수 있다.

위의 예시에 있는 increment() 메소드는 다음과 같이 쓸 수도 있다.


```swift
func increment() {
    self.count += 1
}
```
 

실제로는 self를 코드 내부에서 자주 쓸 일은 없다. 명시적으로 self를 작성하지 않아도, 스위프트는 현재 인스턴스의 프로퍼티나 메소드의 이름을 사용할 때마다, 그것을 참조한다고 추론하기 때문이다. 위 예시에서도 self.count가 아닌 count를 사용함으로 확인할 수 있다.

이 규칙의 대표적인 예외는 인스턴스 메소드의 파라미터 이름이 그 인스턴스의 프로퍼티 이름과 같을 때 발생한다. 이러한 상황에서는 파라미터 이름이 우선권을 가지게 된다. 따라서 둘을 구분하기 위해 self 프로퍼티를 사용해야한다.

다음 self가 파라미터 x와 같은 이름을 가진 프로퍼티 x를 구분하는 것을 보여주는 코드이다.


```swift
struct Point {
    var x = 0.0, y = 0.0
    func isToTheRightOf(x: Double) -> Bool {
        return self.x > x
    }
}
let somePoint = Point(x: 4.0, y: 5.0)
if somePoint.isToTheRightOf(x: 1.0) {
    print("This point is to the right of the line where x == 1.0")
}
// Prints "This point is to the right of the line where x == 1.0"
```
 

self를 작성하지 않는다면, 스위프트는 모든 x가 파라미터 x를 호출하는 것으로 추정한다.

#### Moifying Value Types from Within Instance Methods

스트럭처와 열거형은 값 타입이다. 따라서 기본적으로 값 타입의 프로퍼티는 인스턴스 메소드 내에서 수정될 수 없다.

하지만 스트럭처나 열거형의 프로퍼티를 메소드 내부에서 수정해야 할 필요가 있다면, 변경 행동(mutating behavior)메소드가 할 수 있도록 할 수 있다. 그러한 메소드는 프로퍼티를 메소드 내부에서 수정할 수 있으며, 변경 사항은 메소드가 끝난 후에 기록된다. 또 self에 완전히 새로운 인스턴스를 할당할 수도 있다. 이러한 경우에 메소드가 종료되면 새로운 인스턴스가 기존 인스턴스를 대체하게 된다.

mutating 키워드를 func 키워드 앞에 작성하여 메소드가 이러한 행동을 할 수 있게 한다.


```swift
struct Point {
    var x = 0.0, y = 0.0
    mutating func moveBy(x deltaX: Double, y deltaY: Double) {
        x += deltaX
        y += deltaY
    }
}
var somePoint = Point(x: 1.0, y: 1.0)
somePoint.moveBy(x: 2.0, y: 3.0)
print("The point is now at (\(somePoint.x), \(somePoint.y))")
// Prints "The point is now at (3.0, 4.0)"
```
 

Point 스트럭처는 특정 값 만큼 Point 인스턴스를 이동시키는 뮤테이팅 메소드 moveBy(x:y:)메소드를 정의한다. 이 메소드가 호출되면 새로운 포인트를 리턴하는 대신에 실제로 포인트 값을 수정한다. 

상수 스트럭처 타입에서는 뮤테이팅 메소드를 사용할 수 없다. 스트럭처가 값 타입이기 때문에 그 내부의 프로퍼티가 변수로 선언되었어도 변경할 수 없기 때문이다.

#### Assigning to self Within a Mutating Method

뮤테이팅 메소드는 self 프로퍼티에 완전히 새로운 인스턴스를 할당할 수 있다. 위의 예시는 다음과 같은 방식으로 다시 작성할 수도 있다.


```swift
struct Point {
    var x = 0.0, y = 0.0
    mutating func moveBy(x deltaX: Double, y deltaY: Double) {
        self = Point(x: x + deltaX, y: y + deltaY)
    }
}
```
 

이 예시의 뮤테이팅 moveBy(x:y:) 메소드는 x와 y의 값이 목표 위치로 설정된 새로운 구조를 만든다. 결과는 이전의 예시와 완전히 똑같다.

열거형의 뮤테이팅 메소드는 self 파라미터를 그 열거형의 다른 케이스로 변경할 수 있다.


```swift
enum TriStateSwitch {
    case off, low, high
    mutating func next() {
        switch self {
        case .off:
            self = .low
        case .low:
            self = .high
        case .high:
            self = .off
        }
    }
}
var ovenLight = TriStateSwitch.low
ovenLight.next()
// ovenLight is now equal to .high
ovenLight.next()
// ovenLight is now equal to .off
```
 

이 예제는 삼상스위치에 대해 정의한다. next() 메소드가 호출될 때마다 스위치는 세가지 상태로 순환한다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
