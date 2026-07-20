---
title: "The Swift Programming Language. Initialization (1)"
date: 2023-06-13

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Initialization

weight: 20

draft: false
original: "https://junmusu.tistory.com/92"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Initialization

_이니셜라이제이션(Initialization)_ 은 클래스, 스트럭처, 열거형의 인스턴스를 사용하기 위해 준비하는 프로세스다. 이 프로세스는 인스턴스의 각 저장 프로퍼티에 초기 값을 설정하고, 인스턴스가 사용될 준비가 되기 전에 필요한 초기 설정을 하는 작업이 포함된다.

이니셜라이제이션은 특정 타입의 새로운 인스턴스를 만들기 위해 호출하는 특별한 메소드인 이니셜라이저를 정의함으로써 구현할 수 있다. Objective-C의 이니셜라이저와 다르게 스위프트의 이니셜라이저는 값을 리턴하지 않는다. 이니셜라이저의 가장 중요한 역할은 새 인스턴스가 처음으로 사용되기 전에 정확하게 초기화 되는 것을 보장하는 것이다.

클래스 타입의 인스턴스들은 할당 해제되기 전 사용자가 지정한 정리 작업을 할 수 있는 _디이니셜라이저(deinitializer)_ 를 구현할 수 있다.(주: "사용자가 지정한 정리 작업" 부분은 원문에선 custom cleanup 이라고 적혀있다.)

### Setting Initial Values for Stored Properties

클래스와 스트럭처는 반드시 인스턴스가 생성될 때 모든 저장 프로퍼티가 적합한 초기 값을 가지고 있어야 한다. 저장 프로퍼티는 불확실한(indeterminate) 상태로 존재할 수 없다.

저장 프로퍼티의 초기 값은 이니셜라이저에서 설정하거나, 프로퍼티를 정의할 때 디폴트 값을 할당해서 설정할 수 있다.

> **Note**  
>  저장 프로퍼티에 디폴트 값을 할당하거나, 이니셜라이저를 통해 초기 값을 설정할 때, 프로퍼티의 값은 프로퍼티 옵저버를 호출하지 않고 직접 설정된다.

#### Initializers

이니셜라이저는 특정 타입의 새로운 인스턴스를 생성하기 위해 호출된다. 가장 간단한 형태의 이니셜라이저는 init 키워드를 사용하여 작성한, 파라미터가 없는 인스턴스 메소드와 처럼 생겼다.


```swift
init() {
    // perform some initialization here
}
```
 

아래의 예시는 화씨 단위로 표현된 온도를 저장하는 스트럭처 Fahrenheit를 정의한다. Fahrenheit 스트럭처는 하나의 Double 타입 저장 프로퍼티 temperature를 가지고 있다.


```swift
struct Fahrenheit {
    var temperature: Double
    init() {
        temperature = 32.0
    }
}
var f = Fahrenheit()
print("The default temperature is \(f.temperature)° Fahrenheit")
// Prints "The default temperature is 32.0° Fahrenheit"
```
 

스트럭처에 파라미터가 없는 하나의 이니셜라이저 init만 정의되어 있다. 이 이니셜라이저는 temperature를 32.0으로 초기화한다.

#### Default Property Values

위에서 보이는 것처럼 이니셜라이저에서 저장 프로퍼티의 초기 값을 설정할 수 있다. 다른 방법으로는, 프로퍼티를 선언할 때 프로퍼티의 디폴트 값을 지정하는 것이다. 속성이 정의될 때 초기 값을 할당하여 프로퍼티의 디폴트 값을 지정할 수 있다.

> **Note**  
>  프로퍼티가 항상 똑같은 초기 값을 받는다면, 디폴트 값을 제공하는 것이 이니셜라이저를 통해 초기 값을 설정하는 것보다 낫다. 둘의 결과는 같지만, 디폴트 값을 제공하는 것은 프로퍼티의 초기화와 선언을 더 밀접하게 묶어준다. 디폴트 값을 사용하면, 짧고 간결한 이니셜라이저를 만들게 해주며, 그 값으로 프로퍼티의 타입을 추론하게 해준다. 또한 디폴트 값은 디폴트 이니셜라이저와 이니셜라이저 상속에서 어드밴티지를 쉽게 받을 수 있게 해준다.

Fahrenheit 스트럭처를 디폴트 값을 제공함으로써 더 간단한 형태로 작성할 수 있다.


```swift
struct Fahrenheit {
    var temperature = 32.0
}
```
 

### Customizing Initialization

이니셜라이제이션 프로세스를 입력 파라미터와 옵셔널 프로퍼티 타입을 사용하거나, 상수 프로퍼티를 할당함으로써 커스터마이즈할 수 있다.

#### Initialization Parameters

이니셜라이제이션 프로세스를 커스터마이즈하는 값의 타입과 이름을 정의하기 위해 이니셜라이제이션 파라미터를 이니셜라이저에 제공할 수 있다. 이니셜라이제이션 파라미터는 함수나 메소드의 파라미터와 동일한 기능과 문법을 사용한다.

다음의 예시는 섭씨 단위로 표현되는 온도를 저장하는 Celsius라는 스트럭처를 정의한다. Celsius 스트럭처는 다른 온도 단위로 스트럭처를 초기화하는 두 개의 커스텀 이니셜라이저 init(formFahrenheit:)와 init(fromKelvin:)을 구현한다.


```swift
struct Celsius {
    var temperatureInCelsius: Double
    init(fromFahrenheit fahrenheit: Double) {
        temperatureInCelsius = (fahrenheit - 32.0) / 1.8
    }
    init(fromKelvin kelvin: Double) {
        temperatureInCelsius = kelvin - 273.15
    }
}
let boilingPointOfWater = Celsius(fromFahrenheit: 212.0)
// boilingPointOfWater.temperatureInCelsius is 100.0
let freezingPointOfWater = Celsius(fromKelvin: 273.15)
// freezingPointOfWater.temperatureInCelsius is 0.0
```
 

두 이니셜라이저 모두 아규먼트를 섭씨 값으로 변환하고, 변환된 값을 temparatureInCelsius라는 프로퍼티에 저장한다.

#### Parameter Names and Argument Labels

함수나 메소드의 파라미터처럼, 이니셜라이제이션 파라미터도 파라미터 이름과 아규먼트 레이블을 모두 가질 수 있다.

하지만 이니셜라이저는 함수나 메소드의 이름처럼 식별할 수 있는 함수 이름이 없다. 그러므로 이니셜라이저의 파라미터들의 이름과 타입은 어떤 이니셜라이저가 호출되어야 하는지 식별하는데 큰 역할은 한다. 이러한 이유로 스위프트는 아규먼트 레이블을 제공하지 않은 이니셜라이저의 모든 파라미터에도 자동적으로 아규먼트 레이블을 제공한다.

다음의 예시는 스트럭처 Color와 세 개의 상수 프로퍼티 red, green, blue를 정의한다. 이 프로퍼티들은 0.0 에서 1.0 사이의 값을 저장한다.

Color는 Double 타입의 세개의 프로퍼티를 가진 이니셜라이저를 제공한다. Color는 또한 하나의 파라미터 white를 가진 두 번째 이니셜라이저도 제공한다.


```swift
struct Color {
    let red, green, blue: Double
    init(red: Double, green: Double, blue: Double) {
        self.red   = red
        self.green = green
        self.blue  = blue
    }
    init(white: Double) {
        red   = white
        green = white
        blue  = white
    }
}
```
 

두 이니셜라이저 모두 각 이니셜라이저 파라미터에 값을 제공하여 새 Color 인스턴스를 만드는데 사용할 수 있다.


```swift
let magenta = Color(red: 1.0, green: 0.0, blue: 1.0)
let halfGray = Color(white: 0.5)
```
 

이러한 이니셜라이저를 아규먼트 레이블 없이 부르는 것은 불가능하다는 것을 알아두자. 아규먼트 레이블이 정의된 경우, 생략하면 컴파일 타임 에러가 발생한다.


```swift
let veryGreen = Color(0.0, 1.0, 0.0)
// this reports a compile-time error - argument labels are required
```
 

#### Initializer Parameters Without Argument Labels

이니셜라이저 파라미터에 아규먼트 레이블을 사용하고 싶지 않으면, 명시적으로 아규먼트 레이블을 작성하는 대신 언더스코어(_)를 사용하면 된다.

다음은 위에서 나온 Celsius 예시에 Double 타입 섭씨 값을 넣어 새로운 인스턴스를 만드는 이니셜라이저를 추가한 버전이다.


```swift
struct Celsius {
    var temperatureInCelsius: Double
    init(fromFahrenheit fahrenheit: Double) {
        temperatureInCelsius = (fahrenheit - 32.0) / 1.8
    }
    init(fromKelvin kelvin: Double) {
        temperatureInCelsius = kelvin - 273.15
    }
    init(_ celsius: Double) {
        temperatureInCelsius = celsius
    }
}
let bodyTemperature = Celsius(37.0)
// bodyTemperature.temperatureInCelsius is 37.0
```
 

이니셜라이저 호출 Celsisus(37.0)은 아규먼트 레이블을 사용하지 않아도 의도가 명확하다. 따라서 이름 없는 Double 타입 값을 사용하여 init(_ celsius: Double)을 호출 할 수 있도록 작성하는 것이 적합하다.

#### Optional Property Types

옵셔널 타입 프로퍼티가 있는 경우 자동으로 nil로 초기화 되는데, 이는 이니셜라이제이션 프로세스 동안 이 프로퍼티가 값이 아직 없음을 의도적으로 보여주기 위함이다.

다음의 예시는 옵셔널 String 타입 프로퍼티 response를 가지고 있는 SurveyQuestion 클래스를 정의한다.


```swift
class SurveyQuestion {
    var text: String
    var response: String?
    init(text: String) {
        self.text = text
    }
    func ask() {
        print(text)
    }
}
let cheeseQuestion = SurveyQuestion(text: "Do you like cheese?")
cheeseQuestion.ask()
// Prints "Do you like cheese?"
cheeseQuestion.response = "Yes, I do like cheese."
```
 

설문조사를 할 때, 질문하기 전 까지는 응답을 알 수가 없으므로 response 프로퍼티는 String? 타입으로 선언되었다. SurveyQuestion의 새 인스턴스가 만들어 질 때, response프로퍼티는 자동적으로 nil이 할당되고, "아직 값이 없음"을 의미한다.

#### Assigning Constant Properties During Initialization

이니셜라이제이션이 완료되기 전 까지 명확한 값을 가진다면, 이니셜라이제이션동안 어느 시점에서나 상수 프로퍼티에 값을 할당할 수 있다. 한번 상수 프로퍼티가 값을 할당받으면, 더 이상 수정할 수 없다.

> **Note**  
>  클래스 인스턴스에서 상수 프로퍼티는 해당 프로퍼티가 도입된(intoduce) 클래스에서만 이니셜라이제이션 도중 수정할 수 있다. 서브클래스에선 수정할 수 없다.

위에 있는 SurveyQuestion 예시에서 text 프로퍼티를 변수가 아닌 상수 프로퍼티로 수정하여 한번 SurveyQuestion의 인스턴스가 만들어졌으면 수정할 수 없음을 나타낼 수 있다. text 프로퍼티가 상수임에도, 클래스의 이니셜라이저에서 여전히 설정할 수 있다.


```swift
class SurveyQuestion {
    let text: String
    var response: String?
    init(text: String) {
        self.text = text
    }
    func ask() {
        print(text)
    }
}
let beetsQuestion = SurveyQuestion(text: "How about beets?")
beetsQuestion.ask()
// Prints "How about beets?"
beetsQuestion.response = "I also like beets. (But not with cheese.)"
```
 

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
