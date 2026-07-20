---
title: "The Swift Programming Language. Opaque Types (2)"
date: 2023-08-13

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Opaque and Boxed Protocol Types

weight: 49

draft: false
original: "https://junmusu.tistory.com/130"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Boxed Protocol Types

박스드 프로토콜 타입은 “there exists a type T such that T conforms to the protocol” 라는 구절에서 따와 실존적 타입 _(existential type)_ 이라고도 한다. 박스드 프로토콜 타입을 만들기 위해, 프로토콜 이름 앞에 `any`를 작성한다. 다음은 예시이다:


```swift
struct VerticalShapes: Shape {
    var shapes: [any Shape]
    func draw() -> String {
        return shapes.map { $0.draw() }.joined(separator: "\n\n")
    }
}

let largeTriangle = Triangle(size: 5)
let largeSquare = Square(size: 5)
let vertical = VerticalShapes(shapes: [largeTriangle, largeSquare])
print(vertical.draw())
```
 

위의 예시에서, `VerticalShapes`는 도형들의 타입을 박스드 `Shape` 원소들의 배열인 `[any Shape]`로 선언한다. 배열의 각 원소들은 서로 다른 타입일 수 있지만, 반드시 `Shape` 프로토콜을 준수해야 한다. 런타임에 유연성을 지원하기 위해, 스위프트는 필요할 때 박스(box)라는 간접적인 단계를 추가한다. 박스는 성능 코스트가 있다.

`VerticalShapes` 타입 내부의 코드는 `Shape` 프로토콜이 요구하는 메소드, 프로퍼티, 서브스크립트를 사용할 수 있다. 예를 들어 `VerticalShapes`의 `draw()` 메소드는 배열 속 각 원소의 `draw()` 메소드를 호출한다. 이 메소드는 `Shape`가 `draw()` 메소드를 요구하기 때문에 사용가능하다. 대조적으로, 삼각형의 `size` 프로퍼티와 같은 `Shape`가 요구하지 않는 다른 프로퍼티들이나 메소드들에 접근하려고 시도하면 에러가 발생한다.

`Shapes`로 사용하는 세 가지 타입을 대조해본다.

  - **struct VertiaclShapes <S: Shape>와 var shapes: [s]**로 작성하여 제네릭을 이용하는 방법은 원소가 특정 도형 타입인 배열을 만든다. 해당 특정 도형 타입의 정체는 배열과 이 배열과 상호작용하는 모든 코드가 볼 수 있다.
  - **var shapes: [some Shape]** 로 작성하여 불투명한 타입을 이용하는 방법은 배열이 해당 특정 도형 타입이고, 그 특정 타입의 정체가 숨겨진 배열을 생성한다.
  - **var shapes: [any Shape]** 로 작성하여 박스드 프로토콜 타입을 이용하는 방법은 서로 다른 타입의 원소를 저장할 수 있는 배열을 생성하고, 각 타입들의 정체를 숨긴다.



이 경우에, 박스드 프로토콜 타입이 `VerticalShapes`의 호출자가 다른 종류의 도형들을 섞을 수 있는 유일한 접근 방식이다.

`as` 캐스트를 통해 박스드 값의 실제 타입을 알아낼 수 있다. 예시는 다음과 같다:


```swift
if let downcastTriangle = vertical.shapes[0] as? Triangle {
    print(downcastTriangle.size)
}
// Prints "5"
```
 

### Differences Between Opaque Types and Boxed Protocol Types

함수에서 불투명 타입을 리턴하는 것은 박스드 프로토콜 타입을 리턴하는 것과 매우 비슷하게 보인다, 그러나 이 두 종류의 리턴 타입은 타입의 정체를 보존하는지가 다르다. 불투명한 타입은 하나의 지정된 타입을 참조하지만, 함수의 호출자는 이 타입을 볼 수 없다; 박스드 프로토콜 타입은 특정 프로토콜을 준수하는 어떤 타입이라도 참조할 수 있다. 일반적으로, 박스드 프로토콜 타입은 저장할 값들의 실제 타입에 대하여 더 많은 유연성을 제공하고, 불투명한 타입은 실제 타입에 대해 더 강한 보장을 하게 해준다.

예를 들어, 다음은 불투명한 리턴 타입 대신에 박스드 프로토콜 타입을 리턴하는 버전 `flip(_:)` 이다:


```swift
func protoFlip<T: Shape>(_ shape: T) -> Shape {
    return FlippedShape(shape: shape)
}
```
 

이 버전의 `protoFlip(_:)`은 항상 똑같은 타입의 값을 리턴하는 `flip(_:)`과 똑같은 본문을 가지고 있다. `flip(_:)`과는 다르게, `protoFlip(_:)`은 리턴 값이 항상 똑같을 필요는 없고, 단지 `Shape` 프로토콜을 준수하기만 하면 된다. 다른 말로, `protoFlip(_:)`은 `flip(_:)`이 하는 것 보다 훨씬 느슨한 API 계약(contract)를 한다. 이는 다양한 타입의 값을 리턴할 수 있는 유연성을 가지게 한다.


```swift
func protoFlip<T: Shape>(_ shape: T) -> Shape {
    if shape is Square {
        return shape
    }

    return FlippedShape(shape: shape)
}
```
 

개정된 버전의 코드는 어떤 도형이 들어왔는지에 따라 `Square`나 `FlippedShape`의 인스턴스를 리턴한다. 이 함수를 통해 완전히 다른 타입인 이 두 도형은 리턴된다. 이 함수의 다른 유효한 버전은 뒤집었을 때 동일한 도형인 여러 다른 타입의 인스턴스들을 리턴할 수 있다. `protoFlip(_:)`이 더 적은 리턴 타입 정보를 제공하는 것은 타입의 정보에 의존하는 많은 연산들이 리턴 값에서 사용하지 못한다는 것을 의미한다. 예를 들어, 이 함수의 리턴된 결과를 비교하기 위해서 == 연산자를 사용하는 것은 불가능하다.


```swift
let protoFlippedTriangle = protoFlip(smallTriangle)
let sameThing = protoFlip(smallTriangle)
protoFlippedTriangle == sameThing  // Error
```
 

이 예시의 마지막 줄에서 발생하는 에러는 다양한 이유로 인해 발생한다. 가장 즉각적인 문제는 `Shape`는 프로토콜의 요구사항에 `==` 연산자를 포함하지 않고 있다는 것이다. 이를 추가하여도 다음 문제는 `==` 연산자의 좌우측 아규먼트의 타입을 알아야 한다는 것이다. 이러한 종류의 아규먼트는 보통 `Self` 타입의 아규먼트를 받지만, 프로토콜에 `Self` 요구사항을 추가하면 프로토콜을 타입으로 사용할 때 발생하는 타입 삭제가 허용되지 않는다.

박스드 프로토콜을 타입을 리턴 타입으로 사용하여 해당 프로토콜을 준수하는 모든 유형을 리턴 값으로 사용할 수 있게 되는 유연성을 부여할 수 있다. 하지만 이러한 유연성의 코스트는 리턴된 값들이 몇몇의 연산이 불가능하게 된다. 이 예시는 박스드 프로토콜 타입이 보존하지 않는 특정한 타입 정보를 사용해야 하는 `==` 연산자가 사용 불가능한 것을 보여준다.

이러한 접근 방식의 다른 문제는 도형 변환이 중첩되지 않는다는 것이다. 삼각형을 뒤집은 결과는 `Shape` 타입의 값이고, `protoFlip(_:)` 함수는 `Shape` 프로토콜을 준수하는 일부 타입을 아규먼트로 받는다. 그러나 박스드 프로토콜의 값은 해당 프로토콜을 준수하지 않는다; `protoFlip(_:)`이 리턴한 값은 `shape`를 준수하지 않는다. 이는 뒤집힌 도형이 `protoFlip(_:)`의 유효한 아규먼트가 아니기 때문에`protoFlip(protoFlip(smallTriangle))`와 같이 다중 변환을 적용하는 코드도 유효하지 않음을 의미한다.

대조적으로, 불투명한 타입은 실제 타입의 정체를 보존한다. 스위프트는 연관 타입을 추론할 수 있으므로 박스드 프로토콜 타입이 리턴 값으로 사용될 수 없는 부분에 불투명한 리턴 값을 사용할 수 있게 한다. 다음은 **Generics** 에서 나온 `Container` 프로토콜의 한 버전이다:


```swift
protocol Container {
    associatedtype Item
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
extension Array: Container { }
```
 

`Container` 프로토콜은 연관 타입을 가지고 있기 때문에, 함수의 리턴 타입으로 사용할 수 없다. 함수의 본문 외부에서 제네릭 타입에 필요한 것이 무엇인지에 대한 충분한 정보가 없으므로 제네릭 리턴 타입에 대한 제약조건으로도 사용할 수 없다.


```swift
// Error: Protocol with associated types can't be used as a return type.
func makeProtocolContainer<T>(item: T) -> Container {
    return [item]
}

// Error: Not enough information to infer C.
func makeProtocolContainer<T, C: Container>(item: T) -> C {
    return [item]
}
```
 

불투명한 타입 `some Container`를 리턴 타입으로 사용하여 알맞은 API 계약(Contract)을 표현한다. — 이 함수는 컨테이너를 리턴하지만, 컨테이너의 타입을 지정하지 않는다.


```swift
func makeOpaqueContainer<T>(item: T) -> some Container {
    return [item]
}
let opaqueContainer = makeOpaqueContainer(item: 12)
let twelve = opaqueContainer[0]
print(type(of: twelve))
// Prints "Int"
```
 

`twelve`의 타입은 `Int`로 추론되고, 타입 추론이 불투명 타입과 함께 동작한다는 사실을 보여준다. `makeOpaqueContainer(item:)`의 구현에서 불투명 컨테이너의 실제 타입은 `[T]`이다. 이 케이스에서, `T`는 `Int`이므로 리턴 값을 정수의 배열이 되고 연관 타입 `Item`은 `Int`로 추론된다. `Container`의 서브스크립트는 `Item`을 리턴한다. 이는 `twelve` 또한 `Int`로 추론됨을 의미한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
