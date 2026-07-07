---
title: "The Swift Programming Language. Generics (3)"
date: 2023-08-04
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Generics"]
weight: 45

draft: false
original: "https://junmusu.tistory.com/126"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Type Constraints

`swapTwoValues(_:_:)` 함수와 `Stack` 타입은 어떠한 타입으로도 작업할 수 있다. 하지만 특정한 _타입 제약조건(type constraints)_ 을 강제하여 제네릭 함수나 제네릭 타입이 사용할 수 있는 타입을 지정하는 것이 유용할 때가 있다. 타입 제약조건은 타입 파라미터가 특정한 클래스를 상속 받거나, 특정 프로토콜을 준수해야 하도록 지정한다.

예를 들어, 스위프트의 `Dictionary` 타입은 딕셔너리의 키로 사용할 수 있는 타입에 제한을 둔다. 딕셔너리의 키로 사용될 타입은 반드시 _hashable_ 해야한다. 즉, 스스로를 유니크하게 구분할 수 있어야 한다.

이러한 요구사항은 타입 제약조건에 의해서 `Dictionary`의 키 타입에 강제되며, 이는 키 타입이 반드시 `Hashable` 프로토콜을 준수하도록 한다. 모든 스위프트의 기본 타입들(`String`, `Int`, `Double`, `Bool`)은 기본적으로 hashable 하다.

커스텀 제네릭 타입을 만들 때, 타입 제약조건을 정의할 수 있다, 그리고 이 제약조건들은 제네릭 프로그래밍을 강력하게 만들어준다. `Hashable`과 같은 추상적인 개념은 구체적인 타입이 아닌 개념적인 특성을 특징짓는다.

#### Type Constraint Syntax

콜론으로 구분된 타입 파라미터 리스트의 내부에서 타입 파라미터의 이름 뒤에 하나의 클래스나 프로토콜 제약조건을 적어서 타입 제약조건을 작성할 수 있다. 제네릭 함수의 기본적인 타입 제약조건은 아래와 같다:


```swift
func someFunction<T: SomeClass, U: SomeProtocol>(someT: T, someU: U) {
    // function body goes here
}
```
 

위의 함수에는 두개의 타입 파라미터가 있다. 첫 번째 파라미터 `T`는 `SomeClass`의 서브클래스이어야 하는 제약조건이 있다. 두 번째 파라미터 `U`는 `SomeProtocol`을 준수해야 하는 제약조건이 있다.

#### Type Constraint in Action

다음은 전달 받은 `String` 값이 `String` 배열 속에 있는지 찾는 논 제네릭 함수 `findIndex(ofString:in)`이다. `findIndex(ofString:in:)` 함수는 배열 속의 값이 찾으려는 문자열 값과 첫 번째로 일치하는 인덱스 값을 리턴하고, 없다면 nil을 리턴한다:


```swift
func findIndex(ofString valueToFind: String, in array: [String]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```
 

`findIndex(ofString:in)` 함수는 문자열 배열에서 특정 문자열을 찾는데 이용할 수 있다:


```swift
let strings = ["cat", "dog", "llama", "parakeet", "terrapin"]
if let foundIndex = findIndex(ofString: "llama", in: strings) {
    print("The index of llama is \(foundIndex)")
}
// Prints "The index of llama is 2
```
 

하지만 배열 내부의 인덱스를 찾는 원리는 문자열에만 유효한 것이 아니다(주: 똑같은 원리로 다른 타입들도 일치하는 인덱스를 찾을 수 있다). `String`을 모두 `T`로 바꿔 같은 기능을 가진 제네릭 함수를 만들 수 있다.

다음은 아마 예상했을 `findIndex(ofString:in:)`의 제네릭 버전 함수 `findIndex(of:in)`이다. 이 함수는 옵셔널 인덱스 번호를 리턴하므로 리턴 타입은 여전히 `Int?`임을 알아두자. 하지만 이 함수는 다음에 설명할 이유로 컴파일 되지 않는다.


```swift
func findIndex<T>(of valueToFind: T, in array:[T]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```
 

이 함수는 위에 작성된 대로 컴파일 되지 않는다. 문제는 동등성 체크 "`if value == valueToFind`"에 있다. 스위프트의 모든 타입이 같음(equal to) 연산자 (`==`)를 사용할 수 있는 것은 아니다. 예를 들어, 복잡한 데이터 모델을 표현하는 클래스나 스트럭처를 만들었다면 "같음"의 의미가 스위프트가 추측할 수 없다. 따라서 이 코드가 모든 가능한 타입 `T`에 대해 작업할 수 있다는 것을 보장할 수 없고, 코드를 컴파일할 때 에러가 발생한다.

하지만 스위프트의 표준 라이브러리는 `Equatable`이라는 프로토콜을 정의한다. 이 프로토콜은 준수하는 타입들에게 같음 연산자 (`==`)와 같지 않음 연산자 (`!=`)를 구현하도록 요구한다. 모든 스위프트의 표준 타입들은 `Equatable` 프로토콜을 준수한다.

`Equatable` 프로토콜을 준사하는 모든 타입은 같음 연산자를 지원하는 것이 보장되기 때문에 `findIndex(of:in:)` 함수를 안전하게 사용할 수 있다. 이러한 사실을 표현하기 위해서 함수를 정의할 때, 타입 제약조건으로 `Equatable`을 타입 파라미터의 정의 부분에 작성한다.


```swift
func findIndex<T: Equatable>(of valueToFind: T, in array:[T]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```
 

`findIndex(of:in:)`에서 쓰이는 타입 파라미터는 `T: Equatable`로 작성되었다. 이는 "`Equatable` 프로토콜을 준수하는 모든 타입"을 의미한다.

`findIndex(of:in:)` 함수는 이제 성공적으로 컴파일되며, `Double`이나 `String`같은 `Equatable`한 타입들이 이용할 수 있게 된다.


```swift
let doubleIndex = findIndex(of: 9.3, in: [3.14159, 0.1, 0.25])
// doubleIndex is an optional Int with no value, because 9.3 isn't in the array
let stringIndex = findIndex(of: "Andrea", in: ["Mike", "Malcolm", "Andrea"])
// stringIndex is an optional Int containing a value of 2
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
