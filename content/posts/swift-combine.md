---
title: "WWDC Note. Combine"
date: 2024-03-17

categories: 
    - Swift
series:
tags:
    - Swift
    - Combine
    - Publisher
    - Subscriber
    - Operator

draft: true
original: "notion-export/블로그 이관/Swift/Combine d84ade8f376583aa8e6a81dc3736c877.md"
---

## WWDC 레퍼런스

[WWDC19 - Introducing Combine](https://developer.apple.com/videos/play/wwdc2019/722/)

## Combine

> Customize handling of asynchronous events by combining event-processing operators.
> 
> 결합된 이벤트 처리 연산자를 이용하여 비동기 이벤트 처리를 커스터마이즈 하는 방법

데이터 흐름을 간편하게 처리하고, 비동기 이벤트를 관리할 수 있는 도구를 제공하는 프레임워크, 다양한 소스에서 발생하는 이벤트를 처리하고, 이들 간의 상호 작용을 쉽게 구현 가능

## 0. 특징

- Generic
- Type safe
- Composition first
- Request driven

## 1. 키 콘셉트

### Publisher

> 값과 에러가 어떻게 생성되는지를 정의한다.
값 타입
> 

데이터를 발행하는 주체, 특정 이벤트가 발생하거나 값이 변경될 때 이 정보를 Subscriber에 전달한다. `Just`, `PassthroughSubject`, `CurrentValueSubject`, `@Published` 등이 있다.

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
값을 수신할 때, 상태를 변경하고 작업을 수행하기 때문에, **참조 타입** - 따라서 구독자는 클래스
> 

Publisher가 발행한 데이터를 구독하고 처리하는 객체, 이벤트를 수신하면 특정 작업을 수행한다. `sink` 등이 있다.

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

> `Publisher`프로토콜을 컨펌한다.
값을 변화시키기 위한 행동을 묘사한다.
Publisher를 구독한다. (업스트림)
결과를 Subscriber에 보낸다. (다운스트림)
> 

Publisher와 구독자 간의 데이터를 변환하거나 필터링 하는 기능을 제공한다. 데이터를 조작하거나 조합하는데 사용된다.

```swift
extension Publishers {
		struct Map<Upstream: Publisher, Output>: Publisher {
				typealias Failure = Upstream.Failure
				
				let upstream: Upstream
				let transform: (Upstream.Output) -> Output
			}
}
```

#### Declarative Operator API

- Functional transformations: `map`, `filter`, `flatMap`과 같은 연산자들
- List operations: `collect`, `first(where:)`와 같은 연산
- Error handling: 에러 처리, `catch`, `retry`와 같은 연산자를 통해 복구나 재시도 작업 가능
- Thread or queue movement: 데이터 처리를 어느 쓰레드나 큐에서 실행할지 지정하는 연산자 `receive(on:)`이나 `subscribe(on:)`과 같은 연산자를 사용한다.
- Scheduling and time: 데이터 처리의 시간적 요소를 다루는 연산자 `debounce`, `delay`, `throttle`같은 연산자들

#### Zip

- Converts several inputs into a single tuple: 여러 Publisher에서 들어오는 값을 하나의 튜플로 변환
- A “when/and” operation: 각 Publisher가 값을 발행 했을 때(when), 그 값을 and 연산으로 묶어 처리 → 모든 퍼블리셔가 값을 발행할 때 까지 기다렸다가, 그 값을 조합하여 한번에 처리
- Requires input from all to proceed: 모든 입력 Publisher로부터 값이 올 때까지 대기

#### Combine Latest

- Converts several inputs into a single value: 여러 Publisher에서 입력된 값을 결합하여 하나의 값으로 만든다.
- A "when/or" operation: 하나의 Publisher에서 값이 발행되면, 다른 Publisher의 최신 값과 결합하여 값을 만든다. → 새로운 값이 발행될 . 때마다 그 값과 결합하여 새로운 결과를 만든다.
- Requires input from any to proceed: `zip`과 다르게 `Combine Latest`는 모든 Publisher가 값을 발행할 필요가 없음. 하나의 Publisher라도 값을 발행하게 된다면, 가장 최근의 다른 Publisher의 값과 결합하여 데이터를 처리한다.
- Stores last value: 각 Publisher에서 발행된 마지막 값을 저장하고, 새로운 값이 들어올때 마다 저장된 최신 값들과 결합하여 새로운 값 생성

> Zip과 CombineLatest는 최대 9개의 Publisher까지 결합할 수 있도록 빌트인 되어있음. 
> 
> ex) `Zip3`, `Zip9`, `CombineLatest3`, `CombineLatest9`, …

## 2. Patterns

1. Subscriber **is attached** to Publisher
2. Publisher **sends a** Subscription
3. Subscriber **requests *N*** values
4. Publisher **sends *N* values or less**
5. Publisher **sends completion**

> One **Subscription**, zero or more **values**, and a single **completion**.
> 

## 3. Publisher

데이터의 변경이나 이벤트 발생 시에 하나 이상의 구독자에게 전달하는 역할을 한다. 다양한 소스에서 발생하는 이벤트를 처리할 수 있는 구성 요소이다.

### 주요 기능

1. 데이터 발행: 네트워크 요청 결과, 사용자 입력, 특정 조건 충족과 같은 상황에서 데이터를 발행할 수 있다.
2. 구독 관리: Subscriber가 구독을 요청할 때 구독을 관리한다.

### Publisher Protocol

publisher의 `Output`, `Failure` 타입은 subcriber의 `Input`, `Failure` 타입과 일치해야 한다. publisher는 하나 이상의 subscriber에게 원소를 전달하고, publisher는 `receive(subscriber:)` 메소드를 통해 subscriber 구독을 승인한다.

이 이후에 publisher는 subscriber에게 다음 메소드들을 호출할 수 있다.

- `receive(subscription:)`: 구독 요청을 승인하고, `Subscription` 인스턴스를 리턴한다. subscriber는 `subscription`을 사용하여 publisher에게 원소를 요청하고 publishing을 취소하는데 사용할 수 있다.
    - `.finished`: 작업이 정상적으로 완료
    - `.failure(let error)`: 작업이 실패
- `receive(_:)`: publisher에서 subscriber에게 하나의 원소를 전달한다.
- `receive(completion:)`: publish가 종료되었음을 subscriber에게 알린다.

모든 `Publisher`는 다운스트림 subscriber들이 정확하게 동작하게 하려면 위의 사항을 준수해야 한다.

### 종류

1. `Just`: 단일 값 발행
    
    ```swift
    let justPublisher = Just("Hello, World!")
    ```
    
2. `Future`: 비동기 작업의 결과를 한 번만 발행하고 완료한다.
    
    ```swift
    let future = Future<String, Error> { promise in
        promise(.success("Hello"))
    }
    ```
    
3. `PassthroughSubject`: 여러 값을 수동으로 발행
    
    ```swift
    let subject = PassthroughSubject<String, Never>()
    
    subject.send("First Value")
    subject.send("Second Value")
    subject.send(completion: .finished)
    ```
    
4. `CurrentValueSubject`: 마지막으로 발행된 값을 기억하고, 새로운 구독자에게 전달
    
    ```swift
    let currentValueSubject = CurrentValueSubject<Int, Never>(0) // 초기값 0
    
    currentValueSubject.send(1)
    currentValueSubject.send(2)
    ```
    
5. `URLSession.DataTaskPublisher`: 네트워크 요청을 퍼블리셔로 변환하여 데이터를 처리한다.
    
    ```swift
    let publisher = URLSession.shared.dataTaskPublisher(for: URL(string: "https://example.com")!)
    ```
    
6. `@Published`: 클래스의 프로퍼티에 사용하여 값이 변경될 때 자동으로 이벤트 발행
    1. 자세한 내용은 Combine in Practice에서…
7. `NotificationCenter.default.publisher`: 노티피케이션을 반응형으로 처리할 수 있게 해주는 퍼블리셔
    
    ```swift
    var cancellable = NotificationCenter.default.publisher(for: .myNotification)
        .sink { notification in
            print("Notification received: \(notification)")
        }
    ```