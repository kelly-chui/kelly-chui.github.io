---
title: "The Swift Programming Language. Closures (1)"
date: 2023-05-28

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Closures

weight: 4

draft: false
original: "https://junmusu.tistory.com/73"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Closures

클로저는 코드 내부에서 전달되고 사용할 수 있는 독립적인 코드 블록이다. 클로저는 C, Objective-C의 블록이나 다른 언어들의 lambda와 유사하다.

클로저는 자신이 정의된 컨텍스트에 있는 상수나 변수의 참조를 캡처하고 저장할 수 있다. 이를 캡쳐한 상수나 변수에 대한 클로징 오버(closing over)라고 한다. 이 경우에 스위프트가 모든 메모리 관리를 해준다.

함수(Function)는 클로저의 특수한 케이스이며, 클로저는 다음과 같은 세가지 형태가 있다.

  - 어떠한 값도 캡처하지 않고, 이름이 있는 전역 함수
  - 자신을 둘러 싼 함수 내부의 값을 캡처하고, 이름이 있는 중첩 함수
  - 자신을 둘러싼 컨텍스트의 값을 캡처하고, 이름이 없는 클로저 표현식



일반적인 상황에서 다음과 같은 최적화를 통해서 클로저를 짧고 난잡하지 않게 만들 수 있다.

  - 컨텍스트에서 파라미터와 리턴 값 타입 추론
  - 단일 표현식 클로저에서의 암시적 리턴
  - 단축된 아규먼트 이름
  - 트레일링(Trailing) 클로저 구문



### Closure Expressions

중첩 함수는 큰 함수에서 코드 블록을 이름붙이고 정의하기에 편리하다. 하지만 함수 선언을 하지 않고 함수와 비슷한 코드 블록을 사용하는 것이 아규먼트로 함수가 전달되는 경우와 같을 때는 더 유용할 때가 있다.

클로저 표현식은 인라인 클로저를 짧고 확실한 구문으로 만드는 방법이다. 클로저 표현식은 구문의 의도나 명확성에 손실을 끼치지 않고 구문을 단축할 수 있는 여러가지 최적화 방법들이 있다. 아래의 예시들은 sorted(by:)함수를 어떻게 더 간결하게 만들 수 있는지 여러가지 최적화를 적용하여 각각의 예시로 보여준다.

#### The Sorted Method

스위프트의 표준 라이브러리는 sorted(by:)라는 정렬 메소드를 제공한다. 이 함수는 배열을 정렬하고 정렬된 배열을 리턴한다. 이 때 아규먼트로 들어간 배열은 변하지 않는다.

다음 배열을 알파벳 역순으로 정렬할 것이다.


```swift
let names = ["Chris", "Alex", "Ewa", "Barry", "Daniella"]
```
 

sorted(by:) 메소드는 '두 개의 같은 타입의 아규먼트를 받아 Bool 타입을 리턴하는' 클로저를 받는다. 이 클로저가 리턴하는 Bool 값은 배열이 정렬되었을 때, 첫 번째 파라미터가 두 번째 파라미터보다 먼저 나와야 한다면 true 반대의 경우에는 false를 가진다.

이 예시는 String 값들을 정렬할 것이다. 따라서 정렬 클로저는 (String, String) -> Bool의 함수 타입을 가져야 한다. 정렬 클로저를 sorted(by:) 메소드로 전달하는 한 가지 방법은 일반적인 함수를 작성하고 그 함수를 sorted(by:) 메소드의 아규먼트로 전달하면 된다.


```swift
func backward(_ s1: String, _ s2: String) -> Bool {
    return s1 > s2
}
var reversedNames = names.sorted(by: backward)
// reversedNames is equal to ["Ewa", "Daniella", "Chris", "Barry", "Alex"]
```
 

그러나 이러한 방법은 단일 표현 함수(a > b)를 쓰기엔 다소 장황한 방법이다. 따라서 이러한 예시에선 정렬 클로저를 클로저 표현식을 사용하여 인라인에 작성하는 것이 더 바람직하다.

#### Closure Expression Syntax

클로저 표현식 구문의 일반적인 형태는 다음과 같다.

> { (parameters) -> return type in  
>  statements  
> }

클로저 표현식 구문의 파라미터는 인아웃 파라미터나 가변 파라미터를 쓸 수도 있지만, 디폴트 값을 가져선 안된다. 튜플도 파라미터 타입이나 리턴 값 타입으로 이용할 수 있다.

아래의 예시는 위의 backward(_:_:) 함수를 클로저 표현식으로 작성한 것이다.


```swift
reversedNames = names.sorted(by: { (s1: String, s2: String) -> Bool in
    return s1 > s2
})
```
 

이 인라인 클로저의 파라미터 타입과 리턴 타입은 위의 backward(_:_:)함수와 동일하다. 두 경우 모두 (s1: String, s2: String) -> Bool로 작성되었다. 하지만 인라인 클로저 표현식의 경우 파라미터와 리턴 타입이 중괄호 외부가 아닌 내부에 작성된다.

in 키워드는 클로저의 파라미터와 리턴 타입의 정의가 완료되었고 클로저 본문이 시작된다는 것을 나타낸다. 또한 클로저 본문이 너무 짧은 경우엔 한 줄로도 작성할 수 있다.


```swift
reversedNames = names.sorted(by: { (s1: String, s2: String) -> Bool in return s1 > s2 } )
```
 

#### Inferring Type From Context

앞선 예시에서, 정렬 클로저가 메소드에 아규먼트로 전달되기 때문에, 스위프트가 정렬 클로저의 파라미터와 리턴 타입을 추론할 수 있다. String 배열에서 sorted(by:)메소드를 호출했기 때문에 sorted(by:)의 파라미터 타입은 (String, String) -> Bool일 것이다. 따라서 (String, String) 과 Bool 같은 타입들은 모두 추론 가능하기 때문에 클로저 표현식에 꼭 적을 필요가 없어진다. 또한 파라미터의 이름을 감싸고 있는 괄호와 리턴 화살표 (->)도 생략 가능해진다.


```swift
reversedNames = names.sorted(by: { s1, s2 in return s1 > s2 } )
```
 

함수나 메소드에 인라인 클로저 표현식으로 클로저를 전달 할때, 항상 파라미터 타입과 리턴 타입을 추론할 수 있다. 결과적으로 함수나 메소드의 아규먼트로 전달되는 인라인 클로저를 완전한 형태(파라미터 타입과 리턴 타입을 모두 작성한)로 작성할 일은 없다.

그래도 코드를 읽는 사람들이 느낄 모호함을 없애기 위해서 타입을 명시적으로 작성 할 수도 있다.

#### Implict Returns from Single-Expression Closures

단일 표현식 클로저(Single-Expression Closures)는 return 키워드를 생략 할 수 있다. 이를 적용하여 다시 예제를 작성하면 다음과 같다.


```swift
reversedNames = names.sorted(by: { s1, s2 in s1 > s2 } )
```
 

sorted(by:)메소드의 함수 타입 아규먼트는 Bool 값을 리턴해야하는 것이 명확하다. 클로저의 본문에는 (s1 > s2)의 단일 표현이 있으므로 Bool 값을 리턴하는것이 확실하다. 어떠한 모호성도 없으므로 return 키워드가 생략 가능하다.

#### Shorthand Argument Names

인라인 클로저는 `$0`, `$1`, `$2`... 꼴의 단축된 아규먼트 이름을 사용할 수 있다. 이러한 단축된 아규먼트 이름을 사용하면 클로저의 정의에서 파라미터 리스트를 생략 할 수 있게 된다. in 키워드 또한 생략 할 수 있는데, 단축된 아규먼트 이름을 사용하면, 클로저 표현식에 클로저의 본문밖에 남지 않기 때문이다.


```swift
reversedNames = names.sorted(by: { $0 > $1 } )
```
 

**Operator Methods**

위 보다 더 짧게 클로저 표현식을 작성하는 방법이 있다. 스위프트의 String 타입은 > 연산자를 두 개의 String 파라미터를 받아 Bool 타입을 리턴하는 메소드로 사용한다. 이는 정확하게 sorted(by:)메소드가 필요한 타입과 같으므로 단순히 > 연산자를 넣기만 하면 된다.


```swift
reversedNames = names.sorted(by: >)
```
 

#### Trailing Closures

함수의 마지막 아규먼트로 클로저 표현식을 전달하고, 그 클로저 표현식이 길 때는 트레일링(Trailing) 클로저를 쓰는게 유용할 수 있다. 트레일링 클로저는 아규먼트로 이용되지만 함수 호출 괄호() 뒤에 작성되며, 첫 번째 클로저 아규먼트 레이블을 작성하지 않는다.


```swift
func someFunctionThatTakesAClosure(closure: () -> Void) {
    // function body goes here
}

// Here's how you call this function without using a trailing closure:

someFunctionThatTakesAClosure(closure: {
    // closure's body goes here
})

// Here's how you call this function with a trailing closure instead:

someFunctionThatTakesAClosure() {
    // trailing closure's body goes here
}
```
 

또한 앞서 나온 String 배열 정렬의 예시에서도 sorted(by:) 메소드를 트레일링 클로저를 이용하여 작성할 수도 있다.


```swift
reversedNames = names.sorted() { $0 > $1 }
```
 

트레일링 클로저를 사용할 때, 함수나 메소드의 유일한 아규먼트가 클로저라면 괄호()또한 적을 필요가 없다.


```swift
reversedNames = names.sorted { $0 > $1 }
```
 

트레일링 클로저는 인라인 클로저가 한 줄로 작성하기 힘들만큼 충분히 길 때 매우 유용하다. 다음은 map(_:) 메소드와 트레일링 클로저를 사용하여 [16, 58, 510]의 Int 타입 배열로 ["OneSix", "FiveEight", "FiveOneZero"]의 String 타입 배열을 새로 만드는 예시이다.


```swift
let digitNames = [
    0: "Zero", 1: "One", 2: "Two",   3: "Three", 4: "Four",
    5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine"
]
let numbers = [16, 58, 510]
let strings = numbers.map { (number) -> String in
    var number = number
    var output = ""
    repeat {
        output = digitNames[number % 10]! + output
        number /= 10
    } while number > 0
    return output
}
```
 

map(_:) 메소드는 배열의 각 요소마다 한번씩 클로저 표현식을 호출한다. 따라서 배열 요소의 타입을 알고 있기 때문에 파라미터 number의 타입을 특정해주지 않아도 된다.(추론이 가능하다)

위 예시에서 트레일링 클로저를 이용함으로써 map(_:) 메소드 호출 괄호()안에 전체 클로저를 작성할 필요 없이 깔끔하게 클로저를 캡슐화 할 수 있다.

만약 함수가 여러개의 클로저를 받는다면 첫 번째 트레일링 클로저의 아규먼트 레이블을 생략 할 수 있지만, 나머지 클로저들의 레이블은 작성해줘야 한다. 다음은 포토 갤러리에서 사진을 가져오는 함수의 예시이다.


```swift
func loadPicture(from server: Server, completion: (Picture) -> Void, onFailure: () -> Void) {
    if let picture = download("photo.jpg", from: server) {
        completion(picture)
    } else {
        onFailure()
    }
}
```
 

이 함수를 호출 하려면 두개의 클로저를 전달해야 한다. 첫번째 클로저는 다운로드가 성공한 후에 이미지를 띄워주는 completion이고, 두 번째 클로저는 에러가 발생했을때 사용자들에게 에러를 보여주는 onFailure이다.


```swift
loadPicture(from: someServer) { picture in
    someView.currentPicture = picture
} onFailure: {
    print("Couldn't download the next picture.")
}
```
 

loadPicture(from:completion:onFailure:) 함수는 백그라운드에서 네트워크 작업을 실시하고 작업이 완료되면 두 개의 컴플리션 핸들러(Completion Handler)를 호출한다. 함수를 이런 방법으로 작성하면, 네트워크 오류를 처리하는 코드와 성공적으로 다운로드 후에 인터페이스를 업데이트 하는 코드를 깔끔하게 분리할 수 있다.

> 이 글은 Apple의 [『The Swift Programming Language』](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>)를 번역 및 재구성한 글입니다.  
> 원저작물은 [Creative Commons Attribution 4.0 International (CC BY 4.0)](<https://creativecommons.org/licenses/by/4.0/>) 라이선스를 따르며,  
> 저작권은 © 2014–2023 Apple Inc. and the Swift project authors에게 있습니다.
