---
title: "The Swift Programming Language. Extensions (2)"
date: 2023-06-29

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Extensions

weight: 37

draft: false
original: "https://junmusu.tistory.com/110"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Methods

익스텐션은 이미 존재하는 타입에 새 인스턴스 메소드와 타입 메소드를 추가할 수 있다. 다음의 예시는 새 인스턴스 메소드 repetitions을 Int 타입에 추가한다.


```swift
extension Int {
    func repetitions(task: () -> Void) {
        for _ in 0..<self {
            task()
        }
    }
}
```
 

repetitions(task:) 메소드는 하나의 () -> Void 타입 아규먼트를 받는다.

이 익스텐션을 정의한 후에는 repetitions(task:)메소드를 어떠한 정수에서도 호출할 수 있다.


```swift
3.repetitions {
    print("Hello!")
}
// Hello!
// Hello!
// Hello!
```
 

#### Mutating Instance Methods

익스텐션에서 추가된 인스턴스 메소드는 인스턴스 자체를 수정(mutate)할 수도 있다. self나 self의 프로퍼티를 수정하는 스트럭처나 열거형은 메소드도 기존 구현의 뮤테이팅 메소드처럼 반드시 mutating으로 지정되어야 한다.

아래의 예시는 원본 값을 제곱하는 새로운 뮤테이팅 메소드 square를 스위프트의 Int 타입에 추가한다.


```swift
extension Int {
    mutating func square() {
        self = self * self
    }
}
var someInt = 3
someInt.square()
// someInt is now 9
```
 

### Subscripts

익스텐션은 이미 존재하는 타입에 새로운 서브스크립트를 추가할 수 있다. 다음의 예시는 스위프트의 빌트인 Int 타입에 정수 서브스크립트를 추가한다. 이 서브스크립트 [n]은 오른쪽에서 n번째 자리의 숫자를 리턴한다.

  - 123456789[0]은 9를 리턴한다.
  - 123456789[1]은 8을 리턴한다.


```swift
extension Int {
    subscript(digitIndex: Int) -> Int {
        var decimalBase = 1
        for _ in 0..<digitIndex {
            decimalBase *= 10
        }
        return (self / decimalBase) % 10
    }
}
746381295[0]
// returns 5
746381295[1]
// returns 9
746381295[2]
// returns 2
746381295[8]
// returns 7
```
 

Int 값이 요청된 인덱스에 충분한 수가 없을 경우, 이 서브스크립트는 마치 왼쪽에 0이 패딩되어 있는 것 처럼 0을 리턴하도록 구현되어 있다:


```swift
746381295[9]
// returns 0, as if you had requested:
0746381295[9]
```
 

### Nested Types

익스텐션은 이미 존재하는 클래스, 스트럭처, 열거형에 새로운 중첩 타입을 추가할 수 있다.


```swift
extension Int {
    enum Kind {
        case negative, zero, positive
    }
    var kind: Kind {
        switch self {
        case 0:
            return .zero
        case let x where x > 0:
            return .positive
        default:
            return .negative
        }
    }
}
```
 

이 예시는 Int 타입에 새로운 중첩 열거형 Kind를 추가한다. 이 열거형은 해당 정수가 음수인지 양수인지 혹은 0인지를 나타낸다.

또한 이 예시는 해당 정수에 알맞은 Kind 열거형 케이스를 리턴하는 새로운 컴퓨티드 인스턴스 프로퍼티 kind를 Int에 추가한다.

이 중첩된 열거형은 이제 어떠한 Int 값에서도 사용할 수 있다.


```swift
func printIntegerKinds(_ numbers: [Int]) {
    for number in numbers {
        switch number.kind {
        case .negative:
            print("- ", terminator: "")
        case .zero:
            print("0 ", terminator: "")
        case .positive:
            print("+ ", terminator: "")
        }
    }
    print("")
}
printIntegerKinds([3, 19, -27, 0, -6, 0, 7])
// Prints "+ + - 0 - 0 + "
```
 

이 함수 printIntegerKinds(_:)는 Int 값 배열을 받고, 그 배열을 순회하며 각 원소의 kind 컴퓨티드 프로퍼티의 값을 보고, 적합한 설명을 출력한다.

> **Note**  
>  number.kind는 Int.kind로 이미 추론이 되어있기 때문에, 스위치 구문 속의 모든 Int.Kind 케이스 값들은 Int.Kind.negative가 아닌 .negative처럼 축약된 형태로 작성되어 있다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
