---
title: "The Swift Programming Language. Opaque Types (1)"
date: 2023-08-12

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Opaque and Boxed Protocol Types

weight: 48

draft: false
original: "https://junmusu.tistory.com/129"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Opaque and Boxed Types

스위프트는 값의 타입에 대한 상세한 정보를 숨기는 두가지 방법을 제공한다: 불투명한 타입과 박스형 프로토콜 타입이다. 타입의 정보를 숨기는 것은 모듈과 모듈을 호출하는 코드의 경계에서 유용하다, 리턴 값의 타입이 공개되지 않은 채로 유지될 수 있기 때문이다.

함수나 메소드는 리턴 값의 타입 정보를 숨기기 위해 불투명한 타입을 리턴하다. 함수의 리턴 타입을 구체적으로 제공하는 대신에, 리턴 값은 값이 지원하는 프로토콜로 묘사된다. 불투명한 타입은 타입의 정체를 보존한다 — 컴파일러는 타입 정보에 대해 접근이 가능하지만, 모듈의 클라이언트들은 불가능하다.

박스형 프로토콜 타입은 주어진 프로토콜을 준수하는 어떠한 타입의 인스턴스라도 저장할 수 있다. 박스형 프로토콜 타입은 타입의 정체를 보존하지 않는다. — 값의 정확한 타입은 런타임에 알 수 없고, 시간이 지나 다른 값이 저장되면 변경될 수 있다.

### The Problem That Opaque Types Solve

아스키 아트 도형을 그리는 모듈을 작성한다고 가정해보자. 아스키 아트 도형의 기본적인 특성은 해당 도형을 문자열로 표현한 것을 리턴하는 `draw()` 함수이고, 이는 `Shape` 프로토콜의 요구사항으로 이용할 수 있다:


```swift
protocol Shape {
    func draw() -> String
}

struct Triangle: Shape {
    var size: Int
    func draw() -> String {
       var result: [String] = []
       for length in 1...size {
           result.append(String(repeating: "*", count: length))
       }
       return result.joined(separator: "\n")
    }
}
let smallTriangle = Triangle(size: 3)
print(smallTriangle.draw())
// *
// **
// ***
```
 

아래의 코드처럼, 세로로 뒤집기와 같은 연산자는 제네릭을 이용하여 구현할 수 있지만, 이러한 접근 방식은 한계가 있다: 결과를 생성하는데 사용된 정확한 제네릭 타입이 노출된다.


```swift
struct FlippedShape<T: Shape>: Shape {
    var shape: T
    func draw() -> String {
        let lines = shape.draw().split(separator: "\n")
        return lines.reversed().joined(separator: "\n")
    }
}
let flippedTriangle = FlippedShape(shape: smallTriangle)
print(flippedTriangle.draw())
// ***
// **
// *
```
 

아래의 코드처럼 두 도형을 수직으로 연결하는 구조체 `JoinedShape<T: Shape, U: Shape>`를 정의하는 접근 방식은 뒤집힌 삼각형을 다른 삼각형과 결합하여 `JoinedShape<FlippedShape<Triangle>, Triangle>`과 같은 타입을 리턴한다.


```swift
struct JoinedShape<T: Shape, U: Shape>: Shape {
    var top: T
    var bottom: U
    func draw() -> String {
       return top.draw() + "\n" + bottom.draw()
    }
}
let joinedTriangles = JoinedShape(top: smallTriangle, bottom: flippedTriangle)
print(joinedTriangles.draw())
// *
// **
// ***
// ***
// **
// *
```
 

도형 생성에 대한 자세한 정보를 노출하는 것은 리턴 타입을 완전히 명시해야 하기 때문에, 아스키 아트 모듈의 공용 인터페이스의 일부가 아닌 타입이 누출될 수 있다. 모듈 내부의 코드는 다양한 방식으로 똑같은 도형을 만들 수 있으며, 그 도형을 사용하는 모듈 외부의 코드는 변환 리스트의 세부 구현을 고려할 필요가 없다. `JoinedShape`나 `FlippedShape`와 같은 래퍼 타입들은 모듈의 사용자에게 중요하지 않고, 겉으로 보여지지도 않는다. 모듈의 공용 인터페이스는 도형의 결합 혹은 뒤집기와 같은 연산으로 구성되며, 이러한 연산들은 `Shape` 값을 리턴한다.

### Returning an Opaque Type

불투명한 타입이 제네릭 타입의 반대라고 생각할 수 있다. 제네릭 타입은 함수를 호출하는 코드가 함수의 파라미터의 타입을 선택하게 해주고, 함수의 구현에서 떨어진 추상적인 방법으로 값을 리턴한다. 예를 들어 다음의 코드에 있는 함수의 리턴값은 호출자가 결정한다:


```swift
func max<T>(_ x: T, _ y: T) -> T where T: Comparable { ... }
```
 

`max(_:_:)`를 호출하는 코드는 `x`와 `y`의 값을 선택하고, 이 값들의 타입에 따라 T의 구체적인 타입이 결정된다. 함수를 호출하는 코드는 Comparable 프로토콜을 사용하는 어떠한 타입이라도 사용할 수 있다. 함수 내부의 코드는 제너럴한 방법으로 작성되어 있고, 따라서 호출자가 제공하는 어떠한 타입이라도 처리할 수 있다. `max(_:_:)`의 구현은 `Comparable` 타입들이 공유하는 기능만을 사용한다.

이러한 역할은 불투명한 리턴 타입을 가진 함수에서 역전된다. 불투명한 타입은 함수의 구현이 함수를 호출하는 코드에서 떨어진 추상적인 방법으로 리턴할 값의 타입을 선택할 수 있게 해준다. 예를 들어, 다음 예시의 함수는 해당 도형의 실제 타입을 노출하지 않고도 사다리꼴을 리턴한다.


```swift
struct Square: Shape {
    var size: Int
    func draw() -> String {
        let line = String(repeating: "*", count: size)
        let result = Array<String>(repeating: line, count: size)
        return result.joined(separator: "\n")
    }
}

func makeTrapezoid() -> some Shape {
    let top = Triangle(size: 2)
    let middle = Square(size: 2)
    let bottom = FlippedShape(shape: top)
    let trapezoid = JoinedShape(
        top: top,
        bottom: JoinedShape(top: middle, bottom: bottom)
    )
    return trapezoid
}
let trapezoid = makeTrapezoid()
print(trapezoid.draw())
// *
// **
// **
// **
// **
// *
```
 

이 예시의 `makeTrapezoid()` 함수는 리턴 타입으로 `someShape`를 선언한다, 이 함수는 어떤 특정한 타입을 지정하지 않고, `Shape` 프로토콜을 준수하는 타입의 값을 리턴한다. 이러한 방식으로 `makeTrapezoid()`를 작성하면 공용 인터페이스의 일부로 만들어진 도형을 타입으로 지정하지 않고 리턴 값이 도형인 공용 인터페이스의 기본적인 측면을 표현할 수 있다. 이 구현은 두 개의 삼각형과 한 개의 사각형을 사용하지만, 리턴 타입을 변경하지 않고도 다른 여러 방법으로 다시 작성할 수도 있다.

이 예시는 불투명한 리턴 타입이 제네릭 타입의 반대라는 것을 주로 보여준다. `makeTrapezoid()` 내부의 코드는 제네릭 함수를 호출하는 코드가 하는 것 처럼 `Shape` 프로토콜을 준수하는 어떤 타입이라도 필요하면 리턴할 수 있다. 이 함수를 호출하는 함수는 제네릭 함수를 구현하는 것과 같이 제네럴한 방법으로 작성해야 한다, 이렇게 해야 `makeTrapezoid()`가 리턴하는 모든 `Shape` 값으로 작업할 수 있기 때문이다.

불투명한 리턴 타입을 제네릭과 함께 사용할 수도 있다. 다음의 코드에 있는 함수들은 `Shape` 프로토콜을 준수하는 어떠한 타입의 값을 리턴한다.


```swift
func flip<T: Shape>(_ shape: T) -> some Shape {
    return FlippedShape(shape: shape)
}
func join<T: Shape, U: Shape>(_ top: T, _ bottom: U) -> some Shape {
    JoinedShape(top: top, bottom: bottom)
}

let opaqueJoinedTriangles = join(smallTriangle, flip(smallTriangle))
print(opaqueJoinedTriangles.draw())
// *
// **
// ***
// ***
// **
// *
```
 

이 예시에서 `opaqueJoinedTriangles`의 값은 앞의 **The Problem That Opaque Types Solve** 섹션에 나오는 제네릭 예제의 `joinedTriangles`와 동일하다. 하지만 다른점은 `flip(_:)`과 `join(_:)`은 제네릭 도형 연산의 리턴 값의 실제 타입을 불투명한 리턴 타입으로 래핑하여 해당 타입들이 노출되는것을 방지한다. 이 두 함수들은 의존하는 타입이 제네릭이고, 타입 파라미터들이 `FlippedShape`와 `JoinedShape`가 필요한 타입 정보를 전달하기 때문에 제네릭 함수이다.

불투명한 리턴 타입을 가진 함수가 여러 곳에서 리턴 할 때(주: 함수 내부에 return 키워드가 여러개 있을 때), 모든 가능한 리턴 값은 반드시 똑같은 타입을 가져야 한다. 제네릭 함수에서는 리턴 타입으로 함수의 타입 파라미터를 사용할 수 있지만, 이 또한 단일 타입이어야 한다. 예를 들면, 다음은 사각형의 특별 케이스를 포함하는 _유효하지 않은_ 버전의 도형 뒤집기 함수이다:


```swift
func invalidFlip<T: Shape>(_ shape: T) -> some Shape {
    if shape is Square {
        return shape // Error: return types don't match
    }
    return FlippedShape(shape: shape) // Error: return types don't match
}
```
 

이 함수를 `Square`를 사용하여 호출한다면, `Square`를 리턴하고; 그렇지 않다면 `FlippedShape`를 리턴한다. 이는 리턴 값은 단일한 타입이어야 하는 것을 위반하는 것이고, `invalidFlip(_:)`을 유효하지 않은 코드로 만들어버린다. `invalidFlip(_:)`을 고치는 한가지 방법은 사각형의 특별 케이스를 `FlippedShape`의 구현으로 옮기는 것이다. 이러면 이 함수는 항상 `FlippedShape` 값을 리턴하게 된다:


```swift
struct FlippedShape<T: Shape>: Shape {
    var shape: T
    func draw() -> String {
        if shape is Square {
           return shape.draw()
        }
        let lines = shape.draw().split(separator: "\n")
        return lines.reversed().joined(separator: "\n")
    }
}
```
 

항상 단일 타입을 리턴해야 하는 요구사항이 불투명한 리턴 타입을 제네릭에서 사용하는 것을 막지는 않는다. 다음은 타입 파라미터를 리턴 값의 실제 타입에 통합한 함수의 예시이다.


```swift
func `repeat`<T: Shape>(shape: T, count: Int) -> some Collection {
    return Array<T>(repeating: shape, count: count)
}
```
 

이 경우에, 리턴 값의 실제 타입은 `T`에 따라 달라진다. 어떠한 도형이 전달되어도 `repeat(shape:count:)`는 해당 도형의 배열을 생성하고 리턴한다. 리턴 값은 항상 `[T]`라는 실제 타입이므로, 불투명한 리턴 타입이 있는 함수는 단일 타입만 리턴해야 한다는 요구사항을 만족한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
