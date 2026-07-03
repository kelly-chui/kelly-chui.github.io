---
title: "The Swift Programming Language. Enumerations (2)"
date: 2023-05-31

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Enumerations

weight: 8

draft: false
original: "https://junmusu.tistory.com/78"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Raw Values

Associated Values 섹션에서는 열거형의 케이스가 다른 타입의 연관값을 저장하는 방법을 보여줬다. 연관 값 대신, 열거형 케이스들은 같은 타입의 디폴트 값-원시 값(raw values)-을 미리 가지고 있을 수도 있다.  
  
다음은 ASCII값을 원시값으로 사용하는 예시이다.


```swift
enum ASCIIControlCharacter: Character {
    case tab = "\t"
    case lineFeed = "\n"
    case carriageReturn = "\r"
}
```
 

열거형 ASCIIControlCharacter의 원시 값은 Character 타입으로 정의되어 있고, ASCII 제어 문자로 설정되어 있다.  
  
원시 값은 어떠한 자료형이든 될 수 있으며, 각 원시 값은 열거형을 선언할 때 고유해야 한다.

> **Note**  
>  원시 값과 연관 값은 다르다. 원시 값은 코드를 작성할 때 미리 채워 넣어야 하는 값이고, 특정 케이스의 원시값은 항상 동일하다. 하지만 연관 값은 열거형의 케이스로 새로운 상수나 변수를 만들 때 설정되고, 때마다 달라질 수 있다.

### Implicitly Assigned Raw Values

정수나 문자열 타입의 원시 값을 가지고 있는 열거형에선 스위프트가 자동적으로 원시 값을 할당해준다.  
  
정수가 원시 값으로 사용될 때, 각 케이스의 원시 값은 암시적으로 전 케이스의 원시 값보다 1높게 설정되고, 첫 번째 케이스가 값을 가지고 있지 않다면 첫 케이스의 원시값은 0으로 설정된다.


```swift
enum Planet: Int {
    case mercury = 1, venus, earth, mars, jupiter, saturn, uranus, neptune
}
```
 

위 예시에서 Planet.mercury는 명시적으로 원시값 1을 가지고, Planet.venus는 암시적으로 2를 가진다. 그리고 뒤의 케이스들도 자동적으로 앞선 케이스보다 1씩 늘어난 원시 값을 암시적으로 가지게 된다.  
  
문자열이 원시값으로 사용되었을 때는 각 케이스의 암시적인 원시 값은 그 케이스의 이름이 된다.


```swift
enum CompassPoint: String {
    case north, south, east, west
}
```
 

CompassPoint.south는 암시적으로 원시값 "south"를 가지게 되고 나머지 케이스들도 자신의 이름을 원시값으로 가진다.  
  
rawValue 프로퍼티를 통하여 열거형 케이스의 원시 값에 접근 할 수 있다.


```swift
let earthsOrder = Planet.earth.rawValue
// earthsOrder is 3

let sunsetDirection = CompassPoint.west.rawValue
// sunsetDirection is "west"
```
 

### Initializing from a Raw Value

원시 값이 있는 열거형을 정의했다면, 열거형은 (파라미터 이름이 rawValue인)원시 값의 타입을 받고, 열거형 케이스나 nil을 리턴하는 이니셜라이저를 자동적으로 가지게 된다.


```swift
let possiblePlanet = Planet(rawValue: 7)
// possiblePlanet is of type Planet? and equals Planet.uranus
```
 

타입이 같다 해도 모든 값이 열거형 케이스의 원시 값에 매치되는 것이 아니므로, 원시 값을 사용하는 이니셜라이저는 항상 옵셔널 열거형 케이스를 리턴한다. 따라서 위의 예시에서 possiblePlanet의 타입은 Planet? 이다.

> **Note**  
>  원시 값을 사용하는 이니셜라이저는 모든 원시 값이 열거형 케이스를 리턴하지는 않기 때문에(not every) 실패 가능한 이니셜라이저다. 

따라서 11번째에 있는 행성을 찾을 때는, nil이 리턴된다.


```swift
let positionToFind = 11
if let somePlanet = Planet(rawValue: positionToFind) {
    switch somePlanet {
    case .earth:
        print("Mostly harmless")
    default:
        print("Not a safe place for humans")
    }
} else {
    print("There isn't a planet at position \(positionToFind)")
}
// Prints "There isn't a planet at position 11"
```
 

### Recursive Enumerations

하나 이상의 열거형 케이스가 연관 값으로 열거형의 또다른 인스턴스를 가지고 있는 열거형을 재귀 열거형이라고 한다. 이 경우에 각 열거형 케이스 앞에 indirect를 써서 나타낼 수 있다.


```swift
enum ArithmeticExpression {
    case number(Int)
    indirect case addition(ArithmeticExpression, ArithmeticExpression)
    indirect case multiplication(ArithmeticExpression, ArithmeticExpression)
}
```
 

혹은 indirect를 enum앞에 작성하면 연관 값이 있는 열거형 케이스가 간접 참조(indirection)를 할 수 있게 된다.


```swift
indirect enum ArithmeticExpression {
    case number(Int)
    case addition(ArithmeticExpression, ArithmeticExpression)
    case multiplication(ArithmeticExpression, ArithmeticExpression)
}
```
 

이 열거형은 숫자, 합셈, 곱셈 세가지의 수학 표현식(arithmetic expression)을 저장할 수 있다. addition과 multiplication 케이스는 수학 표현식 연관 값을 가지는 수학 표현식이다. -이런 연관 값은 중첩된 표현식을 만든다. 예를 들어 (5 + 4) * 2 표현식은 곱셈의 오른쪽에는 숫자가 있고 왼쪽에는 또 다른 표현식이 있다. 데이터가 중첩되어 저장되므로, 열거형도 데이터를 중첩하여 저장할 수 있어야 한다. 결국 열거형이 재귀적이어야 한다.  
  
위 예시에 나온 열거형 ArithmeticExpression으로 (5 + 4) * 2를 만들고, evaluate 해보자.


```swift
let five = ArithmeticExpression.number(5)
let four = ArithmeticExpression.number(4)
let sum = ArithmeticExpression.addition(five, four)
let product = ArithmeticExpression.multiplication(sum, ArithmeticExpression.number(2))
func evaluate(_ expression: ArithmeticExpression) -> Int {
    switch expression {
    case let .number(value):
        return value
    case let .addition(left, right):
        return evaluate(left) + evaluate(right)
    case let .multiplication(left, right):
        return evaluate(left) * evaluate(right)
    }
}

print(evaluate(product))
// Prints "18"
```
 

재귀 함수를 이용하여 위 표현식을 evaluate할 수 있다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
