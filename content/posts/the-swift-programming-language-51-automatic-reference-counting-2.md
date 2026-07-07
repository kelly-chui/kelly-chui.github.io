---
title: "[Swift] Automatic Reference Counting(자동 참조 카운팅) - 2"
date: 2023-08-16
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Automatic Reference Counting"]
weight: 51

draft: false
original: "https://junmusu.tistory.com/132"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Resolving Strong Reference Cycles Between Class Instances

스위프트는 클래스 타입 프로퍼티로 작업할 때 강한 참조 사이클을 해결하는 두 가지 방법으로 약한 참조와 미소유 참조를 제공한다.

약한 참조와 미소유 참조는 참조 사이클 내부의 한 인스턴스가 다른 인스턴스를 강하게 붙잡지 않고 참조할 수 있게 해준다. 그리고는 그 인스턴스들은 서로를 강한 참조 사이클 없이 참조할 수 있게 된다.

다른 인스턴스의 수명이 더 짧을 때 약한 참조를 사용한다. — 즉 다른 인스턴스가 먼저 할당 해제되는 경우이다. 이전의 `Apartment` 예시에서, 아파트의 라이프 사이클 중간에 거주자가 없는 것은 충분히 가능한 일이므로 약한 참조는 이러한 경우의 참조 사이클을 깨뜨리는데 적합하다. 반대로, 미소유 참조를 사용하는 것은 다른 인스턴스가 같거나 더 긴 수명을 가지고 있을때 사용한다.

#### Weak References

약한 참조는 참조되는 인스턴스를 강하게 붙잡지 않는 참조이고, 따라서 ARC가 참조되는 인스턴스를 해제하는 것을 중지시키 않는다. 이러한 동작은 해당 참조가 강한 참조 사이클의 일부가 되는 것을 방지한다. 프로퍼티나 변수의 선언 앞에 `weak` 키워드를 위치시켜 약한 참조임을 나타낼 수 있다.

약한 참조는 자신이 참조하는 인스턴스를 강하게 붙잡지 않기 때문에, 약한 참조가 참조하는 동안에도 해당 인스턴스가 할당 해제될 수도 있다. 그러므로 ARC는 참조하는 인스턴스가 할당 해제될 때 자동으로 약한 참조를 `nil`로 설정한다. 그리고, 약한 참조의 값이 런타임에 `nil`로 변경될 수 있어야 하기 때문에 항상 상수가 아닌 옵셔널 타입 변수로 선언되어야 한다.

다른 옵셔널 값 처럼 약한 참조에 값이 있는지 체크할 수 있으며, 더 이상 존재하지 않는 유효하지 않은 인스턴스의 참조로 끝나지 않게 된다.

> **Note**  
>  프로퍼티 옵저버는 ARC가 약한 참조를 nil로 설정했을 때, 호출되지 않는다.

아래의 예시는 하나의 중요한 차이점을 제외하곤 `Person`과 `Apartment`의 예시와 같다. 이번에는 `Apartment` 타입의 `tenant` 프로퍼티가 약한 참조로 선언된다.


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
    weak var tenant: Person?
    deinit { print("Apartment \(unit) is being deinitialized") }
}
```
 

두 변수(`john`과 `unit4A`)에서의 강한 참조와 두 인스턴스간의 연결은 이전과 같이 생성된다.


```swift
var john: Person?
var unit4A: Apartment?

john = Person(name: "John Appleseed")
unit4A = Apartment(unit: "4A")

john!.apartment = unit4A
unit4A!.tenant = john
```
 

다음은 두 인스턴스를 연결한 참조의 모습을 보여준다:

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-002.png)

`Person` 인스턴스는 여전히 `Apartment` 인스턴스를 강하게 참조하지만, `Apartment` 인스턴스는 `Person` 인스턴스를 약하게 참조한다. 이는 `john`에 의해 유지되고 있는 강한 참조를 `nil`로 설정하여 깨뜨리면, 더이상 `Person` 인스턴스에 대한 강한 참조가 존재하지 않게 된다:


```swift
john = nil
// Prints "John Appleseed is being deinitialized"
```
 

`Person` 인스턴스에 대한 더이상 강한 참조가 존재하지 않으므로, 할당 해제되고, `tenant` 프로퍼티는 `nil`로 설정된다:

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-003.png)

`Apartment` 인스턴스에 유일하게 남은 강한 참조는 변수 `unit4A`에서 온다. 만약 이 강한 참조를 깨뜨리게 되면, 더 이상 `Apartment` 인스턴스에 대한 강한 참조가 존재하지 않게 된다:


```swift
unit4A = nil
// Prints "Apartment 4A is being deinitialized"
```
 

`Apartment` 인스턴스에 더 이상 강한 참조가 존재하지 않으므로, 이 또한 할당 해제된다:

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-004.png)

> **Note**  
>  가비지 컬렉션을 사용하는 시스템에서는 메모리가 부족할 때만 가비지 컬렉션을 실행시키고, 이때 강한 참조가 없는 객체가 할당 해제되기 때문에 약한 포인터로 간단한 캐싱 메커니즘을 구현하는 경우가 있다. 하지만 ARC에서는 값이 가지고 있는 마지막 강한 참조가 제거되자 마자 할당 해제되기 때문에, 이러한 용도로 약한 참조를 사용하는 것은 부적절하다.

#### Unowned References

약한 참조와 비슷하게, _미소유 참조(unowned reference)_ 는 자신이 참조하는 인스턴스를 강하게 붙잡지 않는다. 하지만 약한 참조와 다르게, 미소유 참조는 다른 인스턴스가 같거나 더 긴 수명을 가질 때 사용한다. `unowned` 키워드를 프로퍼티나 변수의 선언 앞에 배치하여 미소유 레퍼런스임을 나타낼 수 있다.

약한 참조와 다르게, 미소유 참조는 항상 값을 가지고 있다고 간주한다. 결과적으로 미소유라고 지정하는 것은 해당 값을 옵셔널로 만들지 않고, ARC는 미소유 참조의 값을 절대 `nil`로 설정하지 않는다.

> **Important**  
>  미소유 참조는 항상 할당 해제되지 않을 것이라고 확신 되는 참조에만 미소유 참조를 사용해야 한다.  
>   
> 참조가 할당 해제된 뒤에 해당 미소유 참조의 값에 접근하려 하는 것은 런타임 에러를 발생시킨다.

아래의 예시는 은행 고객과 그 고객이 사용할 수 있는 신용 카드를 모델링 하는 두 개의 클래스 `Customer`와 `CreditCard`를 정의한다. 이 두 클래스들은 각각 서로의 인스턴스를 프로퍼티로 저장한다. 이러한 관계는 강한 참조 사이클을 만들 수 있는 가능성이 있다.

약한 참조의 예시에서 본 `Apartment`와 `Person`의 관계와 `Customer`와 `CreditCard`의 관계는 약간 다르다. 이 데이터 모델에서, 고객은 신용 카드를 가지고 있을 수도, 혹은 그러지 않을 수도 있는데, 신용 카드는 항상 고객과 연결되어 있다. `CreditCard` 인스턴스는 자신이 참조하는 `Customer` 없이 존재할 수 없다. 이를 표현하기 위해, `Customer` 클래스는 옵셔널 `card` 프로퍼티를 가지고 있고, `CreditCard` 클래스는 미소유(논 옵셔널) `customer` 프로퍼티를 가지고 있다.

게다가, 새로운 `CreditCard` 인스턴스는 `number` 값과 `Customer` 인스턴스를 `CreditCard`의 커스텀 이니셜라이저에 넣어야 생성할 수 있다. 이는 항상 `CreditCard` 인스턴스가 생성될 때 연결된 `Customer` 인스턴스를 가지고 있는 것을 보장한다.

신용 카드가 항상 고객을 가지고 있기 때문에, `customer` 프로퍼티를 미소유 참조로 정의하여, 강한 참조 사이클을 회피한다:


```swift
class Customer {
    let name: String
    var card: CreditCard?
    init(name: String) {
        self.name = name
    }
    deinit { print("\(name) is being deinitialized") }
}

class CreditCard {
    let number: UInt64
    unowned let customer: Customer
    init(number: UInt64, customer: Customer) {
        self.number = number
        self.customer = customer
    }
    deinit { print("Card #\(number) is being deinitialized") }
}
```
 

> **Note**  
> **CreditCard** 클래스의 **number** 프로퍼티의 타입은 충분히 큰 카드 숫자를 표현하기 위해 **Int** 가 아닌 **UInt64** 로 정의한다.

다음의 코드 스니펫은 특정 고객에 대한 참조를 저장하기 위해 옵셔널 `Customer` 변수 `john`을 선언한다. 이 변수는 옵셔널이기 때문에 초기값으로 `nil`을 가지게 된다:


```swift
var john: Customer?
```
 

이제 `Customer` 인스턴스를 생성하여 `card` 프로퍼티로 사용될 새 `CreditCard` 인스턴스를 초기화하고 할당할 수 있다:


```swift
john = Customer(name: "John Appleseed")
john!.card = CreditCard(number: 1234_5678_9012_3456, customer: john!)
```
 

다음은 두 인스턴스를 연결한 참조가 어떤 모습인지 보여준다:

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-005.png)

`Customer` 인스턴스는 `CreditCard` 인스턴스에 대해 강한 참조를 가지고 있고, `CreditCard` 인스턴스는 `Customer` 인스턴스에 대해 미소유 참조를 가지고 있다.

미소유 `customer` 참조 때문에, `john` 변수에 의해 유지되고 있는 강한 참조를 제거하면, 더 이상 `Customer` 인스턴스에 대해 강한 참조가 존재하지 않게 된다:

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-006.png)

`Customer` 인스턴스에 대한 강한 참조가 더 이상 존재하지 않으므로, 이는 할당 해제된다. 이후에 `CreditCard` 인스턴스에 대한 강한 참조도 존재하지 않기 때문에, 이 또한 할당 해제된다:


```swift
john = nil
// Prints "John Appleseed is being deinitialized"
// Prints "Card #1234567890123456 is being deinitialized"
```
 

위에 보이는 마지막 코드 스니펫은 `Customer` 인스턴스와 `CreditCard` 인스턴스의 소멸자가 `john` 변수가 `nil`로 설정된 이후 **"deinitialized"** 메세지를 출력하는 것을 보여준다.

> **Note**  
>  위의 예시는 _안전한_ 미소유 참조를 사용하는 법을 보여준다. 스위프트는 런타임 (성능 문제 등으로)안전 체크를 꺼야하는 상황에서 안전하지 않은 미소유 레퍼런스를 제공한다. 모든 안전하지 않은 작업과 마찬가지로, 이는 프로그래머가 해당 코드의 안정성을 체크해야 하는 책임이 있다.  
>   
> unowned(unsafe)로 작성하여 안전하지 않은 미소유 참조를 나타낼 수 있다. 만약 안전하지 않은 미소유 참조가 할당 해제된 인스턴스를 참조하고 있고, 이에 접근하려 하면 프로그램은 해당 인스턴스가 존재하던 메모리 위치에 접근하려 할 것이고, 이는 안전하지 않은 작업이 된다.

#### Unowned Optional References

클래스에 대한 옵셔널 참조를 미소유로 지정할 수 있다. ARC 소유권의 측면에서, 미소유 옵셔널 참조와 약한 참조를 같은 컨텍스트에서 사용할 수 있다. 차이점은 미소유 옵셔널 참조를 사용할 때는 항상 유효한 객체를 참조하거나 `nil`로 설정되어 있는지 확인해야 한다.

다음은 학교에서 특정 학과가 제공하는 코스들을 추적하는 예시이다:


```swift
class Department {
    var name: String
    var courses: [Course]
    init(name: String) {
        self.name = name
        self.courses = []
    }
}

class Course {
    var name: String
    unowned var department: Department
    unowned var nextCourse: Course?
    init(name: String, in department: Department) {
        self.name = name
        self.department = department
        self.nextCourse = nil
    }
}
```
 

`Department`는 해당 학과가 제공하는 각각의 코스에 대한 강한 참조를 유지한다. ARC 소유권 모델에서, 학과는 자신의 코스들을 소유한다. `Course`는 두 개의 미소유 참조를 가지고 있다. 하나는 학과에 대한 참조이고, 다른 하나는 학생이 수강해야할 다음 코스이다. 모든 코스는 학과의 일부분 이므로, `department` 프로퍼티는 옵셔널이 아니다. 하지만 일부 코스들은 추천되는 후속 코스가 존재하지 않으므로, `nextCourse` 프로퍼티는 옵셔널이다.

다음은 이 클래스들을 사용하는 예시이다:


```swift
let department = Department(name: "Horticulture")

let intro = Course(name: "Survey of Plants", in: department)
let intermediate = Course(name: "Growing Common Herbs", in: department)
let advanced = Course(name: "Caring for Tropical Plants", in: department)

intro.nextCourse = intermediate
intermediate.nextCourse = advanced
department.courses = [intro, intermediate, advanced]
```
 

위의 코드는 3개의 코스를 가지고 있는 학과를 생성한다. 초급과 중급 코스는 둘 다 추천되는 다음 코스가 각자의 `nextCourse` 프로퍼티에 저장되어 있다. `nextCourse` 프로퍼티는 학생들이 코스를 완료하면 다음에 수강해야 할 코스에 대한 미소유 옵셔널 참조를 유지한다.

![](/images/the-swift-programming-language-51-automatic-reference-counting-2/image-007.png)

미소유 옵셔널 참조는 자신이 래핑하는 클래스 인스턴스를 강하게 붙잡지 않고, ARC가 해당 인스턴스를 할당 해제하는 것을 방지하지 않는다. 이는 미소유 옵셔널 참조가 `nil`이 될 수 있다는 것을 제외하고는 미소유 참조가 ARC에서 행동과 동일하다.

논 옵셔널 미소유 참조처럼, `nextCourse`는 항상 할당 해제되지 않은 코스를 참조해야 한다는 것을 보장할 책임이 프로그래머에게 있다. 이 경우에서는, `department.courses`에서 코스를 삭제했을 때, 다른 코스에 있는 삭제된 코스에 대한 참조 또한 삭제해야 한다.

> **Note**  
>  옵셔널 값의 실제 타입은 스위프트의 표준 라이브러리에 있는 열거형인 **Optional** 이다. 하지만 옵셔널은 값 타입은 unowned로 지정될 수 없다는 규칙의 예외이다.  
>   
> 클래스를 래핑하는 옵셔널은 참조 카운팅을 사용하지 않으므로, 옵셔널에 강한 참조를 유지할 필요가 없다.

#### Unowned References and Implicitly Unwrapped Optional Properties

위의 약한 참조와 미소유 참조의 두 예시는 강한 참조 사이클을 깨뜨려야 하는 일반적인 시나리오를 다룬다.

`Person`과 `Apartment` 예시는 `nil`이 될 수 있는 두 프로퍼티가 강한 참조 사이클을 만들 수 있는 가능성이 있는 것을 보여준다. 이러한 상황은 약한 참조가 가장 잘 해결한다.

`Customer`와 `CreditCard` 예시는 하나의 프로퍼티가 `nil`이 될 수 있고, 다른 프로퍼티는 `nil`이 될 수 없는 상황이 강한 참조 사이클을 만들 수 있는 가능성이 있는 것을 보여준다. 이 상황은 미소유 참조가 가장 잘 해결한다.

하지만 세 번째 상황은 두 프로퍼티 모두 값을 가져야 하고, 어떠한 프로퍼티도 초기화가 완료되면 `nil`이 될 수 었다. 이 상황에서는 미소유 프로퍼티와 다른 클래스에 있는 암시적으로 언래핑된 옵셔널 프로퍼티를 결합하여 사용하는 것이 유용하다.

이는 한번 초기화가 완료되면, 참조 사이클을 회피하면서 두 프로퍼티가 서로 직접 연결(옵셔널 언래핑 없이) 되게 할 수 있다. 이 섹션은 이러한 관계를 설정하는 방법을 보여준다.

아래의 예시는 서로의 인스턴스를 프로퍼티로 저장하는 두 개의 클래스의 `Country`와 `City`를 정의한다. 이 데이터 모델에서, 모든 국가는 반드시 수도를 가져야 하고, 모든 도시는 반드시 국가에 포함되어야 한다. 이를 표현하기 위해, `Country`클래스는 `capitalCity` 프로퍼티를 가지고 있고, `City` 클래스는 `country` 프로퍼티를 가지고 있다:


```swift
class Country {
    let name: String
    var capitalCity: City!
    init(name: String, capitalName: String) {
        self.name = name
        self.capitalCity = City(name: capitalName, country: self)
    }
}

class City {
    let name: String
    unowned let country: Country
    init(name: String, country: Country) {
        self.name = name
        self.country = country
    }
}
```
 

두 클래스들 간의 상호 종속성을 설정하기 위해, `City`의 이니셜라이저는 `Country` 인스턴스를 받아 `country` 프로퍼티에 저장한다.

`City`의 이니셜라이저는 `Country`의 이니셜라이저 내부에서 호출된다. 하지만, **Two-Phase Initialization** 에서 소개된 것 처럼, `Country`의 이니셜라이저는 새 `Country` 인스턴스가 완전히 초기화 되기 전 까지 `City`의 이니셜라이저에 `self`를 전달할 수 없다.

이러한 요구사항에 대처하기 위해, `Country`의 `capitalCity` 프로퍼티를 암시적으로 언래핑된 옵셔널 프로퍼티로 선언하면 된다. 이는 `capitalCity` 프로퍼티가 디폴트 값으로 `nil`을 가지고 있는 것을 의미하지만, **Implicitly Unwrapped Optionals** 에서 설명한 것 처럼 언래핑 하지 않아도 값에 접근할 수 있다.

`capitalCity`가 디폴트 값으로 `nil` 값을 가지고 있기 때문에, 새 `Country` 인스턴스는 이니셜라이저가 `name` 프로퍼티를 초기화 하자마자 완전히 초기화 된 것으로 간주된다. 이는 `name` 프로퍼티가 설정 되자마자 `Country` 이니셜라이저가 암시적인 `self` 프로퍼티를 참조하고 전달할 수 있음을 의미한다. 따라서 `Country` 이니셜라이저는 `capitalCity`프로퍼티를 설정할 때, `self`를 `City` 이니셜라이저의 파라미터 중 하나로 전달 할 수 있다.

이 모든 것은 `Country`와 `City` 인스턴스를 강한 참조 사이클과 `capitalCity` 프로퍼티의 언래핑이 없어도, 단일 구문으로 생성할 수 있다는 것을 의미한다:


```swift
var country = Country(name: "Canada", capitalName: "Ottawa")
print("\(country.name)'s capital city is called \(country.capitalCity.name)")
// Prints "Canada's capital city is called Ottawa"
```
 

위의 예시에서, 암시적으로 언래핑된 옵셔널을 사용하는것은 모든 2페이즈 클래스 이니셜라이저의 요구사항이 만족되었다는 것을 의미한다. 초기화가 완료되면, 강한 참조 사이클을 회피하면서도 `capitalCity` 프로퍼티를 논 옵셔널 값처럼 접근할 수 있게 된다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
