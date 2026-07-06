---
title: "[Swift] Generics(제네릭) - 1"
date: 2023-08-01
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Generics"]
weight: 43

draft: false
original: "https://junmusu.tistory.com/124"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Generics

_제네릭 코드(Generic code)_ 는 정의한 요구사항을 만족하는 모든 타입과 함께 작업할 수 있는 유연하고 재사용성 높은 함수나 타입을 작성하게 해준다. 코드의 중복을 피하고, 의도를 추상적이고 명확한 방법으로 표현할 수 있다.

제네릭은 스위프트의 강력한 특징 중 하나이며, 많은 스위프트의 표준 라이브러리는 제네릭 코드로 빌드 되어있다. 사실 인지하지 못했어도 Language Guide 내내 제네릭 코드를 사용했다. 예를 들어, 스위프트의 `Array`와 `Dictionary` 타입은 둘 다 제네릭 컬렉션이다. `Int` 값을 저장하는 배열, `String` 값을 저장하는 배열, 혹은 스위프트에서 만들 수 있는 어떠한 다른 타입이라도 저장하는 배열 등을 생성할 수 있다. 비슷하게, 어떤 타입이든지 간에 특정한 타입을 저장하는 딕셔너리를 만들 수 있다.

### The Problem That Generics Solve

다음은 두 개의 `Int` 값을 스왑하는 논 제네릭(nongeneric) 표준 함수 `swapTwoInts(_:_:)`이다:


```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```
 

이 함수는 `a`와 `b`의 값을 스왑하기 위해 in-out 파라미터를 사용한다.

`swapTwoInts(_:_:)` 함수는 `b`의 기존 값을 `a`로 스왑한다. 그리고 `a`의 기존 값은 `b`로 바꾼다. 이 함수는 두 개의 `Int` 변수를 스왑하기 위해 호출된다:


```swift
var someInt = 3
var anotherInt = 107
swapTwoInts(&someInt, &anotherInt)
print("someInt is now \(someInt), and anotherInt is now \(anotherInt)")
// Prints "someInt is now 107, and anotherInt is now 3"
```
 

`swapTwoInts(_:_:)` 함수는 유용하지만, `Int` 값에 대해서만 사용할 수 있다. 두 개의 `String` 값이나 `Double` 값을 스왑하고 싶으면, 아래의 `swapTwoString(_:_:)`나 `swapTwoDoubles(_:_:)`같은 함수들을 새로 작성해야 한다:


```swift
func swapTwoStrings(_ a: inout String, _ b: inout String) {
    let temporaryA = a
    a = b
    b = temporaryA
}

func swapTwoDoubles(_ a: inout Double, _ b: inout Double) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```
 

`swapTwoInts(_:_:)`, `swapTwoStrings(_:_:)`, 그리고 `swapTwoDoubles(_:_:)` 함수의 본문이 동일하다는 것을 알 수 있다. 유일하게 다른 점은 이 함수들이 받는 값들의 타입이다.

어떠한 타입이라도 두 값을 스왑하는 함수를 만드는것이 더 유용하고, 유연하다. 제네릭 코드는 이러한 함수를 작성할 수 있도록 해준다.(제네릭 버전의 이 함수는 뒤에 등장한다.) 

> **Note**  
>  위의 세 함수에서 **a** 와 **b** 의 타입은 반드시 같아야 한다. 만약 **a** 와 **b** 가 같은 타입이 아니라면, 값을 스왑할 수 없다. 스위프트는 type-safe 언어이며 (예를 들어) **String** 타입의 변수와 **Double** 타입의 변수가 서로의 값을 스왑하는 것을 허용하지 않는다. 이런 상황에서는 컴파일 타임 에러가 발생하게 된다.

### Generic Functions

_제네릭 함수(Generic function)_ 는 어떠한 타입으로도 작업할 수 있다. 다음은 위의 `swapTwoInts(_:_:)` 함수의 제네릭 버전인 `swapTwoValues(_:_:)`이다:


```swift
func swapTwoValues<T>(_ a: inout T, _ b: inout T) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```
 

`swapTwoValues(_:_:)` 함수의 본문은 `swapTwoInts(_:_:)`의 함수의 본문과 동일하지만, `swapTwoValues(_:_:)`함수의 첫 번째 라인은 `swapTwoInts(_:_:)` 함수와 약간 다르다. 다음은 첫 번째 라인을 비교한 것이다:


```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int)
func swapTwoValues<T>(_ a: inout T, _ b: inout T)
```
 

제네릭 버전의 함수는 (`Int`, `String`, `Double` 같은) 실제 타입 이름 대신 플레이스홀더(_placeholder_ , 이 케이스에선 `T`) 타입 이름을 사용한다. 여기서 플레이스홀더 타입 이름은 `T`가 반드시 무엇이어야 한다고 말하지 않지만, `a`와 `b`가 반드시 같은 `T`가 대표하는 타입이어야 함을 말한다. `T` 대신 사용할 실제 타입은 `swapTwoValues(_:_:)`함수가 호출 될 때 마다 결정된다.

또 다른 제네릭 함수와 논 제네릭 함수의 차이점은 제네릭 함수의 이름 (`swapTwoValues(_:_:)`) 뒤에 싱글 길리멧 괄호 안에 있는 플레이스홀더 타입 이름(`<T>`)이 따라온다는 것이다. 괄호는 스위프트에게 `T`가 `swapTwoValues(_:_:)` 함수 정의 내부의 플레이스홀더 타입임을 알려준다. `T`가 플레이스홀더이므로, 스위프트는 `T`의 실제 타입을 찾지 않는다.

이제 `swapTwoValues(_:_:)` 함수는 `swapTwoInts`와 똑같은 방식으로 호출할 수 있지만, 두 값이 서로 같은 타입인 경우에 어떠한 타입의 값이라도 전달받을 수 있다. `swapTwoValues(_:_:)`가 호출 될 때마다, `T`로 사용될 타입은 함수에 전달된 값의 타입으로 추론된다.

아래의 두 예시에서, `T`는 각각 `Int`와 `String`으로 추론된다:


```swift
var someInt = 3
var anotherInt = 107
swapTwoValues(&someInt, &anotherInt)
// someInt is now 107, and anotherInt is now 3

var someString = "hello"
var anotherString = "world"
swapTwoValues(&someString, &anotherString)
// someString is now "world", and anotherString is now "hello"
```
 

> **Note**  
>  위에서 정의한 **swapTwoValues(_:_:)** 함수는 스위프트의 표준 라이브러리에 있는 **swap** 이라는 함수와 같다. 따라서 이러한 함수가 필요할 때에는 스위프트에 이미 존재하는 **swap(_:_:)** 함수를 사용하는 것이 좋다.



### Type Parameters

위의 `swapTwoValues(_:_:)` 의 예시에서 플레이스홀더 타입 `T`는 타입 파라미터의 예시이다. 타입 파라미터는 플레이스홀더 타입을 지정하고, 이름을 붙이며, 싱글 길리멧에 둘러쌓여서 함수의 이름 바로 뒤에 작성된다(`<T>` 처럼).

타입 파라미터를 지정하면, 함수의 파라미터를 정의하는데 사용하거나(`swapTwoValues(_:_:)` 함수의 `a`와 `b`처럼), 함수의 리턴 타입이나 본문 내부에서 타입 어노테이션을 하는데 사용할 수 있다. 각각의 경우에 타입 파라미터는 함수가 호출될 때 마다 실체 타입으로 대체된다.

싱글 길라멧 괄호 내부에 컴마로 구분하여 하나 이상의 타입 파라미터를 제공할 수 있다.

### Naming Type Parameters

대부분의 경우, 타입 파라미터는 `Dictionary<Key, Value>`에서의 `Key`, `Value` 그리고 `Array<Element>`에서의 `Element`같이 코드를 읽는 독자들에게 타입 파라미터와 제네릭 타입 혹은 함수와의 관계를 설명해주는 서술적인 이름을 가지고 있다. 하지만 이러한 관계가 의미있는 않는 경우에는 전통적으로 `T`, `U`, `V`와 같은 단일 문자로 이름을 짓는다.

> **Note**  
>  타입 파라미터의 이름에는 값이 아닌 타입에 대한 플레이스홀더임을 나타내기 위해 항상 upper 카멜 케이스를 사용해야 한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
