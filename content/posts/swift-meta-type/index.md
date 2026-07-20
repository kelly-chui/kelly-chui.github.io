---
title: "Meta Type"
date: 2024-01-26

categories:
  - Swift
series: []
tags:
  - Metatype
  - Protocol Metatype
  - Type System

draft: false
original: "notion-export/블로그 이관/Swift/Meta Type b23ade8f376583948d9701bbd81b7353.md"
---

## 소개

메타 타입은 이러한 타입 자체를 값으로 다루기 위한 타입이다.

즉, 인스턴스가 아니라 타입 그 자체를 표현하는 타입이라고 생각하면 된다.

## 종류

### `.Type`

구조체, 클래스, 열거형 등 구체적인 타입의 메타 타입이다.

```swift
let type: Int.Type = Int.self
```

### `.Protocol`

프로토콜 자체의 메타 타입이다.

```swift
let type: AnyObject.Protocol = AnyObject.self
```

## 언제 사용할까?

메타 타입은 생각보다 자주 등장한다.

- 타입 자체를 함수의 인자로 전달할 때
- 런타임에 타입을 비교하거나 확인할 때
- 타입 정보를 저장해야 할 때
- `type(of:)`를 사용할 때

## 필요한 이유

메타 타입이 필요한 가장 큰 이유는 타입 자체를 값처럼 다루기 위해서이다.

평소에는 `Int`나 `String`으로 인스턴스를 생성하지만, 어떤 상황에서는 인스턴스가 아니라 타입 자체를 전달하거나 저장해야 할 때가 있다.

예를 들어 함수가 "어떤 타입"을 인자로 받아야 한다면 메타 타입을 사용한다:

```swift
func printType(_ type: Any.Type) {
    print(type)
}

printType(Int.self)
printType(String.self)
```

이처럼 메타 타입 덕분에 타입도 하나의 값처럼 전달할 수 있다.

이 부분에서 C/C++의 이중 포인터가 연상되었다. 이중 포인터도 포인터가 저장한 주소값 자체를 변환하기 위해 사용하니까...

## 의문점

### `Int`와 `Int.self`는 무엇이 다를까?

- `Int`는 타입의 이름이다.
- `Int.self`는 `Int`라는 타입을 나타내는 메타 타입 값이다.

예를 들어 아래 코드는 메타 타입을 전달하는 코드이다:

```swift
let type: Int.Type = Int.self
```

아래처럼 작성하는 것은 메타 타입 값이 아니라 단순히 타입 이름을 사용하는 것이므로 의미가 다르다:

```swift
let value: Int = 10
```

즉, `.self`를 붙이는 순간 "타입 그 자체"를 하나의 값으로 사용할 수 있게 된다.

## 레퍼런스

- [The Swift Programming Language - Metatypes](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/types/#Metatype-Type)
