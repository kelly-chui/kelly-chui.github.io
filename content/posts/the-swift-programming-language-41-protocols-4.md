---
title: "The Swift Programming Language. Protocols (4)"
date: 2023-07-03
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Protocols"]
weight: 41

draft: false
original: "https://junmusu.tistory.com/114"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Protocol Composition

하나의 타입이 여러개의 프로토콜을 동시에 준수하도록 하는 것이 유용할 때가 있다. _프로토콜 구성(protocol composition)_ 을 통해 여러 개의 프로토콜을 하나의 프로토콜로 결합할 수 있다. 프로토콜 구성은 내부에 있는 모든 프로토콜의 요구사항을 결합한 임시 로컬 프로토콜을 정의한 것처럼 동작한다. 하지만 프로토콜 구성은 어떠한 새로운 프로토콜 타입도 정의하지 않는다.

프로토콜 구성은 SomeProtocol & AnotherProtocol의 형태를 가진다. 앰퍼샌드로 구분하여 필요한 수 만큼 프로토콜을 나열할 수 있다. 프로토콜 리스트에 추가로 프로토콜 구성은 필요로 하는 슈퍼클래스로 지정하기 위해 하나의 클래스 타입을 포함할 수도 있다.(주: 프로토콜 구성을 준수하려면 특정 클래스의 서브클래스이어야 할 때, 슈퍼클래스도 그 프로토콜 구성 내부에 포함시킨다.)

다음은 두개의 프로토콜 Named와 Aged를 함수 파라미터에 대해 하나의 프로토콜 구성 요구사항으로 결합하는 예시이다.


```swift
protocol Named {
    var name: String { get }
}
protocol Aged {
    var age: Int { get }
}
struct Person: Named, Aged {
    var name: String
    var age: Int
}
func wishHappyBirthday(to celebrator: Named & Aged) {
    print("Happy birthday, \(celebrator.name), you're \(celebrator.age)!")
}
let birthdayPerson = Person(name: "Malcolm", age: 21)
wishHappyBirthday(to: birthdayPerson)
// Prints "Happy birthday, Malcolm, you're 21!"
```
 

이 예시에서, Named 프로토콜은 String 타입 gettable 프로퍼티 name이라는 하나의 요구사항을 가지고 있다. Aged 프로토콜은 Int 타입 gettable 프로퍼티 age라는 하나의 요구사항을 가지고 있다. 두 프로토콜은 Person 스트럭처에 의해 도입된다.

이 예시는 wishHappyBirthday(to:) 함수를 정의한다. celebrator 파라미터의 타입은 Named & Aged이다. 이는 Named와 Aged 프로토콜을 준수하는 모든 타입을 뜻한다. 이는 두 프로토콜을 준수하기만 하면, 어떤 타입이 함수를 통해 전달되는지 상관하지 않는다.

예시에서 새로운 Person 인스턴스 birthdayPerson을 만들고 이 새 인스턴스를 wishHappyBirthday(to:) 함수에 전달한다. Person이 두 프로토콜을 준수하기 때문에 이 호출은 유효하다, 따라서 wishHappyBirthday(to:) 함수는 생일 축하 메시지를 출력할 수 있게 된다.

다음은 Named 프로토콜을 전에 나온 예시 Location 클래스와 결합시킨 예시이다.


```swift
class Location {
    var latitude: Double
    var longitude: Double
    init(latitude: Double, longitude: Double) {
        self.latitude = latitude
        self.longitude = longitude
    }
}
class City: Location, Named {
    var name: String
    init(name: String, latitude: Double, longitude: Double) {
        self.name = name
        super.init(latitude: latitude, longitude: longitude)
    }
}
func beginConcert(in location: Location & Named) {
    print("Hello, \(location.name)!")
}

let seattle = City(name: "Seattle", latitude: 47.6, longitude: -122.3)
beginConcert(in: seattle)
// Prints "Hello, Seattle!"
```
 

beginConcert(in:)은 Location의 서브클래스이면서 Named 프로토콜을 준수하는 모든 타입을 뜻하는 Location & Named 타입의 파라미터를 받는다. City는 두 요구사항을 모두 충족한다.

birthdayPerson을 beginConcert(in:) 함수에 전달하면 Person은 Location의 서브클래스가 아니기 때문에 유효하지 않다, 비슷하게 Location의 서브클래스이지만, Named 프로토콜을 준수하지 않는 클래스의 인스턴스를 beginConcert(in:)에 전달하면 이 또한 유효하지 않게 된다.

### Checking for Protocol Conformance

Type Casting에서 소개된 is와 as 연산자를 프로토콜 준수 여부를 확인하는데 사용할 수 있고, 특정 프로토콜로 캐스트할 수도 있다. 프로토콜을 확인하고 캐스트하는 것은 타입을 확인하고 캐스트 하는 것과 완전히 같은 구문을 사용한다.

  - is 연산자는 인스턴스가 프로토콜을 준수하면 true 아니면 false를 리턴한다.
  - as? 버전의 다운캐스트 연산자는 프로토콜 타입의 옵셔널 값을 리턴한다. 인스턴스가 프로토콜을 준수하지 않는다면 nil을 리턴한다.
  - as! 버전의 다운캐스트 연산자는 프로토콜 타입을 강제로 다운캐스트한다. 다운캐스트가 실패하면 런타임 에러를 발생시킨다.



다음의 예시는 하나의 Double 타입 gettable 프로퍼티 요구사항 area를 가지고 있는 프로토콜 HasArea를 정의한다.


```swift
protocol HasArea {
    var area: Double { get }
}
```
 

다음 두 클래스 Circle과 Country는 둘 다 HasArea 프로토콜을 준수한다.


```swift
class Circle: HasArea {
    let pi = 3.1415927
    var radius: Double
    var area: Double { return pi * radius * radius }
    init(radius: Double) { self.radius = radius }
}
class Country: HasArea {
    var area: Double
    init(area: Double) { self.area = area }
}
```
 

Circle 클래스는 area 프로퍼티 요구사항을 저장 프로퍼티 radius를 기반으로 한 컴퓨티드 프로퍼티로 구현했다. Country 클래스는 area 요구사항을 저장 프로퍼티로 직접 구현했다. 두 클래스 모두 HasArea 프로토콜을 올바르게 준수한다.

다음은 HasArea 프로토콜을 준수하지 않는 Animal 클래스이다.


```swift
class Animal {
    var legs: Int
    init(legs: Int) { self.legs = legs }
}
```
 

Circle, Country, Animal 클래스는 서로 공유하는 기반 클래스가 존재하지 않는다. 하지만 모두 클래스이므로, 이 세 타입의 인스턴스들은 AnyObject 타입 값을 저장하는 배열을 초기화 할 수 있다.


```swift
let objects: [AnyObject] = [
    Circle(radius: 2.0),
    Country(area: 243_610),
    Animal(legs: 4)
]
```
 

objects 배열은 Circle, Country, Animal의 인스턴스로 이루어진 배열 리털로 초기화 된다. 그 후 objects 배열을 순회할 수 있으므로, 배열 속의 각 원소가 HasArea 프로토콜을 준수하는지 체크할 수 있다.


```swift
for object in objects {
    if let objectWithArea = object as? HasArea {
        print("Area is \(objectWithArea.area)")
    } else {
        print("Something that doesn't have an area")
    }
}
// Area is 12.5663708
// Area is 243610.0
// Something that doesn't have an area
```
 

배열 속의 원소가 HasArea 프로토콜을 준수 할 때, as? 연산자에 의해 리턴된 옵셔널 값은 objectWithArea라는 상수로 옵셔널 바인딩 된다. objectWithArea 상수는 HasArea 타입인 것을 알고 있으므로, 타입 안전한 방법으로 area 프로퍼티에 접근이 가능해진다.

원소의 기존 타입은 캐스팅 프로세스에 의해 변경되지 않는다는 것을 알아두자. 이 원소들은 여전히 Circle, Country, Animal 타입이다. 하지만 objectWithArea 상수에 저장되어 있을 때는, HasArea 타입인 것으로만 알고 있으므로, area 프로퍼티만 접근 가능하다.

### Optional Protocol Requirements

프로토콜에 옵셔널 요구사항을 정의할 수 있다. 이 요구사항은 해당 프로토콜을 준수하는 타입들이 구현할 필요는 없다. 옵셔널 요구사항은 optional이 앞에 붙은 상태로 프로토콜의 정의의 일부로 작성된다. 옵셔널 요구사항은 Objective-C와 상호 운용하는 코드를 작성할 때 옵셔널 요구사항을 사용할 수 있다. 이때 프로토콜과 옵셔널 요구사항 모두 @objc 속성으로 지정되어야 한다. @objc 프로토콜은 스트럭처나 열거형에선 도입 불가능하고, 클래스에만 도입할 수 있는 것을 알아두자.

옵셔널 요구사항으로 메소드나 프로퍼티를 사용할 때, 그 타입은 자동적으로 옵셔널이 된다. 예를 들어, (Int) -> String 타입 메소드는 ((Int) -> String)? 타입이 된다. 함수의 리턴 값이 아닌 함수 타입 전체가 옵셔널 타입인 것을 알아두자.

옵셔널 프로토콜 요구사항은 그 프로토콜을 준수하는 타입이 해당 요구사항을 구현하지 않았을 가능성이 있기 때문에 옵셔널 체이닝으로 호출할 수 있다. someOptionalMethod?(someArgument) 와 같이 호출한 메소드의 이름 뒤에 물음표를 작성하여 옵셔널 메소드가 구현되었는지 확인한다. 옵셔널 체이닝에 대한 자세한 정보는 Optional Chaining에 나와있다.

다음의 예시는 증가량을 제공하는 외부 소스를 사용하는 정수 카운팅 클래스 Counter를 정의한다. 이 데이터 소스는 두 개의 옵셔널 요구사항을 가진 ConuterDataSource 프로토콜에 정의되어 있다.


```swift
@objc protocol CounterDataSource {
    @objc optional func increment(forCount count: Int) -> Int
    @objc optional var fixedIncrement: Int { get }
}
```
 

CounterDataSource 프로토콜은 옵셔널 메소드 요구사항 increment(forCount:)와 옵셔널 프로퍼티 요구사항 fixedIncrement를 정의한다. 이 요구사항들은 Counter 인스턴스의 적합한 증가량을 제공하는 두 가지 방법을 정의한다.

> **Note**  
>  엄밀히 말해서, CounterDataSource의 요구사항들은 모두 옵셔널이므로 아무것도 구현하지 않고도 해당 프로토콜을 준수하는 커스텀 클래스를 작성할 수 있다. 하지만 기술적으로는 가능해도 좋은 데이터 소스를 만들었다고 할 수는 없다.

CounterDataSource? 타입 옵셔널 프로퍼티 dataSource를 가지고 있는 Counter 클래스는 아래에 정의한다.


```swift
class Counter {
    var count = 0
    var dataSource: CounterDataSource?
    func increment() {
        if let amount = dataSource?.increment?(forCount: count) {
            count += amount
        } else if let amount = dataSource?.fixedIncrement {
            count += amount
        }
    }
}
```
 

카운터 클래스는 변수 프로퍼티 count에 현재 값을 저장한다. 또한 Counter 클래스는 호출될 때마다 count 프로퍼티를 증가시키는 increment 메소드를 정의한다.

increment() 메소드는 우선 데이터 소스에서 increment(forCount:) 구현을 검색하여 증가량을 찾는다. increment() 메소드는 옵셔널 체이닝을 사용하여 increment(forCount:)에 count 프로퍼티를 아규먼트로 전달하여 호출을 시도한다.

여기서 2단계의 옵셔널 체이닝이 동작하는 것을 알아두자. 첫 번째로 dataSource가 nil일 수 있으므로, increment(forCount)는 dataSource가 nil이 아닐때만 호출될수 있음을 나타내기 위해 dataSource의 이름 뒤에 물음표를 붙인다. 두 번째로 dataSource가 존재하더라도, increment(forCount:)가 옵셔널 요구사항이기 때문에 이를 구현했음을 보장할 수 없기 때문에 옵셔널 체이닝을 통해 처리한다. 따라서 increment(forCount:)는 해당 메소드가 구현되었을때만 호출된다. 이는 increment(forCount:)도 뒤에 물음표가 작성된 이유이다.

increment(forCount:)의 호출은 앞서 나온 두 이유로 실패할 수도 있기 때문에 이 호출의 리턴값은 옵셔널 Int 값이 된다. 이는 increment(forCount:)가 옵셔널이 아닌 Int 값을 리턴하도록 정의되었어도 적용된다. 2단계의 옵셔널 체이닝을 거쳐도, 결과는 여전히 하나의 옵셔널로 래핑된다. 여러 단계의 옵셔널 체이닝 작업에 대한 정보는 Linking Multiple Levels of Chaining에 나와있다.

increment(forCount:)를 호출한 후에 리턴된 옵셔널 Int 값은 옵셔널 바인딩을 통해 상수 amount로 언래핑 된다. 옵셔널 Int가 값을 가지고 있다면 — 델리게이트와 메소드가 동시에 존재하고 메소드가 값을 리턴한다면 (주: 여기서 델리게이트는 dataSource, 메소드는 increment(forCount:)를 뜻함) — 언래핑된 amount는 저장 프로퍼티 count에 더해지고, 값을 증가시키는 작업은 완료된다.

만약 increment(forCount:) 메소드에서 값을 검색하는 것이 불가능 하다면 — dataSource가 nil이거나, increment(forCount:)를 구현하지 않았거나 — increment()메소드는 데이터 소스의 fixedIncrement 프로퍼티에서 값을 대신 검색한다. fixedIncrement 프로퍼티 또한 옵셔널 요구사항이다, 따라서 그 값은 fixedIncrement가 옵셔널이 아닌 Int 프로퍼티여도 옵셔널 값이 된다.

다음은 데이터 소스가 쿼리될 때마다 상수 3을 리턴하는 CounterDataSource의 간단한 구현이다. 이는 옵셔널 fixedIncrement 프로퍼티 요구사항을 구현함으로써 수행한다:


```swift
class ThreeSource: NSObject, CounterDataSource {
    let fixedIncrement = 3
}
```
 

ThreeSource 인스턴스를 새로운 Counter 인스턴스의 데이터 소스로 사용할 수 있다:


```swift
var counter = Counter()
counter.dataSource = ThreeSource()
for _ in 1...4 {
    counter.increment()
    print(counter.count)
}
// 3
// 6
// 9
// 12
```
 

위의 코드는 새로운 Counter 인스턴스를 생성하고 데이터 소스를 새 ThreeSource 인스턴스로 설정한다. 그리고 counter의 increment() 메소드를 네 번 호출한다. 예상한 것 처럼 count 프로퍼티는 increment()가 호출될 때 마다 3씩 증가한다.

다음은 현재 값에 따라 값을 증가시키거나 감소시켜서 0으로 만드는 좀 더 복잡한 데이터소스 TowardsZeroSource이다:


```swift
class TowardsZeroSource: NSObject, CounterDataSource {
    func increment(forCount count: Int) -> Int {
        if count == 0 {
            return 0
        } else if count < 0 {
            return 1
        } else {
            return -1
        }
    }
}
```
 

TowardZeroSource 클래스는 CounterDataSource의 옵셔널 increment(forCount:) 메소드를 count 아규먼트 값을 사용하여 증가시킬지, 감소시킬지 결정한다. count가 이미 0이라면, 0을 리턴하여 계산이 더 이상 필요하지 않다는 것을 나타낸다.

TowardsZeroSource의 인스턴스를 이미 존재하는 Counter 인스턴스가 -4에서 0까지 카운트 하도록 사용할 수 있다. 카운터가 0에 도달하면, 더 이상 계산하지 않는다.


```swift
counter.count = -4
counter.dataSource = TowardsZeroSource()
for _ in 1...5 {
    counter.increment()
    print(counter.count)
}
// -3
// -2
// -1
// 0
// 0
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
