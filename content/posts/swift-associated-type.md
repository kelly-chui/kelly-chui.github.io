---
title: "Swift. Associated Type"
date: 2025-01-26

categories:
    - Swift
series:
tags:
    - Swift
    - Protocol
    - Associated Type
    - Generic

draft: true
original: "notion-export/블로그 이관/Swift/Associated Type 9aaade8f3765820fb5b8018a162473c4.md"
---

## 소개

Swift의 프로토콜은 구현이 아니라 요구사항만 정의한다. 그런데 어떤 프로토콜은 사용할 타입을 미리 알 수 없는 경우가 있다.

예를 들어, 아래와 같은 `Container` 프로토콜을 만든다고 생각해 보자.

```swift
protocol Container {
    func append(_ item: ???)
}
```

`append`가 받을 타입은 무엇이어야 할까?

`Int`일 수도 있고, `String`일 수도 있으며, 사용자가 직접 만든 타입일 수도 있다. 하지만 프로토콜이 특정 타입에 종속되면 재사용성이 크게 떨어진다.

이럴 때 사용하는 것이 Associated Type이다. 처음에는 Generic으로도 해결할 수 있을 것 같다는 생각이 들었는데, 프로토콜은 Generic을 사용할 수 없다.

## 기본 문법

프로토콜 내부에서 `associatedtype` 키워드로 선언하고, 프로토콜을 채택할 타입은 `typealias`를 통해 실제 타입을 결정한다.

```swift
protocol Container {
    associatedtype Item
    var count: Int { get }
    mutating func append(_ item: Item)
    subscript(index: Int) -> Item { get }
}
```

여기서 `Item`은 실제 타입이 아니라 타입의 이름이다.

프로토콜을 정의하는 시점에는 `Item`이 무엇인지 모르지만, 프로토콜을 채택하는 타입이 이를 구체적으로 결정한다.

### 구현 예제

예를 들어 `Int`를 저장하는 스택을 다음과 같이 구현했다:

```swift
struct IntStack: Container {
    typealias Item = Int
    
    private var items: [Item] = []
    var count: Int {
        items.count
    }

    mutating func append(_ item: Item) {
        items.append(item)
    }

    subscript(index: Int) -> Item {
        items[index]
    }
}
```

처음에는 `Item`을 사용하는 이유가 잘 이해되지 않았다. 어차피 구현할 때는 `Int`를 적을 텐데 왜 굳이 `Item`을 쓰는 걸까 싶었다. 

하지만 컴파일러는 `typealias Item = Int`를 보는 순간 둘을 같은 타입으로 취급한다.

따라서 아래처럼 `Int`를 직접 사용하는 코드도 완전히 동일하게 동작한다:

```swift
struct IntStack: Container {
    typealias Item = Int

    private var items: [Int] = []
    var count: Int {
        items.count
    }

    mutating func append(_ item: Int) {
        items.append(item)
    }

    subscript(index: Int) -> Int {
        items[index]
    }
}
```

`typealias`를 작성하지 않아도 컴파일러가 `append`와 `subscript`의 타입을 보고 `Item == Int`임을 자동으로 추론해주기도 한다.

```swift
struct IntStack: Container {
    private var items: [Int] = []
    var count: Int {
        items.count
    }

    mutating func append(_ item: Int) {
        items.append(item)
    }

    subscript(index: Int) -> Int {
        items[index]
    }
}
```

## 제약 조건

Associated Type에도 제약 조건을 걸 수 있다:

```swift
protocol Container {
    associatedtype Item: Equatable
}
```

단순한 프로토콜 제약은 `:` 문법으로 충분하지만, 여러 타입 사이의 관계나 복잡한 제약을 표현할 때는 `where` 절을 사용할 수도 있다:

```swift
protocol Container {
    associatedtype Item where Item: Equatable
}
```

`where`절은 여러 타입 사이의 관계나 복잡한 제약을 표현할 수 있다. 아래 코드에서는 `Iterator`의 원소가 반드시 `Item` 타입이어야 한다는 제약 조건을 의미한다:

```swift
protocol Container {
    associatedtype Item
    associatedtype Iterator: IteratorProtocol

    where Iterator.Element == Item
}
```

## Generic과의 차이

처음에는 Generic과 거의 같은 기능 아닌가 싶었다. 실제로 목적도 비슷하다. 하지만 Swift에서는 프로토콜에 Generic를 사용할 수 없기 때문에 Associated Type이 필요하다. 그리고 타입이 결정되는 시점도 다르다.

Generic은 타입을 사용하는 시점에 타입이 결정된다:

```swift
struct Box<T> {
    let value: T
}

let intBox = Box(value: 10)      // T == Int
let stringBox = Box(value: "Hi") // T == String
```

위 코드에서 `intBox`와 `stringBox`를 생성할 때, 각각 전달한 `10`, `Hi`의 타입에 의해서 `T`의 타입이 정해진다.

Associated Type은 프로토콜을 채택하는 타입이 실제 타입을 결정한다:

```swift
protocol Container {
    associatedtype Item
}

struct IntStack: Container {
    typealias Item = Int
}

struct StringContainer: Container {
    typealias Item = String
}
```

프로토콜은 `Item`의 실제 타입을 모르지만, `IntStack`, `StringContainer`가 `Container`를 채택하고 선언할 때 `Item`의 타입이 각각 정해진다.

## 정리

Associated Type은 프로토콜이 사용할 타입을 나중에 결정할 수 있도록 하는 기능이다.

- 프로토콜에서 타입을 미리 결정할 수 없을 때 사용한다.
- `associatedtype` 키워드로 선언한다.
- 구현체가 실제 타입을 결정한다.
- Generic과 목적은 비슷하지만, 프로토콜에서는 Associated Type을 사용하며 타입이 결정되는 시점도 다르다.

## 레퍼런스

- https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics/#Associated-Types
- https://developer.apple.com/documentation/swift