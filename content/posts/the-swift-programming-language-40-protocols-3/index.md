---
title: "The Swift Programming Language. Protocols (3)"
date: 2023-07-02

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Protocols

weight: 40

draft: false
original: "https://junmusu.tistory.com/113"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Adding Protocol Conformance with and Extension

새로운 프로토콜을 도입하고 준수하기 위해 이미 존재하는 타입을 확장할 수 있다. 그 타입의 원본 소스코드에 접근하지 못하더라도 가능하다. 익스텐션은 이미 존재하는 타입에 새로운 프로퍼티, 메소드, 서브스크립트를 추가할 수 있으므로, 프로토콜에서 요구하는 모든 요구사항들을 추가할 수 있다.

> **Note**  
>  타입의 이미 존재하는 인스턴스는 인스턴스의 타입의 익스텐션에 프로토콜 준수가 추가되었을 때, 자동적으로 프로토콜을 준수하게 된다.

예를 들어, TextRespresentable 프로토콜은 텍스트로 표현할 수 있는 방법이 있는 모든 타입에서 구현 가능하다:


```swift
protocol TextRepresentable {
    var textualDescription: String { get }
}
```
 

앞서 나온 Dice 클래스는 TextRespresentable을 도입하고 준수하기 위해 확장될 수 있다:


```swift
extension Dice: TextRepresentable {
    var textualDescription: String {
        return "A \(sides)-sided dice"
    }
}
```
 

이 익스텐션이 새로운 프로토콜을 도입하는 방법은 Dice가 기존 구현에서 프로토콜을 도입하는 방식과 완벽하게 똑같다. 프로토콜의 이름은 타입 이름의 뒤에 콜론으로 구분되어 작성되고, 프로토콜의 요구사항의 구현은 익스텐션의 중괄호 내부에서 제공된다.

이러면 모든 Dice 인스턴스는 TextRepresentable로 취급할 수 있다:


```swift
let d12 = Dice(sides: 12, generator: LinearCongruentialGenerator())
print(d12.textualDescription)
// Prints "A 12-sided dice"
```
 

비슷하게, SnakesAndLadders 게임은 클래스도 TextRepresentable 프로토콜을 도입하고 준수하기 위해 확장될 수 있다.


```swift
extension SnakesAndLadders: TextRepresentable {
    var textualDescription: String {
        return "A game of Snakes and Ladders with \(finalSquare) squares"
    }
}
print(game.textualDescription)
// Prints "A game of Snakes and Ladders with 25 squares"
```
 

#### Conditionally Conforming to a Protocol

제네릭 타입은 프로토콜의 요구사항을 제네릭 파라미터가 해당 프로토콜을 준수하는 것과 같은 특정 조건하에서만 만족할 수 있다. 타입을 확장할 때, 제약조건을 리스트로 작성하여 제네릭 타입이 조건부로 프로토콜을 준수하게 할 수 있다. 이 제약조건들을 제네릭 where 절을 사용하여 도입하려는 프로토콜 이름 뒤에 작성한다. 제네릭 where 절에 대한 자세한 설명은 **Generic Where Clauses** 에 나와있다.

다음의 익스텐션은 Array 인스턴스의 원소들이 TextRepresentable을 만족할 때, Array가 TextRepresentable을 준수하도록 만든다.


```swift
extension Array: TextRepresentable where Element: TextRepresentable {
    var textualDescription: String {
        let itemsAsText = self.map { $0.textualDescription }
        return "[" + itemsAsText.joined(separator: ", ") + "]"
    }
}
let myDice = [d6, d12]
print(myDice.textualDescription)
// Prints "[A 6-sided dice, A 12-sided dice]"
```
 

#### Declaring Protocol Adoption with and Extension

타입이 이미 프로토콜의 모든 요구사항을 준수하고 있지만, 프로토콜을 도입하지 않은 상태일 때, 빈 익스텍션으로 프로토콜을 도입하게 할 수 있다:


```swift
struct Hamster {
    var name: String
    var textualDescription: String {
        return "A hamster named \(name)"
    }
}
extension Hamster: TextRepresentable {}
```
 

Hamster의 인스턴스들은 TextPrepresentable이 필요한 타입이 필요한 곳 어디에서나 사용할 수 있다.


```swift
let simonTheHamster = Hamster(name: "Simon")
let somethingTextRepresentable: TextRepresentable = simonTheHamster
print(somethingTextRepresentable.textualDescription)
// Prints "A hamster named Simon"
```
 

> **Note**  
>  타입은 프토콜의 요구사항을 만족한다해서 프로토콜을 자동적으로 도입하지 않는다. 항상 명시적으로 프토토콜을 도입한다고 작성해줘야 한다.

### Adopting a Protocol Using a Synthesized Implementation

스위프트는 많은 간단한 케이스에서 Equatable, Hashable, Comparable과 같은 프로토콜을 자동적으로 준수하게 하는 기능을 제공한다. 이러한 합성 구현(synthesized implementation)을 사용하는 것은 프로토콜 요구사항을 구현하기 위해 반복적인 상용구를 작성할 필요가 없게 해준다.

스위프트는 다음과 같은 종류의 커스텀 타입에 대해 Equatable에 대한 합성 구현을 제공한다:

  - Equatable 프로토콜을 준수하는 저장 프로퍼티만을 가지고 있는 스트럭처
  - Equatable 프로토콜을 준수하는 연관 값만을 가지고 있는 열거형
  - 연관값이 없는 열거형



==의 합성 구현을 받으려면, ==을 직접 구현하지 않고 기존 선언을 포함하는 파일에서 Equtable에 대한 준수를 선언한다. Equatable 프로토콜은 !=에 대한 기본 구현을 제공한다.

아래의 예시는 3차원 벡터를 위한 Vector3D 스트럭처를 정의한다. x, y, z 프로퍼티가 Equtable 타입이므로, Vector3D는 등가 연산자에 대한 합성 구현을 받는다.


```swift
struct Vector3D: Equatable {
    var x = 0.0, y = 0.0, z = 0.0
}

let twoThreeFour = Vector3D(x: 2.0, y: 3.0, z: 4.0)
let anotherTwoThreeFour = Vector3D(x: 2.0, y: 3.0, z: 4.0)
if twoThreeFour == anotherTwoThreeFour {
    print("These two vectors are also equivalent.")
}
// Prints "These two vectors are also equivalent."
```
 

스위프트는 다음과 같은 종류의 커스텀 타입에 대해 Hashable에 대한 합성 구현을 제공한다:

  - Hashable 프로토콜을 준수하는 저장 프로퍼티만을 가지고 있는 스트럭처
  - Hashable 프로토콜을 준수하는 연관 값만을 가지고 있는 열거형
  - 연관 값이 없는 열거형



hash(into:)의 합성 구현을 받으려면, hash(into:) 메소드를 직접 구현하지 않고 기존 구현을 포함하는 파일 내부에서 Hashable에 대한 준수를 선언한다.

스위프트는 원시 값이 없는 열거형에 대해 Comparable의 합성 구현을 제공한다. 만약 해당 열거형이 연관 값을 가지고 있다면, 그 연관값들은 만드시 Comparable 프로토콜을 준수해야 한다. < 의 합성 구현을 받으려면, <을 직접 구현하지 않고 기존 구현을 포함하는 파일 내부에서 Comparable에 대한 준수를 선언한다. Comparable 프로토콜의 <=, >, >= 연산자도 마찬가지로, 합성 구현으로 제공한다.

아래의 예시는 beginner, intermediate, expert 케이스로 구성된 SkillLevel 열거형을 정의한다. expert 케이스는 추가적으로 별의 개수에 따라 랭크된다.


```swift
enum SkillLevel: Comparable {
    case beginner
    case intermediate
    case expert(stars: Int)
}
var levels = [SkillLevel.intermediate, SkillLevel.beginner,
              SkillLevel.expert(stars: 5), SkillLevel.expert(stars: 3)]
for level in levels.sorted() {
    print(level)
}
// Prints "beginner"
// Prints "intermediate"
// Prints "expert(stars: 3)"
// Prints "expert(stars: 5)"
```
 

### Collections of Protocol Types

**Protocols as Types** 에서 언급한 것 처럼, 프로토콜은 배열이나 딕셔너리와 같은 컬렉션에 저장되기 위해 타입으로 사용할 수도 있다. 다음 예시는 TextRepresentable의 배열 things를 생성한다.


```swift
let things: [TextRepresentable] = [game, d12, simonTheHamster]
```
 

이제 이 배열을 순회하고 각 원소들의 텍스트 설명을 출력할 수 있다:


```swift
for thing in things {
    print(thing.textualDescription)
}
// A game of Snakes and Ladders with 25 squares
// A 12-sided dice
// A hamster named Simon
```
 

실제 인스턴스의 타입이 Dice나 DiceGame 혹은 Hamster 이지만, thing 상수의 타입은 TextRepresentable인 것을 알아두자. TextRepresentable 타입이기 때문에 textualDescription 프로퍼티를 가지고 있는 것을 알고 있다. 따라서 루프의 각 반복마다 thing.textualDesciption을 사용하는 것은 안전하다.

### Protocol Inheritance

프로토콜은 하나 이상의 다른 프로토콜에서 상속받을 수 있으며, 상속받은 요구사항 위에 요구사항을 더 추가할 수 있다. 프로토콜 상속 구문은 클래스 상속 구문과 비슷하지만, 컴마로 구분하여 리스트를 작성하여 다중 상속을 받을 수 있는 옵션이 존재한다.


```swift
protocol InheritingProtocol: SomeProtocol, AnotherProtocol {
    // protocol definition goes here
}
```
 

다음은 TextRepresentable 프로토콜을 상속받은 프로토콜의 예시이다.


```swift
protocol PrettyTextRepresentable: TextRepresentable {
    var prettyTextualDescription: String { get }
}
```
 

이 예시는 TextRepresentable에서 상속받는 새로운 프로토콜 PrettyTextRepresentable을 선언한다. PrettyTextRepresentable을 도입하는 모든 타입들은 TextTepresentable의 요구사항에 더해 PrettyTextRespresentable의 추가적인 요구사항도 만족해야한다. 이 예시에서 PrettyTextRepresentable은 String 타입을 리턴하는 gettable 프로퍼티 prettyTextualDescription를 요구한다.

SnakeAndLadders 클래스는 PrettyTextRepresentable을 도입하고 준수하기 위해 확장될 수 있다:


```swift
extension SnakesAndLadders: PrettyTextRepresentable {
    var prettyTextualDescription: String {
        var output = textualDescription + ":\n"
        for index in 1...finalSquare {
            switch board[index] {
            case let ladder where ladder > 0:
                output += "▲ "
            case let snake where snake < 0:
                output += "▼ "
            default:
                output += "○ "
            }
        }
        return output
    }
}
```
 

이 익스텐션은 PrettyTextRepresentable 프로토콜을 도입하고, SnakesAndLadders 타입에 대한 PrettyTextualDescription 프로퍼티의 구현을 제공한다. PrettyTextRepresentable인 모든 것은 TextRepresentable이기도 하므로, PrettyTextualDescription의 구현은 TextRepresentable 프로토콜의 textualDescription 프로퍼티를 접근하여 출력 문자열의 시작 부분을 만든다. 콜론과 줄 바꿈을 추가하여 PrettyTextualDescription의 시작 부분으로 한다. 그리고 보드 칸의 배열을 순회하여, 각 칸의 컨텐츠에 맞는 기호를 붙인다.

  - 칸의 값이 0보다 크다면 사다리 이므로, ▲로 표현한다.
  - 칸의 값이 0보다 작다면 뱀 이므로, ▼로 표현한다.
  - 칸이 값이 0이면, 아무것도 아닌 칸이고, ○로 표현한다.



prettyTextualDescription 프로퍼티는 이제 SnakeAndLadders 인스턴스를 묘사하기 위해 출력될 수 있다:


```swift
print(game.prettyTextualDescription)
// A game of Snakes and Ladders with 25 squares:
// ○ ○ ▲ ○ ○ ▲ ○ ○ ▲ ▲ ○ ○ ○ ▼ ○ ○ ○ ○ ▼ ○ ○ ▼ ○ ▼ ○
```
 

### Class-Only Protocols

프로토콜의 상속 리스트에 AnyObject 프로토콜을 추가하여 해당 프로토콜을 클래스 타입만 도입할 수 있도록 할 수 있다.


```swift
protocol SomeClassOnlyProtocol: AnyObject, SomeInheritedProtocol {
    // class-only protocol definition goes here
}
```
 

위의 예시에서, SomeClassOnlyProtocol은 클래스 타입에서만 도입 가능하다. 스트럭처와 열거형의 정의에서 SomeClassOnlyProtocol을 도입하려 시도하면 컴파일 타임 에러가 발생한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
