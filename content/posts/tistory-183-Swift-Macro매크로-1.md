---
title: "[Swift] Macro(매크로) - 1"
date: 2025-08-14
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Macros"]
weight: 32

draft: false
original: "https://junmusu.tistory.com/183"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

매크로는 컴파일할 때 소스 코드를 변환하여, 반복적인 코드를 직접 작성하지 않게 해준다. 컴파일하는 동안, Swift는 평상시처럼 코드를 빌드하기 전에 매크로들을 확장한다.

![](/images/tistory/tistory-183-Swift-Macro매크로-1/image-002.png)

매크로를 확장하는 것은 항상 추가하는(additive) 작업이다: 매크로는 새로운 코드를 더하지만, 기존에 존재하는 코드를 삭제하거나 수정하지 않는다.

매크로 입력과, 매크로 확장의 출력 둘 다 구문적으로 유효한 Swift 코드인지 체크된다. 마찬가지로, 매크로에 전달되는 값과 매크로로 생성된 코드 안의 값이 정확한 타입인지 검사된다. 추가적으로, 매크로를 확장할 때 구현부에서 에러를 마주치면, 컴파일러는 이를 컴파일 에러로 처리한다. 이러한 보장은 매크로를 사용하는 코드를 더 쉽게 이해하게 해주고, 매크로를 잘못 사용하거나 매크로의 구현에 버그가 있는 이슈들을 더 쉽게 알아차리게 해준다.

Swift는 두 종류의 매크로가 있다:

  - 프리스탠딩 매크로는 선언에 붙지 않고, 독립적으로 표현된다.
  - 어태치드(Attached) 매크로는 선언에 붙어서 그 선언을 수정한다.



두 매크로는 호출 방법이 약간 다르지만, 매크로 확장 모델은 동일하고, 같은 방식으로 구현할 수 있다. 다음 섹션에서는 두 종류의 매크로를 좀 더 자세하게 설명한다.

### Freestanding Macros

프리스탠딩 매크로를 호출하려면, 넘버 사인(`#`)을 이름 앞에 작성하고, 이름 뒤에 있는 괄호 안에 아규먼트들을 작성한다. 예를 들어:


```arduino
func myFunction() {
    print("Currently running \(#function)")
    #warning("Something's wrong")
}
```
 

첫 번째 라인에서, `#function`은 Swift 스탠다드 라이브러리에서 `function()` 매크로를 호출한다. 이 코드를 컴파일할 때, Swift는 `#function`을 현재 함수의 이름으로 대체하는 해당 매크로의 구현을 호출한다. 이 코드를 실행하고 `myFunction()`을 호출했을 때, "Currently running myFunction()"을 프린트한다. 두 번째 라인에서, `#warning`은 Swift 스탠다드 라이브러리에서 `warning(_:)` 매크로를 호출하여, 커스텀 컴파일 타임 경고를 생성한다.

프리스탠딩 매크로는 `#function`처럼 값을 생산하거나 `#warning`처럼 컴파일 타임에 동작을 수행할 수 있다.

### Attached Macros

어태치드 매크로를 호출하려면, at 사인(`@`)을 이름 앞에 붙이고, 이름 뒤에 있는 괄호 안에 아규먼트들을 작성한다.

어태치드 매크로는 해당 매크로가 붙어있는 선언을 수정한다. 해당 선언에 새로운 메소드를 정의한다거나 프로토콜에 대한 컨펌을 추가하는 식으로 코드를 추가한다.

예를 들어, 매크로를 사용하지 않는 다음 코드를 생각해보자:


```reasonml
struct SundaeToppings: OptionSet {
    let rawValue: Int
    static let nuts = SundaeToppings(rawValue: 1 << 0)
    static let cherry = SundaeToppings(rawValue: 1 << 1)
    static let fudge = SundaeToppings(rawValue: 1 << 2)
}
```
 

이 코드에서, `SundaeToppings` 옵션 셋의 각각의 옵션들은 반복적이고 수동적인 이니셜라이저 호출을 포함한다. 이는 새로운 옵션을 추가할 때, 라인 마지막에 잘못된 수를 적는 것과 같은 실수를 하기 쉽게 된다.

다음은 이 코드가 매크로를 사용한 버전이다:


```crystal
@OptionSet<Int>
struct SundaeToppings {
    private enum Options: Int {
        case nuts
        case cherry
        case fudge
    }
}
```
 

이 버전의 `SundaeToppings`는 `@OptionSet` 매크로를 호출한다. 이 매크로는 private 이뉴머레이션에 있는 모든 케이스를 읽어서 각 옵션에 대한 상수 리스트를 생성하고, `OptionSet` 프로토콜을 컨펌하도록 한다.

> Kelly 주  
> 옵션 셋은 Swift에서 제공하는 비트마스킹 자료구조 기법이다.

비교를 하기 위해, 다음은 `@OptionSet` 매크로가 확장된 버전이다. 이 코드는 Swift에게 매크로의 확장을 보여달라고 특별히 요청한 경우에 볼 수 있다.


```swift
struct SundaeToppings {
    private enum Options: Int {
        case nuts
        case cherry
        case fudge
    }


    typealias RawValue = Int
    var rawValue: RawValue
    init() { self.rawValue = 0 }
    init(rawValue: RawValue) { self.rawValue = rawValue }
    static let nuts: Self = Self(rawValue: 1 << Options.nuts.rawValue)
    static let cherry: Self = Self(rawValue: 1 << Options.cherry.rawValue)
    static let fudge: Self = Self(rawValue: 1 << Options.fudge.rawValue)
}
extension SundaeToppings: OptionSet { }
```
 

private 이뉴머레이션 이후에 온 모든 코드는 `@OptionSet` 매크로에서 온 것이다. 매크로를 사용하여 모든 스태틱 변수들을 생성하는 버전의 `SundaeToppings`는 수동으로 작성했던 이전 버전보다 더 쉽게 읽을 수 있고 유지 보수도 쉬워진다.

### Macro Declarations

대부분의 Swift의 코드에서, 함수나 타입과 같은 심볼을 구현할 때, 별개의 선언은 필요하지 않다. 하지만 매크로에서는 선언과 구현은 구분되어있다. 매크로의 선언은 이름과 받을 파라미터, 사용할 수 있는 위치, 그리고 어떤 종류의 코드를 생성하는지를 포함한다. 매크로의 구현은 Swift 코드를 생성하여 매크로를 확장하는 코드가 포함되어 있다.

매크로 선언은 `macro` 키워드를 사용한다. 예를 들어, 다음은 이전 예제에서 사용했던 `@OptionSet` 매크로 선언의 일부이다:


```leaf
public macro OptionSet<RawType>() =
        #externalMacro(module: "SwiftMacros", type: "OptionSetMacro")
```
 

첫 번째 라인은 매크로의 이름과 아규먼트를 특정한다 — 이름은 `OptionSet`이고, 어떠한 아규먼트도 받지 않는다. 두 번째 라인은 Swift에게 매크로의 구현이 위치한 곳을 알려주기 위해 Swift 스탠다드 라이브러리에서 `externalMacro(module:type:)`을 가져와 사용한다. 이 경우에, `SwiftMacros` 모듈은 `@OptionSet` 매크로를 구현하는 `OptionSetMacro`라는 이름을 가진 타입을 포함하고 있다.

`OptionSet`은 어태치드 매크로이기 때문에 스트럭처나 클래스 처럼 이름에 upper camel case 를 사용한다. 프리스탠딩 매크로는 변수나 함수처럼 lower camel case를 사용한다.

> Note  
> 매크로는 항상 public으로 선언된다. 매크로를 선언하는 코드와 매크로를 사용하는 코드는 서로 다른 모듈에 있기 때문에 퍼블릭이 아닌 매크로는 어디에도 적용할 수 없다.

매크로 선언은 매크로의 _역할_을 정의한다 — 매크로가 호출될 수 있는 소스 코드의 위치 그리고 매크로가 생성할 수 있는 코드의 종류. 모든 매크로는 매크로 선언의 시작 부분에 어트리뷰트의 일부로 작성된, 하나 혹은 그 이상의 역할을 가지고 있다. 다음은 `@OptionSet` 선언의 조금 더 확장된 일부로 역할을 위한 어트리뷰트를 포함하고 있다.


```less
@attached(member)
@attached(extension, conformances: OptionSet)
public macro OptionSet<RawType>() =
        #externalMacro(module: "SwiftMacros", type: "OptionSetMacro")
```
 

`@attached` 어트리뷰는 이 선언에서 두 번 등장하고, 각각의 매크로 역할을 나타낸다. 첫 번째 사용 `@attached(member)`는 매크로가 적용된 타입에 새로운 멤버를 추가함을 나타낸다. `@OptionSet` 매크로는 `OptionSet` 프로토콜이 요구하는 `init(rawValue:)` 이니셜라이저와 그 밖에 추가적인 멤버들을 추가한다. 두 번째 사용 `@attached(extension, conformances: OptionSet)`은 `@OptionSet`이 `OptionSet` 프로토콜을 컨펌하도록 만들어 준다는 것을 알려준다. `@OptionSet` 매크로는 해당 매크로가 적용된 타입을 확장하여 @OptionSet` 프로토콜을 컨펌하도록 한다.

프리스탠딩 매크로는, `@freestanding` 어트리뷰트를 작성하여 역할을 지정한다:


```crystal
@freestanding(expression)
public macro line<T: ExpressibleByIntegerLiteral>() -> T =
        /* ... location of the macro implementation... */
```
 

위의 `#line` 매크로는 `expression` 역할을 가지고 있다. 익스프레션 매크로는 값을 생성하거나, 혹은 경고를 생성하는 것과 같은 컴파일 타임의 동작을 수행한다.

매크로의 역할에 더해서, 매크로의 선언은 매크로가 생성하는 심볼의 이름에 대한 정보를 제공한다. 매크로 선언이 이름의 리스트를 제공하면, 그 매크로는 반드시 해당 이름들만 사용하는 선언만 생성하는 것이 보장되며(Kelly 주: 여기서 말하는 선언은 매크로 선언이 아닌 이 매크로가 해당 타입에서 추가할 멤버 선언을 뜻한다.), 생성된 코드를 이해하고 디버그 하는데 도움을 준다. 아래는 `@OptionSet`의 전체 선언이다.


```less
@attached(member, names: named(RawValue), named(rawValue),
        named(`init`), arbitrary)
@attached(extension, conformances: OptionSet)
public macro OptionSet<RawType>() =
        #externalMacro(module: "SwiftMacros", type: "OptionSetMacro")
```
 

위의 선언에서 `@attached(member)` 매크로는 `@OptionSet` 매크로가 생성하는 각 심볼들을 `name:` 레이블 뒤에 아규먼트로 포함하고 있다. 이 매크로(`@OptionSet`)는 `RawValue`, `rawValue` 그리고 `init`이라는 이름의 심볼에 해당하는 선언을 추가한다. — 이 이름들은 이미 알려져 있기 때문에 매크로에서 명시적으로 나열한다.

매크로 선언에는 이름 리스트 뒤에 `arbitrary`도 포함되어 있어서, 매크로를 실제로 사용하기 전 까지는 이름을 알 수 없는 선언을 생성하는 것을 허용한다. 예를 들어, `@OptionSet` 매크로가 `SundaeToppings`에 적용되면, `nuts`, `cherry`,`fudge`라는 이뉴머레이션 케이스에 대응하는 타입 프로퍼티를 생성한다.

* * *

> 이 포스트는 The Swift Programming Language의 내용을 직접 번역한 내용에 주석을 달아 정리한 것입니다.   
> 원문: [The Swift Programming Language (Swift 6.2)](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)
