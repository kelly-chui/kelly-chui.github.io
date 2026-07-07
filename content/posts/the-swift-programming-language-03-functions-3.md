---
title: "The Swift Programming Language. Functions (3)"
date: 2023-05-27
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Functions"]
weight: 3

draft: false
original: "https://junmusu.tistory.com/72"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Function Types

모든 함수는 파라미터들의 타입들과 리턴 값의 타입으로 이루어진 특정한 _함수 타입_ 을 가지고 있다.


```swift
func addTwoInts(_ a: Int, _ b: Int) -> Int {
    return a + b
}
func multiplyTwoInts(_ a: Int, _ b: Int) -> Int {
    return a * b
}
```
 

위의 예시에서 두 함수는 두 개의 정수 값을 받아 정수 값을 리턴한다. 두 함수 모두 (Int, Int) -> Int 타입이며, 이는 "두 개의 Int 타입 파라미터를 받아 Int 타입을 리턴하는 함수" 라는 의미이다.

파라미터와 리턴 값이 없는 함수의 예시이다.


```swift
func printHelloWorld() {
    print("hello, world")
}
```
 

이 함수의 타입은 () -> Void 이고 "파라미터가 없고 리턴값이 Void인 함수" 라는 의미를 가진다.

#### Using Function Types

함수 타입은 스위프트에 있는 다른 타입들과 동일하게 이용할 수 있다. 대표적으로, 함수 타입 변수나 상수를 선언하고 거기에 알맞은 함수를 할당할 수 있다.


```swift
var mathFunction: (Int, Int) -> Int = addTwoInts
```
 

이 문장은 "두개의 정수 값을 받아 하나의 정수를 리턴하는 함수 타입을 가진 mathFunction이라는 변수를 선언하고 이 변수가 addTwoInts라는 함수를 참조하게 한다" 라는 의미이다.

또한 변수 mathFunction을 이용하여 할당된 함수를 호출할 수 있다.


```swift
print("Result: \(mathFunction(2, 3))")
// Prints "Result: 5
```
 

타입이 같은 다른 함수 또한 변수 mathFunction에 할당 할 수 있다.


```swift
mathFunction = multiplyTwoInts
print("Result: \(mathFunction(2, 3))")
// Prints "Result: 6
```
 

#### Function Types as Parameter Types

함수 타입을 다른 함수의 파라미터 타입으로 쓸 수 있다. 이를 통해 함수의 특정한 부분의 구현을 그 함수를 호출 할 때 제공할 수 있도록 남겨둘 수 있다. 


```swift
func printMathResult(_ mathFunction: (Int, Int) -> Int, _ a: Int, _ b: Int) {
    print("Result: \(mathFunction(a, b))")
}
printMathResult(addTwoInts, 3, 5)
// Prints "Result: 8
```
 

위 함수의 첫 번째 파라미터 mathFunction의 타입은 (Int, Int) -> Int이며, 이런 타입을 가진 모든 함수들을 이 파라미터를 통해 아규먼트로 전달할 수 있다.

위 함수는 첫 번째 파라미터로 들어온 함수의 결과를 출력하는 역할만 한다. 파라미터로 들어온 함수가 어떤 일을 하는지 전혀 신경쓰지 않고, 들어온 함수가 맞는 타입인지의 여부에만 영향을 받는다.

#### Function Types as Return Types

-> 뒤에 함수 타입을 작성해주기만 하면, 함수 타입을 다른 함수의 리턴 타입으로도 사용할 수 있다.

아래의 예시는 (Int) -> Int 타입의 간단한 두 함수 stepForward(_:), stepBackward(_:)와 (Int) -> Int를 리턴하는 함수 chooseStepFunction(backward:)이다.


```swift
func stepForward(_ input: Int) -> Int {
    return input + 1
}
func stepBackward(_ input: Int) -> Int {
    return input - 1
}
func chooseStepFunction(backward: Bool) -> (Int) -> Int {
    return backward ? stepBackward : stepForward
}
var currentValue = 3
let moveNearerToZero = chooseStepFunction(backward: currentValue > 0)
// moveNearerToZero now refers to the stepBackward() function
print("Counting to zero:")
// Counting to zero:
while currentValue != 0 {
    print("\(currentValue)... ")
    currentValue = moveNearerToZero(currentValue)
}
print("zero!")
// 3...
// 2...
// 1...
// zero!
```
 

함수 chooseStepFunction(backward:)는 파라미터로 전달된 Bool 값에 따라 stepForward(_:) 함수나 stepBackward(_:) 함수를 리턴한다.

위의 예시에서 currentValue의 초기값은 3이기 때문에 moveNearerToZero 변수는 stepBackward(_:) 함수를 참조하게 되고, currentValue = moveNearerToZero(currentValue)를 반복함으로써 currentValue는 0까지 줄어든다.

#### Nested Functions

앞서 나온 모든 예시들은 전역 함수의 경우에서만을 다뤘다. 하지만 스위프트에선 함수 내부에 함수를 선언할 수 있고 이를 중첩 함수(Nested Functions)라고 한다.

기본적으로 중첩 함수들은 둘러싼 함수 외부에서는 숨겨져 있지만, 둘러싼 함수에서는 중첩 함수를 호출해서 사용할 수 있다. 또한 이 중첩 함수를 리턴함으로써 함수 외부에서 이 함수를 사용하게할 수도 있다.

위의 chooseStepFunction(backward:) 함수의 예시에서 중첩 함수를 이용해 보자


```swift
import Foundation

func chooseStepFunction(backward: Bool) -> (Int) -> Int {
    func stepForward(_ input: Int) -> Int {
        return input + 1
    }
    func stepBackward(_ input: Int) -> Int {
        return input - 1
    }
    return backward ? stepBackward : stepForward
}
var currentValue = 3
let moveNearerToZero = chooseStepFunction(backward: currentValue > 0)
// moveNearerToZero now refers to the stepBackward() function
print("Counting to zero:")
// Counting to zero:
while currentValue != 0 {
    print("\(currentValue)... ")
    currentValue = moveNearerToZero(currentValue)
}
print("zero!")
// 3...
// 2...
// 1...
// zero!
```
 

> 이 글은 Apple의 [『The Swift Programming Language』](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
