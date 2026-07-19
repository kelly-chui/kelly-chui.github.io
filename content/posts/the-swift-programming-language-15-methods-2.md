---
title: "The Swift Programming Language. Methods (2)"
date: 2023-06-06

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Methods

weight: 15

draft: false
original: "https://junmusu.tistory.com/85"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Type Methods

이전에 설명했던 인스턴스 메소드는 특정 타입의 인스턴스가 호출한다. 타입 그 자체에 연관된 메소드는 타입 메소드라고하며, func 키워드 앞에 static 키워드를 작성하여 타입 메소드임을 나타낸다. 클래스는 서브클래스가 타입 메소드를 오버라이드 할 수 있도록 class 키워드를 대신 사용할 수 있다.

타입 메소드는 인스턴스 메소드처럼 닷 구문을 통해서 호출되지만, 인스턴스가 아닌 타입을 통해서 호출해야 한다. 다음은 클래스 SomeClass가 타입 메소드를 호출하는 예시이다.


```swift
class SomeClass {
    class func someTypeMethod() {
        // type method implementation goes here
    }
}
SomeClass.someTypeMethod()
```
 

타입 메소드의 본문에서 self 프로퍼티는 타입의 인스턴스가 아닌 타입 자체를 뜻한다. 따라서 인스턴스 메소드처럼 이를 통해 타입 프로퍼티와 타입 메소드 프로퍼티를 구분할 수 있다.

더 일반적으로, 타입 메소드의 본문에서 사용되는 정규화 되지 않은(주: 명시적으로 타입을 작성하지 않은) 메소드나 프로퍼티 이름은 타입 내부의 다른 타입 메소드나 타입 프로퍼티를 참조한다. 즉, 타입 메소드는 앞에 타입을 작성하지 않더라도 다른 타입 메소드를 사용할 수 있고, 비슷하게 타입 프로퍼티도 앞에 타입을 작성하지 않고도 접근할 수 있다.

아래의 예시는 플레이어의 진행도를 게임의 레벨이나 스테이지를 통해 추적하는 스트럭처 LevelTracker를 정의한다. 이때 하나의 디바이스에 여러 플레이어의 정보가 저장되어 있다고 가정한다.

레벨 1을 제외한 모든 게임의 레벨은 게임을 처음 시작했을 때 잠겨있다. 플레이어가 레벨을 클리어 했을 때, 그 레벨은 디바이스에 있는 모든 플레이어들에게 열리게 된다. LevelTracker 스트럭처는 타입 메소드와 프로퍼티를 이용하여 어떤 레벨이 열렸는지를 추적한다.


```swift
struct LevelTracker {
    static var highestUnlockedLevel = 1
    var currentLevel = 1

    static func unlock(_ level: Int) {
        if level > highestUnlockedLevel { highestUnlockedLevel = level }
    }

    static func isUnlocked(_ level: Int) -> Bool {
        return level <= highestUnlockedLevel
    }

    @discardableResult
    mutating func advance(to level: Int) -> Bool {
        if LevelTracker.isUnlocked(level) {
            currentLevel = level
            return true
        } else {
            return false
        }
    }
}
```
 

LevelTracker 스트럭처는 열려있는 가장 높은 레벨을 추적한다. 이 값은 타입 프로퍼티 highestUnlockedLevel에 저장된다.

또한 LevelTracker는. highestUnlockedLevel과 같이 사용하기 위해 두개의 타입 함수(메소드)도 정의한다. 첫 번째는 새로운 레벨이 열렸을때 highestUnlocked의 값을 업데이트 해주는 unlock(_:) 함수이고, 두 번째는 특정 레벨이 열려있는지 판단하기 위한 isUnlocked(_:)함수이다.

이외에도 LevelTracker는 개인 플레이어의 진행도를 인스턴스 프로퍼티 currentLevel을 통해 추적한다.

currentLevel 프로퍼티를 관리하기 위해 LevelTracker는 advance(to:)라는 인스턴스 메소드를 정의한다. 이 메소드는 currentLevel이 업데이트 되기 전에 요청된 새 레벨이(currentLevel에 들어갈 새 값이) 열려있는 레벨인지 확인한다.

LevelTracker 스트럭처는 개인 플레이어의 진행도를 추적하고 업데이트하기 위하여 아래에 보이는 Player 클래스와 함께 사용된다.


```swift
class Player {
    var tracker = LevelTracker()
    let playerName: String
    func complete(level: Int) {
        LevelTracker.unlock(level + 1)
        tracker.advance(to: level + 1)
    }
    init(name: String) {
        playerName = name
    }
}
```
 

Player 클래스는 플레이어의 진행도를 추적하기 위해 새 LevelTracker의 인스턴스를 생성한다. 그리고 특정 레벨을 완료했을 때, 호출할 complete(level:) 메소드 또한 제공한다. 이 메소드는 다음 레벨을 모든 플레이어들에게 열고, 플레이어의 진행도를 업데이트하고 다음 레벨로 이동시킨다.

새로운 플레이어가 왔을때 Player의 인스턴스를 생성한다. 그리고 그 플레이어가 레벨 1을 클리어 했을때의 예시이다.


```swift
var player = Player(name: "Argyrios")
player.complete(level: 1)
print("highest unlocked level is now \(LevelTracker.highestUnlockedLevel)")
// Prints "highest unlocked level is now 2"
```
 

어떤 플레이어도 완료하지 못한 레벨에 접근하려는 두 번째 플레이어를 생성하면, 실패하는 것을 볼 수 있다.


```swift
player = Player(name: "Beto")
if player.tracker.advance(to: 6) {
    print("player is now on level 6")
} else {
    print("level 6 hasn't yet been unlocked")
}
// Prints "level 6 hasn't yet been unlocked"
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
