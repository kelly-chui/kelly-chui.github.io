---
title: "Swift Concurrency. Protect Mutable States With Swift Actors - WWDC21"
date: 2026-08-31T16:34:03+09:00

categories:
  - WWDC
series:
tags:
  - Swift Concurrency
  - Actor

draft: false
original: ""
---

Swift Concurrency를 사용하면 여러 작업을 동시에 실행할 수 있다. 하지만 여러 작업이 같은 데이터를 읽고 변경하기 시작하면 데이터 레이스가 발생할 수 있고, 그 원인을 찾기도 어렵다.

Swift는 이러한 shared mutable state를 안전하게 다루기 위해 액터를 제공한다. 액터는 자신의 상태에 대한 접근을 조정하고, 동시성 코드에서 발생할 수 있는 데이터 레이스를 컴파일 타임에 발견할 수 있도록 돕는다.

이 포스팅에서는 WWDC21의 *Protect Mutable State With Swift Actors* 세션을 따라가며 데이터 레이스가 발생하는 이유와 액터의 동작 방식, actor reentrancy, actor isolation, `Sendable`, 그리고 메인 액터에 대해 정리한다.

## Data Race

동시성 코드를 작성할 때 데이터 레이스는 쉽게 발생하고, 디버깅 하기 어렵다. 다음과 같은 코드를 보자:

```swift
class Counter {
    var value = 0

    func increment() -> Int {
        value = value + 1
        return value
    }
}

let counter = Counter()
Task.detached {
    print(counter.increment())
}
Task.detached {
    print(counter.increment())
}
```

실행 결과가 1 → 2로 출력되든, 2 → 1로 출력되든 `counter`의 `value`는 2가 된다. 이 경우에는 최종 상태가 올바르지만, 출력 순서는 Task의 실행 시점에 따라 달라질 수 있다.

하지만 두 task가 모두 0을 읽은 뒤 각각 1을 기록한다면, 두 호출의 결과가 모두 1이 될 수 있다. 반대로 실행 순서에 따라 두 결과가 모두 2가 되는 경우도 가능하다.

이처럼 프로그램의 서로 다른 부분에서 데이터에 접근하면, 데이터 레이스의 원인을 찾기 위해 프로그램의 다른 부분까지 함께 살펴봐야 한다.

데이터 레이스는 shared mutable state에서 발생한다. 데이터가 변경되지 않거나 여러 동시성 Task 사이에서 공유되지 않는다면 데이터 레이스도 발생하지 않는다.

### Avoiding Data Races

가장 간단한 방법은 shared mutable state를 없애는 것이다. 값 타입 프로퍼티를 `let`으로 선언하면 값이 변경되지 않으므로 여러 concurrent task가 동시에 접근해도 안전하다.

값 의미론(value semantics)을 사용하면 프로그램의 동작을 더 쉽게 추론할 수 있고, 동시성 프로그램에서도 안전하게 값을 공유할 수 있다.

Swift에서 배열과 딕셔너리는 모두 값 타입이다. 먼저 값 타입을 사용해 보자:

```swift
struct Counter {
    var value = 0

    mutating func increment() -> Int {
        value = value + 1
        return value
    }
}

let counter = Counter()
Task.detached {
    print(counter.increment())
}
Task.detached {
    print(counter.increment())
}
```

`counter`는 `let`으로 선언되어 있으므로 값을 변경할 수 없고, 컴파일 오류가 발생한다.

{{< image src="image-001-optimized-image.webp" >}}

그렇다면 `counter`를 `var`로 바꿔 보자. 이번에는 여러 Task가 같은 값을 변경하려 하기 때문에 다시 데이터 레이스 문제가 발생한다.

{{< image src="image-002-optimized-image.webp" >}}

다행인건, Swift 컴파일러가 이러한 shared mutable state에 대한 접근을 검사하고 문제를 알려 준다.

Task 내부에서 `counter`를 각각 `var`로 선언하면 컴파일 오류는 사라지지만, 두 Task가 같은 카운터를 공유하지 않게 된다. 이는 원래 프로그램과 동작이 달라진다는 뜻이다.

{{< image src="image-003-optimized-image.webp" >}}

결국 shared mutable state를 제거할 수 없는 경우가 있다. 이런 경우에는 별도의 동기화 방법이 필요하다. 

저수준에서는 원자적 연산과 lock을 사용할 수 있고, 고수준에서는 Serial dispatch queue와 같은 방법을 사용할 수 있다.

다만 이러한 도구들은 규칙을 잘 지켜서 사용해야 한다. 한 번이라도 실수하면 데이터 레이스가 발생할 수 있다.

## Actor

액터는 자신만의 상태를 가지며, 그 상태는 프로그램의 나머지 부분으로부터 격리한다. 따라서 액터 외부의 코드가 액터의 상태에 접근하려면 반드시 액터를 거쳐야 한다.

외부 코드가 액터의 상태에 접근하려 하면 액터의 동기화 메커니즘이 이 접근을 조정하게 된다. 그래서 lock이나 Serial dispatch queue를 사용할 때와 동일한 상호 배제 특성이 있다.

하지만 액터의 동기화 메커니즘은 Swift 언어 자체적으로 지원하는 기능이므로 (Swift Concurrency는 built-in 이니까) 직접 관리할 필요가 없고, 만약 액터 규칙을 위반하면 컴파일러에서 에러를 찾아준다.

Swift의 다른 named type과 다르지 않게 액터는 프로퍼티, 메소드, 이니셜라이저, 서브스크립트를 가질 수 있다. 또한 프로토콜을 채택하거나 extension을 통해 기능을 확장하는 것도 가능하다.

그리고 액터는 레퍼런스 타입이다. 액터 자체가 여러 실행 흐름에서 공유될 수 있는 mutable state를 표현하기 때문이다.

결국 액터의 가장 큰 특징은 자신의 인스턴스를 프로그램의 나머지 부분으로부터 격리하고, 그 데이터에 대한 접근이 동기화되도록 보장한다.

이제 `Counter`를 액터로 바꿔 보자.

```swift
actor Counter {
    var value = 0

    func increment() -> Int {
        value = value + 1
        return value
    }
}
```

`value`와 `increment()`는 그대로지만, 액터는 `value`에 동시에 접근할 수 없도록 보장한다. 이는 액터에서 실행되는 동기 코드가 다른 액터 코드에 의해 중단되지 않고 끝까지 실행된다는 것을 의미한다.

{{< callout type="note" title="`await`가 없으면 원자적일까?" >}}
`await`는 Swift Task의 suspension point일 뿐이고, 실제 코드를 실행하는 스레드는 OS에 의해 실행 중간에 선점될 수 있다. 또한 여러 task가 서로 다른 스레드에서 병렬로 실행될 수도 있다.

따라서 `print(counter.increment())` 역시 하나의 원자적 연산이 아니다. `increment()`가 값을 반환한 뒤 `print()`가 실행되기 전에 다른 Task가 실행될 수 있다.

예를 들어 카운터 자체는 0 → 1 → 2 순서로 정상적으로 증가했더라도, 1을 리턴받은 task의 `print()`가 늦게 실행되면 2 → 1 순서로 출력될 수 있다.
{{< /callout >}}

액터의 내부 동기화 메커니즘은 하나의 `increment()` 호출이 끝난 뒤에야 다른 `increment()` 호출이 액터의 상태에 접근하도록 보장한다.

```swift
let counter = Counter()
Task.detached {
    print(await counter.increment())
}
Task.detached {
    print(await counter.increment())
}
```

따라서 출력은 1 → 2가 될 수도 있고 2 → 1가 될 수도 있고, 두 결과 모두 유효하다. `increment()`의 실행은 액터 내부에서 보호되지만, 리턴된 값을 출력하는 `print()`는 액터 외부에서 실행되기 때문이다.

먼저 액터에 접근한 task가 `value`를 변경하는 동안에는 다른 task가 `value`에 동시에 접근할 수 없기 때문이다. 둘 다 1 혹은 2가 출력 되는 일은 없다.

그렇다면, 두 번째 task를 어떻게 기다리게 하는 걸까? 기본적으로, 액터의 상태에 대한 외부 접근은 비동기 코드로 이루어지기 때문이다. 이미 액터가 다른 task를 처리하고 있다면 새로 들어온 코드는 일시 중단되고, CPU가 다른 task를 실행할 수 있게 된다.

시간이 지나서 첫 번째 task가 완료되고 액터를 다시 사용할 수 있게 되면 일시 중단된 task가 재개된다.

따라서 액터에 접근하는 비동기 호출이 완료될 때까지 현재 task를 일시 중단할 수 있음을 나타내기 위해 `await` 키워드를 사용한다.

## Synchronous interaction within an actor

이제 느리게 동작하는 `reset` 연산을 추가해 보자. 이 연산은 `value`를 0으로 되돌린 다음, `newValue`에 도달할 때까지 `increment()`를 호출한다.

```swift
extension Counter {
    func resetSlowly(to newValue: Int) {
        value = 0
        for _ in 0..<newValue {
            increment()
        }
        assert(value == newValue)
    }
}
```

여기서 `resetSlowly` 메소드는 `Counter`의 `extension`에 정의되어 있으므로 `Counter` 액터에 격리되어 있다. 따라서 `increment()`처럼 같은 액터에 격리된 다른 메소드를 호출할 때는 `await`가 필요하지 않으며, 일반적인 동기 메소드 호출처럼 사용할 수 있다.

이것은 액터의 중요한 특성 중 하나다. 액터에 격리된 동기 코드는 다른 task의 개입을 허용하는 중단점이 없기 때문에(`await`는 동기 코드 안에 없으니까), 액터의 내부 상태를 다루는 동작을 일반적인 코드처럼 사용할 수 있다.

하지만 액터가 항상 처음부터 끝까지 하나의 task만 처리하는 것은 아니다. 다른 액터나 비동기 코드와 상호작용하면서 `await`를 만나면 현재 task는 일시 중단될 수 있다. 

이때 액터는 그 작업이 재개되기를 기다리는 동안 다른 task를 처리할 수 있으므로, `await` 전후에서 액터의 상태가 바뀔 수도 있다.

## Actor reentrancy

```swift
actor ImageDownloader {
    private var cache: [URL: Image] = [:]

    func image(from url: URL) async throws -> Image? {
        if let cached = cache[url] {
            return cached
        }

        let image = try await downloadImage(from: url)

        cache[url] = image
        return image
    }
}
```

`ImageDownloader`는 다른 서비스에서 이미지를 다운로드하고, 같은 이미지를 반복해서 다운로드하지 않도록 결과를 캐시에 저장한다. 처음에 캐시에 이미지가 있는지를 확인하고, 이미지가 없다면 다운로드를 받은 이후에 캐시에 저장하고 결과를 리턴한다.

이 예제에서는 액터 내부에 있으므로 이 코드는 저수준의 데이터 레이스로부터 안전하고, 여러 이미지를 동시에 다운로드할 수 있다.

액터의 동기화 메커니즘이 `cache`에 접근하는 코드를 한번에 하나의 task만 실행할 수 있도록 보장하기 때문에, 동시 접근 때문에 캐시 자체가 손상되진 않는다.

하지만 이미지를 다운로드하는 작업은 시간이 오래걸리므로 비동기 코드로 작성해야 한다. 그리고 이전에 말한 것 처럼 `await` 전후는 액터의 상태가 굉장히 다를 수 있다.

두 동시성 task가 동시에 같은 이미지를 요청하는 경우를 생각해 보자.

1. 첫 번째 task가 `cache`에 이미지가 없다는 것을 확인한 다음 이미지 다운로드를 시작하고 일시 중단된다.
2. 이미지가 다운로드되는 동안 서버에서 해당 URL의 이미지가 변경된다.
3. 두 번째 task가 같은 URL의 이미지를 요청한다.
4. 두 번째 task도 `cache`에 이미지가 없다는 것을 확인하고(아직 첫 번째 task가 끝나지 않았으니) 이미지 다운로드를 시작하고 일시 중단된다.
5. 첫 번째 task가 먼저 완료된 경우, 다운받은 이미지를 `cache`에 저장하고 이미지를 리턴한다.
6. 두 번째 task도 다운로드가 완료되면, 역시 이미지를 `cache`에 저장한다. 이 때, 캐시 덮어쓰기가 발생한다.
7. 결국 같은 URL에 대해 두 task가 다른 이미지를 리턴하게 된다.

데이터 레이스는 발생하지 않았지만, `await` 이후에도 `cache`가 이전과 같을 것이라고 가정했기 때문에 논리적인 버그가 발생했다. 따라서 `await` 이후에는 이전 상태와 같은지 다시 한번 확인해야한다.

이런 경우에는 task가 재개된 이후 `cache`에 이미지가 존재한다면, 기존에 저장된 이미지를 유지하고 새로 다운로드한 이미지는 사용하지 않는 방식으로 문제를 해결할 수 있다:

```swift
actor ImageDownloader {
    private var cache: [URL: Image] = [:]

    func image(from url: URL) async throws -> Image? {
        if let cached = cache[url] {
            return cached
        }

        let image = try await downloadImage(from: url)

        cache[url] = cache[url, default: image]
        return image
    }
}
```

하지만 결과의 일관성은 지켰지만, 이미지를 두 번 다운로드하는 문제 자체는 해결하지 못한다. 가장 좋은 방법은 애초에 중복 다운로드가 발생하지 않도록 설계하는 것이다.

actor reentrancy는 데드락을 방지하고 다른 task가 계속 진행될 수 있게 한다. 대신 `await`를 지날 때마다 이전에 세운 가정이 여전히 유효한지 확인해야 한다.

reentrancy를 안전하게 다루려면 액터의 상태 변경은 가능한 한 동기 코드 안에서 수행하는 것이 좋다. 특히 하나의 동기 함수 안에서 상태를 변경하면 상태 변화 전체를 하나의 단위로 캡슐화할 수 있다.

상태를 변경하는 과정에서는 액터가 일시적으로 일관되지 않은 상태에 놓일 수도 있다. 하지만 `await`는 잠재적인 중단점이므로, `await`에 도달하기 전에는 반드시 액터를 다시 일관된 상태로 만들어야 한다.

즉, `await`는 reentrancy가 발생할 수 있는 경계다. 따라서 `await` 직전의 액터는 다른 task가 이어서 접근하더라도 문제가 없을 만큼 일관된 상태여야 한다.

## Actor isolation

액터도 다른 타입과 마찬가지로 메소드와 프로퍼티를 정의할 수 있지만, mutable state와 이를 다루는 코드는 기본적으로 해당 액터에 격리된다. 액터 외부에서는 격리된 상태에 직접 접근할 수 없으며, 격리된 메소드를 호출하려면 일반적으로 `await`가 필요하다.

### Protocol

앞서 살펴본 것처럼 액터도 프로토콜을 채택할 수 있다.

```swift
actor LibraryAccount {
    let idNumber: Int
    var booksOnLoan: [Book] = []
}

extension LibraryAccount: Equatable {
    static func ==(lhs: LibraryAccount, rhs: LibraryAccount) -> Bool {
        lhs.idNumber == rhs.idNumber
    }
}
```

`==`는 `static` 메소드 이므로 인스턴스의 `self`에 격리되지 않는다. 대신 두 개의 `LibraryAccount`를 파라미터로 받아 액터 외부에서 비교를 수행한다.

이 예제에서는 액터의 불변 상태인 `idNumber`만 사용하므로 안전하다. 그렇다면 프로토콜의 요구사항을 구현하면서 액터의 상태에 접근해야 하는 경우에는 어떻게 해야 할까?

이번에는 `Hashable`을 채택해 보자:

```swift
extension LibraryAccount: Hashable {
    func hash(into hasher: inout Hasher) {
        hasher.combine(idNumber)
    }
}
```

이 코드는 컴파일러 차원에서 에러가 발생한다. `hash(into:)`는 `async`가 아니므로 actor isolation을 유지하면서 외부에서 호출할 방법이 없기 때문이다.

{{< callout type="warning" title="`Hashable` 요구사항은 동기적으로 호출된다" >}}
세션에서 설명이 살짝 빈약한데, 딕셔너리나 집합은 원소를 저장하고 찾을 때 내부적으로 `hash(into:)`를 동기적으로 호출한다. 즉, `hash(into:)`를 actor-isolated 메소드로 만들면 호출하는 쪽에서 `await`로 기다릴 수 없기 때문에, `Hashable` 요구사항을 충족할 수 없다. 

따라서 액터 외부에서 동기적으로 실행할 수 있는 `nonisolated` 구현이 필요하다.
{{< /callout >}}

이 문제를 해결하려면 `nonisolated`를 사용할 수 있다. `nonisolated`가 붙은 선언은 액터 내부에 정의되어 있더라도 actor isolation의 영향을 받지 않으며, 액터 외부의 코드처럼 동기적으로 호출할 수 있다.

다만 `nonisolated` 코드는 actor isolation의 보호를 받지 않기 때문에 액터의 mutable state에는 접근할 수 없다. 따라서 `booksOnLoan`로 해시를 계산하는 것은 불가능하다.

### Closures

함수와 마찬가지로 클로저도 actor-isolated일 수 있고 nonisolated일 수도 있다.

{{< callout type="warning" title="예제 Swift 문법 오류" >}}
일단은 세션에서 제공한 예제 코드를 그대로 사용했지만, 이 콜아웃 아래의 예제는 Swift 버전과 관계 없이 `reduce` 호출 부분이 잘못되었다.

`reduce`가 아규먼트로 받는 클로저는 2개의 파라미터를 가지는데, 아래 예제에서는 `book` 하나만 넘기고 있다.

예제에서 의도한 코드는 아마도 아래와 같을 것으로 예상한다.

```swift
func read() -> Int {
    booksOnLoan.reduce(0) { totalPages, book in
        totalPages + readSome(book)
    }
}
```
{{< /callout >}}

```swift
extension LibraryAccount {
    func readSome(_ book: Book) -> Int { ... }
    
    func read() -> Int {
        booksOnLoan.reduce(0) { book in
            readSome(book)
        }
    }
}
```

`readSome` 호출에 `await`가 필요하지 않은 이유는 클로저가 `read` 안에서 생성되어 `read`의 actor isolation을 상속하기 때문이다.

또한 `reduce`는 동기적으로 실행되므로 클로저가 actor isolation 밖으로 빠져나가 동시에 실행될 가능성이 없다. 따라서 클로저 내부에서도 actor-isolated 메소드를 동기적으로 호출할 수 있다.

그렇다면 클로저를 액터와 독립적으로 실행해야 하는 경우에는 어떻게 될까? 예를 들어 책을 지금이 아니라 나중에 읽도록 작업을 분리하고 싶다면 detached task를 사용할 수 있다.

```swift
extension LibraryAccount {
    func readSome(_ book: Book) -> Int { ... }
    func read() -> Int { ... }
    
    func readLater() {
        Task.detached {
            await read()
        }
    }
}
```

detached task의 클로저는 액터가 수행 중인 다른 작업과 동시에 실행될 수 있다. ([Explore Structured Concurrency in Swift]({{<relref "posts/wwdc-swift-concurrency-explore-structured-concurrency-in-swift-2" >}})에서 detached task는 액터를 상속받지 않는다는걸 다뤘다.) 

따라서 이 클로저는 actor-isolated일 수 없으며 actor isolation 외부에서 실행된다. 결국 `read` 메소드를 호출하려면 액터에 비동기적으로 접근해야 하고, `await`로 호출해야 한다.

### Value type & reference type

```swift
actor LibraryAccount {
    let idNumber: Int
    var booksOnLoan: [Book] = []
    func selectRandomBook() -> Book? { ... }
}

struct Book {
    var title: String
    var authors: [Author]
}

func visit(_ account: LibraryAccount) async {
    guard var book = await account.selectRandomBook() else {
        return
    }
    book.title = "\(book.title)!!!" // OK: modifying a local copy
}
```

`Book`이 값 타입이라고 가정해 보자. 액터에서 `Book`을 리턴하면 값이 복사되므로, 리턴된 `Book`을 수정해도 액터가 가지고 있는 원래 값에는 영향을 주지 않는다.

{{< image src="image-004-optimized-image.webp" align="center" width="360">}}

```swift
class Book {
    var title: String
    var authors: [Author]
}
```

반대로, `Book`이 클래스라면 액터는 클래스 인스턴스에 대한 레퍼런스를 가지게 된다. 이 경우, `visit` 메소드를 호출하면 액터의 mutable state인 `Book`의 레퍼런스가 액터 외부로 공유되어서 데이터 레이스의 위험이 생긴다.

{{< image src="image-005-optimized-image.webp" align="center" width="480">}}

값 타입과 액터는 동시성 환경에서 안전하게 사용할 수 있지만, 일반적인 클래스와 같은 레퍼런스 타입은 주의해야 한다.

결국 actor isolation을 넘어서 값을 안전하게 전달하고 싶으면, 그 값이 안전하게 공유된다는 것을 보장해야 한다. Swift는 이러한 특성을 가진 타입을 `Sendable`로 표현한다.

### Sendable

`Sendable`은 해당 타입의 값을 서로 다른 액터와 같은 isolation 영역 사이에서 안전하게 전달할 수 있음을 나타낸다. Swift는 isolation 경계를 넘어 전달되는 값이 동시성 환경에서도 안전한지 Sendable을 통해 검사한다.

값을 복사한 뒤 양쪽에서 수정해도 서로에게 영향을 주지 않는 값 타입은 일반적으로 이 조건을 만족한다.

#### Actor Type

액터는 자신의 mutable state에 대한 접근을 동기화하는 메커니즘이 있으니 당연히 `Sendable`이다.

#### Class Type

클래스는 조금 더 복잡하다. 여러 곳에서 같은 인스턴스를 참조할 수 있기 때문에, 공유하더라도 데이터 레이스가 발생하지 않는다는 것을 보장할 수 있어야 한다.

예를 들어 불변 데이터만 가지고 있거나, 내부에서 lock과 같은 동기화 메커니즘을 사용해 mutable state에 대한 동시 접근을 안전하게 제어한다면 `Sendable`로 사용할 수 있다.

#### Structure Type

{{< callout type="warning" title="프로젝트 설정에 따라 다를 수 있음" >}}
최신 Swift에서 Default Actor Isolation이 `MainActor`로 되어있다면(이게 프로젝트 기본값이다), 아래 예제의 `Book` 자체가 메인 액터에 격리되어 동시 접근이 제한되기 때문에, 컴파일 에러를 발생시키지 않는다.

따라서 `Sendable`의 컴파일 타임 검사 결과는 Swift 버전과 언어 모드뿐만 아니라 Default Actor Isolation, Strict Concurrency Checking 등의 프로젝트 설정에 따라서도 달라질 수 있다.
{{< /callout >}}

```swift
struct Book: Sendable {
    var title: String
    var authors: [Author]
}
```

어떤 타입이 `Sendable`인지 명시하려면 다른 프로토콜과 마찬가지로 `Sendable`을 채택하면 된다. 여기서 `Book`은 모든 프로퍼티가 `Sendable`일 때 `Sendable`이 된다.

만약 `Author`가 `Sendable`이 아닌 클래스라면 `Author`의 배열도 `Sendable`이 아니게 된다. 따라서 이 코드는 컴파일 오류가 발생한다.

{{< image src="image-006-optimized-image.webp" >}}

{{< callout type="note" title="액터가 보장하는 것" >}}
액터가 보장하는 것은 프로그램이 의도한 논리적 상태까지 자동으로 유지해 준다는 뜻이 아니다. 액터가 보장하는 범위는 액터의 격리된 상태에 대한 동시 접근을 안전하게 직렬화해 데이터 레이스를 막는 것이다. 

액터 밖으로 공유한 reference type의 내부 값이 어떻게 바뀌는지까지 자동으로 보호해 주지는 않는다.
{{< /callout >}}

#### Generic Type

제네릭 타입은 제네릭 인자에 따라 `Sendable` 여부가 달라진다. 다음은 두 제네릭 파라미터 `T`와 `U`를 받는 `Pair` 스트럭처다:

```swift
struct Pair<T, U> {
    var first: T
    var second: U
}

extension Pair: Sendable where T: Sendable, U: Sendable { }
```

위의 예제처럼 제네릭 타입은 조건이 만족될 때만 `Sendable`을 채택하도록 선언할 수 있다.

#### Function Type

함수 값 자체도 `Sendable`일 수 있으므로 액터 사이에 안전하게 전달할 수 있다.

특히 클로저에서는 `Sendable`의 역할이 중요하다. 클로저는 주변의 값을 캡처할 수 있기 때문에, 클로저 자체뿐만 아니라 캡처한 값이 동시성 환경에서 안전한지도 보장되어야 한다. 이를 위해 `Sendable` 클로저에는 다음과 같은 제약이 적용된다.

- 가변 지역 변수를 캡처할 수 없다.
- 캡처하는 값은 모두 `Sendable`이어야 한다.
- 동기 `Sendable` 클로저는 actor-isolated일 수 없다. 액터 외부에서도 클로저를 동기적으로 호출할 수 있는데, 이때 호출부에서 액터에 진입하기 위한 `await`를 사용할 수 없기 때문이다. (앞서 `Hashable` 예시 코드와 비슷한 이유다)

사실 Swift Concurrency 관련 WWDC 세션의 많은 코드들은 `Sendable` 클로저에 의존하는데, 예를 들어서 detached task를 생성하는 연산은 `@Sendable` 함수 타입을 인자로 받는다.

## Main Actor

앱에서는 UI 업데이트와 사용자 인터랙션을 처리하는 작업을 메인 스레드에서 수행한다. 반면, 네트워크 통신이나 I/O처럼 시간이 오래 걸릴 수 있는 작업을 메인 스레드에서 수행하면 UI가 버벅거리나 멈출 수 있다.

따라서 일반적인 작업은 메인 스레드 외부에서 처리하고, 메인 스레드에서 실행해야 하는 작업만 메인 스레드에서 수행해야 한다.

과거에는 메인 스레드에서 실행해야 하는 작업을 `DispatchQueue.main.async`로 전달했다:

```swift
func checkedOut(_ booksOnLoan: [Book]) {
    booksView.checkedOutBooks = booksOnLoan
}

// Dispatching to the main queue is your responsibility.
DispatchQueue.main.async {
    checkedOut(booksOnLoan)
}
```

메인 스레드에서 실행 중일 때는 UI에 안전하게 접근할 수 있지만, 메인 스레드 외부에서 UI에 접근해야 한다면 위의 예시처럼 작업을 메인 디스패치 큐로 비동기적으로 전달해야 한다.

이러한 방식은 액터가 자신의 격리된 상태에 대한 접근을 조정하는 방식과 매우 유사하다. Swift Concurrency에서는 메인 스레드에서 실행되어야 하는 작업을 표현하기 위해 특별한 액터를 제공하는데, 이를 메인 액터라고 한다.

메인 액터가 일반 액터와 다른 점은 모든 동기화를 메인 디스패치 큐를 통해 수행하고, 메인 액터에서 실행되어야 하는 코드와 데이터가 프로그램 곳곳에 흩어져 있다는 것이다.

따라서 이러한 코드와 데이터를 메인 액터에 격리할 수 있는 방법이 필요하다. Swift에서는 선언에 `@MainActor` 어트리뷰트를 붙여 해당 선언을 메인 액터에 격리할 수 있다.

```swift
@MainActor func checkedOut(_ booksOnLoan: [Book]) {
    booksView.checkedOutBooks = booksOnLoan
}

// Swift ensures that this code is always run on the main thread.
await checkedOut(booksOnLoan)
```

위 코드에서는 `checkedOut`에 `@MainActor`를 붙였기 때문에 이 메소드는 항상 메인 액터에 격리되어 실행된다.

이렇게 메인 스레드에서 실행되어야 하는 코드를 `@MainActor`로 표시하면, 호출하는 쪽에서 `DispatchQueue.main`을 직접 사용할 필요가 없다. 

메인 액터 외부에서 이 메소드를 호출할 때는 다른 액터들과 같이 `await`가 필요하며, Swift가 메인 액터에서 실행될 수 있도록 조정한다.

`@MainActor`는 개별 메소드뿐만 아니라 타입 전체에도 적용할 수 있다. 이 경우 타입의 멤버와 해당 타입을 상속하는 서브클래스도 메인 액터에 격리된다:

{{< callout type="warning" title="`UIViewController`의 Main actor isolation" >}}
WWDC21 당시에는 `UIViewController` 자체가 `@MainActor`로 격리되어 있지 않았기 때문에 서브클래스에 명시적으로 `@MainActor`를 붙여야 했다.

이후 SDK가 업데이트되면서 `UIViewController` 자체가 `@MainActor`로 격리되었고, 이러한 격리는 서브클래스에도 적용된다. 따라서 최신 SDK에서는 아래 예제처럼 `UIViewController`의 서브클래스에 `@MainActor`를 다시 명시할 필요가 없다.
{{< /callout >}}

```swift
@MainActor class MyViewController: UIViewController {
    func onPress(...) { ... } // implicitly @MainActor

    nonisolated func fetchLatestAndDisplay() async { ... } 
}
```

개별 메소드는 `nonisolated` 키워드를 사용해 메인 액터의 isolation에서 제외할 수 있다. UI와 관련된 상태와 연산은 메인 액터에 격리하고, 그 밖에 독립적으로 보호해야 하는 공유 상태는 별도의 액터에 격리하자.

## 정리

액터는 actor isolation을 통해 자신의 mutable state에 대한 동시 접근을 직렬화하여 데이터 레이스를 방지한다. 액터 외부에서는 격리된 상태에 직접 접근할 수 없으며, 격리된 메소드를 호출하려면 일반적으로 `await`를 거쳐야 한다. 

이를 통해 공유 상태에 대한 동시 접근을 직접 동기화하는 대신, 액터라는 안에서 안전하게 관리할 수 있다.

다만 actor isolation이 프로그램의 논리적인 상태까지 자동으로 보호해 주는 것은 아니다. 액터는 reentrant하기 때문에 `await`에서 task가 중단된 동안 다른 task가 같은 액터에서 실행될 수 있다. 

따라서 `await`에 도달하기 전에는 액터를 일관된 상태로 만들어야 하며, 재개된 이후에는 이전의 상태가 여전히 유효한지 확인해야 한다.

Isolation 경계를 넘어 값을 전달할 때는 `Sendable`이 중요하다. 값 타입은 일반적으로 안전하게 전달할 수 있으며, 액터 역시 자신의 mutable state를 격리하므로 `Sendable`이다. 

반면 여러 곳에서 동일한 인스턴스를 공유하는 클래스와 같은 레퍼런스 타입은 자체적으로 동시성 안전성을 보장하지 않는다면 shared mutable state를 만들 수 있으므로 주의해야 한다. Swift는 `Sendable`과 `@Sendable`을 통해 이러한 값과 코드의 전달이 안전한지 컴파일 타임에 검사한다.

UI와 관련된 상태와 연산은 메인 액터에 격리할 수 있다. `@MainActor`를 사용하면 메인 스레드에서 실행되어야 하는 코드를 타입 시스템에 표현할 수 있으며, 호출하는 쪽에서 `DispatchQueue.main`을 직접 관리할 필요도 줄어든다. 

UI 이외에 독립적으로 보호해야 하는 공유 상태가 있다면 별도의 액터로 격리하여 각각의 동시성 영역을 구성할 수 있다.
