---
title: "[Swift] Nested Types(중첩 타입)"
date: 2023-06-28
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Nested Types"]
weight: 35

draft: false
original: "https://junmusu.tistory.com/108"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Nested Types

열거형은 특정 클래스나 스트럭처의 기능을 지원하도록 자주 생성된다. 비슷한 이유로, 클래스나 스트럭처를 복잡한 컨텍스트 내부에서 순수하게 유틸 용도로 사용하기 위해 정의할 수도 있다. 이를 위해 스위프트에서는 _중첩 타입(nested types)_ 을 정의할 수 있다. 중첩 타입을 지원하는 타입의 정의 내부에서 중첩 열거형, 클래스, 스트럭처를 중첩시킬 수 있다.

### Nested Types in Action

아래의 예시는 블랙잭 카드 게임에서 사용하는 플레잉 카드를 모델링하는 BlackjackCard라는 스트럭처를 정의한다. BlackjackCard 스트럭처는 두 개의 중첩 열거형 타입 Suit와 Rank를 가지고 있다.

블랙잭에서, 에이스 카드는 1 혹은 11의 값을 가지게 된다. 이 특징은 Rank 열거형에 중첩되어 있는 Values라는 스트럭처에 의해 표현된다.


```swift
struct BlackjackCard {

    // nested Suit enumeration
    enum Suit: Character {
        case spades = "♠", hearts = "♡", diamonds = "♢", clubs = "♣"
    }

    // nested Rank enumeration
    enum Rank: Int {
        case two = 2, three, four, five, six, seven, eight, nine, ten
        case jack, queen, king, ace
        struct Values {
            let first: Int, second: Int?
        }
        var values: Values {
            switch self {
            case .ace:
                return Values(first: 1, second: 11)
            case .jack, .queen, .king:
                return Values(first: 10, second: nil)
            default:
                return Values(first: self.rawValue, second: nil)
            }
        }
    }

    // BlackjackCard properties and methods
    let rank: Rank, suit: Suit
    var description: String {
        var output = "suit is \(suit.rawValue),"
        output += " value is \(rank.values.first)"
        if let second = rank.values.second {
            output += " or \(second)"
        }
        return output
    }
}
```
 

Suit 열거형은 원시 값으로 Character 타입 기호를 사용하여 4개의 플레잉 카드 문양(suit)을 묘사한다.

Rank 열거형은 원시 값으로 Int 타입 숫자를 사용하여 13개의 플레잉 카드 랭크(rank)를 묘사한다. (Jack, Queen, King, Ace 케이스는 원시 값을 사용하지 않는다.)

위에 언급한대로, Rank 열거형은 고유한 중첩 스트럭처 Values를 정의한다. 이 스트럭처는 대부분의 카드들이 하나의 값만을 가지고 있지만, 에이스 카드는 두 개의 값을 가진다는 사실을 캡슐화 한다. Values 스트럭처는 다음과 같은 사실을 나타내기 위해 두 개의 프로퍼티를 정의한다.

  - Int 타입 first
  - Int? 타입 second



Rank는 Values의 인스턴스를 리턴하는 컴퓨티드 프로퍼티 values도 정의한다. 이 컴퓨티드 프로퍼티는 카드의 랭크에 따라 적합한 새 Values 인스턴스를 초기화한다. jack, queen, king, ace와 같은 랭크에는 특별한 값을 사용하고, 일반 숫자 랭크 카드에는 랭크의 Int 타입 원시 값을 사용한다.

BlackjackCard 스트럭처는 두 개의 프로퍼티 rank와 suit를 가지고 있으며, rank와 suit를 사용하여 카드의 이름과 값에 대한 설명을 만드는 컴퓨티드 프로퍼티 description도 정의한다. description 프로퍼티는 옵셔널 바인딩을 사용하여 표시할 두 번째 값이 있는지 확인하고, 있다면 두 번째 값에 대한 설명을 추가한다.

BlackjackCard 스트럭처는 커스텀 이니셜라이저가 없으므로, 암시적인 멤버와이즈 이니셜라이저를 가지게 된다. 이 이니셜라이저를 사용하여 새 상수 theAceOfSpades를 초기화 할 수 있다:


```swift
let theAceOfSpades = BlackjackCard(rank: .ace, suit: .spades)
print("theAceOfSpades: \(theAceOfSpades.description)")
// Prints "theAceOfSpades: suit is ♠, value is 1 or 11"
```
 

Rank와 Suit가 BlackjackCard에 중첩되어 있어도 콘텍스트에서 추론 가능하므로, 이 인스턴스의 이니셜라이제이션은 (.ace와 .spades 같은)케이스 이름만으로 열거형 케이스를 참조할 수 있다(주: 추론이 가능하기 때문에 Rank.ace, Suit.spades와 같이 적지 않아도 된다는 의미). 위의 예시에서, description 프로퍼티는 스페이드 에이스가 1 혹은 11의 값을 가지는 것을 정확하게 묘사한다.

### Referring to Nested Types

중첩 타입이 정의되어 있는 컨텍스트 외부에서 사용하기 위해서는, 중첩 타입이 정의되어 있는 타입의 이름을 앞에 작성한다.


```swift
let heartsSymbol = BlackjackCard.Suit.hearts.rawValue
// heartsSymbol is "♡"
```
 

이는 자연스럽게 이 타입들이 정의되어 있는 컨텍스트 내부로 한정되기 때문에, Suit, Rank, Values의 이름을 의도적으로 짧게 유지할 수 있게 해준다(주: 외부에 이름이 같은 Suit, Rank 스트럭처가 있더라도 정의되어 있는 스코프가 다르므로 BlackjactCard 내부에 중첩되어 있는 Suit, Rank 스트럭처의 이름을 BlackjactSuit, BlackjackRank 처럼 길게 지어서 구분할 필요가 없다는 의미)

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
