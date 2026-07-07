---
title: "The Swift Programming Language. Properties (2)"
date: 2023-06-02
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Properties"]
weight: 12

draft: false
original: "https://junmusu.tistory.com/82"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Property Observers

프로퍼티 옵저버(Property Observer)는 프로퍼티 값의 변화를 관측하고 반응한다. 프로퍼티 옵저버는 새로 설정된 값이 이전의 값과 같더라도, 프로퍼티의 값이 설정 될 때 마다 반응한다.

프로퍼티 옵저버는 다음의 위치들에 추가할 수 있다.

  - 직접 정의한 저장 프로퍼티
  - 상속받은 저장 프로퍼티
  - 상속받은 컴퓨티드 프로퍼티



서브클래스에서 상속받은 프로퍼티를 오버라이드 하여 프로퍼티 옵저버를 추가할 수 있다. 직접 정의한 컴퓨티드 프로퍼티의 경우에는 setter를 사용하면 프로퍼티 옵저버를 사용하지 않고도 값의 변화를 관측하고 응답할 수 있다.

프로퍼티 옵저버는 두 종류가 있으며, 둘을 같이 쓸 수도 있고 하나만 쓸 수도 있다.

  - willSet은 새로운 값이 저장되기 직전에 호출된다.
  - didSet은 새로운 값이 저장된 직후 호출된다.



willSet을 구현하면, 프로퍼티의 새로운 값이 상수 파라미터로 전달된다. 이 파라미터의 이름을 직접 지을 수 있으며 willSet 구현 코드 내부에서 사용할 수 있다. 파라미터의 이름을 짓지 않는다면 newValue라는 디폴트 이름을 가지게 된다.

비슷하게 didSet을 구현할 때는 프로퍼티의 이전 값이 상수 파라미터로 전달된다. 이 파라미터의 이름을 지을 수 있고, 짓지 않는 경우에는 oldValue라는 디폴트 이름을 갖는다. (값이 저장된 이후의 시점이기 때문에 프로퍼티는 새로운 값을 가지고 있다.)

> **Note  
> ** 슈퍼 클래스의 이니셜라이저가 호출된 이후 서브 클래스의 이니셜라이저가 프로퍼티의 값을 설정할 때 슈퍼 클래스의 willSet과 didSet 옵저버가 호출된다. 슈퍼 클래스의 이니셜라이저가 호출되기 전 까지 호출되지 않는다.

다음은 willSet과 didSet의 사용 예시이다.


```swift
class StepCounter {
    var totalSteps: Int = 0 {
        willSet(newTotalSteps) {
            print("About to set totalSteps to \(newTotalSteps)")
        }
        didSet {
            if totalSteps > oldValue  {
                print("Added \(totalSteps - oldValue) steps")
            }
        }
    }
}
let stepCounter = StepCounter()
stepCounter.totalSteps = 200
// About to set totalSteps to 200
// Added 200 steps
stepCounter.totalSteps = 360
// About to set totalSteps to 360
// Added 160 steps
stepCounter.totalSteps = 896
// About to set totalSteps to 896
// Added 536 steps
```
 

StepCounter 클래스는 totalSteps 프로퍼티를 Int 타입으로 선언한다. totalSteps 프로퍼티는 willSet과 didSet 옵저버를 가지고 있는 저장 프로퍼티이다.

totalSteps의 willSet과 didSet 옵저버는 프로퍼티가 새로운 값을 할당 받을 때 마다 호출된다.(새로운 값이 이전 값과 같아도 상관없이 호출된다.)

이 예시의 willSet 프로퍼티는 커스텀 파라미터 이름 newTotalSteps을 사용하여 새로운 값을 전달 받고, didSet 프로퍼티는 커스텀 파라미터 이름을 사용하는 대신, 파라미터의 디폴트 이름인 oldValue를 사용한다.

> **Note**  
>  옵저버가 있는 프로퍼티를 함수에 in-out 파라미터로 전달하면, in-out 파라미터의 copy-in copy-out 메모리 모델(함수 종료 후에 프로퍼티 값이 다시 쓰여진다) 때문에 willSet과 didSet 옵저버가 호출된다. 

### Property Wrappers

프로퍼티 래퍼(property wrapper)는 프로퍼티가 저장되는 방식을 관리하는 코드와 프로퍼티를 정의하는 코드 사이에 분리 레이어를 추가한다. 예를 들어, 스레드 안정성(thread-safety) 확인을 제공하는 프로퍼티들이나 데이터를 데이터베이스에 저장해야하는 프로퍼티들의 경우 그러한 코드를 모든 프로퍼티에 각각 작성해 줘야 한다. 프로퍼티 래퍼를 사용하면 래퍼를 정의할 때 한번 코드를 작성하여 다수의 프로퍼티에 해당 관리 코드를 적용할 수 있다.

프로퍼티 래퍼를 정의하려면, wrappedValue 프로퍼티를 정의하는 스트럭처, 열거형, 클래스를 만든다. 아래의 코드에서 TwelveOrLess 스트럭처는 래핑한 값이 12 이하이도록 한다. 만약 12 이상의 숫자를 저장하면, 대신 12가 저장된다.


```swift
@propertyWrapper
struct TwelveOrLess {
    private var number = 0
    var wrappedValue: Int {
        get { return number }
        set { number = min(newValue, 12) }
    }
}
```
 

setter는 새 값이 12 이하인지 확인하고, getter는 저장된 값을 리턴한다.

> **Note**  
>  위 예시에서 number는 private로 선언되어 TwelveOrLess의 구현 내부에서만 사용할 수 있다. 어떤 곳에 있는 코드든 WrappedValue의 getter와 setter를 사용하여 값에 접근 할 수 있지만, number에 직접 접근하지 못하게 한다.

프로퍼티의 뒤에 래퍼의 이름을 속성(attribute)으로 적어 프로퍼티에 래퍼를 적용할 수 있다. 다음 예시는 TwelveOrLess 프로퍼티 래퍼를 사용하는 스트럭처의 예시이다.


```swift
struct SmallRectangle {
    @TwelveOrLess var height: Int
    @TwelveOrLess var width: Int
}

var rectangle = SmallRectangle()
print(rectangle.height)
// Prints "0"

rectangle.height = 10
print(rectangle.height)
// Prints "10"

rectangle.height = 24
print(rectangle.height)
// Prints "12"
```
 

특성 속성 구문(special attribute syntax)의 어드밴티지를 받지 않고, 동일한 동작을 할 수도 있다. 아래의 코드는 위 예시를 @TwelveOrLess를 사용하지 않고 다시 작성한 것이다.


```swift
struct SmallRectangle {
    private var _height = TwelveOrLess()
    private var _width = TwelveOrLess()
    var height: Int {
        get { return _height.wrappedValue }
        set { _height.wrappedValue = newValue }
    }
    var width: Int {
        get { return _width.wrappedValue }
        set { _width.wrappedValue = newValue }
    }
}
```
 

_height와 _width 프로퍼티는 프로퍼티 래퍼의 인스턴스를 가진다.

#### Setting Initial Values for Wrapped Properties

위의 예시에서는 TwelveOrLess에서 정의한 number의 초기 값으로 래핑된 프로퍼티의 초기 값을 설정한다. 이 프로퍼티 래퍼를 사용한 코드는 TwelveOrLess로 래핑된 프로퍼티들에게 다른 초기 값을 줄 수 없다. 예를 들어, SmallRectangle의 정의에서 height나 width의 초기값을 줄 수없다. 따라서 초기 값을 설정하거나 다른 사용자 지정 행동을 위해 프로퍼티 래퍼는 이니셜라이저가 필요하다. 

다음 예시는 이니셜라이저가 최대 값과 래핑될 값을 설정하는 TwelveOrLess의 확장 smallNumber이다.


```swift
@propertyWrapper
struct SmallNumber {
    private var maximum: Int
    private var number: Int

    var wrappedValue: Int {
        get { return number }
        set { number = min(newValue, maximum) }
    }

    init() {
        maximum = 12
        number = 0
    }
    init(wrappedValue: Int) {
        maximum = 12
        number = min(wrappedValue, maximum)
    }
    init(wrappedValue: Int, maximum: Int) {
        self.maximum = maximum
        number = min(wrappedValue, maximum)
    }
}
```
 

smallNumber는 세가지 이니셜라이저를 가지고 있다. 아래의 예시들은 이 이니셜라이저들이 어떻게 쓰이는지 보여준다.

프로퍼티에 래퍼를 적용하고 초기 값을 특정하지 않는다면, 스위프트는 init() 이니셜라이저로 래퍼를 설정한다.


```swift
struct ZeroRectangle {
    @SmallNumber var height: Int
    @SmallNumber var width: Int
}

var zeroRectangle = ZeroRectangle()
print(zeroRectangle.height, zeroRectangle.width)
// Prints "0 0"
```
 

height와 width를 래핑하는 SmallNumber의 인스턴스는 SmallNumber()를 통하여 생성된다.


```swift
struct UnitRectangle {
    @SmallNumber var height: Int = 1
    @SmallNumber var width: Int = 1
}

var unitRectangle = UnitRectangle()
print(unitRectangle.height, unitRectangle.width)
// Prints "1 1"
```
 

만약 = 1을 래핑된 프로퍼티에 작성하면, init(wrappedValue:) 이니셜라이저를 호출한 것으로 번역된다. 


```swift
struct NarrowRectangle {
    @SmallNumber(wrappedValue: 2, maximum: 5) var height: Int
    @SmallNumber(wrappedValue: 3, maximum: 4) var width: Int
}

var narrowRectangle = NarrowRectangle()
print(narrowRectangle.height, narrowRectangle.width)
// Prints "2 3"

narrowRectangle.height = 100
narrowRectangle.width = 100
print(narrowRectangle.height, narrowRectangle.width)
// Prints "5 4"
```
 

사용자 지정 속성 뒤에 괄호를 만들어 아규먼트를 작성해주면 스위프트는 이러한 아규먼트를 받는 이니셜라이저를 사용해 래퍼를 설정한다.

앞서 나온 예시들을 합쳐서 이런식으로도 사용 가능하다.


```swift
struct MixedRectangle {
    @SmallNumber var height: Int = 1
    @SmallNumber(maximum: 9) var width: Int = 2
}

var mixedRectangle = MixedRectangle()
print(mixedRectangle.height)
// Prints "1"

mixedRectangle.height = 20
print(mixedRectangle.height)
// Prints "12"
```
 

#### Projecting a Value From a Property Wrapper

프로퍼티 래퍼는 프로젝팅된 값(projected value)을 사용하여 추가 기능을 드러낼 수 있다. 예를 들어 데이터베이스 접근을 관리하는 프로퍼티 래퍼는 flushDatabaseConnection() 메소드를 프로젝팅 된 값을 통해 드러낼 수 있다. 프로젝팅된 값의 이름은 래핑된 값의 이름과 같지만 앞에 달러 기호($)가 붙는다.

위의 SmallNumber 예시에서는 프로퍼티를 너무 높은 숫자로 설정했을때, 프로퍼티 래퍼는 그 수를 조정하여 저장한다. 아래의 코드는 프로퍼티에 새로운 값을 저장하기전에 프로퍼티 래퍼가 값을 조정하였는지 알기 위해 SmallNumber 스트럭처에 projectedValue 프로퍼티를 추가했다.


```swift
@propertyWrapper
struct SmallNumber {
    private var number: Int
    private(set) var projectedValue: Bool

    var wrappedValue: Int {
        get { return number }
        set {
            if newValue > 12 {
                number = 12
                projectedValue = true
            } else {
                number = newValue
                projectedValue = false
            }
        }
    }

    init() {
        self.number = 0
        self.projectedValue = false
    }
}
struct SomeStructure {
    @SmallNumber var someNumber: Int
}
var someStructure = SomeStructure()

someStructure.someNumber = 4
print(someStructure.$someNumber)
// Prints "false"

someStructure.someNumber = 55
print(someStructure.$someNumber)
// Prints "true"
```
 

someStructure.$someNumber는 래퍼의 프로젝팅된 값에 접근한다. 12보다 작은 숫자를 저장하면 프로젝팅 된 값이 false가 되고 높은 숫자를 저장하면 true가 된다.

프로퍼티 래퍼는 프로젝팅된 값으로 어떠한 타입이든지 리턴할 수있다. 이 예시에서 프로퍼티 래퍼는 숫자가 조정되었는지의 정보만 드러낸다. 더 많은 정보를 드러내기 위해 다른 타입의 인스턴스나 self를 리턴할 수 있다.

프로젝팅된 값을 프로퍼티 getter나 인스턴스의 메소드로 접근할 때는 프로퍼티 이름 뒤에 적는 self. 을 생략할 수 있다. 다음 예제 코드는 $height와 $width로 height와 width 래퍼의 프로젝팅된 값을 참조한다.


```swift
enum Size {
    case small, large
}

struct SizedRectangle {
    @SmallNumber var height: Int
    @SmallNumber var width: Int

    mutating func resize(to size: Size) -> Bool {
        switch size {
        case .small:
            height = 10
            width = 20
        case .large:
            height = 100
            width = 100
        }
        return $height || $width
    }
}
```
 

프로퍼티 래퍼 구문은 단지 구문적 설탕(syntactic sugar)이기 때문에 height와 width에 접근하는 것은 다른 프로퍼티에 접근하는 것과 똑같이 동작한다.

#### Global and Local Variables

전역 변수와 로컬 변수도 컴퓨티드 프로퍼티나 프로퍼티 옵저버와 같은 기능을 쓸 수 있다. 컴퓨티드 변수는 값을 저장하기 보다는 계산을 해주고, 컴퓨티드 프로퍼티와 똑같은 방법으로 작성한다.

> **Note**  
>  글로벌 변수와 상수는 lazy 저장 프로퍼티와 비슷하게 lazy하게 계산된다. 하지만 lazy 키워드를 붙일 필요가 없다. 반대로, 로컬 변수는 절대로 lazy하게 계산되지 않는다.

로컬 저장 변수에도 프로퍼티 래퍼를 적용할 수 있지만, 전역 변수나 컴퓨티드 변수에는 적용할 수 없다. 아래의 코드에서 myNumber는 SmallNumber를 프로퍼티 래퍼로 사용한다.


```go
func someFunction() {
    @SmallNumber var myNumber: Int = 0

    myNumber = 10
    // now myNumber is 10

    myNumber = 24
    // now myNumber is 12
}
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
