---
title: "The Swift Programming Language. Protocols (1)"
date: 2023-06-30
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Protocols"]
weight: 38

draft: false
original: "https://junmusu.tistory.com/111"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Protocols

_프로토콜(protocol)_ 은 특정 작업이나 기능에 적합한 메소드, 프로퍼티, 기타 요구사항에 대한 청사진을 정의한다. 프로토콜은 해당 요구사항들을 실제로 구현하기 위해 클래스, 스트럭처, 열거형에서 도입할 수 있다. 프로토콜의 요구사항들을 만족하는 타입을 프로토콜을 _준수한다고(conform)_ 말한다.

프로토콜을 준수하고 있는 타입이 반드시 구현해야하는 요구사항을 지정하는 것 외에도, 프로토콜을 확장하여 이러한 요구사항들의 일부를 구현하거나, 그 프로토콜을 준수하고 있는 타입이 사용할 수 있는 기능을 추가할 수 있다.

### Protocol Syntax

프로토콜은 클래스, 스트럭처, 열거형과 매우 비슷한 방법으로 정의한다:


```swift
protocol SomeProtocol {
    // protocol definition goes here
}
```
 

커스텀 타입은 특정 프로토콜을 도입할 때, 타입 정의의 일부로 타입의 이름 뒤에 콜론으로 구분하여 작성한다. 다수의 프로토콜을 채택할 때는 프로토콜을 컴마로 구분하여 리스트로 작성한다:


```swift
struct SomeStructure: FirstProtocol, AnotherProtocol {
    // structure definition goes here
}
```
 

클래스가 슈퍼클래스를 가지고 있을 때는 채택한 프로토콜들의 앞에 슈퍼클래스의 이름을 적는다.


```swift
class SomeClass: SomeSuperclass, FirstProtocol, AnotherProtocol {
    // class definition goes here
}
```
 

> **Note**  
>  프로토콜은 타입이기 때문에 스위프트의 다른 타입들과 같이 이름 첫 글자를 대문자로 작성한다.

### Property Requirements

프로토콜은 인스턴스 특정 이름 및 타입의 프로퍼티나 타입 프로퍼티를 준수하고 있는 타입이 제공하도록 요구할 수 있다. 프로토콜은 요구하는 프로퍼티가 저장 프로퍼티인지 컴퓨티드 프로퍼티인지 특정하지 않는다 — 단지 요구하는 프로퍼티의 이름과 타입만을 특정한다. 또한 프로토콜은 어떤 프로퍼티가 gettable이어야 하는지 혹은, gettable and settable이어야 하는지를 지정한다.

프로토콜이 프로퍼티가 gettable and settable인 것을 요구한다면, 그 프로퍼티는 상수 저장 프로퍼티나, read-only 컴퓨티드 프로퍼티일 수 없다. 프로토콜이 gettable인 프로퍼티를 요구한다면, 그 요구사항은 어떠한 프로퍼티도 만족할 수 있다(프로퍼티가 settable이더라도 유효하다.)

프로퍼티 요구사항은 항상 변수 프로퍼티로 선언된다, Gettable and settable 프로퍼티는 타입 선언 뒤에 { get set } 으로 작성하여 나타내고, gettable 프로퍼티는 { get }을 작성하여 나타낸다.


```swift
protocol SomeProtocol {
    var mustBeSettable: Int { get set }
    var doesNotNeedToBeSettable: Int { get }
}
```
 

타입 프로퍼티 요구사항을 프로퍼티에 작성할 때는 항상 static 키워드를 앞에 붙인다. 이 규칙은 해당 프로퍼티가 클래스 내부에서 구현될 때, class나 static 키워드가 앞에 붙어있는 상황에서도 유지된다.


```swift
protocol AnotherProtocol {
    static var someTypeProperty: Int { get set }
}
```
 

다음은 하나의 프로퍼티 요구사항만 있는 프로토콜의 예시이다.


```swift
protocol FullyNamed {
    var fullName: String { get }
}
```
 

FullyNamed 프로토콜은 이를 준수하고 있는 타입이 정규화된 이름을 제공하도록 요구한다. 이 프로토콜은 준수하는 타입의 어떠한 특성도 특정하지 않는다. — 단지 준수하는 타입이 스스로의 풀 네임을 제공하도록 특정한다. 이 프로토콜은 모든 FullyNamed 타입이 String 타입 gettable 인스턴스 프로퍼티 fullName을 가져야 한다고 명시한다.

다음은 FullyNamed 프로토콜을 준수하는 간단한 스트럭처의 예시이다:


```swift
struct Person: FullyNamed {
    var fullName: String
}
let john = Person(fullName: "John Appleseed")
// john.fullName is "John Appleseed"
```
 

이 예시는 Person이라는 스트럭처를 정의한다. 이 스트럭처는 정의의 첫 번째 라인에 FullNamed 프로토콜을 도입한 것을 보여준다.

Person의 각 인스턴스는 fullName이라는 하나의 String 타입 저장 프로퍼티를 가지고 있다. 이는 FullyNamed 프로토콜의 요구사항을 만족하고, Person이 정확하게 그 프로토콜을 준수하고 있다는 것을 의미한다.(스위프트는 프로토콜의 요구사항이 만족되지 않았을 때 컴파일 타임 에러를 발생시킨다.)

다음은 FullyNamed 프로토콜을 준수하는 좀 더 복잡한 클래스이다.


```swift
class Starship: FullyNamed {
    var prefix: String?
    var name: String
    init(name: String, prefix: String? = nil) {
        self.name = name
        self.prefix = prefix
    }
    var fullName: String {
        return (prefix != nil ? prefix! + " " : "") + name
    }
}
var ncc1701 = Starship(name: "Enterprise", prefix: "USS")
// ncc1701.fullName is "USS Enterprise"
```
 

이 클래스는 fullName 프로퍼티 요구사항을 우주선에 대한 read-only 컴퓨티드 프로퍼티로 만들었다. 각 Starship 클래스의 인스턴스는 필수적인 name과 부가적인 prefix를 저장한다. fullName 프로퍼티는 prefix 값이 존재할 때 사용하고, 우주선의 풀 네임을 만들기 위해 name 앞에 붙인다.

### Method Requirements

프로토콜은 준수하는 타입이 특정 인스턴스 메소드나 타입 메소드를 구현하도록 요구할 수 있다. 이 메소드들은 프로토콜의 정의 내에서 일반적인 인스턴스 메소드나 타입 메소드와 정확하게 같은 방법으로 작성되지만, 메소드의 본문이 존재하지 않는다. 일반적인 메소드와 같은 규칙으로 가변 파라미터도 허용되지만, 프로토콜의 정의 내부에 있는 메소드 파라미터에는 디폴트 값을 지정할 수 없다.

타입 프로퍼티 요구사항처럼, 프로토콜의 타입 메소드 요구사항에는 앞에 static 키워드를 붙여야한다. 이는 클래스에서 해당 타입 메소드가 구현될 때 class 혹은 static 키워드가 앞에 붙어있는 상황에서도 유지된다:


```swift
protocol SomeProtocol {
    static func someTypeMethod()
}
```
 

다음의 예시는 하나의 인스턴스 메소드 요구사항이 있는 프로토콜을 정의한다.


```swift
protocol RandomNumberGenerator {
    func random() -> Double
}
```
 

RandomNumberGenerator 프로토콜은 모든 준수하는 타입이 호출되었을 때 Double을 리턴하는 인스턴스 메소드 random을 가지고 있도록 요구한다. 

RandomNumberGenerator 프로토콜은 각 난수가 어떻게 생성되는지에 대한 어떠한 추정도 하지 않는다. — 단순히 생성기가 새로운 난수를 생성하는 표준적인 방법을 요구할 뿐이다.

다음은 RandomNumberGenerator 프로토콜을 도입하고 준수하는 클래스의 구현이다. 이 클래스는 _linear congruential generator_ 라고 알려진 알고리즘을 사용하여 의사난수 생성기를 구현한다.


```swift
class LinearCongruentialGenerator: RandomNumberGenerator {
    var lastRandom = 42.0
    let m = 139968.0
    let a = 3877.0
    let c = 29573.0
    func random() -> Double {
        lastRandom = ((lastRandom * a + c)
            .truncatingRemainder(dividingBy:m))
        return lastRandom / m
    }
}
let generator = LinearCongruentialGenerator()
print("Here's a random number: \(generator.random())")
// Prints "Here's a random number: 0.3746499199817101"
print("And another one: \(generator.random())")
// Prints "And another one: 0.729023776863283"
```
 

#### Mutating Method Requirements

가끔씩 메소드가 자신이 속한 인스턴스를 수정(mutate) 해야하는 경우가 있다. 예를 들어 값 타입의 메소드에서는 mutating 키워드를 사용하여 그 메소드가 자신이 속한 인스턴스와 그 인스턴스의 프로퍼티들을 수정할 수 있다는 것을 나타낸다. 이러한 프로세스는 Modifying Value Types from Within Instance Methods에 설명되어 있다.

프로토콜을 채택한 타입의 인스턴스를 수정하려는 의도를 가진 인스턴스 메소드 요구사항을 정의하려면, 프로토콜 정의 내부에서 해당 메소드 앞에 mutating 키워드를 붙인다. 이는 스트럭처나 열거형이 프로토콜을 도입하고, 요구사항을 만ㅇ족할 수 있게 해준다.

> **Note**  
>  프로토콜 인스턴스 메소드 요구사항을 mutating으로 지정했을 때, 클래스에서 해당 메소드를 구현할 때는 mutating 키워드를 작성할 필요가 없다. mutating 키워드는 스트럭처와 열거형에서만 사용한다.

아래의 예시는 toggle이라는 하나의 인스턴스 메소드 요구사항을 정의하는 Togglable이라는 프로토콜을 정의한다. 이름처럼 toggle() 메소드는 일반적으로 준수하는 타입의 프로퍼티를 수정하여 해당 타입의 상태를 토글하거나 전환하는 의도를 가지고 있다.

toggle() 메소드는 호출되었을 때 준수하는 인스턴스의 상태를 변화시킬 것으로 예상된다는 것을 나타내기 위해 mutating 키워드로 지정되어 있다:


```swift
protocol Togglable {
    mutating func toggle()
}
```
 

스트럭처나 열거형에서 쓰기 위해 Togglable 프로토콜을 구현한 경우, 그 스트럭처나 열거형은 toggle() 메소드를 mutating 키워드와 함께 구현하여 해당 프로토콜을 준수할 수 있다.

아래의 예시는 OnOffSwitch라는 열거형을 정의한다. 이 열거형은 열거형 케이스로 on, off로 나타나 있는 두 개의 상태 사이에서 토글된다. 이 열거형의 toggle 구현은 프로토콜의 요구사항에 맞추기 위해 mutating으로 지정되어 있다.


```swift
enum OnOffSwitch: Togglable {
    case off, on
    mutating func toggle() {
        switch self {
        case .off:
            self = .on
        case .on:
            self = .off
        }
    }
}
var lightSwitch = OnOffSwitch.off
lightSwitch.toggle()
// lightSwitch is now equal to .on
```
 

### Initializer Requirements

프로토콜은 준수하고 있는 타입들이 특정한 이니셜라이저를 구현하도록 요구할 수 있다. 이러한 이니셜라이저들은 프로토콜 정의의 일부로 일반적인 이니셜라이저와 같은 방법으로 작성되지만, 이니셜라이저 본문이 존재하지 않는다:


```swift
protocol SomeProtocol {
    init(someParameter: Int)
}
```
 

#### Class Implementations of Protocol Initializer Requirements

프로토콜의 이니셜라이저 요구사항을 그 프로토콜을 준수하는 타입에서 데지그네이티드 이니셜라이저 혹은 컴비니언스 이니셜라이저로 구현할 수 있다. 두 케이스 모두 이니셜라이저를 구현 할때 required로 지정해야 한다.


```swift
class SomeClass: SomeProtocol {
    required init(someParameter: Int) {
        // initializer implementation goes here
    }
}
```
 

required를 사용하면 명시적이거나 상속받은 이니셜라이저 요구사항 구현을 해당 프로토콜을 준수하는 타입의 모든 서브클래스에게 제공하는 것을 보장한다. 따라서 서브클래스들도 해당 프로토콜을 준수하게 된다.

> **Note**  
>  final로 지정된 클래스는 서브클래스가 없기 때문에 프로토콜 이니셜라이저 구현에 required를 지정할 필요가 없다.

서브클래스가 오버라이드한 슈퍼클래스의 데지그네이티드 이니셜라이저가 프로토콜의 이니셜라이저 요구사항과 매치될 때, 해당 이니셜라이저를 required와 override로 동시에 지정한다.


```swift
protocol SomeProtocol {
    init()
}

class SomeSuperClass {
    init() {
        // initializer implementation goes here
    }
}

class SomeSubClass: SomeSuperClass, SomeProtocol {
    // "required" from SomeProtocol conformance; "override" from SomeSuperClass
    required override init() {
        // initializer implementation goes here
    }
}
```
 

#### Failable Initializer Requirements

프로토콜은 실패 가능한 이니셜라이저 요구사항을 정의할 수 있다.

실패 가능한 이니셜라이저 요구사항은 해당 프로토콜을 준수하는 타입의 실패 가능한/불가능한 이니셜라이저에 의해 만족될 수 있다. 실패 불가능한 이니셜라이저 요구사항은 실패 불가능한 이니셜라이저 혹은 암시적으로 언래핑된 실패 가능한 이니셜라이저에 의해 만족될 수 있다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
