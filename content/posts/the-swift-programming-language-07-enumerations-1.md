---
title: "The Swift Programming Language. Enumerations (1)"
date: 2023-05-30

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Enumerations

weight: 7

draft: false
original: "https://junmusu.tistory.com/77"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Enumerations

열거형은 연관된 값들을 공통된 타입으로 묶은 그룹이며, 타입 안전(type-safe)하게 사용하게 해준다.

스위프트의 열거형은 유연하다. 각 케이스에 값을 할당하지 않아도 되며, 스트링, 캐릭터, 정수, 실수등을 각 열거형 케이스에 제공할 수 있다.

스위프트에서 열거형은 그 자체로 일급 객체다. 컴퓨티드 프로퍼티(computed properties)나 인스턴스 메소드(instance method)와 같은, 기존에는 클래스에서만 사용할 수 있었던 많은 기능들을 가져왔고, 초기 케이스 값을 설정하는 이니셜라이저도 정의할 수 있으며, 프로토콜을 상속 받을 수도 있다.

### Enumeration Syntax

열거형을 작성할 때는 enum 키워드를 사용하여 한 쌍의 중괄호 안에 작성한다.


```swift
enum SomeEnumeration {
    // enumeration definition goes here
}
```
 

다음 예시는 나침반의 동서남북 방향을 열거형으로 표현한 것이다.


```swift
enum CompassPoint {
    case north
    case south
    case east
    case west
}
```
 

north, south, east, west와 같이 열거형 안에 정의된 값들은 열거형 케이스이다. case 키워드를 이용하여 새로운 열거형 케이스를 작성할 수 있다.

한 줄에 다수의 케이스를 컴마(, )로 구분지어 작성할 수도 있다.


```swift
enum Planet {
    case mercury, venus, earth, mars, jupiter, saturn, uranus, neptune
}
```
 

새로운 열거형의 정의는 새로운 타입을 정의하는 것과 같다. 스위프트의 다른 타입들처럼 열거형의 이름은 첫 문자를 대문자로 쓴다. 또한 이름을 단수형으로 쓰면 이 열거형이 자명하다는 것을 보일 수 있다.


```swift
var directionToHead = CompassPoint.west
```
 

directionToHead의 타입은 directionToHead가 CompassPoint의 값중 하나로 초기화 되었으므로 추론이 가능하다. directionToHead가 한번 CompassPoint로 선언되었으니, 닷(.)을 이용하여 다른 CompassPoint의 값으로 설정 가능하다.


```swift
directionToHead = .east
```
 

이미 directionToHead의 타입을 알고 있으니 앞에 타입(CompassPoint)를 적어주지 않아도 된다.

### Matching Enumeration Values with a Switch Statement

열거형의 값들을 switch 구문과 매치시킬 수 있다.


```swift
directionToHead = .south
switch directionToHead {
case .north:
    print("Lots of planets have a north")
case .south:
    print("Watch out for penguins")
case .east:
    print("Where the sun rises")
case .west:
    print("Where the skies are blue")
}
// Prints "Watch out for penguins"
```
 

switch 구문은 반드시 exhaustive 해야 하므로, 모든 열거형 케이스를 하나라도 생략하면 컴파일할 수 없다. 하지만 모든 열거형 케이스를 명시적으로 다루기 힘들 때는 default 케이스를 사용하여 명시적으로 다루지 않은 나머지 케이스를 처리할 수 있다.


```swift
let somePlanet = Planet.earth
switch somePlanet {
case .earth:
    print("Mostly harmless")
default:
    print("Not a safe place for humans")
}
// Prints "Mostly harmless"
```
 

### Iterating over Enumeration Cases

모든 열거형 케이스들을 담은 컬렉션이 필요한 경우가 있다. 이 때 열거형의 이름 옆에 : CaseIterable를 붙여주면 allCases 프로퍼티를 이용해 그러한 컬렉션을 사용할 수 있다.


```swift
enum Beverage: CaseIterable {
    case coffee, tea, juice
}
let numberOfChoices = Beverage.allCases.count
print("\(numberOfChoices) beverages available")
// Prints "3 beverages available"
```
 

위 예시에선 Beverage.allCases를 사용해 Beverage 열거형의 모든 케이스를 가지고 있는 컬렉션에 접근 하고 있다. allCases는 원소가 enumeration 타입인 컬렉션처럼 사용된다(따라서 이 경우엔 컬렉션의 원소가 Beverage 값이다).

위의 예시는 얼마나 많은 케이스를 가졌는지 알아내는 코드이고, 아래의 예시에선 for in 루프를 사용해 모든 케이스를 반복(iterate)한다.


```swift
for beverage in Beverage.allCases {
    print(beverage)
}
// coffee
// tea
// juice
```
 

### Associated Values

케이스들에 다른 타입의 값들을 저장하는 것은 유용하게 사용할 수 있다. 이런 추가 정보를 연관 값(associated value)라고 한다. 연관 값의 타입은 열거형의 각 케이스마다 다르게 만들 수도 있다.

UPC 포맷을 사용하는 1차원 바코드와 문자열을 사용하는 QR코드의 예시이다.


```swift
enum Barcode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}
var productBarcode = Barcode.upc(8, 85909, 51226, 3)
productBarcode = .qrCode("ABCDEFGHIJKLMNOP")
```
 

이 정의는 어떤 Int나 String값을 제공하지 않고 단지 Barcode.upc나 Barcode.qrCode의 연관 값의 타입만 정의한다.

연관 값의 타입을 이용해서 새로운 바코드를 만들 수 있다.


```swift
var productBarcode = Barcode.upc(8, 85909, 51226, 3)
productBarcode = .qrCode("ABCDEFGHIJKLMNOP")
```
 

위 예시에서 Barcode.upc와 그 정수 값들은 새로운 Barcode.qrCode에 의해 문자열로 대체되었다. Barcode 타입의 상수나 변수는 .upc나 .qrCode를 연관 값과 함께 저장할 수 있지만. 한번에 그 둘 중 하나만 저장 가능하다.

switch 구문으로 연관 값을 추출 할 수 있다. switch 구문 케이스들의 본문에서 각각의 연관값을 let 키워드를 사용해서 상수로 추출하거나 var 키워드를 이용하여 변수로 추출할 수 있다.


```swift
switch productBarcode {
case .upc(let numberSystem, let manufacturer, let product, let check):
    print("UPC: \(numberSystem), \(manufacturer), \(product), \(check).")
case .qrCode(let productCode):
    print("QR code: \(productCode).")
}
// Prints "QR code: ABCDEFGHIJKLMNOP."
```
 

모든 연관값을 상수로만 추출하거나 변수로만 추출하는 경우에는 var나 let을 case 이름 뒤에 한번만 써줘도 된다.


```swift
switch productBarcode {
case let .upc(numberSystem, manufacturer, product, check):
    print("UPC : \(numberSystem), \(manufacturer), \(product), \(check).")
case let .qrCode(productCode):
    print("QR code: \(productCode).")
}
// Prints "QR code: ABCDEFGHIJKLMNOP."
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
