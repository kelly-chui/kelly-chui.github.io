---
title: "[Swift] Initialization(초기화) - 4"
date: 2023-06-17
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Initialization"]
weight: 23

draft: false
original: "https://junmusu.tistory.com/97"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Failable Initializers

이니셜라이제이션이 실패할 수 있는 클래스, 스트럭처, 열거형을 정의하는 것이 유용하게 쓰일 때가 있다. 유효하지 않은 파라미터 값, 필요한 외부 리소스의 부재, 이니셜라이제이션이 실패해야하는 조건 등으로 이러한 실패를 트리거할 수 있다.

실패할 수 있는 이니셜라이제이션 조건을 다루기 위해서는, 하나 이상의 실패 가능한(failable) 이니셜라이저를 클래스, 스트럭처, 열거형의 정의의 한 파트로 정의한다. 실패 가능한 이니셜라이저는 init 키워드 뒤에 ?를 붙여서 표시할 수 있다.(init?)

> **Note**  
>  동일한 타입과 이름을 가진 파라미터들로 실패 가능한 이니셜라이저와 실패 불가능한 이니셜라이저를 동시에 정의할 수 없다.

실패 가능한 이니셜라이저는 초기화가 되었을 때 옵셔널 값을 생성한다. 실패 가능한 이니셜라이저 내부에 return nil을 작성하여 이니셜라이제이션의 실패가 트리거 되는 지점을 표시할 수 있다.

> **Note**  
>  엄밀히 말하자면, 이니셜라이저는 값을 리턴하지 않고, self가 완전히 정확하게 초기화 되는 것을 보장하는 역할을 한다. 따라서 return nil을 이니셜라이제이션 실패의 트리거로 작성한다 해도, 이니셜라이제이션이 성공할 떄는 return 키워드를 작성할 필요가 없다.

예를 들면, 실패 가능한 이니셜라이저는 숫자 타입을 변환하기 위해 구현되어 있다. 변환하는 동안 숫자 타입들의 값을 정확하게 유지하는 것을 보장하기 위해 init(exactly:) 이니셜라이저를 사용한다. 만약 타입 변환이 값을 유지하지 못할 때, 이니셜라이저는 실패한다.


```swift
let wholeNumber: Double = 12345.0
let pi = 3.14159


if let valueMaintained = Int(exactly: wholeNumber) {
    print("\(wholeNumber) conversion to Int maintains value of \(valueMaintained)")
}
// Prints "12345.0 conversion to Int maintains value of 12345"


let valueChanged = Int(exactly: pi)
// valueChanged is of type Int?, not Int


if valueChanged == nil {
    print("\(pi) conversion to Int doesn't maintain value")
}
// Prints "3.14159 conversion to Int doesn't maintain value"
```
 

아래의 예시는 String 타입 상수 프로퍼티 species를 가지고 있는 스트럭처 Animal을 정의한다. 또한 Animal 스트럭처는 하나의 파라미터 species를 받는 실패가능한 이니셜라이저를 정의한다. 이 이니셜라이저는 species가 빈 문자열로 전달되었는지 확인한다. 만약 빈 문자열을 감지한다면, 이니셜라이저 실패가 트리거되고, 그렇지 않았다면 species 프로퍼티 값이 설정되고 이니셜라이제이션이 성공한다.


```swift
struct Animal {
    let species: String
    init?(species: String) {
        if species.isEmpty { return nil }
        self.species = species
    }
}
let someCreature = Animal(species: "Giraffe")
// someCreature is of type Animal?, not Animal

if let giraffe = someCreature {
    print("An animal was initialized with a species of \(giraffe.species)")
}
// Prints "An animal was initialized with a species of Giraffe"
```
 

이 실패 가능한 이니셜라이저로 새 Animal의 인스턴스를 만들고, 이니셜라이제이션이 성공했는지 확인할 수 있다.

만약 실패 가능한 이니셜라이저의 species 파라미터에 빈 문자열을 전달한다면, 이니셜라이저는 이니셜라이제이션 실패를 트리거한다.


```swift
let anonymousCreature = Animal(species: "")
// anonymousCreature is of type Animal?, not Animal

if anonymousCreature == nil {
    print("The anonymous creature couldn't be initialized")
}
// Prints "The anonymous creature couldn't be initialized"
```
 

#### Failable Initializers for Enumerations

하나 이상의 파라미터를 기반으로 실패할 수 있는 이니셜라이저를 사용하여 적합한 열거형 케이스를 선택할 수 있다. 이니셜라이저는 제공한 파라미터가 적합한 열거형 케이스와 일치하지 않는 경우 실패할 수 있다.

아래의 예시는 세 개의 상태 (kelvin, celsius, fahrenheit)를 가진 열거형 TemperatureUnit을 정의한다. 실패 가능한 이니셜라이저는 온도 단위를 나타내는 문자 기호에 대한 적합한 열거형 케이스를 찾는데 사용된다.


```swift
enum TemperatureUnit {
    case kelvin, celsius, fahrenheit
    init?(symbol: Character) {
        switch symbol {
        case "K":
            self = .kelvin
        case "C":
            self = .celsius
        case "F":
            self = .fahrenheit
        default:
            return nil
        }
    }
}
```
 

이 실패 가능한 이니셜라이저는 세 상태중 적합한 열거형 케이스를 선택할 수 있게 하고, 파라미터가 세 상태 어느 하나에도 일치하지 않는다면 이니셜라이제이션이 실패할 수 있게 한다.


```swift
let fahrenheitUnit = TemperatureUnit(symbol: "F")
if fahrenheitUnit != nil {
    print("This is a defined temperature unit, so initialization succeeded.")
}
// Prints "This is a defined temperature unit, so initialization succeeded."

let unknownUnit = TemperatureUnit(symbol: "X")
if unknownUnit == nil {
    print("This isn't a defined temperature unit, so initialization failed.")
}
// Prints "This isn't a defined temperature unit, so initialization failed."
```
 

#### Failable Initializers for Enumerations with Raw Values

원시 값을 가진 열거형은 자동적으로 실패 가능한 이니셜라이저 init?(rawValue:)를 받게 된다. 이 이니셜라이저는 파라미터 rawValue의 값과 일치하는 원시 값을 가진 열거형 케이스를 선택한다. 만약 일치하는 열거형 케이스가 없다면 이니셜라이제이션 실패가 트리거된다.

위의 TemperatureUnit 예시를 Character 타입 원시 값을 사용하여 init?(rawValue:)를 사용할 수 있도록 새로 작성할 수 있다.


```swift
enum TemperatureUnit: Character {
    case kelvin = "K", celsius = "C", fahrenheit = "F"
}

let fahrenheitUnit = TemperatureUnit(rawValue: "F")
if fahrenheitUnit != nil {
    print("This is a defined temperature unit, so initialization succeeded.")
}
// Prints "This is a defined temperature unit, so initialization succeeded."

let unknownUnit = TemperatureUnit(rawValue: "X")
if unknownUnit == nil {
    print("This isn't a defined temperature unit, so initialization failed.")
}
// Prints "This isn't a defined temperature unit, so initialization failed."
```
 

#### Propagation of Initialization Failure

클래스, 스트럭처, 열거형의 실패 가능한 이니셜라이저는 같은 클래스, 스트럭처, 열거형의 다른 실패 가능한 이니셜라이저에게 위임할 수도 있다. 유사한 방식으로, 서브클래스의 실패 가능한 이니셜라이저는 슈퍼클래스의 실패 가능한 이니셜라이저에게 위로 위임할 수도 있다.

두 경우 모두 위임받은 다른 이니셜라이저가 실패할 경우, 전체 이니셜라이제이션 프로세는 즉시 실패하고, 더 이상의 이니셜라이제이션 코드는 실행되지 않는다.

> **Note**  
>  실패 가능한 이니셜라이저는 실패 불가능한 이니셜라이저한태도 위임할 수 있다. 기존에 존재하는 실패 불가능한 이니셜라이제이션 프로세스에 잠재적인 실패 상태를 추가해야 할 때, 이 방식을 사용한다.

아래의 예시는 Product의 서브클래스 CartItem을 정의한다. CartItem 클래스는 온라인 쇼핑 장바구니를 모델링한다. CartItem은 상수 저장 프로퍼티 quantity를 도입하고, 이 프로퍼티의 값이 항상 1 이상이도록 보장한다.


```swift
class Product {
    let name: String
    init?(name: String) {
        if name.isEmpty { return nil }
        self.name = name
    }
}

class CartItem: Product {
    let quantity: Int
    init?(name: String, quantity: Int) {
        if quantity < 1 { return nil }
        self.quantity = quantity
        super.init(name: name)
    }
}
```
 

CartItem의 실패 가능한 이니셜라이저는 받은 quantity의 값이 1이상인지 검증하면서 시작한다. 만약 quantity가 유효하지 않다면, 모든 이니셜라이제이션 프로세스는 즉시 실패하고, 나머지 코드들은 실행되지 않는다. 비슷하게 Product의 실패 가능한 이니셜라이저는 name 값을 확인한다. 만약 name이 빈 문자열이라면 이니셜라이저 프로세는 즉시 실패한다.

CartItem의 인스턴스를 빈 문자열이 아닌 name과 1이상의 값을 가지는 quantity로 만든다면, 이니셜라이제이션은 성공한다.


```swift
if let twoSocks = CartItem(name: "sock", quantity: 2) {
    print("Item: \(twoSocks.name), quantity: \(twoSocks.quantity)")
}
// Prints "Item: sock, quantity: 2"
```
 

quantity의 값을 0으로 한다면, CartItem 이니셜라이저는 이니셜라이제이션을 실패하도록 한다.


```swift
if let zeroShirts = CartItem(name: "shirt", quantity: 0) {
    print("Item: \(zeroShirts.name), quantity: \(zeroShirts.quantity)")
} else {
    print("Unable to initialize zero shirts")
}
// Prints "Unable to initialize zero shirts"
```
 

비슷하게 CartItem 인스턴스의 name을 빈 문자열로 만들려고 하면, 슈퍼클래스 Product의 이니셜라이저는 이니셜라이제이션을 실패하도록 한다.


```swift
if let oneUnnamed = CartItem(name: "", quantity: 1) {
    print("Item: \(oneUnnamed.name), quantity: \(oneUnnamed.quantity)")
} else {
    print("Unable to initialize one unnamed product")
}
// Prints "Unable to initialize one unnamed product"
```
 

#### Overriding a Failable Initializer

다른 이니셜라이저들처럼, 슈퍼클래스의 실패 가능한 이니셜라이저를 서브클래스에서 오버라이드할 수 있다. 또는 슈퍼클래스의 실패 가능한 이니셜라이저를 서브클래스의 실패 불가능한 이니셜라이저로 오버라이드할 수도 있다. 이렇게 한다면 슈퍼클래스의 이니셜라이제이션이 실패가 허용되어 있더라도, 이니셜라이제이션이 실패할 수 없는 서브클래스를 만들수 있다.

실패할 수 있는 슈퍼클래스의 이니셜라이저를 실패 불가능한 서브클래스의 이니셜라이저로 오버라이드 했을 때, 슈퍼 클래스의 이니셜라이저로 위임하는 유일한 방법은 슈퍼클래스 이니셜라이저의 결과를 강제 언래핑(force-unwrap)하는 것임을 알아두자.

> **Note**  
>  실패 가능한 이니셜라이저를 실패 불가능한 이니셜라이저로 오버라이드 하는 것은 가능하지만, 그 반대는 불가능하다.

아래의 예시는 클래스 Document를 정의한다. Document의 name 프로퍼티는 빈 문자열이 아니거나 nil로 name 초기화 할 수 있지만, 빈 문자열로는 초기화 하지 못한다.


```swift
class Document {
    var name: String?
    // this initializer creates a document with a nil name value
    init() {}
    // this initializer creates a document with a nonempty name value
    init?(name: String) {
        if name.isEmpty { return nil }
        self.name = name
    }
}
```
 

다음의 예시는 Document의 서브클래스 AutomaticallyNameDocument를 정의한다. AutomaticallyNameDocumnet 서브클래스는 Document에서 도입된 두 개의 데지그네이티드 이니셜라이저를 오버라이드한다. 이 오버라이드는 AutomaticallyNamedDocument 인스턴스가 name없이 초기화 되었을 때나 init(name:) 이니셜라이저에 빈 문자열이 전달되었을 때, name의 초기 값으로 "[Untitled]" 를 가지도록 보장한다.


```swift
class AutomaticallyNamedDocument: Document {
    override init() {
        super.init()
        self.name = "[Untitled]"
    }
    override init(name: String) {
        super.init()
        if name.isEmpty {
            self.name = "[Untitled]"
        } else {
            self.name = name
        }
    }
}
```
 

AutomaticallyNamedDocument는 슈퍼클래스의 실패 가능한 이니셜라이저 init?(name:")를 실패 불가능한 이니셜라이저 init(name:)으로 오버라이드 한다. AutomaticallyNamedDocument가 빈 문자열에 대한 대처를 슈퍼클래스와 다른 방식으로 하므로, 서브클래스의 이니셜라이저는 실패할 필요가 없으므로, 실패 불가능한 이니셜라이저를 대신 제공한다.

서브클래스의 실패 불가능한 이니셜라이저 구현의 일부분으로 슈퍼클래스의 실패 가능한 이니셜라이저를 호출하기 위해 강제 언래핑을 사용할 수 있다. 예를 들어 아래의 UntitledDocument 서브클래스는 항상 "[Untitled]"로 name을 가지며, 이니셜라이제이션중 실패할 수 있는 슈퍼클래스의 init(name:)이니셜라이저를 사용한다.


```swift
class UntitledDocument: Document {
    override init() {
        super.init(name: "[Untitled]")!
    }
}
```
 

이러한 상황에서, 슈퍼클래스의 init(name:) 이니셜라이저가 빈 문자열을 전달받았을 때, 강제 언래핑은 런타임 에러를 일으킨다. 하지만 이 상황에선 문자열 상수("[Untitled]")로 호출되기 때문에, 이니셜라이저가 실패하지 않는 것을 볼 수 있고, 런타임 에러가 발생하지 않는다.

#### The init! Failable Initializer

일반적인 실패 가능한 이니셜라이저는 init?의 형태로 정의하지만, 실패가능한 이니셜라이저가 암시적으로 언래핑 되는 옵셔널 인스턴스를 생성하도록 정의할 수도 있다. init 키워드 뒤에 물음표 대신 느낌표를 사용하여 이러한 이니셜라이저를 정의할 수 있다. (init!)

init? 에서 init!으로 위임할 수도 있고, 반대도 가능하다. init! 에서 init?으로 오버라이드할 수도 있으며, 이것도 역이 성립한다. 또한 init에서 init!으로도 위임할 수 있지만, init! 초기화 구문에 의해 이니셜라이제이션이 실패할 수 있다.

#### Required Initializers

클래스의 이니셜라이저의 정의 앞에 required를 작성하면, 그 클래스의 모든 서브클래스가 이 이니셜라이저를 구현해야 한다는 것을 나타낸다. 이러한 이니셜라이저를 필수 이니셜라이저(required Initializer)라고 한다.


```swift
class SomeClass {
    required init() {
        // initializer implementation goes here
    }
}
```
 

서브 클래스가 필수 이니셜라이저 구현 앞에도 required를 반드시 작성해야한다. 이는 필수 이니셜라이저가 상속 체인에 추가된 서브 클래스에도 적용됨을 나타낸다. 필수 데지그네이티드 이니셜라이저를 오버라이드 할 때 override를 작성하지 않아도 된다.


```swift
class SomeSubclass: SomeClass {
    required init() {
        // subclass implementation of the required initializer goes here
    }
}
```
 

> **Note**  
>  상속된 이니셜라이저로 필수 요구 사항을 충족할 수 있는 경우에는 필수 이니셜라이저를 명시적으로 제공할 필요는 없다. (주: 서브 클래스에서 필수 이니셜라이저를 수정하지 않고, 필수 이니셜라이저를 상속받았으면 굳이 다시 작성할 필요는 없다)

#### Setting a Default Property Value with a Closure or Function

저장 프로퍼티의 디폴트 값이 커스터마이징이나 셋업이 필요하다면, 클로저나 전역 함수로 그 프로퍼티에 커스터마이즈 된 디폴트 값을 제공할 수 있다. 프로퍼티가 속한 타입의 새 인스턴스가 초기화 될 때 마다, 클로저나 함수가 호출되어 프로퍼티의 디폴트 값에 리턴 값을 할당한다.

이러한 종류의 클로저나 함수는 일반적으로 프로퍼티의 타입과 똑같은 타입의 임시적인 값을 만들어 내고, 원하는 초기 상태를 나타내도록 해당 값을 조정하고, 조정된 임시 값을 프로퍼티의 기본 값으로 리턴한다.

다음은 기본 속성 값을 제공하기 위해 위해 클로저를 사용하는 방법에 대한 간단한 구조(skeleton outline)이다.


```swift
class SomeClass {
    let someProperty: SomeType = {
        // create a default value for someProperty inside this closure
        // someValue must be of the same type as SomeType
        return someValue
    }()
}
```
 

클로저의 닫는 중괄호 뒤에 빈 괄호쌍이 오는 것을 알아두자. 이것은 스위프트가 클로저를 즉시 실행하도록 한다. 만약 이 괄호를 생략한다면, 클로저의 리턴 값이 아닌 클로저 자체를 프로퍼티에 할당하려고 시도한다.

> **Note**  
>  프로퍼티를 초기화하기 위해 클로저를 사용할 때, 인스턴스의 나머지 부분은 클로저가 실행되는 중에는 초기화 되지 않았다는 것을 기억해야 한다. 따라서 다른 프로퍼티 값들을 디폴트 값이라 하더라도 클로저 내부에서는 접근할 수 없다. 또한 self 프로퍼티 또한 사용할 수 없으며, 인스턴스의 메소드도 호출할 수 없다.

아래의 예시는 체스판을 모델링한 Chessboard 스트럭처를 정의한다. 체스판은 검은색과 흰색의 사각형이 번갈아 나타나는 8 x 8 보드이다.

![](/images/tistory/tistory-97-Swift-Initialization초기화-4/image-002.png)

체스판을 나타내기 위해, Chessboard 스트럭처는 64개의 Bool 값의 배열인 boardColors 프로퍼티를 가진다. 배열에서 true 값은 검은색 사각형을 나타내고, false 값은 흰색 사각형을 나타낸다. 배열의 첫 번째 원소는 체스판의 좌상단 사각형을 가리키고 마지막 원소는 우하단 사각형을 가리킨다.

boardColors 배열은 색상 값을 설정하기 위해 클로저로 초기화된다.


```swift
struct Chessboard {
    let boardColors: [Bool] = {
        var temporaryBoard: [Bool] = []
        var isBlack = false
        for i in 1...8 {
            for j in 1...8 {
                temporaryBoard.append(isBlack)
                isBlack = !isBlack
            }
            isBlack = !isBlack
        }
        return temporaryBoard
    }()
    func squareIsBlackAt(row: Int, column: Int) -> Bool {
        return boardColors[(row * 8) + column]
    }
}
```
 

새 Chessboard 인스턴스가 생성되면, 클로저가 실행된다. 그리고 boardColors의 디폴트 값이 계산되고 리턴된다. 위 예시에 있는 클로저는 체스판에 있는 각 사각형에 맞는 색을 temporaryBoard라는 임시 배열 안에서 계산하고 설정한다. 그리고 이 임시 배열은 설정이 끝나면 클로저의 리턴 값이 되어서 리턴된다. 리턴된 배열 값은 boardColors에 저장되고, squareIsBlackAt(row:column:) 함수로 쿼리 할 수 있다.


```swift
let board = Chessboard()
print(board.squareIsBlackAt(row: 0, column: 1))
// Prints "true"
print(board.squareIsBlackAt(row: 7, column: 7))
// Prints "false"
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
