---
title: "The Swift Programming Language. Generics (2)"
date: 2023-08-02

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Generics

weight: 44

draft: false
original: "https://junmusu.tistory.com/125"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Generic Types

제네릭 함수와 다르게, 스위프트는 제네릭 타입도 정의할 수 있게 해준다. 이는 `Array`나 `Dictionary`처럼 모든 타입과 함께 작업할 수 있는 커스텀 클래스, 스트럭처, 열거형이다.

이 섹션은 스택이라는 제네릭 컬렉션 타입을 작성하는 방법을 보여준다. 스택은 배열과 비슷하게 순서가 있는 값들의 집합이다, 하지만 스위프트의 `Array` 타입보다 더 제한된 작업을 한다. 배열은 배열의 어느 위치에서나 값을 삽입하거나 제거할 수 있지만, 스택은 컬렉션의 끝 부분에서만 삽입(_pushing_)이나 삭제(_popping_)을 할 수 있다.

> **Note**  
> **UINavigationController** 클래스가 내비게이션 계층에서 뷰 컨트롤러들을 모델링 할 때 스택의 개념을 사용한다. **UINavigationController** 클래스의 **pushViewController(_:animated:)** 메소드를 호출하여 내비게이션 스택에 뷰 컨트롤러를 추가(push)할 수 있고, **popViewControllerAnimated(_:)** 메소드로 내비게이션 스택에 있는 뷰 컨트롤러를 제거(pop)한다. 스택은 컬렉션이 "last in, first out" 접근 방식을 사용하게 하기 위해 유용한 컬렉션 모델이다.

아래의 그림은 스택에서 push와 pop의 동작을 보여준다:

![](/images/the-swift-programming-language-44-generics-2/image-002.png)

  1. 스택에 3개의 값이 들어있다.
  2. 4번째 값이 스택의 top에 push 된다.
  3. 스택이 4개의 값을 가지고 있다. 가장 최근에 들어온 값은 top에 있다.
  4. top에 있는 아이템이 pop 된다.
  5. 값을 pop한 이후에 스택은 다시 3개의 값을 가지고 있게 된다.



다음은 논 제네릭 버전의 Int 타입 스택을 작성하는 방법이다:


```swift
struct IntStack {
    var items: [Int] = []
    mutating func push(_ item: Int) {
        items.append(item)
    }
    mutating func pop() -> Int {
        return items.removeLast()
    }
}
```
 

이 스트럭처는 스택에 값을 저장하기 위해 `items`라는 `Array` 프로퍼티를 사용한다. `Stack`은 스택에 값을 추가하고 제거하기 위해서 `push`와 `pop` 두 개의 메소드를 제공한다. 이 메소드들은 스트럭처의 `items` 배열을 수정해야하기 때문에 mutating 으로 지정되어 있다.

위의 `IntStack` 타입은 `Int` 값만 사용할 수 있다. 하지만 모든 타입을 관리할 수 있는 제네릭 `Stack` 스트럭처를 정의한다면, 더 유용하게 사용할 수 있다.

다음은 같은 코드의 제네릭 버전이다:


```swift
struct Stack<Element> {
    var items: [Element] = []
    mutating func push(_ item: Element) {
        items.append(item)
    }
    mutating func pop() -> Element {
        return items.removeLast()
    }
}
```
 

제네릭 버전의 `Stack`은 본질적으로 논 제네릭 버전과 동일하지만, `Element`라는 타입 파라미터가 실제 타입인 `Int` 대신 쓰였다는 것을 알아두자. 이 타입 파라미터는 싱글 길라멧 괄호 쌍에 둘러쌓여(`<Element>`) 스트럭처의 이름 뒤에 작성된다.

`Element`는 이후에 제공된 타입을 위한 플레이스홀더 이름을 정의한다. 이 미래 타입(본문: future type)은 스트럭처의 정의 어디에서나 `Element`로 불릴 수 있다.(주: 스트럭처의 정의 내부 어디에서든 `Element`라는 플레이스홀더 이름을 타입처럼 사용할 수 있다.) 이 경우에서 `Element`는 세 곳에서 플레이스홀더로 사용된다.

  - **Element** 타입의 빈 배열로 초기화 되는 **items** 프로퍼티를 만들기 위해
  - **push(_:)** 메소드가 **Element** 타입인 파라미터 **item** 을 받는다는 것을 특정하기 위해
  - **pop()** 메소드가 **Element** 타입을 리턴한다는 것을 특정하기 위해



Stack 스트럭처가 제네릭 타입이기 때문에, `Array`나 `Dictionary`와 유사하게 스위프트에서 유효한 모든 타입의 스택을 만들 수 있다.

싱글 길라멧 쌍안에 스택에 저장할 값의 타입을 작성하여 새로운 `Stack`의 인스턴스를 만들 수 있다. 예를 들어, 새로운 문자열의 스택을 만들려면 `Stack<String>()`으로 작성하면 된다:


```swift
var stackOfStrings = Stack<String>()
stackOfStrings.push("uno")
stackOfStrings.push("dos")
stackOfStrings.push("tres")
stackOfStrings.push("cuatro")
// the stack now contains 4 strings
```
 

다음은 `stackOfStrings`가 4개의 값을 push한 후 보이는 모습이다:

![](/images/the-swift-programming-language-44-generics-2/image-003.png)

스택에서 값을 pop하면 top에 있는 값 `"cuatro"`가 리턴되고, 스택에서 제거된다:


```swift
let fromTheTop = stackOfStrings.pop()
// fromTheTop is equal to "cuatro", and the stack now contains 3 strings
```
 

다음은 top에 있는 값을 제거한 후 스택의 모습이다:

![](/images/the-swift-programming-language-44-generics-2/image-004.png)

### Extending a Generic Type

제네릭 타입을 확장할 때, 타입 파라미터 리스트를 익스텐션의 정의의 일부로 제공하지 않아도, 익스텐션의 본문에서 타입의 원래 정의에 있는 타입 파라미터 리스트를 사용할 수 있다. 그리고 기존 타입 파라미터 이름은 기존 정의에 있는 타입 파라미터를 참조하는데 사용한다.(주: 익스텐션을 정의할 때 파라미터 리스트를 작성할 필요가 없다.)

다음의 예시는 제네릭 `Stack` 타입에 스택의 top에 있는 요소를 pop하지 않고 리턴하는 read-only 컴퓨티드 프로퍼티 `topItem`을 추가한다:


```swift
extension Stack {
    var topItem: Element? {
        return items.isEmpty ? nil : items[items.count - 1]
    }
}
```
 

`topItem` 프로퍼티는 옵셔널 `Element` 타입 값을 리턴한다. 스택이 비어있으면 `topItem`은 nil을 리턴하게 되고; 비어있지 않다면, `topItem`은 `items` 배열에 있는 마지막 요소를 리턴한다.

이 익스텍션은 타입 파라미터 리스트를 정의하지 않고, `Stack` 타입에 이미 존재하던 파라미터 이름 `Element`를 익스텐션에 있는 컴퓨티드 프로퍼티 `topItem`의 타입을 나타내는데 사용했다는 것을 알아두자.

이제 어떠한 `Stack` 인스턴스도 top에 있는 요소를 제거하지 않고 접근하고 쿼리할때 `topItem` 컴퓨티드 프로퍼티를 사용할 수 있다.


```swift
if let topItem = stackOfStrings.topItem {
    print("The top item on the stack is \(topItem).")
}
// Prints "The top item on the stack is tres."
```
 

제네릭 타입의 익스텐션은 확장된 타입의 인스턴스들이 새로운 기능을 얻기 위해 반드시 만족해야 할 요구사항을 포함할 수 있다. 이는 뒤에 나올 **Extensions with a Generic Where Clause** 에서 설명한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
