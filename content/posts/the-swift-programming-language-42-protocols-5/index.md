---
title: "The Swift Programming Language. Protocols (5)"
date: 2023-07-04

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Protocols

weight: 42

draft: false
original: "https://junmusu.tistory.com/115"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Protocol Extensions

프로토콜은 메소드, 이니셜라이저, 서브스크립트, 컴퓨티드 프로퍼티를 해당 프로퍼티를 준수하는 타입들에게 제공하도록 확장될 수 있다. 이는 각 타입의 개별 준수나 전역 함수가 아니라 프로토콜 스스로 동작을 정의할 수 있게 해준다.

예를 들어, RandomNumberGenerator 프로토콜은 random() 메소드 요구사항의 결과값을 사용하여 랜덤 Bool 값을 리턴하는 randomBool() 메소드를 제공하도록 확장될 수 있다.


```swift
extension RandomNumberGenerator {
    func randomBool() -> Bool {
        return random() > 0.5
    }
}
```
 

프로토콜의 익스텐션을 만들면, 해당 프로토콜을 준수하는 모든 타입은 추가적인 수정 없이 모든 이러한 메소드 구현을 자동적으로 얻게 된다.


```swift
let generator = LinearCongruentialGenerator()
print("Here's a random number: \(generator.random())")
// Prints "Here's a random number: 0.3746499199817101"
print("And here's a random Boolean: \(generator.randomBool())")
// Prints "And here's a random Boolean: true"
```
 

프로토콜 익스텐션은 해당 프로토콜을 준수하는 타입에게 구현을 추가할 수 있만, 프로토콜을 확장하거나 다른 프로토콜에서 상속을 받지는 못한다. 프로토콜 상속은 항상 프로토콜의 선언에서만 지정된다.

### Providing Default Implementations

프로토콜 확장을 이용하여 메소드나 컴퓨티드 프로퍼티 요구사항의 디폴트 구현을 제공할 수 있다. 만약 해당 프로토콜을 준수하는 타입이 메소드나 프로퍼티의 구현을 제공한다면 해당 구현을 익스텐션에서 제공하는 디폴트 구현 대신 사용하게 된다.

> **Note**  
>  익스텐션에서 기본 구현이 제공되는 프로토콜 요구사항은 옵셔널 프로토콜 요구사항과 구분된다. 둘 모두 해당 프로토콜을 준수하는 타입에서 꼭 구현할 필요는 없지만, 디폴트 구현이 있는 요구사항은 옵셔널 체이닝 없이도 호출 가능하다.

예를 들어 TextRepresentable 프로토콜을 상속받는 PrettyTextRepresentable 프로토콜은 prettyTextualDescription 프로퍼티 요구사항의 디폴트 구현을 textualDescription 프로퍼티의 결과를 리턴함으로써 간단하게 제공할 수 있다:


```swift
extension PrettyTextRepresentable  {
    var prettyTextualDescription: String {
        return textualDescription
    }
}
```
 

#### Adding Constraints to Protocol Extensions

프로토콜 익스텐션을 정의할 때, 해당 프로토콜을 준수하는 타입들이 익스텐션의 메소드와 프로퍼티들을 사용하기 위해 반드시 만족해야 할 제약조건을 지정할 수 있다. 이 제약조건들을 확장하려는 프로토콜의 이름 뒤에 제네릭 where 절을 이용하여 작성한다. 제네릭 where 절에 대한 정보는 **Generic Where Clauses** 에 나와있다.

예를 들어 모든 원소가 Equatable 프로토콜을 준수하는 컬렉션에 적용될 Collection 프로토콜의 익스텐션을 정의할 수 있다. 컬렉션의 원소가 Equatable 프로토콜을 준수하도록 제약조건은 걸면, 각 원소들이 같은지 다른지 확인할 수 있다.


```swift
extension Collection where Element: Equatable {
    func allEqual() -> Bool {
        for element in self {
            if element != self.first {
                return false
            }
        }
        return true
    }
}
```
 

allEqual() 메소드는 컬렉션 내부의 모든 원소들이 같다면 true를 리턴한다.

하나는 모든 원소들이 같고 다른 하나는 그렇지 않은, 두 개의 정수 배열을 생각해보자:


```swift
let equalNumbers = [100, 100, 100, 100, 100]
let differentNumbers = [100, 100, 200, 100, 200]
```
 

배열은 Collection을 준수하고 Int 타입은 Equatable을 준수하므로, 위의 두 배열은 allEqual() 메소드를 사용할 수 있다:


```swift
print(equalNumbers.allEqual())
// Prints "true"
print(differentNumbers.allEqual())
// Prints "false"
```
 

> **Note**  
>  만약 프로토콜을 준수하는 타입이 같은 메소드나 프로퍼티를 구현하는 다른 제약조건 익스텐션을 여러 개 만족할 때, 스위프트는 가장 상세한 제약조건에 있는 구현을 사용하도록 한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
