---
title: "Combine. Combine in Practice - WWDC19"
date: 2024-03-18

categories:
  - Swift
  - WWDC
series:
  - Legacy
tags:
  - Combine
  - Observer Pattern

draft: false
original: "notion-export/블로그 이관/Swift/Combine in Practice 266ade8f376583f1ad67818d14cb406d.md"
aliases:
  - /posts/wwdc-combine-in-practice/
---

## A unified, declarative API for processing values over time

Combine에서는 값이 시간의 흐름에 따라 전달되는 과정을 Publisher로 표현하고, 여러 연산자를 연결해 데이터가 변환되는 흐름을 선언적으로 작성한다. 아래 예제에서는 Notification으로 전달된 Data를 `MagicTrick`으로 디코딩한다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.tryMap { data in
		let decoder = JSONDecoder()
		try decoder.decode(MagicTrick.self, from: data)
	} // Output: MagicTrick, Failure: Error
```

`decode` 연산자를 사용하면 위 변환을 다음과 같이 줄여서 작성할 수 있다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.decode(MagicTrick.self, JSONDecoder()) // Output: MagicTrick, Failure: Error
```

## Error Handling

- 모든 Publisher는 자신이 발생시킬 수 있는 실패의 종류를 명확하게 정의한다.
- 실패가 발생하지 않거나 이미 처리된 경우에는 `Never`를 Failure 타입으로 사용한다.
- Combine은 실패를 감지하고 복구할 수 있는 다양한 연산자를 제공한다.

> Combine의 Publisher는 전달하는 값의 타입인 `Output`과 실패할 때 전달하는 오류의 타입인 `Failure`를 함께 가진다. 두 타입이 연산자를 거치며 어떻게 바뀌는지 확인하면 데이터 흐름과 오류 흐름을 함께 추적할 수 있다.

### assertNoFailure

실패가 발생하지 않는다고 선언하고 `Failure`를 `Never`로 바꾸는 가장 간단한 방법이다.

```swift
	.assertNoFailure() // Output: MagicTrick, Failure: Never
```

정상 값이 업스트림에서 도착하면 다운스트림 Subscriber에 전달한다.

에러가 업스트림에서 도착하면 프로그램이 크래시한다. 실제로 실패할 가능성이 있는 Publisher에는 신중하게 사용해야 한다.

### catch

에러가 도착하면 현재 Publisher를 새로운 Publisher로 교체한다.

```swift
	.catch {
		return Just(MagicTrick.placeholder) // Recovery 클로저
	} // Output: MagicTrick, Failure: Never
```

정상 값이 업스트림에서 도착하면 다운스트림 Subscriber에 전달한다.

에러가 업스트림에서 도착하면 현재 업스트림 연결이 종료되고, 제공된 Recovery 클로저가 호출되어 새로운 Publisher를 생성한다. 이후 생성된 Publisher를 구독해 새로운 값을 받을 수 있다.

`catch`는 실패한 업스트림을 복구 Publisher로 교체한다. 따라서 원래 업스트림과의 연결은 종료된다.

### flatMap

입력값이 들어올 때마다 새로운 Publisher를 만들고, 중첩된 Publisher를 하나의 흐름으로 평탄화한다. 아래 예제에서는 각 Data를 디코딩하고, 해당 디코딩이 실패했을 때만 placeholder를 반환한다. `catch`가 `flatMap` 내부에 있기 때문에 한 번의 디코딩 실패가 바깥의 Notification Publisher 전체를 종료시키지 않는다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.flatMap { data in
		return Just(data)
			.decode(MagicTrick.self, JSONDecoder())
			.catch {
				return Just(MagicTrck.placeholder)
			}
	} // Output: MagicTrick, Failure: Never
```

### KeyPath로 값 추출하기

`publisher(for:)`를 사용하면 Publisher가 전달하는 값에서 KeyPath에 해당하는 프로퍼티만 추출할 수 있다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.flatMap { data in
		return Just(data)
			.decode(MagicTrick.self, JSONDecoder())
			.catch {
				return Just(MagicTrck.placeholder)
			}
	} // Output: MagicTrick, Failure: Never
	.publisher(for: \.name) // Output: String, Failure: Never
```

## Scheduled Operators

이벤트가 언제, 어디에서 전달되는지를 제어하는 연산자들이다.

- `delay`: 이벤트 전달을 특정 미래 시간으로 미룬다.
- `throttle`: 이벤트가 특정 속도보다 더 빠르게 전달되지 않도록 한다.
- `receive(on:)`: 다운스트림에서 이벤트를 처리할 스레드나 큐를 지정한다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.flatMap { data in
		return Just(data)
			.decode(MagicTrick.self, JSONDecoder())
			.catch {
				return Just(MagicTrck.placeholder)
			}
	} // Output: MagicTrick, Failure: Never
	.publisher(for: \.name) // Output: String, Failure: Never
	.receive(on: RunLoop.main) // Output: String, Failure: Never 유지
```

## Subscriber

```swift
protocol Subscriber {
	associatedtype Input
	associatedtype Failure: Error
	
	// Subscription: Subscriber가 Publisher에서 Subscriber로 가는 데이터 플로우를 제어하는 방법
	func receive(subscription: Subscription)
	func receive(_ input: Input) -> Subscribers.Demand
	func receive(completion: Subscribers.Completion<Failure>)
}
```

Subscriber에는 다음 세 종류의 이벤트가 정해진 순서로 전달된다.

1. 구독이 시작되면 Publisher는 `receive(subscription:)`을 한 번 호출한다.
2. Publisher는 Subscriber가 요청한 만큼 0개 이상의 값을 `receive(_:)`로 전달한다.
3. Publisher는 최대 한 번 completion을 보낼 수 있고, completion 이후에는 더 이상 값을 전달할 수 없다.

모든 스트림이 completion을 보내는 것은 아니다. `NotificationCenter`처럼 계속 이벤트를 발행할 수 있는 스트림은 구독이 취소될 때까지 completion 없이 유지될 수 있다.

> Combine의 데이터 흐름은 `Subscription`을 통해 시작되고, 값이 전달된 뒤 completion 또는 취소로 끝난다. Publisher와 Subscriber 사이의 연결을 직접 제어하는 객체가 Subscription이다.

### Kinds of Subscriber

1. `assign`: Publisher가 전달한 값을 객체의 프로퍼티에 할당한다.

```swift
let rickNamePublisher = ... // <String, Never>
let canceller = trickNamePublisher.assign(to: \.someProperty, on: someObject)
// ...
canceller.cancel()
```

- `sink`: 전달된 값을 클로저에서 직접 처리한다.

```swift
let trickNamePublisher = ... // <String, Never>
let canceller = trickNamePublisher.sink { trickName in
	// Do something with trickName
}
```

수신된 모든 값에 대해 클로저가 호출되어 원하는 사이드 이펙트를 수행할 수 있다. `assign`과 마찬가지로 `sink`는 구독을 종료하는 데 사용할 수 있는 `AnyCancellable` 객체를 반환한다.

### Cancellation

Combine에는 구독을 일찍 종료하는 취소 기능이 내장되어 있다.

```swift
protocol Cancellable {
	func cancel()
}

final class AnyCancellable: Cancellable {} // 소멸될 때 자동으로 `cancel()`호출
```

`AnyCancellable`은 소멸될 때 자동으로 `cancel()`을 호출하므로, 별도로 취소 코드를 작성해야 하는 경우를 줄여준다.

### Subjects

- Behave like both Publisher and Subscriber
- Broadcast values to multiple subscribers

```swift
protocol Subject: Publisher, AnyObject {
	func send(_ value: Output)
	func send(completion: Subscribers.Completion<Failure>)
}
```

Subject는 여러 다운스트림 Subscriber에게 값을 브로드캐스트하고, `send()`를 통해 값을 직접 전송할 수도 있다.

1. `PassthroughSubject`: 값을 저장하지 않으므로 Subscriber가 연결된 이후에 발생한 값만 전달한다.
2. `CurrentValueSubject`: 마지막 값을 저장하므로 Subscriber가 연결될 때 현재 값을 바로 전달한다.

> Subject는 Publisher이면서 동시에 값을 직접 발행할 수 있는 입력 지점이다. 외부 이벤트를 Combine 흐름에 넣을 때 유용하지만, 모든 상태를 Subject로 관리하기보다는 `@Published`처럼 목적이 분명한 Publisher를 먼저 고려하는 편이 좋다.

```swift
let trickNamePublisher = ... // <String, Never>
let magicWordsSubject = PassthroughSubject<String, Never>()
trickNamePublisher.subscribe(magicWordsSubject) // Subscriber 처럼 업스트림 퍼블리셔를 subscribe 할 수 있음

let canceller = magicWordsSubject.sink { value in
	// do something with the value
} // Publisher처럼 sink 연산자를 호출할 수 있음
magicWordsSubject.send("Please") // 직접 값을 보내기

// 스트림에 Subject를 삽입하는 연산자 Share
// Passthrough Subject를 스트림에 삽입한다.
let sharedTrickNamePublisher = trickNamePublisher.share()
```

### Working with SwiftUI

SwiftUI가 Subscriber를 소유하고, 개발자는 Publisher를 제공하면 된다.

```swift
protocol BindableObject { // 현재는 ObservableObject로 이름이 바뀜
	associatedtype PublisherType: Publisher where PublisherType.Failure == Never
	var didChange: PublisherType { get }
}
```

- `PublisherType`: 실패할 가능성이 없는 Publisher 타입
    - UI에 값이 반영되기 전에 Swift의 타입 시스템이 업스트림의 오류 타입을 확인할 수 있어 UI 프레임워크에서 유용하다.
    - 다만 `PublisherType`은 실제로 전달되는 값의 타입이 아니라, 변경 이벤트를 전달하는 Publisher의 타입이다.
- `didChange`: 상태가 변했음을 UI에 알리는 Publisher
    - UI 업데이트는 상태 변화에 따라 자동으로 이루어지므로 특정 값을 보낼 필요가 없고, 보통 `<Void, Never>` 형태를 사용한다.
    - SwiftUI는 `didChange` 이벤트를 받으면 View의 `body`를 다시 평가해 UI를 업데이트한다.
    
    ```swift
    class WizardModel: BindableObject { // ObservableObject
    	var trick: WizardTrick { didSet { didChange.send() } }
    	var wand: wand? { didSet { didChange.send() } }
    	
    	let didChange = PassthroughSubject<Void, Never>()
    }
    
    struct TrickView: View {
    	@ObjectBinding var model: WizardModel // @ObservedObject로 이름 바뀜
    	
    	var body: some View {
    		Text(model.trick.name)
    	}
    }
    ```
    
    - `trick`의 상태가 변하면 `didSet`에 의해 `didChange`가 이벤트를 발행하고, `@ObjectBinding`으로 래핑된 model의 변화에 반응해 `body`가 다시 평가된다.
    - 현재 SwiftUI에서는 `BindableObject`와 `@ObjectBinding`이 각각 `ObservableObject`와 `@ObservedObject`로 변경되었다.

## Integrating Combine

### Designed for composition

Combine의 장점은 작은 Publisher와 연산자를 조합해 더 큰 데이터 흐름을 만들 수 있다는 점이다. 다음 예제에서는 텍스트 필드의 값을 `@Published` Publisher로 제공한다.

```swift
@Published var password: String = ""
@IBAction func passwordChanged(_ sender: UITextField) {
	password = send.text ?? ""
}
```

### @Published

`@Published` 프로퍼티 래퍼를 사용하면 프로퍼티에 Publisher를 추가할 수 있다. 프로퍼티의 현재 값은 그대로 사용하면서, `$` 접두사를 통해 값의 변경을 발행하는 Publisher에 접근할 수 있다.

```swift
@Published var password: String = ""
self.password = "1234" // @Published가 붙어있어도 일반 프로퍼티와 똑같이 사용 가능
let currentPassword: String = self.password

// 프레픽스로 $를 붙인 경우에는 래핑된 값에 접근하게 되며, 퍼블리셔에서 사용하는 모든 연산자 사용 가능
let printerSubscription = $password.sink { // sink를 사용해서 구독
	print("The published value is '\($0)'")
}

// password의 값이 변경되면, 그 때 Subscriber가 변경된 값을 받게 된다.
self.password = "password"
```

### 유용한 컴바인 연산자

```swift
@Published var password: String = ""
@Published var passwordAgain: String = ""

var validatedPassword: CombineLatest<Published<String>, Published<String>, String?> {
	return CombineLatest($password, $passwordAgain) { password, passwordAgain in
		guard password == passwordAgain, password.count > 8 else { return nil }
		return password
	} // <String?, Never>
	.map { $0 == "password1" ? nil : $0 } // <String?, Never>
	.eraseToAnyPublisher() // <String, Never> 타입 유지
}
```

- `eraseToAnyPublisher()`: API의 경계를 명확하게 정의하고 내부 구현을 감춘다.
    - 구체적인 `CombineLatest<...>` 타입 대신 `AnyPublisher<String?, Never>`를 반환하면 사용하는 쪽은 입력과 출력 타입만 알면 된다.

```swift
@Published var username: String = ""

var validatedUsername: AnyPublisher<String, Never> {
	return $username
		.debounce(for: 0.5, scheduler: RunLoop.main)
		.removeDuplicates() // <String, Never>
		.eraseToAnyPublisher() // <String, Never>
}
```

- `debounce`: 지정한 시간 동안 새로운 값이 발생하지 않을 때 마지막 값을 발행한다. 예를 들어 0.5초로 설정하면 사용자가 타이핑하는 동안에는 값을 보내지 않고, 입력이 멈춘 뒤 0.5초가 지나면 마지막 값을 보낸다.
- `removeDuplicates`: 연속해서 발행되는 값 중 중복된 값을 제거한다.

### Future

`Future`는 비동기 작업의 결과를 Publisher 형태로 반환한다. 클로저 기반으로 동작하며, `promise`를 사용해 작업의 성공 또는 실패 결과를 전달한다.

```swift
@Published var username: String = ""

var validatedUsername: AnyPublisher<String, Never> {
	return $username
		.debounce(for: 0.5, scheduler: RunLoop.main)
		.removeDuplicates() // <String, Never>
		.flatMap { username in
			return Future { promise in
				self.usernameAvailable(username) { available in
					promise(.success(available ? username : nil))
				}
			}
		}
		.eraseToAnyPublisher() // <String?, Never>
}

// func usernameAvailable(_ username: Stirng, completion: (Bool) -> Void)
```

- 비동기 처리를 위해 `Future` Publisher가 필요하므로 `flatMap`으로 중첩된 Publisher를 하나의 흐름으로 연결한다.
- `promise`: 비동기 작업이 성공하면 결과값을 발행하고, 실패하면 실패 상태를 발행한다.

### 최종 예제 코드

```swift
var validatedCredentials: AnyPublisher<(String, String), Never> {
	return CombineLatest(validatedUsername, validatedPassword) { username, password in
		guard let uname = username, let pwd = password else { return nil }
		return (uname, pwd)
	}
	.eraseToAnyPublisher()
} // <(String, String)?, Never>

@IBOutlet var signupButton: UIButton!

var signupButtonStream: AnyCancellable?

override func viewDidLoad() {
	super.viewDidLoad()
	
	self.signButtonStream = self.validatedCredentials
		.map { $0 != nil }
		.receive(on: RunLoop.main)
		.assign(to: \.isEnabled, on: signupButton)
}
```
