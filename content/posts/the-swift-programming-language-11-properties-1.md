---
title: "[Swift] Properties(프로퍼티) - 1"
date: 2023-06-02
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Properties"]
weight: 11

draft: false
original: "https://junmusu.tistory.com/81"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Properties

프로퍼티는 특정 클래스, 스트럭처, 열거형에 값을 연관시킨다. 저장 프로퍼티는 변수나 상수의 값을 인스턴스의 일부로 저장하고, 컴퓨티드 프로퍼티는 값을 저장하기보다는 계산한다. 컴퓨티드 프로퍼티와 다르게, 저장 프로퍼티는 열거형에서 쓸 수 없다.

저장 프로퍼티와 컴퓨티드 프로퍼티는 인스턴스와 연결되는 반면, 다르게 타입 프로퍼티는 타입 그 자체에 연결된다.

추가로 프로퍼티 값의 변화를 모니터링 하고, 커스텀 액션으로 반응할 수 있는 프로퍼티 옵저버를 사용할 수도 있다. 프로퍼티 옵저버는 저장 프로퍼티에서 직접 정의하여 추가할 수 있으며, 서브클래스한태 상속된다.

### Stored Properties

가장 간단한 형태의 저장 프로퍼티는 클래스나 스트럭처 인스턴스의 일부로 저장되어있는 변수 혹은 상수이다. 

저장 프로퍼티는 디폴트 값을 가질 수 있고, 초기화 할 때 값을 할당해 줄 수도 있다(상수 프로퍼티도 초기화 할 때 값을 할당해 줄 수 있다.)


```swift
struct FixedLengthRange {
    var firstValue: Int
    let length: Int
}
var rangeOfThreeItems = FixedLengthRange(firstValue: 0, length: 3)
// the range represents integer values 0, 1, and 2
rangeOfThreeItems.firstValue = 6
// the range now represents integer values 6, 7, and 8
```
 

FixedLengthRange의 인스턴스는 변수 firstValue와 상수 length를 저장 프로퍼티로 가지고 있다. 위 예시에서 length는 새로운 인스턴스가 생성될 때, 초기화 되지만 상수이기 때문에 생성된 이후에는 값을 변경 할 수 없다.

#### Stored Properties of Constant Structure Instances

스트럭처의 인스턴스를 상수에 할당하면, 그 인스턴스의 프로퍼티가 변수라도 수정할 수 없다.


```swift
let rangeOfFourItems = FixedLengthRange(firstValue: 0, length: 4)
// this range represents integer values 0, 1, 2, and 3
rangeOfFourItems.firstValue = 6
// this will report an error, even though firstValue is a variable property
```
 

rangeOfFour가 상수로 선언되었기 떄문에, firstValue 프로퍼티의 값을 바꿀 수 없다.

스트럭처는 값 타입이기 때문에 인스턴스가 상수로 선언되면 그 인스턴스의 프로퍼티들은 모두 상수가 된다. 하지만 클래스는 레퍼런스 타입이므로, 인스턴스를 상수에 할당해도 변수 프로퍼티들을 변경 할 수 있다.

#### Lazy Stored Properties

지연 저장 프로퍼티(Lazy Stored Property)는 처음 사용될 때 까지 초기 값이 계산되지 않는 프로퍼티이다. 프로퍼티 선언 앞에 lazy를 붙임으로써 작성 할 수 있다.

> **Note**  
>  지연 프로퍼티는 반드시 변수로 선언되어야 한다. 인스턴스를 초기화 할 때, 지연 프로퍼티의 초기 값이 사용되지 않을 수 있다. 상수 프로퍼티는 초기화가 끝나기 전까지 값을 가지고 있어야 하므로, 지연 프로퍼티는 상수가 될 수 없다.

지연 프로퍼티는 인스턴스 초기화가 끝날 때까지 알 수 없는 외부 요인에 초기 값이 의존적인 경우나, 계산에 드는 비용이 많은 경우(computationally expensive)에 그 값이 필요할 때까지 계산하지 않도록 할 때 유용하다.

아래의 예시는 지연 저장 프로퍼티가 복잡한 클래스에 대한 초기화를 회피하는 것을 보여준다. 이 예시에서는 DataImporter와 DataManger라는 두 클래스를 정의한다.


```swift
class DataImporter {
    /*
    DataImporter is a class to import data from an external file.
    The class is assumed to take a nontrivial amount of time to initialize.
    */
    var filename = "data.txt"
    // the DataImporter class would provide data importing functionality here
}

class DataManager {
    lazy var importer = DataImporter()
    var data: [String] = []
    // the DataManager class would provide data management functionality here
}

let manager = DataManager()
manager.data.append("Some data")
manager.data.append("Some more data")
// the DataImporter instance for the importer property hasn't yet been created
```
 

DataManger 클래스는 data라는 문자열 배열 타입의 저장 프로퍼티를 가지고 있고, 이에 대한 접근과 관리를 담당한다.(위 예시에서 구현은 다 하지 않았다.)

DataManger의 기능중 하나는 DataImporter 클래스를 통해서 파일에서 데이터를 가져오는 것인데, DataImporter 클래스가 초기화 하는데 적지 않은 시간이 걸린다고 가정해보자.

DataManager는 파일에서 데이터를 가져오지 않아도, 이미 있는 데이터를 관리 하는게 가능하기 때문에 DataManager가 생성될 때 새로운 DataImporter 인스턴스를 생성하지 않고, DataImporter가 필요할 때 생성하는 것이 합리적이다.

lazy를 앞에 적었으므로 importer에 들어갈 DataImporter 인스턴스는 다음과 같이 importer 프로퍼티에 처음 접근 한 시점에 초기화 된다.


```swift
print(manager.importer.filename)
// the DataImporter instance for the importer property has now been created
// Prints "data.txt"
```
 

#### Stored Properties and Instance Variables

스위프트에서는 Objective-C의 인스턴스 변수 개념이 존재하지 않는다.

### Computed Properties

클래스, 스트럭처, 열거형은 저장 프로퍼티 외에도 컴퓨티드 프로퍼티(Computed Property)를 정의할 수 있다. 컴퓨티드 프로퍼티는 실제로 값을 저장하지 않고 다른 속성의 값을 계산하고 설정하는 getter와 setter를 제공한다.


```swift
struct Point {
    var x = 0.0, y = 0.0
}
struct Size {
    var width = 0.0, height = 0.0
}
struct Rect {
    var origin = Point()
    var size = Size()
    var center: Point {
        get {
            let centerX = origin.x + (size.width / 2)
            let centerY = origin.y + (size.height / 2)
            return Point(x: centerX, y: centerY)
        }
        set(newCenter) {
            origin.x = newCenter.x - (size.width / 2)
            origin.y = newCenter.y - (size.height / 2)
        }
    }
}
var square = Rect(origin: Point(x: 0.0, y: 0.0),
    size: Size(width: 10.0, height: 10.0))
let initialSquareCenter = square.center
// initialSquareCenter is at (5.0, 5.0)
square.center = Point(x: 15.0, y: 15.0)
print("square.origin is now at (\(square.origin.x), \(square.origin.y))")
// Prints "square.origin is now at (10.0, 10.0)"
```
 

이 예시에 있는 세가지 스트럭처의 쓰임은 다음과 같다.

  - Point 스트럭처는 한 점의 x, y 좌표값을 캡슐화 한다.
  - Size 스트럭처는 width와 height를 캡슐화 한다.
  - Rect 스트럭처는 시작점과 크기로 직사각형을 정의한다.



Rect 스트럭처는 Center라는 컴퓨티드 프로퍼티를 가지고 있다. Rect의 중앙점은 항상 origin과 size로 특정할 수 있기 때문에, 중앙점을 Point 타입으로 저장할 필요가 없다. 대신에 Rect는 컴퓨티드 프로퍼티 center에 getter와 setter를 정의하여 center가 실제 값을 저장하고 있는 것처럼 사용할 수 있다.

square의 center 프로퍼티가 호출되었을 때, getter가 중앙값을 계산하여 리턴하고, center 프로퍼티에 새로운 값을 설정했을 때, 그 값에 맞도록 setter가 origin 프로퍼티의 x와 y값을 수정한다.

#### Shorthand Setter Declaration

컴퓨티드 프로퍼티의 setter가 설정할 새 값의 이름을 정의하지 않으면, 디폴트 이름은 newValue가 사용된다. 아래 코드는 이 방법을 사용하여 다시 작성한 Rect 스트럭처이다.


```swift
struct AlternativeRect {
    var origin = Point()
    var size = Size()
    var center: Point {
        get {
            let centerX = origin.x + (size.width / 2)
            let centerY = origin.y + (size.height / 2)
            return Point(x: centerX, y: centerY)
        }
        set {
            origin.x = newValue.x - (size.width / 2)
            origin.y = newValue.y - (size.height / 2)
        }
    }
}
```
 

#### shorthand Getter Declaration

만약 getter의 본문이 단일 표현식으로 되어있다면, getter는 그 표현식을 암시적으로 리턴할 수 있다. 아래 코드는 이 방법을 사용한 것이다.


```swift
struct CompactRect {
    var origin = Point()
    var size = Size()
    var center: Point {
        get {
            Point(x: origin.x + (size.width / 2),
                  y: origin.y + (size.height / 2))
        }
        set {
            origin.x = newValue.x - (size.width / 2)
            origin.y = newValue.y - (size.height / 2)
        }
    }
}
```
 

getter가 return을 생략하는 것은 함수가 return을 생략하는 것과 똑같은 규칙을 따른다.

#### Read-Only Computed Properties

getter만 있고 setter가 없는 컴퓨티드 프로퍼티는 리드 온리 컴퓨티드 프로퍼티라고 한다. 리드 온리 컴퓨티드 프로퍼티는 닷(.)구문으로 접근 가능하고 값을 리턴하지만, 다른 값으로 설정할 수 없다.

> **Note**  
>  컴퓨티드 프로퍼티(리드 온리 포함)는 값이 고정되어 있지 않기 때문에 상수로 선언될 수 없고 반드시 변수로 선언해야 한다.

get 키워드와 중괄호를 사용하지 않으면, 더 단순하게 리드 온리 컴퓨티드 프로퍼티를 선언할 수 있다.


```swift
struct Cuboid {
    var width = 0.0, height = 0.0, depth = 0.0
    var volume: Double {
        return width * height * depth
    }
}
let fourByFiveByTwo = Cuboid(width: 4.0, height: 5.0, depth: 2.0)
print("the volume of fourByFiveByTwo is \(fourByFiveByTwo.volume)")
// Prints "the volume of fourByFiveByTwo is 40.0"
```
 

이 예시는 직육면체를 표현하기 위해 Cuboid라는 새로운 스트럭처를 정의한다. 이 스트럭처의 volume은 리드 온리 컴퓨티드 프로퍼티로 정의되어있다. volume에 setter가 있으면 width, height, depth 중 어떤 값을 변경시켜야 하는지 애매하기 때문이다. (특정 부피를 가진 직육면체가 몇개나 존재하는지 생각해보자)

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
