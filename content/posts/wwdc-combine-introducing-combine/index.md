---
title: "Combine. Introducing Combine - WWDC19"
date: 2024-03-17

categories:
  - Swift
  - WWDC
series:
  - Legacy
tags:
  - Combine
  - Observer Pattern

draft: false
original: "notion-export/블로그 이관/Swift/Combine d84ade8f376583aa8e6a81dc3736c877.md"
aliases:
  - /posts/wwdc-combine-introducing-combine/
---

## Combine

> Customize handling of asynchronous events by combining event-processing operators.
> 
> 결합된 이벤트 처리 연산자를 이용하여 비동기 이벤트 처리를 커스터마이즈 하는 방법

Combine은 데이터 흐름을 간편하게 처리하고 비동기 이벤트를 관리하기 위한 프레임워크다. 다양한 소스에서 발생하는 이벤트를 같은 방식으로 다루고, 이벤트 사이의 상호작용을 연산자로 조합할 수 있다.

## 특징

- Generic: 제네릭을 사용해 다양한 타입의 데이터 흐름을 표현한다.
- Type safe: Publisher의 출력 타입과 실패 타입을 컴파일 타임에 확인한다.
- Composition first: 작은 Publisher와 연산자를 조합해 더 큰 흐름을 만든다.
- Request driven: Subscriber가 필요한 만큼의 값을 요청하는 방식으로 흐름을 제어한다.

## 핵심 개념

### Publisher

> 값과 에러가 어떻게 생성되는지를 정의한다.
> 

Publisher는 데이터를 발행하는 주체다. 특정 이벤트가 발생하거나 값이 변경되면 이 정보를 Subscriber에 전달한다. `Just`, `PassthroughSubject`, `CurrentValueSubject`, `@Published` 등이 Publisher 역할을 한다.

Publisher는 자신이 발행하는 값의 타입과 실패할 때 전달하는 오류의 타입을 함께 정의한다. 이 두 타입이 뒤에서 Subscriber의 입력 타입과 실패 타입으로 연결된다.

```swift
protocol Publisher {
		associatedtype Output // 생성할 값의 종류
		associatedtype Failure: Error // 생성할 에러의 종류
		
		func subscribe<S: Subscriber>(_ subscriber: S) 
				where S.Input == Output, S.Failure == Failure
		// Subscriber의 input, output이 Publisher의 input, output과 매치되어야 한다.
}
```

### Subscriber

> 값과 완료 이벤트를 받는다.
>
> 값을 수신하면 상태를 변경하거나 작업을 수행한다.

Subscriber는 Publisher가 발행한 데이터를 구독하고 처리한다. 이벤트를 받으면 필요한 작업을 수행하며, `sink`가 대표적인 Subscriber 생성 방법이다. Subscriber가 반드시 클래스여야 하는 것은 아니지만, 실제 구독 상태는 Subscription을 통해 유지된다.

```swift
protocol Subscriber {
		associatedtype Input
		associatedtype Failure: Error
		
		// Subscription: Subscriber가 Publisher에서 Subscriber로 가는 데이터 플로우를 제어하는 방법
		func receive(subscription: Subscription)
		func receive(_ input: Input) -> Subscribers.Demand
		func receive(completion: Subscribers.Completion<Failure>)
```

### Operators

> `Publisher` 프로토콜을 채택하고, 값을 변화시키기 위한 행동을 묘사한다
>
> 업스트림에서는 Publisher를 구독해서 값을 받아오고, 결과를 Subscriber에 다운스트림(publish)한다.

Operator는 Publisher와 Subscriber 사이에서 데이터를 변환하거나 필터링한다. Operator 자체도 새로운 Publisher를 반환하므로 여러 연산자를 이어 붙여 데이터 흐름을 조합할 수 있다.

```swift
extension Publishers {
		struct Map<Upstream: Publisher, Output>: Publisher {
				typealias Failure = Upstream.Failure
				
				let upstream: Upstream
				let transform: (Upstream.Output) -> Output
			}
}
```

#### 선언적인 Operator API

- Functional transformations: `map`, `filter`, `flatMap`과 같은 데이터 변환 연산자
- List operations: `collect`, `first(where:)`와 같은 컬렉션 연산자
- Error handling: `catch`, `retry`를 사용한 오류 복구와 재시도
- Thread or queue movement: `receive(on:)`, `subscribe(on:)`을 사용한 실행 위치 제어
- Scheduling and time: `debounce`, `delay`, `throttle`을 사용한 시간 제어

#### Zip

`Zip`은 여러 Publisher의 값을 하나의 튜플로 묶는다. 모든 Publisher가 값을 하나씩 발행할 때까지 기다렸다가 같은 순서의 값들을 조합하므로, 모든 입력이 준비되어야 다음 값을 발행할 수 있다.

#### CombineLatest

`CombineLatest`는 여러 Publisher의 최신 값을 결합해 하나의 값을 만든다. 모든 Publisher가 최소 한 번씩 값을 발행한 뒤에는 어느 하나에서 새 값이 들어올 때마다 다른 Publisher의 최신 값과 함께 새로운 결과를 발행한다.

`Zip`과 `CombineLatest`는 최대 9개의 Publisher까지 결합할 수 있는 오버로드를 제공한다.

> `Zip`은 모든 입력에서 같은 순서의 값이 모일 때까지 기다리고, `CombineLatest`는 모든 입력에 최초 값이 생긴 뒤 어느 하나라도 값이 바뀌면 최신 값들을 다시 조합한다. 모든 입력을 한 묶음으로 처리해야 하면 `Zip`, 최신 상태를 계속 조합해야 하면 `CombineLatest`를 사용한다.

예를 들어 `Zip3`, `Zip9`, `CombineLatest3`, `CombineLatest9`처럼 여러 입력을 조합하는 타입이 제공된다.

## Publisher의 동작 방식

Publisher와 Subscriber 사이에는 Subscription이 만들어지고, 이 Subscription을 통해 실제 데이터 흐름이 시작된다.

1. Subscriber **is attached** to Publisher
2. Publisher **sends a** Subscription
3. Subscriber **requests *N*** values
4. Publisher **sends *N* values or less**
5. Publisher **sends completion**

하나의 Subscription이 만들어지고, 그 뒤에 0개 이상의 값과 최대 한 번의 completion이 전달된다.

### Publisher Protocol

Publisher의 `Output`, `Failure` 타입은 Subscriber의 `Input`, `Failure` 타입과 일치해야 한다. Publisher는 `receive(subscriber:)`를 통해 Subscriber의 구독을 받아들이고, 그 과정에서 Subscription을 전달한다.

구독이 시작되면 Publisher는 Subscriber에게 다음 이벤트를 순서대로 전달한다.

- `receive(subscription:)`: Publisher가 전달한 Subscription을 받는다. Subscriber는 Subscription을 통해 값을 요청하거나 구독을 취소할 수 있다.
- `receive(_:)`: Publisher가 전달한 하나의 값을 받는다. 반환하는 Demand로 다음에 받을 값의 양을 조절할 수 있다.
- `receive(completion:)`: Publisher가 종료되었음을 알린다. 정상 종료는 `.finished`, 오류 종료는 `.failure(let error)`로 표현한다.

모든 `Publisher`는 이 순서를 지켜야 Subscriber가 데이터 흐름을 예측할 수 있다.

### Publisher의 종류

Publisher는 값을 어떻게 만들고 전달하느냐에 따라 여러 형태로 사용할 수 있다.

1. `Just`: 단일 값 발행
    
    ```swift
    let justPublisher = Just("Hello, World!")
    ```
    
2. `Future`: 비동기 작업의 결과를 한 번 발행하고 완료한다.
    
    ```swift
    let future = Future<String, Error> { promise in
        promise(.success("Hello"))
    }
    ```
    
3. `PassthroughSubject`: 여러 값을 수동으로 발행한다.
    
    ```swift
    let subject = PassthroughSubject<String, Never>()
    
    subject.send("First Value")
    subject.send("Second Value")
    subject.send(completion: .finished)
    ```
    
4. `CurrentValueSubject`: 마지막으로 발행된 값을 기억하고 새로운 구독자에게 전달한다.
    
    ```swift
    let currentValueSubject = CurrentValueSubject<Int, Never>(0) // 초기값 0
    
    currentValueSubject.send(1)
    currentValueSubject.send(2)
    ```
    
5. `URLSession.DataTaskPublisher`: 네트워크 요청을 Publisher로 변환해 응답 데이터를 처리한다.
    
    ```swift
    let publisher = URLSession.shared.dataTaskPublisher(for: URL(string: "https://example.com")!)
    ```
    
6. `@Published`: 클래스의 프로퍼티에 사용해 값이 변경될 때 자동으로 이벤트를 발행한다.
7. `NotificationCenter.default.publisher`: Notification을 반응형으로 처리할 수 있게 해주는 Publisher다.
    
    ```swift
    var cancellable = NotificationCenter.default.publisher(for: .myNotification)
        .sink { notification in
            print("Notification received: \(notification)")
    }
    ```

## 정리

Combine의 기본 단위는 값을 발행하는 `Publisher`, 값을 받아 처리하는 `Subscriber`, 그리고 두 요소 사이에서 흐름을 변환하는 `Operator`다. Publisher와 Subscriber는 `Subscription`을 통해 연결되고, `Output`과 `Failure` 타입을 이용해 데이터와 오류의 흐름을 컴파일 타임에 확인한다.

여러 Publisher를 조합할 때는 모든 입력을 같은 순서로 묶는 `Zip`과, 각 입력의 최신 상태를 계속 조합하는 `CombineLatest`를 구분해서 사용하면 된다.
