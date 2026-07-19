---
title: "The Swift Programming Language. Deinitialization"
date: 2023-06-18

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Deinitialization

weight: 24

draft: false
original: "https://junmusu.tistory.com/98"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Deinitialization

디이니셜라이저는 클래스의 인스턴스가 할당 해제되기 전에 직전에 호출된다. 이니셜라이저가 init 키워드를 사용하여 작성하는 것 처럼, deinit 키워드를 사용하여 디이니셜라이저를 작성할 수 있다. 디이니셜라이저는 클래스 타입에만 사용 가능하다.

### How Deinitialization Works

스위프트는 인스턴스가 더 이상 필요하지 않을때, 자동적으로 할당을 해제해여 리소스를 확보한다. 스위프트는 automatic reference counting (ARC)를 통해 메모리를 관리한다. 일반적으로 인스턴스가 할당 해제될때 수동적으로 처리를 해줄 필요가 없다. 하지만 자체적인 리소스로 작업을 할 경우에는, 수동으로 추가적인 처리를 해줘야 하는 경우가 있다. 예를 들면, 파일을 열고 거기에 데이터를 작성하는 커스텀 클래스가 있을 때, 그 클래스의 인스턴스가 할당 해제되기 전에 파일을 먼저 닫아줘야 한다.

클래스 디이니셜라이저는 클래스당 하나만 가질 수 있다. 디이니셜라이저는 어떠한 파라미터도 받지 않으며, 괄호쌍 없이 작성된다.


```swift
deinit {
    // perform the deinitialization
}
```
 

디이니셜라이저는 인스턴스가 할당 해제되기 전에 자동으로 호출된다. 직접 디이니셜라이저를 호출하는 것은 불가능하다. 슈퍼클래의 디이니셜라이저는 서브클래스에 상속되고, 서브클래스의 디이니셜라이저 구현의 마지막에 자동적으로 호출된다. 서브클래스가 디이니셜라이저를 제공하지 않아도, 슈퍼클래스의 디이니셜라이저는 항상 호출된다.

### Deinitializers in Action

다음의 예시는 디이니셜라이저가 작동하는 예시이다. 이 예시는 게임에서 쓰일 Bank와 Player라는 두 개의 타입을 정의한다. Bank 클래스는 코인을 관리하며, 코인은 10,000개 보다 많은 수가 유통되고 있을 수 없다. 게임안에는 오직 하나의 Bank만 존재하므로 Bank는 타입 프로퍼티와 메소드로 현재 상태를 저장하고 관리한다.


```swift
class Bank {
    static var coinsInBank = 10_000
    static func distribute(coins numberOfCoinsRequested: Int) -> Int {
        let numberOfCoinsToVend = min(numberOfCoinsRequested, coinsInBank)
        coinsInBank -= numberOfCoinsToVend
        return numberOfCoinsToVend
    }
    static func receive(coins: Int) {
        coinsInBank += coins
    }
}
```
 

Bank는 coinInBank 프로퍼티로 현재 코인의 개수를 관리한다. 또한 두 개의 메소드 distribute(coins:)와 receive(coins:)를 제공하여 코인수의 변동내역을 처리한다.

distribute(coins:) 메소드는 요청받은 수 만큼의 코인을 주기 전에 은행에 충분한 코인이 있는지 확인한다. 충분한 코인이 없다면, 요청받은 수보다 적은 수를 리턴한다.(만약 은행에 코인이 하나도 없다면 0을 리턴한다) 이 메소드는 실제로 준 코인의 수를 리턴한다.

receive(coins:) 메소드는 단순히 은행의 코인 저장소에 받은 만큼의 코인을 추가한다.

Player 클래스는 게임의 플레이어를 묘사한다. 각 플레이어는 특정한 수의 코인을 지갑에 가지고 있고, 이를 coinsInPurse 프로퍼티로 구현한다.


```swift
class Player {
    var coinsInPurse: Int
    init(coins: Int) {
        coinsInPurse = Bank.distribute(coins: coins)
    }
    func win(coins: Int) {
        coinsInPurse += Bank.distribute(coins: coins)
    }
    deinit {
        Bank.receive(coins: coinsInPurse)
    }
}
```
 

Player의 각 인스턴스는 이니셜라이제이션 도중 은행에서 지정된 수의 코인을 받아 초기화된다. 동전의 숫자가 모자른 경우 지정된 수 보다 적은 코인을 받을 수도 있다.

Player 클래스는 은행에서 코인을 받아 플레이어의 지갑에 추가하는 win(coins:) 메소드를 정의한다. 또한 Player 클래스는 디이니셜라이저를 구현한다. 이 디이니셜라이저는 Player 인스턴스가 할당 해제되기 전에 호출되며, 플레이어의 코인을 모두 은행에 반환하는 동작을 한다.


```swift
var playerOne: Player? = Player(coins: 100)
print("A new player has joined the game with \(playerOne!.coinsInPurse) coins")
// Prints "A new player has joined the game with 100 coins"
print("There are now \(Bank.coinsInBank) coins left in the bank")
// Prints "There are now 9900 coins left in the bank"
```
 

새로운 Player 인스턴스가 생성되면서, 100개의 코인을 요청한다. 이 Player 인스턴스는 옵셔널 Player 변수 playerOne에 저장된다. 플레이어는 언제든지 게임에서 떠날 수 있으므로, 옵셔널 값을 사용하여 플레이어가 현재 게임에 참여해 있는지 확인한다.

playerOne이 옵셔널이기 때문에, win(coins:) 메소드를 호출할 때와 coinsPurse 프로퍼티 값을 출력할 때마다 옵셔널 언래핑을 해줘야한다. 


```swift
playerOne!.win(coins: 2_000)
print("PlayerOne won 2000 coins & now has \(playerOne!.coinsInPurse) coins")
// Prints "PlayerOne won 2000 coins & now has 2100 coins"
print("The bank now only has \(Bank.coinsInBank) coins left")
// Prints "The bank now only has 7900 coins left"
```
 

위 예시에서 플레이어는 2,000코인을 벌었다. 이제 플레이어 지갑에 있는 코인은 개수는 2,100개고 은행에 있는 코인은 7,900개가 남는다.


```swift
playerOne = nil
print("PlayerOne has left the game")
// Prints "PlayerOne has left the game"
print("The bank now has \(Bank.coinsInBank) coins")
// Prints "The bank now has 10000 coins"
```
 

playerOne 변수를 nil로 설정하여("플레이어 인스턴스가 존재하지 않는다" 라는 뜻) 플레이어가 게임을 떠난걸 나타낸다. 이러한 상황이 일어날 때, 그 Player 인스턴스에 대한 playerOne의 참조는 사라진다. 아무런 프로퍼티나 변수가 그 Player 인스턴스를 참조하지 않으므로, 메모리에서 할당 해제된다. 이러한 일이 일어나기 전, 디이니셜라이저가 자동적으로 호출되고, 코인을 은행으로 리턴한다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
