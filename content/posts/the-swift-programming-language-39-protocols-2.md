---
title: "The Swift Programming Language. Protocols (2)"
date: 2023-07-01

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Protocols

weight: 39

draft: false
original: "https://junmusu.tistory.com/112"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Protocols as Types

프로토콜은 어떠한 기능도 실제로 구현하지는 않는다. 하지만 코드에서 프로토콜을 타입으로 사용할 수 있다.

프로토콜을 타입으로 사용하는 가장 일반적인 방법은 프로토콜을 제네릭 제약조건(generic constraint)로 사용하는 것이다. 제네릭 제약조건이 있는 코드는 프로토콜을 준수하는 모든 타입에서 사용할 수 있으며, 특정 타입은 API를 사용되는 코드에서 선택된다. 예를 들어 제네릭 아규먼트를 받는 함수를 호출하면, 호출자가 타입을 선택한다.

불투명한 타입(opaque type)의 코드는 프로토콜을 준수하는 일부 타입에서 동작한다. 실제 타입은 컴파일 타임에 알수 있고, API 구현은 그 타입을 선택하지만 그 타입의 식별자는 클라이언트에게 숨겨져 있다. 불투명한 타입을 사용하는 것은 추상화 레이어를 통해 API의 디테일한 구현이 유출되는 것을 방지하게 해준다. — 예를 들어, 함수의 지정된 리턴 타입을 숨기고, 리턴 값의 타입이 주어진 프로토콜을 준수한다는 것만을 보장하게 한다.

박스드 프로토콜 타입의 코드는 런타임에서 선택된 그 프로토콜을 준수하는 모든 타입의 코드에서 동작한다. 런타임 유연성을 위해, 스위프트는 필요할 때 box라는 성능 비용이 있는 간접 레벨을 추가한다. 이 유연성 때문에, 스위프트는 컴파일 타임에 실제 타입을 알지 못한다. 따라서 프로토콜에서 요구하는 멤버들에게만 접근 할 수있다. 실제 타입에 있는 다른 API에 접근하기 위해서는 런타임에 캐스팅이 필요하다.

### Delegation

_델리게이션(delegation)_ 은 클래스 혹은 스트럭처가 다른 타입의 인스턴스에게 책임을 위임하는 디자인 패턴이다. 이 디자인 패턴은 위임된 책임을 캡슐화하는 프로토콜을 정의함으로써 구현되고, 해당 프로토콜을 준수하는 타입이 위임된 기능을 제공하도록 보장한다. 델리게이션은 특정 동작에 응답하도록 사용하거나, 소스의 타입을 모르는 상태로 외부 소스에서 데이터를 검색하는데 사용할 수 있다.

아래의 예시는 주사위 게임에서 사용하는 두 개의 프로토콜을 정의한다.


```swift
protocol DiceGame {
    var dice: Dice { get }
    func play()
}
protocol DiceGameDelegate: AnyObject {
    func gameDidStart(_ game: DiceGame)
    func game(_ game: DiceGame, didStartNewTurnWithDiceRoll diceRoll: Int)
    func gameDidEnd(_ game: DiceGame)
}
```
 

DiceGame 프로토콜은 주사위를 사용하는 모든 게임에서 도입할 수 있는 프로토콜이다.

DiceGameDelegate 프로토콜은 DiceGame의 진행도를 추적하기 위해 도입할 수 있다. 강한 참조 사이클을 방지하기 위해, 델리게이트는 약한 참조로 선언된다. 프로토콜을 클래스 전용으로 지정하면, 아래에 있는 SnakeAndLadders 클래스는 델리게이트를 반드시 약한 참조로 선언해야 한다. 클래스 전용 프로토콜은 AnyObject에서 상속받는 것으로 지정된다.

다음은 Control Flow에서 소개된 Snakes and Ladders에서 DiceGame 프로토콜과 진행사항을 DiceGameDelegate에 알리기 위해 Dice 인스턴스를 적용한 버전이다


```swift
class SnakesAndLadders: DiceGame {
    let finalSquare = 25
    let dice = Dice(sides: 6, generator: LinearCongruentialGenerator())
    var square = 0
    var board: [Int]
    init() {
        board = Array(repeating: 0, count: finalSquare + 1)
        board[03] = +08; board[06] = +11; board[09] = +09; board[10] = +02
        board[14] = -10; board[19] = -11; board[22] = -02; board[24] = -08
    }
    weak var delegate: DiceGameDelegate?
    func play() {
        square = 0
        delegate?.gameDidStart(self)
        gameLoop: while square != finalSquare {
            let diceRoll = dice.roll()
            delegate?.game(self, didStartNewTurnWithDiceRoll: diceRoll)
            switch square + diceRoll {
            case finalSquare:
                break gameLoop
            case let newSquare where newSquare > finalSquare:
                continue gameLoop
            default:
                square += diceRoll
                square += board[square]
            }
        }
        delegate?.gameDidEnd(self)
    }
}
```
 

이 버전의 게임은 DiceGame 프로토콜을 도입한 SnakesAandLadders 클래스에 의해 래핑되어 있다. 이 클래스는 gettable dice 프로퍼티와 play() 메소드를 DiceGame 프로토콜을 준수하기 위해 제공한다. (dice 프로퍼티는 초기화 이후에 변하지 않고, 프로토콜이 gettable 정도만 요구하므로 상수 프로퍼티로 선언되었다.)

Snakes and Ladders 게임의 보드 설정은 클래스의 init() 이니셜라이저에서 이루어진다. 모든 게임 로직은 프로토콜에서 요구하는 dice 프로퍼티를 주사위를 굴리는데 사용하는 play 메소드로 이동했다.

delegate 프로퍼티는 게임을 플레이하는데 필요하지 않기 때문에 옵셔널 DiceGameDelegate로 선언된 것을 알아두자. delegate 프로퍼티가 옵셔널 타입이기 때문에, 자동적으로 nil로 초기화 된다. 그 후에, 게임 인스턴스 생성자는 delegate 프로퍼티를 알맞은 delegate로 초기화 할 옵션을 가지게 된다. DiceGameDelegate 프로토콜이 클래스 전용이기 때문에, 순환 참조를 피하기 위해 델리게이트를 weak로 선언할 수 있다.

DiceGameDelegate는 게임의 진행 상황을 추적하기 위한 세 개의 메소드를 제공한다. 이 세 개의 메소드는 play() 메소드 안에서 게임 로직과 함께 통합되어 새 게임 시작, 새 턴 시작, 게임 종료 상황에서 호출된다.

delegate 프로퍼티가 옵셔널 DiceGameDelegate 이기 때문에, play() 메소드는 델리게이트에 있는 함수를 호출할 때마다 옵셔널 체이닝을 사용한다. 만약 delegate 프로퍼티가 nil이라면, 이 델리게이트 호출은 에러 없이 실패한다. delegate 프로퍼티가 nil 이 아니라면, 델리게이트 함수가 호출되고, SnakesAndLadders 인스턴스가 파라미터로 전달된다.

다음의 예시는 DiceGameDelegate 프로토콜을 도입한 DiceGameTracker 클래스를 호출한다.


```swift
class DiceGameTracker: DiceGameDelegate {
    var numberOfTurns = 0
    func gameDidStart(_ game: DiceGame) {
        numberOfTurns = 0
        if game is SnakesAndLadders {
            print("Started a new game of Snakes and Ladders")
        }
        print("The game is using a \(game.dice.sides)-sided dice")
    }
    func game(_ game: DiceGame, didStartNewTurnWithDiceRoll diceRoll: Int) {
        numberOfTurns += 1
        print("Rolled a \(diceRoll)")
    }
    func gameDidEnd(_ game: DiceGame) {
        print("The game lasted for \(numberOfTurns) turns")
    }
}
```
 

DiceGameTracker는 DiceGameDelegate에서 요구하는 세 개의 메소드 모두를 구현한다. 이 세 메소드는 게임이 몇 번째 턴에 있는지를 추적하는데 사용된다. 게임이 시작되면 numberOfTurns 프로퍼티를 0으로 리셋하고, 새로운 턴이 시작될 때 마다 1씩 증가시키며, 게임이 종료되면 총 턴수를 출력한다.

gameDidStart(_:)의 구현은 game 파라미터를 플레이 되고 있는 게임에 대한 소개를 출력하는데 사용한다. game 파라미터는 SnakesAndLadders가 아닌 DiceGame이라는 파라미터를 가지고 있다 따라서 gameDidStart(_:)는 DiceGame 프로토콜의 일부로 정의되어 있는 메소드와 프로퍼티에만 접근 가능하다. 하지만 이 메소드는 타입 캐스팅을 통해서 인스턴스의 실제 타입을 쿼리할 수 있다. 이 예시에서 gameDidStart(_:)는 game의 실제 인스턴스가 SnakesAndLadders인지 체크하고, 만약 맞다면 그에 따른 적합한 메세지를 출력한다.

gameDidStart(_:) 메소드는 전달받은 game 파라미터의 dice 프로퍼티 또한 접근한다. game이 DiceGame 프로토콜을 준수한다는 것을 알고 있으므로, dice 프로퍼티가 존재한다는 사실이 보장된다. 따라서 어떤 게임을 하고있는지에 상관 없이 gameDidStart(_:) 메소드는 dice의 side 프로퍼티에 접근하고 출력할 수 있다.

다음은 DiceGameTracker가 작동하는 모습이다.


```swift
let tracker = DiceGameTracker()
let game = SnakesAndLadders()
game.delegate = tracker
game.play()
// Started a new game of Snakes and Ladders
// The game is using a 6-sided dice
// Rolled a 3
// Rolled a 5
// Rolled a 4
// Rolled a 5
// The game lasted for 4 turns
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
