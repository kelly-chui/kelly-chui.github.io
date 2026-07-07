---
title: "The Swift Programming Language. Subscripts (1)"
date: 2023-06-07
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Subscripts"]
weight: 16

draft: false
original: "https://junmusu.tistory.com/86"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Subscripts

클래스, 스트럭처, 열거형은 컬렉션, 리스트, 시퀀스에서 요소에 접근할 때 사용하는 서브스크립트를 정의할 수 있다. 서브스크립트는 별도의 메소드 없이 인덱스로 값을 설정하거나 검색할 수 있다. 예를 들면, 배열 인스턴스에서 요소에 접근할 때, someArray[index]와 같이 사용하고, 딕셔너리에서 someDictionary[key]처럼 사용하는 것이 서브스크립트다.

하나의 타입에 여러 개의 서브스크립트를 정의할 수 있다. 이러한 경우에는 서브스크립트에 전달되는 인덱스의 타입에 따라 적절한 서브스크립트가 선택된다. 또한 서브스크립트는 단일 차원으로 한정되지 않고, 다수의 파라미터를 받는 서브스크립트를 정의할 수 있다.

### Subscript Syntax

서브스크립트 구문은 인스턴스 메소드 구문과 컴퓨티드 프로퍼티 구문과 비슷하다. 인스턴스 메소드와 비슷하게 subscript 키워드를 사용하여 서브스크립트의 정의에 하나 이상의 파라미터와 리턴 타입을 작성한다. 인스턴스 메소드와 다른 점은 서브스크립트는 read-write나 read-only만 가능하다. 이 동작은 컴퓨티드 프로퍼티처럼 getter와 setter에 의해 수행된다.


```swift
subscript(index: Int) -> Int {
    get {
        // Return an appropriate subscript value here.
    }
    set(newValue) {
        // Perform a suitable setting action here.
    }
}
```
 

newValue의 타입은 리턴 값의 타입과 같다. 컴퓨티드 프로퍼티와 마찬가지로 setter의 파라미터를 따로 설정하지 않는다면, 디폴트 파라미터로 newValue가 제공된다.

read-only 컴퓨티드 프로퍼티처럼 read-only 서브스크립트도 get 키워드를 제거하여 간단하게 선언할 수 있다.


```swift
subscript(index: Int) -> Int {
    // Return an appropriate subscript value here.
}
```
 

다음은 read-only 서브스크립트 구현의 예시이다.


```swift
struct TimesTable {
    let multiplier: Int
    subscript(index: Int) -> Int {
        return multiplier * index
    }
}
let threeTimesTable = TimesTable(multiplier: 3)
print("six times three is \(threeTimesTable[6])")
// Prints "six times three is 18"
```
 

이 예시에서 TimeTable의 새 인스턴스는 3배 테이블을 나타내기 위해 생성된다. 

threeTimeTable[6]에서 보여지는 것 처럼, threeTimeTable 인스턴스를 서브스크립트를 호출하여 쿼리할 수 있다.

### Subscript Usage

서브스크립트의 정확한 의미는 단어가 쓰이는 문맥에 따라 다르다. 서브스크립트는 일반적으로 컬렉션, 리스트, 시퀀스의 요소에 접근할 때 사용되지만, 특정 클래스나 스트럭처의 기능에 따라 적합한 방식으로 자유롭게 서브스크립트를 구현할 수 있다.

예를 들어, 딕셔너리 타입의 서브스크립트는 Dictionary 인스턴스에 저장되어 있는 값을 검색하거나 설정하도록 구현되어 있다.


```swift
var numberOfLegs = ["spider": 8, "ant": 6, "cat": 4]
numberOfLegs["bird"] = 2
```
 

위의 예시는 numberOfLegs라는 변수를 정의하고 3개의 키-값 쌍을 포함하는 딕셔너리 리터럴로 초기화 한다. numberOfLegs 딕셔너리의 타입은 [String: Int]로 추론된다. 또한 딕셔너리를 생성한 이후에 서브스크립트를 사용하여 키로 "bird" 값으로 정수 2를 딕셔너리에 추가한다.

> 이 글은 Apple의 [The Swift Programming Language](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
