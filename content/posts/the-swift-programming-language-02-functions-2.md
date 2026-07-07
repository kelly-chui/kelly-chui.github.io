---
title: "The Swift Programming Language. Functions (2)"
date: 2023-05-26
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Functions"]
weight: 2

draft: false
original: "https://junmusu.tistory.com/71"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Function Argument Labels and Parameter Names

함수의 파라미터들은 각각 아규먼트 레이블(Argument Labels)과 파라미터 이름(Parameter Names)을 가지고 있다. 아규먼트 레이블은 함수를 호출할 때 인자와 함께 사용되며, 파라미터 이름은 함수를 구현할 때 사용한다. 기본적으로, 파라미터 이름이 인자 레이블이 된다.


```swift
func someFunction(firstParameterName: Int, secondParameterName: Int) {
    // In the function body, firstParameterName and secondParameterName
    // refer to the argument values for the first and second parameters.
}
someFunction(firstParameterName: 1, secondParameterName: 2)
```
 

모든 파라미터들은 고유한 이름을 가져야 한다. 여러 개의 파라미터들이 같은 아규먼트 레이블을 가질 수도 있지만, 고유한 아규먼트 레이블을 사용하면 코드의 가독성이 증가한다.

#### Specifying Argument Labels

아규먼트 레이블은 파라미터 이름 뒤에 한칸 공백을 두고 적는다.


```swift
func greet(person: String, from hometown: String) -> String {
    return "Hello \(person)!  Glad you could visit from \(hometown)."
}
print(greet(person: "Bill", from: "Cupertino"))
// Prints "Hello Bill!  Glad you could visit from Cupertino.
```
 

아규먼트 레이블을 사용함으로써 함수의 가독성과 의도를 해치지 않고도 더 표현적이고, 실제 문장처럼 만들 수 있다.

#### Omitting Argument Labels

아규먼트 레이블로 _을 적어서 생략 할 수 있다.


```swift
func someFunction(_ firstParameterName: Int, secondParameterName: Int) {
    // In the function body, firstParameterName and secondParameterName
    // refer to the argument values for the first and second parameters.
}
someFunction(1, secondParameterName: 2)
```
 

파라미터에 아규먼트 레이블이 있다면 함수를 호출할때 _반드시_ 아규먼트 레이블을 적어줘야한다.

#### Default Parameter Values

함수의 파라미터에 _디폴트 값_ 을 할당할 수 있고, 이러한 디폴트 값이 할당된 파라미터는 함수를 호출할 때 생략할 수도 있다.


```swift
func someFunction(parameterWithoutDefault: Int, parameterWithDefault: Int = 12) {
    // If you omit the second argument when calling this function, then
    // the value of parameterWithDefault is 12 inside the function body.
}
someFunction(parameterWithoutDefault: 3, parameterWithDefault: 6) // parameterWithDefault is 6
someFunction(parameterWithoutDefault: 4) // parameterWithDefault is 12
```
 

디폴트 값이 없는 파라미터를 함수의 파라미터 목록의 앞부분에 배치하는 것이 좋다.

#### Variadic Parameters

가변 파라미터는 특정된 타입에서 0개 이상의 다양한 수의 값들을 받아들인다. 가변 파라미터는 파라미터의 타입명 뒤에 ...을 작성하여 쓸 수 있다.

가변 파라미터로 들어온 값들은 함수 내부에서 배열로 접근할 수 있다. 예를 들면 Double... 타입을 가진 가변 파라미터 numbers는 함수에서 numbers라는 Double 타입 배열로 사용할 수 있다.


```swift
func arithmeticMean(_ numbers: Double...) -> Double {
    var total: Double = 0
    for number in numbers {
        total += number
    }
    return total / Double(numbers.count)
}
arithmeticMean(1, 2, 3, 4, 5)
// returns 3.0, which is the arithmetic mean of these five numbers
arithmeticMean(3, 8.25, 18.75)
// returns 10.0, which is the arithmetic mean of these three numbers
```
 

함수는 여러개의 가변 파라미터를 받을 수 있다. 단 들어오는 값이 가변 파라미터에 들어가야 하는지, 혹은 그 이후에 있는 파라미터에 들어가야 하는지 모호성을 없애기 위해 가변 파라미터 바로 뒤에 오는 파라미터는 반드시 아규먼트 레이블이 있어야 한다.

#### In-Out Parameters

함수의 파라미터들은 기본적으로 상수이기 때문에 함수 내부에서 이 값을 변화시키려고 하면 컴파일 타임 에러가 발생한다. 만약 파라미터의 값을 변경하고, 함수가 종료된 이후에도 계속 변경된 상태를 유지하고 싶다면 in-out 파라미터를 사용해야 한다.

in-out 파라미터를 작성하려면 inout 키워드를 파라미터의 타입 뒤에 작성하면 된다. in-out 파라미터에 아규먼트를 넘겨줄 때는 변수명 앞에 &를 붙여준다.

상수나 리터럴은 수정이 불가능 하기 때문에, in-out 파라미터에 아규먼트로 넘겨줄 수 없다. 

> **Note**  
>  in-out 파라미터는 디폴트 값을 가질 수 없고, 가변 파라미터가 될 수도 없다.

두개의 정수 in-out 파라미터를 받는 함수 swapTwoInt(_:_:)의 예시이다.


```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```
 

이 함수는 a와 b의 값을 서로 스왑한다. 


```swift
var someInt = 3
var anotherInt = 107
swapTwoInts(&someInt, &anotherInt)
print("someInt is now \(someInt), and anotherInt is now \(anotherInt)")
// Prints "someInt is now 107, and anotherInt is now 3
```
 

위의 예시들은 함수 swapTwoInt(_:_:)가 함수 밖에서 선언된 변수들인 someInt와 anotherInt의 원래 가지고 있던 값(Original value)를 변경한 것을 보여준다.

> 이 글은 Apple의 [『The Swift Programming Language』](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
