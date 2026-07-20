---
title: "The Swift Programming Language. Error Handling (2)"
date: 2023-06-22

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Error Handling

weight: 28

draft: false
original: "https://junmusu.tistory.com/103"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

#### Handling Errors Using Do-Catch

do-catch 문을 사용하면 코드 블록을 실행해서 에러를 처리할 수 있다. 에러가 do절에서 발생하면, 그 에러를 처리할 수 있는 catch절과 매치된다.

다음은 do-catch문의 일반적인 형태이다.


```swift
do {
    try expression
    statements
} catch pattern {
    statements
} catch pattern where condition {
    statements
} catch pattern, pattern where condition {
    statements
} catch {
    statements
}
```
 

catch절 뒤에 (에러의) 패턴을 작성하여, 그 catch절이 처리할 수 있는 에러를 나타낸다. catch절이 패턴을 가지고 있지 않다면, 이 catch절은 모든 에러와 매치될 수 있으며, error라는 이름을 가진 로컬 상수에 바인딩 된다.

예를 들어 아래의 코드는 VedingMachineError 열거형이 가진 3개의 에러와 모두 매치된다.


```swift
var vendingMachine = VendingMachine()
vendingMachine.coinsDeposited = 8
do {
    try buyFavoriteSnack(person: "Alice", vendingMachine: vendingMachine)
    print("Success! Yum.")
} catch VendingMachineError.invalidSelection {
    print("Invalid Selection.")
} catch VendingMachineError.outOfStock {
    print("Out of Stock.")
} catch VendingMachineError.insufficientFunds(let coinsNeeded) {
    print("Insufficient funds. Please insert an additional \(coinsNeeded) coins.")
} catch {
    print("Unexpected error: \(error).")
}
// Prints "Insufficient funds. Please insert an additional 2 coins."
```
 

위의 예시에서, buyFavoriteSnack(person: vendingMachine:) 함수는 에러를 발생시킬 수 있기 때문에 try표현식에 의해 호출된다. 에러가 발생된다면, 즉시 catch절이 실행되어, 전달을 계속할 것인지를 결정한다. 매치되는 패턴이 없는 에러의 경우에는 마지막 catch 절에 의해 로컬 상수 error로 바인딩된다. 아무런 에러도 발생하지 않는다면, do문의 나머지 코드가 실행된다.

catch절은 do절에서 발생할 수 있는 모든 에러를 처리할 필요는 없다. 에러를 처리할 수 있는 catch절이 없다면 에러는 주변의 스코프로 전달된다. 전달된 에러는 반드시 주변의 스코프에서 처리되어야 한다. 논 쓰로잉 함수는 do-catch문이 반드시 에러를 처리해야 한다. 쓰로잉 함수는 둘러싼 do-catch문에서 에러를 처리하거나 호출자가 에러를 처리한다. 에러가 탑 레벨 스코프까지 처리되지 않은 상태로 전달된다면, 런타임 에러가 발생하게 된다.

예를 들어 위의 예시는 VendingMachineError가 아닌 모든 에러가 호출한 함수에 의해 캐치되도록 작성할 수 있다.


```swift
func nourish(with item: String) throws {
    do {
        try vendingMachine.vend(itemNamed: item)
    } catch is VendingMachineError {
        print("Couldn't buy that from the vending machine.")
    }
}

do {
    try nourish(with: "Beet-Flavored Chips")
} catch {
    print("Unexpected non-vending-machine-related error: \(error)")
}
// Prints "Couldn't buy that from the vending machine."
```
 

nourish(with:) 함수에서 vend(itemNamed:)가 vendingMachineError 열거형에 정의되어 있는 에러를 발생시킨다면, nourish(with:)는 메세지를 출력함으로써 에러를 처리한다. 열거형에 정의되어 있지 않은 에러라면, nourish(with:)는 에러를 호출한 곳에 전달하고, 그 에러는 외부에 작성되어 있는 제너럴한 catch절에 의해 캐치된다.

관련된 여러 에러를 캐치하는 다른 방법으론, catch 뒤에 에러 리스트를 컴마로 구분하여 작성하는 것이다. 예를 들면:


```swift
func eat(item: String) throws {
    do {
        try vendingMachine.vend(itemNamed: item)
    } catch VendingMachineError.invalidSelection, VendingMachineError.insufficientFunds, VendingMachineError.outOfStock {
        print("Invalid selection, out of stock, or not enough money.")
    }
}
```
 

eat(item:) 함수는 벤딩 머신 에러를 캐치하기 위해 리스트를 나열한다. 만약 나열된 세가지 에러중 하나가 발생한다면, 이 catch절은 메세지를 출력하여 에러를 처리한다. 리스트에 없는 에러들은 주변의 스코프로 전달된다.

#### Converting Errors to Optional Values

에러를 옵셔널 값으로 변환하여 처리하기 위해 try?를 사용할 수 있다. try? 표현식을 evaluate할 때 에러가 발생한다면, 표현식의 값은 nil이 된다. 예를 들어 아래의 코드에서 x와 y는 같은 같은 행동을 하고, 같은 값을 가진다.


```swift
func someThrowingFunction() throws -> Int {
    // ...
}

let x = try? someThrowingFunction()

let y: Int?
do {
    y = try someThrowingFunction()
} catch {
    y = nil
}
```
 

someThrowingFunction()이 에러를 발생시키면, x와 y의 값은 nil이 되고, 발생시키지 않는다면 함수가 리턴한 값이 된다. x와 y는 someThrowingFunction() 함수가 리턴하는 타입의 옵셔널 값인것을 알아두자. 따라서 이 예시에서 x와 y의 타입은 Int?가 된다.

try?를 쓰는 것은 모든 에러를 같은 방식으로 처리할 수 있게 하여 간결한 에러 처리 코드를 작성하게 해준다. 예를 들어 아래의 코드는 다양한 방법으로 데이터를 fetch하고, 모든 방법이 실패하면 nil을 리턴한다.


```swift
func fetchData() -> Data? {
    if let data = try? fetchDataFromDisk() { return data }
    if let data = try? fetchDataFromServer() { return data }
    return nil
}
```
 

#### Disabling Error Propagation

쓰로잉 함수가 런타임 에러를 절대 발생시키지 않는다는 사실을 아는 경우가 있다. 이런 경우에는, try!를 표현식 앞에 작성하여 에러 전달을 비활성화 시키고, 에러가 발생하지 않는다고 호출을 래핑할 수 있다. 에러가 실제로 발생하는 상황이 벌어지면, 런타임 에러가 발생한다.

예를 들면, 아래의 코드는 주어진 경로에서 이미지를 받아오고, 받아올 수 없다면 에러를 발생시키는 loadImage(atPath:) 함수를 사용한다. 아래의 상황에서, 이미지가 애플리케이션 내부에 있기 때문에 런타임에 에러가 절대 발생하지 않을 것이므로, 에러 전달을 비활성화 하는 것이 적합하다.


```swift
let photo = try! loadImage(atPath: "./Resources/John Appleseed.jpg")
```
 

### Secifying Cleanup Actions

defer문을 사용하면, 코드 블록이 종료되기 전에 일련의 구문들을(set of statements) 실행할 수 있다. 따라서 defer문은 이 코드 블록이 종료되는 이유에 상관 없이(에러가 발생하거나, return이나 break를 만나거나) 정리 작업을 할 수 있게 해준다. 예를 들어 defer문을 사용하면, 파일 디스크립터를 닫고, 수동 할당된 메모리를 해제할 수 있다.

defer문은 현재 스코프가 종료될 때 까지 실행이 연기된다. defer문은 defer 키워드와 나중에 실행될 구문들로 이루어져 있다. 이 구문들에는 break나 return 같은 외부로 컨트롤을 옮기는 구문이 포함될 수 없고, 에러를 발생시킬 수도 없다. defer문들은 코드 내부에 작성된 순서와 반대로 실행된다. 첫 번째 defer문이 맨 마지막으로 실행되고, 마지막에 작성된 defer문이 맨 처음에 실행된다.(주: defer문 내부가 반대로 실행된다는 것이 아닌, 여러개의 defer문이 있을 때 그 defer문들 간의 실행 순서가 반대라는 뜻)


```swift
func processFile(filename: String) throws {
    if exists(filename) {
        let file = open(filename)
        defer {
            close(file)
        }
        while let line = try file.readline() {
            // Work with the file.
        }
        // close(file) is called here, at the end of the scope.
    }
}
```
 

위의 예시는 open(_:) 함수와 짝이 될 close(_:)함수의 존재를 보장한다.

> **Note**  
>  에러 처리와 관련 없는 경우에도 defer문을 사용할 수 있다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
