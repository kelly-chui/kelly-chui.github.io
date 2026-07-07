---
title: "[Swift] Generics(제네릭) - 4"
date: 2023-08-07
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Generics"]
weight: 46

draft: false
original: "https://junmusu.tistory.com/127"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Associated Types

프로토콜을 정의할때, 프로토콜의 정의의 일부로 하나 혹은 그 이상의 _연관 타입(associated type)_ 을 선언하는 것이 유용할 때가 있다. 연관 타입은 프로토콜의 일부로 사용되는 타입에게 플레이스홀더 이름을 부여한다. 해당 연관 타입이 될 실제 타입은 프로토콜이 적용될 때 까지 지정되지 않는다. 연관 타입은 associatedtype 키워드로 특정할 수 있다.

### Associated types in Action

다음은 연관 타입으로 `Item`을 선언하는 프로토콜 `Container`의 예시이다:


```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```
 

`Container` 프로토콜은 모든 컨테이너가 반드시 제공해야할 세 개의 필수 요구사항을 정의한다.

  - `append(_:)` 메소드로 컨테이너에 새로운 아이템을 추가할 수 있어야 한다.
  - `Int`를 리턴하는 `count` 프로퍼티로 컨테이너 내부에 있는 요소의 개수를 알 수 있어야 한다.
  - `Int` 인덱스 값을 받는 서브스크립트를 사용하여 컨테이너 내부의 각 요소를 검색할 수 있어야 한다.



이 프로토콜은 컨테이너 내부의 요소들의 저장되는 방식이나 허용되는 타입을 지정하지 않는다. 이 프로토콜은 단지 `Container`로 분류될 타입들이 반드시 가져야 할 세 개의 기능을 특정할 뿐이다. 이 프로토콜을 준수하는 타입은 이 세 가지 요구사항을 만족한다면, 추가적인 기능을 제공할 수도 있다.

`Container` 프로토콜을 준수하는 모든 타입은 반드시 그 컨테이너가 저장하고 있는 값들의 타입을 특정할 수 있어야 한다. 특히 올바른 타입의 요소만 컨테이너에 들어갈 수 있어야 하며, 서브스크립트를 통해서 그 요소를 리턴할 수 있어야 한다.

이러한 요구사항들을 정의하기 위해, `Container` 프로토콜은 특정 컨테이너가 저장해야 할 타입을 몰라도 해당 컨테이너가 앞으로 저장하게 될 요소들의 타입을 참조할 방법이 있어야 한다. `Container` 프로토콜은 `append(_:)` 메소드에 전달되는 값이 컨테이너의 원소 타입과 같도록 지정해야 하며, 컨테이너의 서브스크립트로 리턴되는 값이 컨테이너의 원소 타입과 같도록 해야한다.

이를 위해 `Container` 프로토콜은 `associatedType Item`이라고 작성하여 연관 타입 `Item`을 선언한다. 이 프로토콜은 `Item`이 무엇인지 정의하지 않는다 —  해당 정보는 이 프로토콜을 준수하는 타입이 제공하도록 남겨놓는다. 이렇게 하더라도, `Item`은 `Container` 내부의 요소의 타입을 참조할 수 있는 방법을 제공하며, `append(_:)` 메소드와 서브스크립트에서 사용할 타입을 정의할 수 있다.

다음은 **Generic Types** 섹션에서 나온 `IntStack` 타입을 `Container` 프로토콜을 도입하고 준수할 수 있는 버전으로 작성한 것이다:


```swift
struct IntStack: Container {
    // original IntStack implementation
    var items: [Int] = []
    mutating func push(_ item: Int) {
        items.append(item)
    }
    mutating func pop() -> Int {
        return items.removeLast()
    }
    // conformance to the Container protocol
    typealias Item = Int
    mutating func append(_ item: Int) {
        self.push(item)
    }
    var count: Int {
        return items.count
    }
    subscript(i: Int) -> Int {
        return items[i]
    }
}
```
 

`IntStack` 타입은 `Container` 프로토콜의 세 가지 요구사항을 모두 구현하고, 각 케이스는 이 요구사항들을 만족하기 위해 `IntStack` 타입의 기존 기능을 래핑한다.

또한 `IntStack`은 이 `Container` 구현에서 사용할 가장 적절한 `Item`이 `Int` 타입임을 특정한다. `typealias Item = Int`의 정의는 이 `Container` 프로토콜의 구현에서 사용하기 위해 추상적인 타입 `Item`을 구체적인 타입인 `Int`로 전환한다.

스위프트의 타입 추론 덕분에 `IntStack`의 구현의 일부로 `Item`을 구체적으로 `Int`로 선언할 필요는 실제로 없다. `IntStack`은 `Container` 프로토콜의 모든 요구사항을 준수하므로, 스위프트는 단순히 `append(_:)` 메소드의 `item` 파라미터와 서브스크립트의 리턴 타입을 보고 적합한 `Item`의 타입을 추론할 수 있다. 따라서 `Item`에 사용할 타입이 명확하므로, `typealias Item = Int` 라인을 제거해도 모든 것은 여전히 동작한다.

또한 제네릭 `Stack` 타입을 `Container` 프로토콜을 준수하여 만들수도 있다:


```swift
struct Stack<Element>: Container {
    // original Stack<Element> implementation
    var items: [Element] = []
    mutating func push(_ item: Element) {
        items.append(item)
    }
    mutating func pop() -> Element {
        return items.removeLast()
    }
    // conformance to the Container protocol
    mutating func append(_ item: Element) {
        self.push(item)
    }
    var count: Int {
        return items.count
    }
    subscript(i: Int) -> Element {
        return items[i]
    }
}
```
 

이 경우에, 타입 파라미터 `Element`는 `append(_:)` 메소드의 `item` 파라미터와 서브스크립트의 리턴 타입으로 이용된다. 따라서 스위프트는 `Element`가 이 특정 컨테이너의 `Item`으로 사용하기에 적합한 타입임을 추론할 수 있다.

### Extending and Exisiting Type to Specify and Associated Type

**Adding Protocol Conformance with and Extension** 에서 소개된 것 처럼, 이미 존재하는 타입이 프로토콜을 준수하도록 확장할 수 있다. 이는 연관 타입을 있는 프로토콜도 포함한다.

스위프트의 `Array` 타입은 `append(_:)`메소드, `count` 프로퍼티, `Int` 인덱스를 통한 요소의 서브스크립트 검색을 제공한다. 이 세 가지의 능력은 `Container` 프로토콜의 요구사항과 일치한다. 이는 단순히 `Array`가 `Container` 프로토콜을 도입하도록 선언하여 `Array`가 `Container` 프로토콜을 준수하도록 확장할 수 있다는 것을 의미한다. 이를 **Declaring Protocol Adoption with and Extension** 에서 소개한 것 처럼 빈 익스텐션으로 이러한 행동 할 수 있다:


```swift
extension Array: Container {}
```
 

배열의 `append(_:)` 메소드와 서브스크립트는 위의 `Stack` 타입처럼 스위프트가 `Item`에 대한 적합한 타입을 추론할 수 있게 해준다. 이 익스텐션을 정의한 후, 모든 `Array`를 `Container`로 사용할 수 있게 된다.

### Adding Constraints to an Associated Type

프로토콜의 연관 타입에 제약조건을 요구하기 위해 타입 제약 조건을 추가 할 수 있다. 예를 들어, 다음의 코드는 컨테이너 내부의 요소가 비교 가능하도록 요구하는 버전의 `Container`를 정의한다.


```swift
protocol Container {
    associatedtype Item: Equatable
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```
 

이 버전의 `Container`를 준수하려면, 컨테이너의 `Item` 타입은 `Equatable`을 준수해야 한다.

### Using a Protocol in Its Associated Type's Constraints

프로토콜은 스스로의 요구사항으로 나타날 수도 있다. 예를 들어 다음은 `suffix(_:)` 메소드를 추가하여 Container 프로토콜을 정제(refine)한 프로토콜이다. `suffix(_:)` 메소드는 끝에서부터 주어진 수 만큼의 요소들을 `Suffix` 타입의 인스턴스로 저장하여 리턴한다.


```swift
protocol SuffixableContainer: Container {
    associatedtype Suffix: SuffixableContainer where Suffix.Item == Item
    func suffix(_ size: Int) -> Suffix
}
```
 

이 프로토콜에서 `Suffix`는 위의 `Container` 예시의 `Item`처럼 연관 타입이다. `Suffix`는 두 가지의 제약조건을 가지고 있다: 반드시 `SuffixableContainer` 프로토콜(현재 정의되고 있는 프로토콜)을 준수해야 하고, 그 `SuffixableContainer` 프로토콜의 `Item` 타입은 반드시 컨테이너의 `Item` 타입과 같아야 한다. `Item`의 제약조건은 뒤에 설명할 제네릭 where 절이다.

다음은 `suffixableContainer` 프로토콜을 준수하는 `Stack` 타입의 익스텐션이다.


```swift
extension Stack: SuffixableContainer {
    func suffix(_ size: Int) -> Stack {
        var result = Stack()
        for index in (count-size)..<count {
            result.append(self[index])
        }
        return result
    }
    // Inferred that Suffix is Stack.
}
var stackOfInts = Stack<Int>()
stackOfInts.append(10)
stackOfInts.append(20)
stackOfInts.append(30)
let suffix = stackOfInts.suffix(2)
// suffix contains 20 and 30
```
 

위의 예시에서, `Stack`의 `Suffix` 연관 타입 또한 `Stack`이다. 따라서 `Stack`의 suffix 연산의 리턴 값도 `Stack`이 된다. 반대로 `SuffixableContainer`를 준수하는 타입은 자기 자신의 타입과 다른 `Suffix` 타입을 가질 수 있다. — 이는 suffix 연산이 다른 타입을 리턴할 수 있다는 것을 뜻한다. 예를 들어, 다음은 `SuffixableContainer`를 준수하여 `IntStack` 대신 `Stack<Int>`를 `Suffix` 타입으로 사용하는 논 제네릭 `IntStack` 타입이다:


```swift
extension IntStack: SuffixableContainer {
    func suffix(_ size: Int) -> Stack<Int> {
        var result = Stack<Int>()
        for index in (count-size)..<count {
            result.append(self[index])
        }
        return result
    }
    // Inferred that Suffix is Stack<Int>.
}
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
