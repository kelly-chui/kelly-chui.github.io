---
title: "[Swift] Optional Chaining(옵셔널 체이닝) - 2"
date: 2023-06-20
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Optional Chaining"]
weight: 26

draft: false
original: "https://junmusu.tistory.com/101"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Linking Multiple Levels of Chaining

다중 레벨의 옵셔널 체이닝을 서로 연결하여 모델 내부의 프로퍼티, 메소드, 서브스크립트로 깊게 내려갈 수 있다. 하지만 다중 레벨 옵셔널 체이닝은 리턴된 값에 옵셔널 단계를 증가시키지 않는다.(주: 옵셔널 체이닝을 하면 항상 옵셔널 값이 리턴되는데, 옵셔널 체이닝 여러개를 합친다 해서 이중 옵셔널, 삼중 옵셔널이 되지 않는다는 뜻)

다른말로 설명하자면:

  - 옵셔널이 아닌 값을 검색하려고 시도하면, 옵셔널 체이닝 때문에 옵셔널 값이 된다.
  - 옵셔널 값을 검색하려고 시도하면, 체이닝 때문에 옵셔널이 추가되지 않는다.



그러므로:

  - Int 타입 값을 옵셔널 체이닝을 통해 검색하면 옵셔널 체이닝의 레벨에 영향을 받지 않고 항상 Int? 가 리턴된다.
  - 비슷하게 Int? 타입 값을 옵셔널 체이닝을 통해 검색해도, 체이닝의 레벨에 영향을 받지 않고 항상 Int? 가 리턴된다.



아래의 예시는 john의 residence 프로퍼티의 address 프로퍼티의 street 프로퍼티에 접근하려고 시도한다. 이 때, 옵셔널 타입인 residence와 address를 통과하기 위해 2레벨의 옵셔널 체이닝이 사용된다, 


```swift
if let johnsStreet = john.residence?.address?.street {
    print("John's street name is \(johnsStreet).")
} else {
    print("Unable to retrieve the address.")
}
// Prints "Unable to retrieve the address."
```
 

john.residence의 값은 현재 유효한 Residence 인스턴스이다. 하지만 john.residence.address는 현재 nil이다. 따라서 john.residence?.address?.street를 호출하는 것은 실패한다.

위의 예시에서 street 프로퍼티 값을 검색하려고 한 것을 알아두자. 이 프로퍼티의 타입은 String? 이다. 2레벨의 옵셔널 체이닝을 적용시킨 john.residence?.address?.street의 리턴 값도 String?이다.

실제 Address의 인스턴스를 john.residence.address에 할당하고, adress의 street 프로퍼티에 실제 값을 설정한다면, street 프로퍼티의 값을 다중 옵셔널 체이닝을 통해 접근할 수 있다.


```swift
let johnsAddress = Address()
johnsAddress.buildingName = "The Larches"
johnsAddress.street = "Laurel Street"
john.residence?.address = johnsAddress


if let johnsStreet = john.residence?.address?.street {
    print("John's street name is \(johnsStreet).")
} else {
    print("Unable to retrieve the address.")
}
// Prints "John's street name is Laurel Street."
```
 

이 예시에서, john.residence의 adress를 설정하려는 시도는 john.residence가 유효한 Residence 인스턴스를 가지고 있기 때문에 성공한다. 

### Chaining on Methods with Optional Return Values

이전의 예시들은 옵셔널 타입의 프로퍼티에 옵셔널 체이닝을 통해 접근하는 방법을 보여줬다. 옵셔널 체이닝을 통해 옵셔널 타입에 있는 옵셔널 값을 리턴하는 메소드도 호출할 수 있으며, 리턴된 옵셔널 값도 필요한 경우 체인시킬 수 있다.

아래의 예시는 Address 클래스의 buildingIdentifier() 메소드를 옵셔널 체이닝을 통해 호출한다. 이 메소드는 String? 타입의 값을 리턴한다. 위에 묘사된 것처럼, 옵셔널 체이닝을 통해 호출한 이 메소드의 궁극적인 리턴 타입도 String?이다.


```swift
if let buildingIdentifier = john.residence?.address?.buildingIdentifier() {
    print("John's building identifier is \(buildingIdentifier).")
}
// Prints "John's building identifier is The Larches."
```
 

만약 메소드의 리턴 값에 옵셔널 체이닝을 수행하고 싶다면, 옵셔널 체이닝 물음표를 메소드의 괄호 뒤에 배치하면 된다.


```swift
if let beginsWithThe =
    john.residence?.address?.buildingIdentifier()?.hasPrefix("The") {
    if beginsWithThe {
        print("John's building identifier begins with \"The\".")
    } else {
        print("John's building identifier doesn't begin with \"The\".")
    }
}
// Prints "John's building identifier begins with "The"."
```
 

> **Note**  
>  위의 예시에서, 옵셔널 체이닝 물음표를 괄호 뒤에 했다. 체인할 옵셔널 값이 buildingIdentifier() 메소드 자체가 아니라, buildingIdentifier() 메소드의 리턴 타입이기 때문이다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
