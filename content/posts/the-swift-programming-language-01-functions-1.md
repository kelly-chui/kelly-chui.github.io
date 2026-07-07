---
title: "[Swift] Functions(함수) - 1"
date: 2023-05-25
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Functions"]
weight: 1

draft: false
original: "https://junmusu.tistory.com/70"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" width="191.1856px" >}}

## Functions

함수는 특정 작업을 수행하는 독립적인 코드 덩어리이다. 함수에 이름을 지어서 그 함수가 무엇을 하는지를 나타내고, 필요할때 "호출(call)"할 수 있다.

스위프트의 함수는 파라미터의 이름이 없는 C-스타일 함수와 파라미터의 이름과 아규먼트 레이블이 모두 있는 Objective-C 스타일 함수를 동시에 표현할 수 있다. 파라미터는 디폴트 값을 가질 수 있고, 파라미터로 받아 값을 변경 시킬 수 있는 in-out 파라미터로도 전달 될 수 있다.

모든 함수는 파라미터들의 타입과 리턴 타입으로 이루어진 타입을 가지고 있다. 스위프트의 다른 타입들과 마찬가지로 다른 함수에 대한 파라미터로 이 타입을 전달 할 수 있고, 리턴 값으로 사용할 수도 있다. 또한 함수는 중첩할 수 있어 함수 내부에서 함수를 작성 하여 특정 기능에 대한 캡슐화를 할 수 있다.

### Defining and Calling Functions

함수를 정의할 때, 입력으로 들어올 한 개 이상의 파라미터와 만약 리턴할 값이 존재한다면, 리턴 값을 설정해 줄 수 있다.

모든 함수는 수행할 태스크를 설명하는 이름이 있으며, 함수를 사용하기 위해선 함수의 이름을 호출하고 위해 함수의 이름과 알맞은 입력값(아규먼트)를 전달해야 한다. 함수로 전달된 아규먼트들은 반드시 함수의 파라미터 목록의 순서와 같아야 한다.


```swift
func greet(person: String) -> String {
    let greeting = "Hello, " + person + "!"
    return greeting
}
```
 

이러한 정의는 함수가 어떤 일을 하는지, 어떤 값을 받는지, 그리고 종료되면 무엇을 리턴하는지를 나타낸다.

### Function Parameters and Return Values

스위프트에서 함수의 파라미터와 리턴 값은 매우 유연하게 사용될 수 있다.

#### Functions Without Parameters

함수가 꼭 파라미터가 있을 필요는 없다.


```swift
func sayHelloWorld() -> String {
    return "hello, world"
}
print(sayHelloWorld())
// Prints "hello, world"
```
 

파라미터가 없는 함수라도 함수를 호출할 때 괄호 한 쌍()이 꼭 필요하다.

#### Functions With Multiple Parameters

함수가 여러개의 파라미터들을 가질 수도 있다. 이 파라미터들은 괄호 속에 컴마로 구분된다.


```swift
func greet(person: String, alreadyGreeted: Bool) -> String {
    if alreadyGreeted {
        return greetAgain(person: person)
    } else {
        return greet(person: person)
    }
}
print(greet(person: "Tim", alreadyGreeted: true))
// Prints "Hello again, Tim!
```
 

#### Functions Without Return Values

리턴 값이 없는 함수를 만들 수도 있다. 아래의 함수는 리턴 값을 리턴하는 대신, 스스로 출력한다.


```swift
func greet(person: String) {
    print("Hello, \(person)!")
}
greet(person: "Dave")
// Prints "Hello, Dave!
```
 

리턴 값이 없기 때문에 함수의 정의에서 `->` 또한 필요하지 않다.

또한 함수의 리턴값을 무시할 수도 있다.


```swift
func printAndCount(string: String) -> Int {
    print(string)
    return string.count
}
func printWithoutCounting(string: String) {
    let _ = printAndCount(string: string)
}
printAndCount(string: "hello, world")
// prints "hello, world" and returns a value of 12
printWithoutCounting(string: "hello, world")
// prints "hello, world" but doesn't return a value
```
 

첫 번째 함수는 파라미터로 들어온 스트링을 출력하고, 글자 수를 `Int` 타입으로 리턴한다. 두 번째 함수는 첫 번째 함수를 호출하여 스트링을 출력하지만 첫 번째 함수의 리턴 값을 무시한다.

> NOTE  
> 리턴 값은 무시될 수 있지만, 리턴 값이 존재하는 함수에서는 반드시 리턴을 해야한다. 그렇지 않다면 컴파일 타임 에러가 발생한다.

#### Functions with Multiple Return Values

튜플을 이용하여 여러 개의 리턴 값을 묶어 하나의 값으로 리턴할 수 있다.


```swift
func minMax(array: [Int]) -> (min: Int, max: Int) {
    var currentMin = array[0]
    var currentMax = array[0]
    for value in array[1..<array.count] {
        if value < currentMin {
            currentMin = value
        } else if value > currentMax {
            currentMax = value
        }
    }
    return (currentMin, currentMax)
}
```
 

이 함수는 정수 배열에서 최대값과 최소값을 찾아 두개의 정수 타입으로 이루어진 튜플을 리턴한다. 또한 이미 함수의 정의에서 리턴될 튜플의 각 멤버들의 이름의 정의되었기 때문에 리턴할 때 이름을 적을 필요가 없다.

**Optional Tuple Return Types**

리턴할 튜플 타입이 값이 없을 수 있다면(튜플이 nil이 될수 있다는 것을 반영하기 위해) 옵셔널 튜플을 사용 할 수 있다. 옵셔널 튜플 타입은 튜플의 뒤에 ?를 붙여서 작성한다.

> Note  
> (Int, Int)와 같은 옵셔널 튜플과 옵셔널 값을 포함한 튜플 (Int?, Int?)은 다르다. 옵셔널 튜플 타입을 사용하면 튜플 내부의 각 멤버가 아닌 튜플 전체가 옵셔널이다.

위의 함수 `minMax(array:)`는 파라미터 `array`로 빈 배열이 들어오면, `array[0]`에 접근할 때 런타임 에러가 발생한다. 이러한 문제들을 안전하게 처리하기 위해 옵셔널 튜플을 리턴 타입으로 써서 빈 배열이 들어왔을 때 `nil`을 리턴해보자


```swift
func minMax(array: [Int]) -> (min: Int, max: Int)? {
    if array.isEmpty { return nil }
    var currentMin = array[0]
    var currentMax = array[0]
    for value in array[1..<array.count] {
        if value < currentMin {
            currentMin = value
        } else if value > currentMax {
            currentMax = value
        }
    }
    return (currentMin, currentMax)
}
```
 

위 함수의 경우, 옵셔널 바인딩을 이용해 실제 값을 리턴하는지 혹은 `nil`을 리턴하는지 확인 할 수 있다.


```swift
if let bounds = minMax(array: [8, -6, 2, 109, 3, 71]) {
    print("min is \(bounds.min) and max is \(bounds.max)")
}
// Prints "min is -6 and max is 109
```
 

#### Functions With an Implicit Return

함수 코드가 단 하나의 줄로 되어있으면, 암시적으로 그 한 줄이 리턴 값이 된다.


```swift
func greeting(for person: String) -> String {
    "Hello, " + person + "!"
}
print(greeting(for: "Dave"))
// Prints "Hello, Dave!"

func anotherGreeting(for person: String) -> String {
    return "Hello, " + person + "!"
}
print(anotherGreeting(for: "Dave"))
// Prints "Hello, Dave!
```
 

`greeting(for:)`와 `anotherGreeting(for:)`는 동일한 메시지를 리턴하지만 함수를 하나의 줄로만 작성할 수 있는 경우에는 `return` 키워드를 생략 할 수 있다.

> 이 글은 Apple의 [『The Swift Programming Language』](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
