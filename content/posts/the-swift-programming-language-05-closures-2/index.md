---
title: "The Swift Programming Language. Closures (2)"
date: 2023-05-29

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Closures

weight: 5

draft: false
original: "https://junmusu.tistory.com/74"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Capturing Values

클로저는 자신이 정의된 컨텍스트에서 상수나 변수를 캡처할 수 있다. 캡처한 상수나 변수가 정의되어있는 범위가 더 이상 존재하지 않아도 클로저의 본문에서 그 변수나 상수를 참조하고 수정할 수 있다.

스위프트에서 값을 캡쳐하는 가장 간단한 형태의 클로저는 중첩 함수이다. 중첩 함수는 외부 함수(둘러싸고 있는 함수)내부에 선언된 변수나 상수, 그리고 아규먼트를 캡처할 수 있다.

다음 예시는 incrementer라는 중첩 함수를 가지고 있는 makeIncrementer 함수의 예시이다. incrementer() 함수는 runningTotal과 amount 두개의 변수를 캡처한다. 이 값을 캡처한 다음에 incrementer는 호출될 때마다 amount만큼 runningTotal을 증가시키는 클로저가 되고, makeIncrementer에 의해 리턴 된다.


```swift
func makeIncrementer(forIncrement amount: Int) -> () -> Int {
    var runningTotal = 0
    func incrementer() -> Int {
        runningTotal += amount
        return runningTotal
    }
    return incrementer
}
```
 

makeIncrementer(forIncrement:)함수는 incrementer가 리턴할 runningTotal이라는 변수를 정의한다.

또한 하나의 forIncrement라는 아규먼트 레이블을 가지고 있는 Int 타입 파라미터 amount를 가지고 있다. 이 아규먼트는 리턴된 incrementer 함수가 호출될 때 마다 runningTotal을 얼마나 증가시킬지 결정한다. makeIncrementer(forIncrement:)함수는 incrementer라는 중첩 함수도 가지고 있는데 이 중첩함수가 실질적으로 runningTotal의 값을 증가시키고 그 값을 리턴한다.

중첩된 함수를 독립적으로 생각했을 때, incrementer()는 이상하게 보인다.


```swift
func incrementer() -> Int {
    runningTotal += amount
    return runningTotal
}
```
 

incrementer() 함수는 어떠한 파라미터도 가지고 있지 않지만 runningTotal과 amount를 그 본문에서 사용한다. runningTotal과 amount의 참조를 둘러싸고 있는 함수(makeIncrementer)에서 캡처하면 함수(incrementer) 본문에서 사용할 수 있기 때문이다. 참조로 캡처하면 makeIncrementer 함수 실행이 종료되어도 incrementer()가 호출될 때 마다 runningTotal을 사용할 수 있게 된다.

다음의 예시는 makeIncrementer를 실행하는 예시이다.


```swift
let incrementByTen = makeIncrementer(forIncrement: 10)
incrementByTen()
// returns a value of 10
incrementByTen()
// returns a value of 20
incrementByTen()
// returns a value of 30
```
 

두 번째 incrementer를 만든다면 그 두 번째 incrementer는 첫 번째 incrementer와 다른 runningTotal의 참조를 가지게 된다.


```swift
let incrementBySeven = makeIncrementer(forIncrement: 7)
incrementBySeven()
// returns a value of 7
incrementByTen()
// returns a value of 40
```
 

다시 incrementByTen을 호출하면 incrementBySeven의 영향을 받지 않는다는 것을 알 수 있다.

> **Note**  
>  클래스 인스턴스의 프로퍼티에 클로저를 할당하고, 그 클로저가 인스턴스나 다른 멤버들을 캡처하게 되면 인스턴스와 클로저 사이에 강한 참조 사이클을 만들게 된다. 스위프트는 이 강한 참조 사이클을 제거하기 위해 캡처 리스트를 사용한다.

### Closures Are Reference Types

위의 예시에 incrementBySeven과 incrementByTen은 상수이지만, runningTotal의 값을 증가시킬 수 있다. 이는 클로저와 함수가 참조 타입이기 때문이다.

상수나 변수에 클로저를 할당하는 것은 그 상수나 변수가 클로저를 참조하도록 설정하는것이다. 위의 예시에서 incrementByTen이 상수인건 그 상수가 참조할 클로저를 선택하는것이 상수인 것이지, 클로저 자체의 내용이 아니다.(클로저가 할당된 상수는 다른 클로저로 바꿀 수 없을 뿐이지, 그 클로저의 내용 자체가 상수일 필요는 없다.)

다른 두개의 상수와 변수에 클로저를 할당하면 두 상수와 변수는 같은 클로저를 참조하게 된다.


```swift
let alsoIncrementByTen = incrementByTen
alsoIncrementByTen()
// returns a value of 50

incrementByTen()
// returns a value of 60
```
 

위의 예시에서 alsoIncrementByTen을 호출하는 것은 incrementByTen을 호출하는 것과 같다. 두 변수와 상수가 같은 클로저를 참조하고 있으므로 같은 runningTotal을 공유하기 때문이다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
