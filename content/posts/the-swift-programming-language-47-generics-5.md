---
title: "The Swift Programming Language. Generics (5)"
date: 2023-08-08
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Generics"]
weight: 47

draft: false
original: "https://junmusu.tistory.com/128"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Generic Where Clauses

타입 제약조건을 사용하면 제너럴 함수, 서브스크립트, 타입에 관련된 타입 파라미터의 요구사항을 정의할 수 있다.

이는 연관 타입의 제약 조건을 정의하는데에도 유용하며, 제네릭 where 절을 정의하여 할 수 있다. 제네릭 `where`절은 연관 타입이 반드시 특정 프로토콜을 준수하게 하거나, 특정한 타입 파라미터와 연관 타입이 반드시 같아야 함을 요구할 수 있다. 제네릭 `where`절은 `where` 키워드로 시작하고, 뒤에 연관 타입의 제약조건이나 타입 파라미터와 연관 타입의 동등 관계를 작성한다. 제네릭 where절은 타입이나 함수의 본문의 여는 중괄호 바로 앞에 작성한다.

아래의 예시는 두 개의 컨테이너 같은 요소들을 같은 순서로 저장하고 있는지를 체크하는 제네릭 함수 `allItemsMatch`를 정의한다. 이 함수는 만약 모든 요소들이 일치한다면 true를 리턴하고 그렇지 않다면 false를 리턴한다.

두 컨테이너가 같은 타입의 컨테이너인지 체크할 필요는 없다, 하지만 그들은 같은 타입의 요소를 저장하고 있어야 한다. 이 요구사항은 타입 제약조건과 제네릭 `where` 절의 조합으로 표현된다:


```swift
func allItemsMatch<C1: Container, C2: Container>
        (_ someContainer: C1, _ anotherContainer: C2) -> Bool
        where C1.Item == C2.Item, C1.Item: Equatable {

    // Check that both containers contain the same number of items.
    if someContainer.count != anotherContainer.count {
        return false
    }

    // Check each pair of items to see if they're equivalent.
    for i in 0..<someContainer.count {
        if someContainer[i] != anotherContainer[i] {
            return false
        }
    }

    // All items match, so return true.
    return true
}
```
 

이 함수는 `someContainer`와 `anotherContainer` 두 개의 아규먼트를 받는다. `someContainer` 아규먼트는 `C1` 타입이고, anotherContainer 아규먼트는 `C2` 타입이다. `C1`과 `C2`는 두 컨테이너의 타입을 위한 타입 파라미터이고, 함수가 호출될 때 결정된다.

다음의 요구사항은 함수의 두 타입 파라미들에 적용된다:

  - **C1** 은 반드시 **Container** 프로토콜을 준수해야 한다 (**C1: Container**).
  - **C2** 도 반드시 **Container** 프로토콜을 준수해야 한다 (**C2: Container**).
  - **C1** 의 **Item** 은 **C2** 의 **Item** 과 반드시 같아야 한다 (**C1.Item == C2.Item**).
  - **C1** 의 **Item** 은 반드시 **Equatable** 프로토콜을 준수해야 한다 (**C1.Item: Equatable**).



첫 번째와 두 번째 요구사항은 함수의 타입 파라미터 리스트에 정의되어 있다, 그리고 세 번째와 네 번째 요구사항은 함수의 제네릭 `where` 절에 정의되어 있다.

이 요구사항들은 다음을 뜻한다:

  - **someContainer** 는 타입 **C1** 의 컨테이너이다.
  - **anotherContainer** 는 타입 **C2** 의 컨테이너이다.
  - **someContainer** 와 **anotherContainer** 는 같은 타입의 요소를 포함해야 한다.
  - **someContainer** 의 요소들은 같지 않음 (**!=**) 연산자를 사용하여 서로 다른지 확인할 수 있어야 한다.



세 번째와 네 번째 요구사항이 결합되어 `anotherContainer`의 요소의 타입과 `someContainer`의 요소의 타입이 완벽하게 같기 때문에, `anotherContainer`의 요소도 `!=` 연산자로 체크할 수 있음을 알 수 있다.

이러한 요구사항들은 `allItemsMatch(_:_:)` 함수가 두 컨테이너가 서로 다른 컨테이너 타입이라도 비교할 수 있게 해준다.

`allItemsmatch(_:_:)` 함수는 두 컨테이너가 동일한 수의 요소를 가지고 있는지 확인하는것으로 시작한다. 만약 서로의 요소의 개수가 다르다면, 이 두 컨테이너가 일치할 방법이 존재하지 않으므로 함수는 false를 리턴한다.

이 체크를 마친 후에, 함수는 `someContainer`의 모든 요소를 `for-in` 루프와 반닫힌 구간 연산자 (`..<`)로 순회한다. 각 요소마다 함수는 `someContainer`의 요소가 `anotherContainer`의 대응하는 요소와 같지 않는지 체크한다. 만약 두 요소가 다르다면, 두 컨테이너는 일치하지 않는 것 이므로, 함수는 false를 리턴한다.

루프가 일치하지 않는 부분을 찾지 못하고 끝난다면, 두 컨테이너는 일치하는 것이므로 함수는 true를 리턴한다.

다음은 `allItemsMatch(_:_:)` 함수가 동작하는 것을 보여준다:


```swift
var stackOfStrings = Stack<String>()
stackOfStrings.push("uno")
stackOfStrings.push("dos")
stackOfStrings.push("tres")

var arrayOfStrings = ["uno", "dos", "tres"]

if allItemsMatch(stackOfStrings, arrayOfStrings) {
    print("All items match.")
} else {
    print("Not all items match.")
}
// Prints "All items match."
```
 

위의 예시는 `String` 값을 저장하는 `Stack` 인스턴스를 생성하고, 세 개의 문자열들을 스택에 push한다. 그리고 스택에 넣은 것과 같은 문자열들을 가진 배열 리터럴로 초기화된 `Array` 인스턴스를 생성한다. 스택과 배열은 서로 다른 타입이지만, 둘 모두 `Container` 프로토콜을 준수하고, 똑같은 타입의 값을 저장하고 있다. 따라서 `allItemsMatch(_:_:)` 함수를 이 두 컨테이너를 아규먼트로 하여 호출할 수 있다. 위의 예시에서 `allItemsMatch(_:_:)` 함수는 이 두 컨테이너가 일치한다고 정확한 결과를 보여준다.

### Extensions with a Generic Where Clause

익스텐션의 일부로도 제네릭 `where`절을 사용할 수있다. 아래의 예시는 이전 예시에 나왔던 제네릭 `Stack` 스트럭처를 `isTop(_:)` 메소드를 추가하여 확장한다.


```swift
extension Stack where Element: Equatable {
    func isTop(_ item: Element) -> Bool {
        guard let topItem = items.last else {
            return false
        }
        return topItem == item
    }
}
```
 

이 `isTop(_:)` 메소드는 우선 스택이 비어있지 않은지 체크한다. 그리고 주어진 요소가 스택의 top에 있는 요소와 비교한다. 만약 이 익스텐션을 제네릭 `where`절 없이 시도한다면 문제가 생기게 된다: `isTop(_:)`의 구현은 `==` 연산자를 사용하지만 `Stack`의 정의는 요소들이 동등성(equatable)을 가지도록 요구하지 않는다, 따라서 `==` 연산자를 이용하는 것은 컴파일 타임 에러를 발생시킨다. 제네릭 `where`절을 사용하는것은 새로운 익스텐션에 새로운 요구사항을 더하게 해준다. 따라서 이 익스텐션은 `stack`의 요소들이 동등성을 가질 때만 `isTop(_:)` 메소드를 추가한다.

다음은 `isTop(_:)` 메소드가 동작하는 것을 보여준다:


```swift
if stackOfStrings.isTop("tres") {
    print("Top element is tres.")
} else {
    print("Top element is something else.")
}
// Prints "Top element is tres."
```
 

원소들이 동등성이 없는 스택에서 `isTop(_:)` 메소드를 호출하면 컴파일 타임 에러가 발생하게 된다.


```swift
struct NotEquatable { }
var notEquatableStack = Stack<NotEquatable>()
let notEquatableValue = NotEquatable()
notEquatableStack.push(notEquatableValue)
notEquatableStack.isTop(notEquatableValue)  // Error
```
 

프로토콜을 확장할 때도 제네릭 where절을 사용할 수 있다. 아래의 예시는 이전 예시에 나온 Container 프로토콜에 startsWith(_:) 메소드를 추가한다.


```swift
extension Container where Item: Equatable {
    func startsWith(_ item: Item) -> Bool {
        return count >= 1 && self[0] == item
    }
}
```
 

`startsWith(_:)` 메소드는 우선 컨테이너가 하나 이상의 요소를 가지고 있도록 확인하고, 첫 번째 요소가 받은 요소와 일치하는지를 확인한다. `startsWith(_:)` 메소드는 컨테이너의 요소가 동등성을 가지고 있다면, 위에서 사용한 스택이나 배열같은 `Container` 프로토콜을 준수하는 모든 타입이 사용할 수 있다.


```swift
if [9, 9, 9].startsWith(42) {
    print("Starts with 42.")
} else {
    print("Starts with something else.")
}
// Prints "Starts with something else."
```
 

위의 예시에 있는 제네릭 `where`절은 `Item`이 프로토콜을 준수하도록 요구한다, 하지만 제네릭 `where`절을 `Item`이 특정 타입이 되도록 요구하기 위해 사용할 수도 있다. 예를 들어:


```swift
extension Container where Item == Double {
    func average() -> Double {
        var sum = 0.0
        for index in 0..<count {
            sum += self[index]
        }
        return sum / Double(count)
    }
}
print([1260.0, 1200.0, 98.6, 37.0].average())
// Prints "648.9"
```
 

이 예시는 `Item`의 타입이 `Double`인 컨테이너에 요소들의 평균을 계산하여 리턴하는 `average()` 메소드를 추가한다. 

익스텐션의 일부로 다수의 요구사항을 컴마로 구분하여, 다른 곳에서 사용했던 것과 같은 방법으로 제네릭 `where`절으로 추가할 수 있다. 

### Contextual Where Clauses

제네릭 타입의 컨텍스트의 이미 작업중인 경우에는 고유한 제네릭 타입 제약조건이 없는 선언의 일부로 제네릭 `where` 절을 작성할 수 있다. 예를 들어, 제네릭 타입의 익스텐션에 있는 메소드나 제네릭 타입의 서브스크립트에서 제네릭 `where`절을 작성할 수 있다. `Container` 스트러처는 제네릭이고, 아래의 예시에 있는 `where`절은 이러한 새로운 메소드를 컨테이너가 사용하기 위해 어떠한 타입 제약조건을 만족해야하는지를 지정한다.


```swift
extension Container {
    func average() -> Double where Item == Int {
        var sum = 0.0
        for index in 0..<count {
            sum += Double(self[index])
        }
        return sum / Double(count)
    }
    func endsWith(_ item: Item) -> Bool where Item: Equatable {
        return count >= 1 && self[count-1] == item
    }
}
let numbers = [1260, 1200, 98, 37]
print(numbers.average())
// Prints "648.75"
print(numbers.endsWith(37))
// Prints "true"
```
 

이 예시는 요소가 정수일 때, `average()` 메소드를 `Container`에 추가하고, `endsWith(_:)` 메소드를 요소들이 동등성이 있을 때 추가한다. 두 함수 모두 `Container`의 기존 선언에 있는 `Item` 타입 파라미터에 타입 제약조건을 추가한다.

만약 이 코드를 상황별 `where`절을 사용하지 않고 작성하고 싶다면, 각각의 `where` 절마다 하나씩 총 두 개의 익스텐션을 작성해야 한다. 아래의 예문은 같은 동작을 한다.


```swift
extension Container where Item == Int {
    func average() -> Double {
        var sum = 0.0
        for index in 0..<count {
            sum += Double(self[index])
        }
        return sum / Double(count)
    }
}
extension Container where Item: Equatable {
    func endsWith(_ item: Item) -> Bool {
        return count >= 1 && self[count-1] == item
    }
}
```
 

상황별 `where`절을 사용하는 버전에서 `average()`와 `endWith(_:)`는 같은 익스텐션에 구현되어 있다. 각 메소드의 제네릭 `where`절은 해당하는 함수를 사용하기 위해 만족해야 하는 요구조건들을 명시하기 때문이다. 이러한 요구사항들을 익스텐션의 제네릭 `where`절에 옮겨도 똑같은 상황을 만들 수 있지만, 각 요구조건마다 하나의 익스텐션을 만들어야 한다.

### Associated Types with a Generic Where Clause

연관 타입에 제네릭 `where`절을 추가할 수 있다. 예를 들어, 표준 라이브러리에 있는 `Sequence` 프로토콜처럼 이터레이터를 포함하는 버전의 `Container`를 만들고 싶다고 가정해보자:


```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }


    associatedtype Iterator: IteratorProtocol where Iterator.Element == Item
    func makeIterator() -> Iterator
}
```
 

`Iterator`에 있는 제네릭 `where`절은 이터레이터가 이터레이터의 타입에 관계 없이 컨테이너의 요소의 타입과 동일한 타입의 원소를 순회해야 한다. `makeIterator()` 함수는 컨테이너의 이터레이터에 대한 접근을 제공한다.

다른 프로토콜에서 상속받은 프로토콜은 프로토콜의 선언에서 상속된 연관 타입에 제네릭 `where`절을 포함하여 제약조건을 추가한다. 예를 들어 다음의 코드는 `Item`이 `Comparable`을 준수하는 `ComparableContainer` 프로토콜을 선언한다:


```swift
protocol ComparableContainer: Container where Item: Comparable { }
```
 

### Generic Subscripts

서브스크립트는 제네릭이 될 수 있고, 제네릭 `where`절도 포함할 수 있따. 플레이스홀더 타입 이름을 subscript 뒤에 싱글 길라멧 괄호 내부에 작성하고, 제네릭 `where` 절을 서브스크립트의 본문 바로 앞에 작성한다. 예를 들면:


```swift
extension Container {
    subscript<Indices: Sequence>(indices: Indices) -> [Item]
            where Indices.Iterator.Element == Int {
        var result: [Item] = []
        for index in indices {
            result.append(self[index])
        }
        return result
    }
}
```
 

이 `Container` 프로토콜의 익스텐션은 인덱스 시퀀스를 받고 받은 인덱스 각각에 포함된 요소들을 배열로 리턴한다. 이 제네릭 서브스크립트는 다음과 같은 제약이 있다:

  - 싱글 길라멧 괄호 내부에 있는 제네릭 파라미터 **Indices** 는 **Sequence** 프로토콜을 준수하는 타입이어야 한다.
  - 서브스크립트는 파라미터로 **Indices** 타입인 **indices** 를 받는다.
  - 제네릭 **where** 절은 시퀀스의 이터레이터가 반드시 **Int** 타입의 요소를 순회해야 하는 것을 요구한다. 이는 컨테이너가 사용하는 인덱스들과 시퀀스 내부의 인덱스들이 동일한 타입임을 보장한다.



종합해보면, 이러한 제약조건들은 `indices` 파라미터로 전달될 값은 정수 시퀀스임을 의미한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
