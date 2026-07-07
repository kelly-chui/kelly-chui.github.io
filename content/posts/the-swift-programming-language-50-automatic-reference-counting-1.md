---
title: "[Swift] Automatic Reference Counting(자동 참조 카운팅) - 1"
date: 2023-08-15
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Automatic Reference Counting"]
weight: 50

draft: false
original: "https://junmusu.tistory.com/131"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Automatic Reference Counting

스위프트는 _자동 참조 카운팅_(ARC)을 사용하여 앱의 메모리 사용량을 추적하고 관리한다. 대부분의 경우에, 스위프트에서 메모리 관리는 "그냥 작동"하고, 메모리 관리를 직접 할 생각을 하지 않아도 된다. ARC는 클래스 인스턴스가 더 이상 필요하지 않게 되었을 때, 자동적으로 해당 메모리를 비우게 된다.

하지만, 경우에 따라 ARC는 메모리 관리를 위해 코드 내부에서의 관계**(주: 원문은 relationships between parts of your code, 코드 부분들 간의 관계)** 에 대한 정보를 요구할 때가 있다. 이 챕터는 이러한 상황들을 설명하고, 어떻게 ARC가 앱의 메모리를 관리하는지를 보여준다.

참조 카운팅은 클래스의 인스턴스들에만 적용된다. 스트럭처나 열거형은 참조 타입이 아니라 값 타입이며, 참조를 통해 저장되거나 전달되지 않는다.

### How ARC Works

클래스의 새 인스턴스를 만들 때 마다, ARC는 해당 인스턴스에 대한 정보를 저장하기 위해 메모리 청크(a chunk of memory)를 할당한다. 이 메모리는 인스턴스의 타입 정보와 함께 해당 인스턴스와 연결된 저장 프로퍼티들의 값을 보유한다.

추가적으로, 인스턴스가 더 이상 필요하지 않을 때, ARC는 해당 인스턴스가 사용중인 메모리를 해제하여, 해당 메모리가 다른 용도로 사용될 수 있게 한다. 이는 클래스 인스턴스가 더 이상 필요하지 않을 때 메모리 공간을 차지하지 않도록 보장한다.

하지만, ARC가 아직 사용중인 인스턴스를 할당 해제하였을 때 더 이상 그 인스턴스의 프로퍼티나 메소드에 접근하는 불가능하다. 해당 인스턴스에 접근하려고 시도한다면, 앱은 대부분 크래시가 될 것이다.

아직 필요한 인스턴스가 사라지지 않도록 하기 위하여 ARC는 현재 각 클래스 인스턴스를 참조하는 프로퍼티, 상수, 변수를 추적한다. ARC는 참조가 하나라도 활성화되어 있는 인스턴스의 메모리를 할당해제 하지 않는다.

이러한 것들을 가능하게 하기 위하여, 클래스 인스턴스를 프로퍼티, 상수, 변수에 할당할 때마다 인스턴스에 대한 _강한 참조(strong reference)_ 를 만든다. "강한" 참조라고 하는 이유는 인스턴스를 단단하게 유지하고, 해당 강한 참조가 남아있는 이상 할당 해제를 허용하지 않기 때문이다.

### ARC in Action

다음은 ARC가 작동하는 예시이다. 이 예시는 저장 상수 프로퍼티 `name`을 정의하는 간단한 클래스 `Person`으로 시작한다:


```swift
class Person {
    let name: String
    init(name: String) {
        self.name = name
        print("\(name) is being initialized")
    }
    deinit {
        print("\(name) is being deinitialized")
    }
}
```
 

`Person` 클래스는 인스턴스의 `name` 프로퍼티를 설정하고, 초기화가 진행중임을 나타내는 메세지를 출력하는 이니셜라이저를 가지고 있다. 또한 클래스가 할당 해제되었을 때 메세지를 출력하는 디이니셜라이저도 가지고 있다.

다음 코드 스니펫은 나중에 새 `Person` 인스턴스에 대한 여러가지 참조를 설정하기 위해 사용할 `Person?` 타입의 변수 세 개를 정의한다. 이 세 변수는 옵셔널 타입이기 때문에, 자동적으로 `nil`로 초기화되고, 당장은 `Person` 인스턴스의 참조를 가지고 있지 않다.


```swift
var reference1: Person?
var reference2: Person?
var reference3: Person?
```
 

새로운 `Person` 인스턴스를 생성하고, 이 세 변수중 하나에 이를 할당할 수 있다:


```swift
reference1 = Person(name: "John Appleseed")
// Prints "John Appleseed is being initialized"
```
 

`"John Appleseed is being initialized"` 메세지가 `Person` 클래스의 이니셜라이저를 호출할 때 출력되는 것을 알아두자. 이는 이니셜라이저가 수행됨을 의미한다.

새 `Person` 인스턴스가 `reference1` 변수에 할당되었기 때문에, `reference1`와 새 `Person` 인스턴스 사이에는 강한 참조가 생기게 된다. 하나 이상의 강한 참조가 존재하므로, ARC는 `Person`이 할당 해제되지 않고 메모리에 남을 수 있게 한다.

만약 같은 `Person`의 인스턴스를 두 개 이상의 변수에 할당하면, 강한 참조가 두 개 더 해당 인스턴스에 생기게 된다:


```swift
reference2 = reference1
reference3 = reference1
```
 

이제 세 개의 강한 참조가 이 `Person` 인스턴스에 존재한다.

만약 이중에서 (맨 처음 만들어진 참조를 포함하여서)두 개의 강한 참조를 제거하고 싶다면 변수들에 `nil`을 할당하면 된다, 하나의 강한 참조가 남아있으므로, 이 `Person` 인스턴스는 할당 해제되지 않는다.


```swift
reference1 = nil
reference2 = nil
```
 

ARC는 세 번째 강한 참조가 끊어질 때까지 이 `Person` 인스턴스를 할당 해제하지 않는다. 세 번째 강한 참조가 끊어지면, 더 이상 이 `Person` 인스턴스가 필요하지 않다는 것이 명확해진다:


```swift
reference3 = nil
// Prints "John Appleseed is being deinitialized"
```
 

### Strong Reference Cycles Between Class Instances

위의 예시들에서, 더 이상 필요하지 않을 때 할당 해제하기 위해 ARC는 새로 생성한 `Person` 인스턴스의 참조를 추적한다.

하지만 클래스의 인스턴스가 강한 참조가 절대 사라지지 않는 상황이 있을수 있다. 이는 두 개의 클래스 인스턴스가 서로 강한 참조를 가지고 있을때 발생한다. 이를 _강한 참조 사이클(strong reference cycle)_ 이라고 한다.

클래스들의 사이에 약한(weak)이나 미소유(unowned) 참조를 정의해서 강한 참조 사이클을 해결할 수 있다. 이 과정은 **Resolving Strong Reference Cycles Between Class Instances** 에 설명되어 있다. 하지만, 강한 참조 사이클을 해결하기 전에, 왜 이런 사이클이 발생하는지 아는 것이 유용하다.

다음은 어떻게 강한 참조 사이클이 의도적이지 않게 생겨나는지의 예시이다. 이 예시는 아파트들과 거주민을 모델링하는 두 개의 클래스 `Person`과 `Apartment`를 정의한다:


```swift
class Person {
    let name: String
    init(name: String) { self.name = name }
    var apartment: Apartment?
    deinit { print("\(name) is being deinitialized") }
}

class Apartment {
    let unit: String
    init(unit: String) { self.unit = unit }
    var tenant: Person?
    deinit { print("Apartment \(unit) is being deinitialized") }
}
```
 

모든 `Person` 인스턴스는 `String` 타입 `name` 프로퍼티와 `nil`로 초기화된 옵셔널 `apartment` 프로퍼티를 가지고 있다. `apartment` 프로퍼티는 모든 사람이 아파트를 가지고 있지는 않으므로 옵셔널이다.

비슷하게 모든 `Apartment` 인스턴스는 `String` 타입 `unit` 프로퍼티와 `nil`로 초기화된 옵셔널 `tenant` 프로퍼티를 가지고 있다. `tenant` 프로퍼티는 모든 아파트가 거주자를 가지고 있지는 않으므로 옵셔널이다.

두 클래스는 또한 클래스가 소멸되고 있을 때 해당 사실을 출력하는 디니이니셜라이저 또한 정의한다. 이는 `Person`이나 `Apartment`가 예상한 대로 할당 해제되고 있는지 확인하게 해준다.

다음의 코드 스니펫은 두개의 옵셔널 타입 변수 `john`과 `unit4A`를 정의한다. 이 두 변수는 옵셔널이기 때문에 초기 값으로 `nil`을 가지고 있다:


```swift
var john: Person?
var unit4A: Apartment?
```
 

이제 `Person`과 `Apartment`의 인스턴스를 생성하고 이 새 인스턴스들을 `john`과 `unit4A` 변수에 할당할 수 있다:


```swift
john = Person(name: "John Appleseed")
unit4A = Apartment(unit: "4A")
```
 

다음은 이 두 인스턴스를 만들고 할당하였을 때 강한 참조가 어떻게 보이는지를 보여준다. `john` 변수는 새 `Person` 인스턴스, `unit4A` 변수는 새 `Apartment` 인스턴스와 강한 참조를 가지게 된다:

![](/images/the-swift-programming-language-50-automatic-reference-counting-1/image-002.png)

이 두 인스턴스를 서로 연결하여 사람이 아파트를 소유하게 만들 수있고, 아파트가 거주자를 가지게 만들 수 있다. 느낌표(`!`)는 `john`과 `unit4A` 두 옵셔널 변수에 저장된 인스턴스를 언래핑하고 접근하기 위해 사용되어 해당 인스턴스를 설정할 수 있게 해준다.


```swift
john!.apartment = unit4A
unit4A!.tenant = john
```
 

![](/images/the-swift-programming-language-50-automatic-reference-counting-1/image-003.png)

두 인스턴스를 연결하는 것은 두 인스턴스 사이에 강한 참조 사이클을 생성한다. `Person` 인스턴스는 이제 `Apartment` 인스턴스에 대한 강한 참조 사이클을 가지게 되고, `Apartment` 인스턴스는 `Person` 인스턴스에 강한 참조 사이클을 가지게 된다, 그러므로 `john`과 `unit4A` 변수 사이에 있는 강한 참조들을 깨뜨려도, 참조 카운트는 0으로 떨어지지 않고, 이 인스턴스들은 ARC가 할당 해제시키지 않는다:


```swift
john = nil
unit4A = nil
```
 

이 두 변수를 `nil`로 설정하였을 때 어떠한 디이니셜라이저도 호출되지 않았다는 것을 주목하자. 강한 참조 사이클은 `Person`과 `Apartment` 인스턴스가 할당 해제되는 것을 막아, 메모리 누수를 일으키게 된다.

다음은 `john`과 `unit4A` 변수를 `nil`로 설정한 이후의 강한 참조를 보여준다:

![](/images/the-swift-programming-language-50-automatic-reference-counting-1/image-004.png)

`Person`과 `Apartment` 인스턴스 사이의 강한 참조는 계속해서 남게 되고, 깨뜨릴수 없게 된다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
