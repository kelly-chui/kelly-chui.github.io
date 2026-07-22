---
title: "The Swift Programming Language. Memory Safety (2)"
date: 2025-01-27

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Memory Safety

weight: 54

draft: false
original: "https://junmusu.tistory.com/153"
---

![](image-001.dat)

## Conflicting Access to In-Out Parameters

함수는 모든 in-out 파라미터에 대한 장기 쓰기 접근 권한을 가지고 있다. in-out 파라미터에 대한 쓰기 권한은 모든 non-in-out 파라미터가 evaluate된 후에 시작되어 함수가 호출되는 전체 기간동안 유지된다. 여러개의 in-out 파라미터가 존재할 경우, 쓰기 접근 파라미터들이 보이는 순서대로 시작된다.

이 장기 쓰기 접근 권한의 결과중 하나는 스코프 규칙(scoping rule)과 액세스 컨트롤이 허락하더라도, in-out으로 전달된 원본 변수에 접근할 수 없다는 것이다—원본에 접근하는 것은 충돌을 발생시킨다:


```swift
var stepSize = 1

func increment(_ number: inout Int) {
    number += stepSize
}

increment(&stepSize)
// Error: conflicting accesses to stepSize”
```
 

위의 코드에서, `stepSize`는 글로벌 변수이므로 일반적으로 `increment(_:)`에서 접근 가능하다. 하지만, `stepSize`의 읽기 접근은 `number`의 쓰기 접근과 오버랩 된다. 아래의 그림처럼, `number`와 `stepSize` 둘 다 메모리의 같은 공간을 가리키게 된다. 읽기와 쓰기 접근이 같은 메모리를 가리키고, 오버랩되어 충돌을 일으킨다.

![](image-002-optimized-image.webp)

이 충돌을 해결하는 방법중 하나는 `stepSize`의 명시적인 카피를 만드는 것이다:


```swift
// Make an explicit copy.
var copyOfStepSize = stepSize
increment(&copyOfStepSize)

// Update the original.
stepSize = copyOfStepSize
// stepSize is now 2
```
 

`increment(_:)`가 호출되기 전 `stepSize`의 카피를 만들면, `copyOfStepSize`의 값이 현재의 스텝 사이즈로 증가하는 것이 명확해진다. 읽기 접근이 쓰기 접근이 시작하기 전에 끝나게 되어 충돌이 발생하지 않게 된다.

다른 in-out 파라미터의 장기 쓰기 접근 권한의 결과는 하나의 변수를 같은 함수의 여러 in-out 파라미터로 전달했을 때 충돌을 발생시킨다:


```swift
func balance(_ x: inout Int, _ y: inout Int) {
    let sum = x + y
    x = sum / 2
    y = sum - x
}
var playerOneScore = 42
var playerTwoScore = 30
balance(&playerOneScore, &playerTwoScore)  // OK
balance(&playerOneScore, &playerOneScore)
// Error: conflicting accesses to playerOneScore
```
 

위의 `balance(_:_:)`함수는 두 개의 파라미터를 총합을 균등하게 나누어 수정한다. `playerOneScore`와 `playerTwoScore`를 아규먼트로 사용하여 호출하는 것은 충돌을 발생시키지 않는다—같은 시간에 두 개의 쓰기 접근 권한이 오버랩 되지만, 메모리의 다른 위치에 접근한다. 반대로, `playerOneScore`를 두 파라미터에 전달하면 충돌이 발생한다. 두 개의 쓰기 접근 권한을 메모리의 같은 위치에서 같은 시간에 시도하기 때문이다.

> **NOTE**  
>  연산자들도 함수이기 때문에, in-out 파라미터에 대한 장기 쓰기 접근 권한을 가질 수 있다. 예를 들면, balance(_:_:)가 <^>이라는 연산자 함수면, playerOneScore <^> playerOneScore와 같이 사용하는 것은 balance(&playerOneScore, &playerOneScore)와 같은 충돌을 일으킬 것이다.

## Conflicting Access to self in Methods

스트럭처의 뮤테이팅 메소드는 메소드 호출 동안 `self`에 대한 쓰기 접근 권한을 가지고 있다. 예를 들어서, 각각의 플레이어가 데미지를 받으면 줄어드는 체력을 가지고 있고, 특수 능력을 쓰면 줄어드는 에너지를 가지고 있는 게임을 생각해보자.


```swift
struct Player {
    var name: String
    var health: Int
    var energy: Int

    static let maxHealth = 10
    mutating func restoreHealth() {
        health = Player.maxHealth
    }
}
```
 

위의 `restoreHealth()`메소드에서, `self`에 대한 쓰기 접근은 메소드의 시작부터, 리턴될 때 까지 지속된다. 이 경우에, `restoreHealth()`의 내부에 `Player` 인스턴스의 프로퍼티에 대한 오버랩된 접근 코드가 존재하지 않는다. 아래에 있는 `shareHealth(with:)` 메소드는 다른 `Player` 인스턴스를 in-out 파라미터로 받아서, 오래핑 접근 가능성을 만든다.


```swift
extension Player {
    mutating func shareHealth(with teammate: inout Player) {
        balance(&teammate.health, &health)
    }
}

var oscar = Player(name: "Oscar", health: 10, energy: 10)
var maria = Player(name: "Maria", health: 5, energy: 10)
oscar.shareHealth(with: &maria)  // OK
```
 

위의 예시에서, Oscar 플레이어가 Maria 플레이어와 체력을 공유하기 위해 `shareHealth(with:)`를 쓰는 것은 충돌을 야기하지 않는다. `oscar`가 뮤테이팅 메소드에서 `self`의 값이기 때문에, `oscar`에 대한 쓰기 접근 권한이 메소드의 호출 동안 존재하고, `maria`의 쓰기 접근도 in-out 파라미터로 전달되었기 때문에, 같은 기간동안 존재한다. 아래의 그림처럼, 메모리의 다른 위치에 접근했기 때문에, 같은 시간에 두 쓰기 접근이 오버랩되어도, 충돌하지 않는다.

![](image-003-optimized-image.webp)

하지만, `oscar`를 `shareHealth(with:)`의 아규먼트로 전달한다면, 충돌이 발생하게 된다:


```swift
oscar.shareHealth(with: &oscar)
// Error: conflicting accesses to oscar
```
 

이 뮤테이팅 메소드는 `self`에 대한 쓰기 접근 권한이 메소드가 실행되는 동안 필요하고, in-out 파라미터 `teammate`에 대한 쓰기 접근 권한이 같은 기간동안 필요하다. 메소드의 내부에서, `self`와 `teammate`가 메모리의 같은 위치를 참조한다—아래의 그림에서 보이듯이. 두 쓰기 접근 권한은 같은 메모리를 가리키고 오버랩되어, 충돌을 발생시킨다.

![](image-004-optimized-image.webp)

## Conflicting Access to Properties

스트럭처, 튜플, 그리고 이뉴머레이션과 같은 타입은 스트럭처의 프로퍼티나 튜플의 원소와 같은 개별적인 구성 값들로 만들어진다. 이 타입들이 값 타입이기 때문에, 값의 일부분을 변경하는 것은 전체 값을 변경하게 된다, 이는 하나의 프로퍼티에 대한 읽기 혹은 쓰기 접근이 전체 값에 대한 읽기 혹은 쓰기 접근을 요구하는 것을 의미한다. 예를 들어, 튜플의 원소에 쓰기 접근을 오퍼래핑 하는 것은 충돌을 만든다:


```swift
var playerInformation = (health: 10, energy: 20)
balance(&playerInformation.health, &playerInformation.energy)
// Error: conflicting access to properties of playerInformation
```
 

위의 예시에서, `balance(_:_:)`를 튜플의 원소에서 호출하는 것은 `playerInformation`에 대한 쓰기 접근이 오버랩되기 때문에 충돌을 만든다. `playerInformation.health`와 `playerInformation.energy`는 in-out 파라미터로 전달되고, 이는 `balance(_:_:)`가 이들에 대한 쓰기 접근이 함수의 호출 기간동안 필요한 것을 뜻한다. 이 두 케이스에서, 이 튜플의 원소에 대한 쓰기 접근 권한은 전체 튜플에 대한 쓰기 접근 권한을 요구한다. 이것은 오버랩 기간동안 `playerInformation`에 대한 두 개의 쓰기 접근이 존재하는 것을 의미하고, 충돌을 야기한다.

아래의 코드는 글로벌 변수에 저장되어있는 스트럭처의 프로퍼티들에 대한 오버랩된 쓰기 접근 권한에서 똑같은 에러가 나타나는 것을 보여준다.


```swift
var holly = Player(name: "Holly", health: 10, energy: 10)
balance(&holly.health, &holly.energy)  // Error
```
 

실제로는, 스트럭처의 프로퍼티에 대한 대부분의 접근 안전하게 오버랩 될 수 있다. 예를 들어, 위의 코드에 있는 `holly` 변수는 글로벌 변수 대신에 로컬 변수로 바꾸면, 컴파일러는 컴파일러는 저장 프로퍼티에 대한 오버랩된 접근을 안전하다고 증명할 수 있다:


```swift
func someFunction() {
    var oscar = Player(name: "Oscar", health: 10, energy: 10)
    balance(&oscar.health, &oscar.energy)  // OK
}
```
 

위의 예시에서, 오스카의 체력과 에너지는 `balance(_:_:)`의 두 개의 in-out 파라미터로 전달된다. 두 저장 프로퍼티가 어떠한 방식으로든 상호작용하지 않기 때문에 컴파일러는 메모리 안전성이 보존된다는 것을 증명할 수 있다.

스트럭처의 프로퍼티에 대한 오버랩된 접근 제한이 메모리 안전성을 위해 항상 필요한 것은 아니다. 메모리 안전성은 바람직한 보증(desired guarantee)이지만, 독점 접근은 메모리 안전성보다 더 엄격한 요구사항이다—이는 일부 코드는 독점 접근을 위반하면서도, 메모리 안전성을 보존하는 것을 의미한다. Swift는 컴파일러가 비독점적인 접근이 여전히 메모리가 안전하다는 것을 증명할 수 있다면 이러한 memory-safe 코드를 허용한다. 특히 다음과 같은 조건들을 적용한 경우에는 스트럭처의 프로퍼티에 대한 오버랩된 접근이 안전하다고 증명할 수 있다:

  - 컴퓨티드 프로퍼티나 클래스 프로퍼티가 아닌 인스턴스의 스토어드 프로퍼티에만 접근한다.
  - 스트럭처가 글로벌 변수의 값이 아닌 로컬 변수의 값이다.
  - 스트럭처가 클로저에 캡처되지 않거나, 혹은 nonescaping 클로저에만 캡처된다.



컴파일러가 접근이 안전하다고 증명할 수 없으면, 접근을 허락하지 않는다.

> **Kelly’s Note**  
>  로컬 변수는 스코프가 한정되므로, 글로벌 변수보다 제한 조건이 덜 엄격하다. escaping 클로저에 캡처된 경우 해당 클로저가 스코프를 벗어날 수 있으므로 메모리가 안전하다고 판단하지 못한다.  
> 스트럭처가 로컬 변수의 값일 때 안전한 이유는 위 코드를 예시로 들면 이미 var oscar = …라인부터 oscar에 대한 읽기/쓰기 접근 권한을 someFunction이 가지고 있다. 따라서 in-out 파라미터에 전달되어도 컴파일러가 알아서 충돌이 나지 않도록 처리한다.

원문: <https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7>

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
