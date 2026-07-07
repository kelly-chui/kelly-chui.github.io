---
title: "The Swift Programming Language. Error Handling (1)"
date: 2023-06-21
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Error Handling"]
weight: 27

draft: false
original: "https://junmusu.tistory.com/102"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Error Handling

에러 핸들링은 프로그램이 에러 상황에서 응답하고 회복하는 프로세스이다. 스위프트는 런타임에 복구 가능한 에러를 던지고(throwing), 포착하고(catching), 전파하고(propagating), 조정하는(manipulating)데 최적화된 지원을 해준다.

일부 연산들은 항상 실행을 마치거나 의미있는 결과를 생성하는 것을 보장하지 않는다. 옵셔널은 값의 부재를 나타내는 사용되자만, 연산이 실패한 경우에는 코드가 그에 응답할 수 있도록 실패한 이유를 아는 것이 유용하다.

예를 들면, 디스크에 저장되어있는 파일을 읽고 처리하는 작업을 생각해보자. 이 작업에는 특정 경로에 없는 파일을 포함하거나, 파일에 대한 읽기 권한이 없거나, 파일을 호환 가능한 포맷으로 인코딩 하지 못하는 등의 수많은 실패 요소들이 있다. 이러한 상황들을 구분하면, 프로그램이 해결할 수 있는 에러는 해결하고, 해결 불가능한 에러는 사용자들에게 알릴 수 있다.

### Representing and Throwing Errors

스위프트에서, 에러는 Error 프로토콜을 준수하는 형태로 표시된다. 이 빈 프로토콜을 준수한 타입은 에러 처리에 사용할 수 있다.

스위프트의 열거형은 에러의 특성을 담은 연관값에 함께 사용하면, 관련이 있는 에러 상황들을 그룹화 하여 모델링하는데 특화되어 있다. 아래의 예시는 게임 내부에서 자판기가 겪을 수 있는 에러들을 모델링 한 것이다.


```swift
enum VendingMachineError: Error {
    case invalidSelection
    case insufficientFunds(coinsNeeded: Int)
    case outOfStock
}
```
 

에러를 발생하면, 예측하지 못한 일이 일어나서 정상적인 플로우의 실행을 더 이상 지속할 수 없음을 나타낼 수 있다. throw 문을 사용하여 에러를 발생시킬 수 있다. 예를 들어, 다음의 코드는 자판기에서 5개의 동전이 더 필요하다는 에러를 발생시킨다.


```swift
throw VendingMachineError.insufficientFunds(coinsNeeded: 5)
```
 

### Handling Errors

에러가 발생하면, 주변의 코드들이 반드시 에러를 처리해야 한다. - 예를 들면 문제를 고치거나, 다른 접근 방식을 시도하거나, 유저에게 실패를 알려야 한다.

스위프트에서 에러를 처리하는 4가지의 방법이 있다. 에러가 발생한 함수를 호출하는 코드에 에러를 전파하거나, do-catch 문을 사용하여 에러를 처리하거나, 옵셔널 값을 이용하여 에러를 처리하거나, 혹은 에러가 발생하지 않을 것이라고 assert(주: assert 함수를 이용한 에러 검출 처리를 말하는 건지, 아니면 실제 사전적인 뜻인 주장하다를 뜻하는 것인지 잘 모르겠어서 코멘트를 남겨놓음)할 수 있다. 각 접근 방법은 아래의 섹션에서 설명한다.

만약 함수가 에러를 발생시키면, 그 에러는 프로그램의 플로우를 변화시킨다. 따라서 코드에서 에러가 발생할 수 있는 위치를 빠르게 식별하는 것이 중요하다. 코드에서 에러가 발생한 곳을 식별하기 위해 try(혹은 try!, try?)키워드를 에러가 발생할 수 있는 함수, 메소드, 이니셜라이저의 앞에 작성한다. 이 키워드들은 아래의 섹션에서 설명한다.

> **Note**  
>  스위프트의 에러 처리는 try, catch, throw 키워드를 쓰는 점에서 다른 언어들과 유사하지만, 다른 언어들과 달리 처리하는데 비용이 많이 드는 콜 스택 해제를 사용하지 않는다. 따라서 throw 문의 성능은 return 문의 성능과 비슷하다.

Propagating Errors Using Throwing Functions

함수, 메소드, 이니셜라이저가 에러를 발생시킬 수 있다는 것을 나타내기 위해, 함수의 정의 내부에 throws 키워드를 파라미터 뒤에 작성한다. throws로 표시된 함수를 _쓰로잉 함수(throwing function)_ 이라고 한다. 함수가 특정한 리턴 타입을 가지고 있따면, throws 키워드를 리턴 애로우(->) 앞에 작성한다.


```swift
func canThrowErrors() throws -> String

func cannotThrowErrors() -> String
```
 

쓰로잉 함수는 그 함수를 호출한 스코프 내로 에러를 전달한다.

> Note  
> 쓰로잉 함수만 에러를 전달할 수 있다. 쓰로잉 함수가 아닌 함수에서 발생한 모든 에러는 함수 내부에서 처리되어야 한다.

아래의 예시에서 VendingMachine 클래스는 요청이 불가능할 때 적합한 VendingMachineError를 발생시키는 vend(itemNamed:) 메소드를 가지고 있다.


```swift
struct Item {
    var price: Int
    var count: Int
}

class VendingMachine {
    var inventory = [
        "Candy Bar": Item(price: 12, count: 7),
        "Chips": Item(price: 10, count: 4),
        "Pretzels": Item(price: 7, count: 11)
    ]
    var coinsDeposited = 0

    func vend(itemNamed name: String) throws {
        guard let item = inventory[name] else {
            throw VendingMachineError.invalidSelection
        }

        guard item.count > 0 else {
            throw VendingMachineError.outOfStock
        }

        guard item.price <= coinsDeposited else {
            throw VendingMachineError.insufficientFunds(coinsNeeded: item.price - coinsDeposited)
        }

        coinsDeposited -= item.price

        var newItem = item
        newItem.count -= 1
        inventory[name] = newItem

        print("Dispensing \(name)")
    }
}
```
 

vend(itemNamed:) 메소드는 스낵을 구입할 때, 어느 조건 하나로 만족하지 않는다면 guard 문을 사용하여 메소드를 빠르게 종료시키고, 적합한 에러를 발생시키도록 구현되어 있다. throw 문은 프로그램 컨트롤을 바로 이전하기 때문에, 모든 조건이 충족된 경우에만 스낵을 살 수 있게 된다.

vend(itemNamed:) 메소드는 발생하는 모든 오류를 전달하므로, 이 메소드를 호출하는 코드는 에러를 처리하거나(do-catch, try?, try!를 사용해서) 혹은 계속해서 전달해야 한다. 예를 들어 아래 예시에 있는 buyFavoriteSnack(person:vendingMachine:)도 쓰로잉 함수이며, vend(itemNamed:)메소드가 발생시킨 모든 메소드는 buyFavoriteSnack(person:vendingMachine:)이 호출되는 지점까지 전달된다.


```swift
let favoriteSnacks = [
    "Alice": "Chips",
    "Bob": "Licorice",
    "Eve": "Pretzels",
]
func buyFavoriteSnack(person: String, vendingMachine: VendingMachine) throws {
    let snackName = favoriteSnacks[person] ?? "Candy Bar"
    try vendingMachine.vend(itemNamed: snackName)
}
```
 

이 예시에서, buyFavoriteSnack(person: vendingMachine:) 함수는 주어진 person의 좋아하는 스낵을 찾고, vend(itemNamed)를 호출하여 그 스낵을 사는 것을 시도한다. vend(itemNamed:)메소드가 에러를 발생시킬 수 있으므로, try 키워드를 앞에 작성한다.

쓰로잉 이니셜라이저도 쓰로잉 함수처럼 에러를 전달할 수 있다. 예를 들어 아래에 있는 PurchasedSnack 스트럭처의 이니셜라이저는 이니셜라이제이션 프로세스의 일부분으로 쓰로잉 함수를 호출하고, 발생하는 모든 에러를 호출한 코드에 전달하여 처리한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
