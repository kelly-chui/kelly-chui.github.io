---
title: "The Swift Programming Language. Optional Chaining (1)"
date: 2023-06-19

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Optional Chaining

weight: 25

draft: false
original: "https://junmusu.tistory.com/99"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Optional Chaining

옵셔널 체이닝은 nil일 수도 있는 프로퍼티, 메소드, 서브스크립트를 호출하고 쿼리하는 프로세스이다. 만약 옵셔널에 값이 있다면, 프로퍼티, 메소드, 서브스크립트 호출은 성공하고, nil이라면 프로퍼티, 메소드, 서브스크립트 호출은 nil을 리턴한다. 다수의 쿼리를 하나의 체인으로 엮을 수 있으며, 그중 하나라도 nil값을 가진다면 전체적인 체인은 안전하게 실패한다.

### Optional Chaining as an Alternative to Forced Unwrapping

호출하고자 하는 프로퍼티, 메소드, 서브스크립트가 nil이 아니라면, 옵셔널 값 뒤에 물음표(?)를 붙여 옵셔널 체이닝을 특정할 수 있다. 이것은 옵셔널 값 뒤에 느낌표(!)를 붙여 강제 언래핑을 하는 것과 매우 비슷하다. 가장 큰 차이점은, 옵셔널 체이닝은 만약 옵셔널이 nil이라면 안전하게 실패하고, 강제 언래핑은 옵셔널이 nil이면 런타임 에러를 발생시킨다.

옵셔널 체이닝이 nil값을 호출할 수도 있다는 사실을 반영하기 위해, 옵셔널 체이닝의 결과는 쿼리한 프로퍼티, 메소드, 서브스크립트가 옵셔널 값이 아니더라도 옵셔널 값으로 리턴한다. 리턴된 옵셔널 값을 체크해서 옵셔널 체이닝 호출이 성공했는지 확인할 수 있다(리턴된 옵셔널이 값을 가지고 있을 때), 혹은 체인 내부에 nil 값이 있다면 성공하지 못한다.(리턴된 옵셔널 값이 nil일 때).

옵셔널 체이닝 호출의 결과는 예상하는 타입이 옵셔널로 래핑된 값이 나온다. 일반적으로 Int를 리턴하는 프로퍼티는 옵셔널 체이닝을 통해 접근했을 때, Int?를 리턴할 것이다.

다음의 코드들은 옵셔널 체이닝이 강제 언래핑과 어떻게 다르고, 성공여부를 확인하는 방법을 보여준다.

우선, 두 개의 클래스 Person과 Residence를 정의한다.


```swift
class Person {
    var residence: Residence?
}

class Residence {
    var numberOfRooms = 1
}
```
 

Residence의 인스턴스는 Int 타입 프로퍼티 numberOfRooms 하나를 가지고 있고, Person의 인스턴스는 Residence? 타입 프로퍼티 residence를 가지고 있다.

Person의 새 인스턴스를 만들면, residence 프로퍼티는 옵셔널 값이기 때문에 기본적으로 nil로 초기화된다. 아래의 코드에서 john의 residence 프로퍼티의 값은 nil이다.


```swift
let john = Person()
let roomCount = john.residence!.numberOfRooms
// this triggers a runtime error
```
 

john의 residence에 접근하기 위해 강제 언래핑을 하면, residence가 nil이기 때문에 런타임 에러를 발생시킨다.

위의 코드는 residence가 실제 값을 가진 옵셔널 값일 때 성공하지만, residence가 nil인 경우에는 항상 런타임 에러를 발생신킨다. 

옵셔널 체이닝은 numberOfRooms에 접근하는 대안적인 방법을 제시한다. 옵셔널 체이닝을 사용하기 위해서는, 느낌표가 있는 부분에 물음표를 쓰면 된다.


```swift
if let roomCount = john.residence?.numberOfRooms {
    print("John's residence has \(roomCount) room(s).")
} else {
    print("Unable to retrieve the number of rooms.")
}
// Prints "Unable to retrieve the number of rooms."
```
 

위 코드는 스위프트가 옵셔널 residence 프로퍼티를 '체인'하고 residence가 존재하는 경우에, numberOfRooms의 값에 접근하게 한다.

numberOfRooms에 접근하는 것은 실패 가능성을 가지고 있기 때문에, 옵셔널 체이닝은 Int?(또는 optional Int) 타입으로 리턴을 시도한다. 위의 예시처럼 residence가 nil일 때는, numberOfRooms에 접근 불가능한 것을 나타내기 위해 이 optional Int는 nil이 된다. optional Int는 옵셔널 바이닝을 통해 언래핑 되어, roomCount 상수에 할당된다.

numberOfRooms가 옵셔널이 아닌 Int 타입이어도 이게 된다는 사실을 알아두자. 옵셔널 체이닝을 통해 쿼리한다는 사실은 numberOfRooms가 항상 Int 타입이 아닌 Int? 타입으로 리턴 된다는 것을 뜻한다.

john.residence에 Residence 인스턴스를 할당하여, 더이상 nil이 아니게 할 수 있다.


```swift
john.residence = Residence()
if let roomCount = john.residence?.numberOfRooms {
    print("John's residence has \(roomCount) room(s).")
} else {
    print("Unable to retrieve the number of rooms.")
}
// Prints "John's residence has 1 room(s)."
```
 

john.residence는 이제 실제 Residence 인스턴스 값을 가지고 있다. 만약 numberOfRooms를 전과 같은 방식으로 옵셔널체이닝으로 접근하면, 실제 값을 포함하는 Int?를 리턴한다.

### Defining Model Calsses for Optional Chaining

옵셔널 체이닝은 1레벨 보다 깊은 프로퍼티, 메소드, 서브스크립트를 부르는데 사용한다. 이러한 용법은 서로 복잡하게 얽혀있는 모델에서 서브프로퍼티로 내려갈 수 있게 해주고, 그 서브프로퍼티의 프로퍼티, 메소드, 서브스크립트에 접근할 수 있는지 확인할 수 있게 해준다.

아래의 코드들은 멀티레벨 옵셔널 체이닝을 포함하여, 앞으로 나올 예시들에서 사용할 네 개의 클래스 모델들을 정의한다. 이 클래스들은 위에 나온 Person 과 Residence 모델을 연관된 프로퍼티, 메소드, 서브스크립트와 함께 Room과 Address를 추가하여 확장한다.

Person 클래스는 전과 동일하게 정의한다.


```swift
class Person {
    var residence: Residence?
}
```
 

Residence 클래스는 전보다 조금 더 복잡해졌다. 이번에는 Residence 클래스는 [Room] 타입 변수 프로퍼티 rooms를 정의한다.


```swift
class Residence {
    var rooms: [Room] = []
    var numberOfRooms: Int {
        return rooms.count
    }
    subscript(i: Int) -> Room {
        get {
            return rooms[i]
        }
        set {
            rooms[i] = newValue
        }
    }
    func printNumberOfRooms() {
        print("The number of rooms is \(numberOfRooms)")
    }
    var address: Address?
}
```
 

이 버전의 Residence는 Room 인스턴스를 요소로 가진 배열을 가지고 있기 떄문에, numbersOfRoom 프로퍼티는 컴퓨티드 프로퍼티로 구현된다.

이 rooms 배열에 쉽게 접근하기 위해, rooms 배열에 들어온 인덱스를 통해 접근할 수 있는 read-write 서브스크립트를 제공한다.

또한 printNumberOfRooms라는 메소드를 제공한다. 이 메소드는 단순히 방의 개수를 출력한다.

마지막으로 Residence는 address라는 Address? 타입의 프로퍼티를 정의한다. Address 클래스는 아래에서 정의한다. 

rooms 배열에서 사용되는 Room 클래스는 프로퍼티 name 하나와, 이니셜라이저 하나를 가지고 있는 간단한 클래스이다.


```swift
class Room {
    let name: String
    init(name: String) { self.name = name }
}
```
 

이 모델의 마지막 클래스는 Address이다. 이 클래스는 세개의 String? 타입 옵셔널 프로퍼티를 가지고 있다. 처음 두 개의 프로퍼티 buildingName과 buildingNumber는 특정 빌딩을 주소의 일부로 식별하는 대안적인 방법이다. 세 번째 프로퍼티 street는 주소에서 쓰일 도로의 이름이다.


```swift
class Address {
    var buildingName: String?
    var buildingNumber: String?
    var street: String?
    func buildingIdentifier() -> String? {
        if let buildingNumber = buildingNumber, let street = street {
            return "\(buildingNumber) \(street)"
        } else if buildingName != nil {
            return buildingName
        } else {
            return nil
        }
    }
}
```
 

또한 Address 클래스는 String? 타입을 리턴하는 메소드 buildingIndentifier()를 제공한다. 이 메소드는 프로퍼티들을 확인하여 값을 가지고 있다면 리턴한다.

### Accessing Properties Through Optional Chaining

옵셔널 체이닝을 사용하여 옵셔널 값인 프로퍼티에 접근할 수 있으며, 그 접근이 성공했는지 확인할 수 있다.

아래의 코드는 위에서 선언한 새로운 Person 클래스의 인스턴스를 만든 후 이전과 같이 numberOfRooms 프로퍼티에 접근을 시도한다.


```swift
let john = Person()
if let roomCount = john.residence?.numberOfRooms {
    print("John's residence has \(roomCount) room(s).")
} else {
    print("Unable to retrieve the number of rooms.")
}
// Prints "Unable to retrieve the number of rooms."
```
 

john.residence가 nil이기 때문에, 이 옵셔널 체이닝 호출은 이전과 같이 실패한다.

옵셔널 체이닝을 통하여 프로퍼티의 값 설정을 시도할 수 있다.


```swift
let someAddress = Address()
someAddress.buildingNumber = "29"
someAddress.street = "Acacia Road"
john.residence?.address = someAddress
```
 

이 예시에서, john.residence의 address 프로퍼티를 설정하려는 시도는 john.residence가 nil이기 때문에 실패한다.

할당은 옵셔널 체이닝의 일부이기 때문에, = 연산자 우측 항은 evaluate 되지 않는다. 이전의 예시에서 상수에 접근하는 것은 사이드 이펙트를 야기하지 않기 때문에, someAddress가 절대 evaluate 되지 않는다는 사실을 발견하기는 어렵니다. 아래의 코드는 동일한 할당을 진행하지만, address를 만들기 위해 함수를 사용한다. 이 함수는 값을 리턴하기 전에 = 연산자의 우측 항이 evaluate 되었다는 사실을 보여주기 위해 "Function was called"를 출력한다.


```swift
func createAddress() -> Address {
    print("Function was called.")


    let someAddress = Address()
    someAddress.buildingNumber = "29"
    someAddress.street = "Acacia Road"


    return someAddress
}
john.residence?.address = createAddress()
```
 

이 코드를 실행하면 아무것도 출력되지 않기 때문에, createAddress() 함수가 호출되지 않았음을 알 수 있다.

### Calling Method Through Optional Chaining

옵셔널 값의 메소드를 호출하고, 호출이 성공적이었는지 확인할 때도 옵셔널 체이닝을 사용할 수 있다. 심지어 메소드가 리턴 값이 정의되지 않았을 때도 사용 가능하다.

Residence 클래스의 printNumberOfRooms() 메소드는 numberOfRooms의 현재 값을 출력한다. 


```swift
func printNumberOfRooms() {
    print("The number of rooms is \(numberOfRooms)")
}
```
 

이 메소드는 리턴 타입을 특정하지 않았지만, 리턴 타입이 없는 함수나 메소드는 암시적으로 Void 타입의 리턴 타입을 가지고 있다. 이러한 사실은 그러한 함수나 메소드가 빈 튜플을 리턴하는 것을 뜻한다.

옵셔널 값에 있는 이러한 메소드들을 옵셔널 체이닝으로 호출하면, 메소드의 리턴 타입은 Void가 아닌 Void?가 된다. 따라서 printNumberOfRooms() 메소드가 리턴 타입이 정의되어 있지 았더라도, 이 메소드를 호출할 수 있는지의 여부를 if 문을 통하여 확인할 수 있다. 따라서 printNumberOfRooms가 리턴한 값을 nil과 비교하여 메소드 호출이 성공했는지 확인할 수 있다.


```swift
if john.residence?.printNumberOfRooms() != nil {
    print("It was possible to print the number of rooms.")
} else {
    print("It was not possible to print the number of rooms.")
}
// Prints "It was not possible to print the number of rooms."
```
 

옵셔널 체이닝을 통하여 프로퍼티를 설정하려고 할 때도 같다. 위 **Accessing Properties Through Optional Chaining** 에 나온 예시는 residence의 값이 nil인데도, john.residence의 address 값을 설정하려고 시도한다. 옵셔널 체이닝을 통해 프로퍼티의 값을 설정하려는 모든 시도는 Void? 타입을 리턴한다. 이를 통해 프로퍼티가 성공적으로 설정되었는지 확인할 수 있다.


```swift
if (john.residence?.address = someAddress) != nil {
    print("It was possible to set the address.")
} else {
    print("It was not possible to set the address.")
}
// Prints "It was not possible to set the address."
```
 

### Accessing Subscripts Through Optional Chaining

옵셔널 체이닝을 통해 옵셔널 값에 있는 서브스크립트로 값을 검색하고 설정하고, 서브스크립트 호출이 성공했는지를 확인할 수도 있다.

> **Note**  
>  옵셔널 체이닝을 통해 옵셔널 값에 있는 서브스크립트에 접근할때, 서브스크립트의 괄호 뒤가 아닌 앞에 물음표를 작성해야 한다. 항상 옵셔널 체이닝의 물음표는 옵셔널인 표현식의 바로 뒤에 온다.

아래의 예시는 Residence 클래스에 정의되어 있는 서브스크립트를 통해 john.residence 프로퍼티의 rooms 배열의 첫 번째 방의 이름을 검색하려고 시도한다. john.residence가 현재 nil이기 때문에, 서브스크립트 호출은 실패하게 된다.


```swift
if let firstRoomName = john.residence?[0].name {
    print("The first room name is \(firstRoomName).")
} else {
    print("Unable to retrieve the first room name.")
}
// Prints "Unable to retrieve the first room name."
```
 

옵셔널 체이닝에서 사용하는 물음표는 john.residence 바로 뒤, 즉 서브스크립트 괄호 앞에 온다. 이유는 john.residence가 옵셔널 체이닝을 시도하는 옵셔널 값이기 때문이다.

비슷하게 서브스크립트를 통해서 새로운 값으로 설정하는 것도 시도할 수 있다.


```swift
john.residence?[0] = Room(name: "Bathroom")
```
 

residence가 현재 nil이기 때문에, 이러한 시도는 실패하게 된다.

rooms 배열에 하나 이상의 Room 인스턴스가 들어있도록, Residence의 인스턴스를 생성하고, john.residence에 할당하면 옵셔널 체이닝을 통해 Residence 서브스크립트로 rooms 배열에 들어있는 실제 요소에 접근할 수 있게 된다.


```swift
let johnsHouse = Residence()
johnsHouse.rooms.append(Room(name: "Living Room"))
johnsHouse.rooms.append(Room(name: "Kitchen"))
john.residence = johnsHouse


if let firstRoomName = john.residence?[0].name {
    print("The first room name is \(firstRoomName).")
} else {
    print("Unable to retrieve the first room name.")
}
// Prints "The first room name is Living Room."
```
 

#### Accessing Subscripts of Optional Type

서브스크립트가 딕셔너리처럼 옵셔널 타입의 값을 리턴한다면, 서브스크립트 괄호 뒤에 물음표를 배치한다.


```swift
var testScores = ["Dave": [86, 82, 84], "Bev": [79, 94, 81]]
testScores["Dave"]?[0] = 91
testScores["Bev"]?[0] += 1
testScores["Brian"]?[0] = 72
// the "Dave" array is now [91, 82, 84] and the "Bev" array is now [80, 94, 81]
```
 

위의 예시는 testScores라는 딕셔너리를 정의한다. 이 예시는 옵셔널 체이닝을 사용해 "Dave" 배열에 들어있는 첫 번째 원소를 91로 바꾸고, "Bev" 배열의 첫 번째 원소의 값을 1 증가시키고, "Brain" 배열의 첫 번째 원소의 값을 72로 설정하려 한다. 앞의 두 개의 호출은 성공하지만, testScores 딕셔너리는 "Dave"와 "Bev" key만 가지고 있기 떄문에, 세 번째 호출은 실패한다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
