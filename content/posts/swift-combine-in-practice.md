---
title: "WWDC Note. Combine in Practice"
date: 2024-03-18

categories:
  - Swift
series:
  - Combine
tags:
  - Swift
  - Combine
  - Publisher
  - Subscriber
  - Operator

draft: false
original: "notion-export/블로그 이관/Swift/Combine in Practice 266ade8f376583f1ad67818d14cb406d.md"
---

## WWDC 레퍼런스

- [WWDC19 - Combine in Practice](https://developer.apple.com/videos/play/wwdc2019/721/)

## A unified, declarative API for processing values over time

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

위를 아래와 같이 단축해서 작성할 수 있다.

```swift
let trickNamePublisher = NotificationCenter.default.publisher(for: .newTrickDownloaded)
	.map { notification in
		return notification.userInfo?["data"] as! Data
	} // Output: Data, Failure: Never
	.decode(MagicTrick.self, JSONDecoder()) // Output: MagicTrick, Failure: Error
```

## Error Handling

> Every `Publisher` describes how they can fail
Use operators to react/recover from errors
> 
- 모든 Publisher와 Subscriber는 생성하거나, 허용하는 실패의 종류를 명확하게 정의할 수 있다.
- 일반적인 Swift와 다르게 오류 처리를 Convention-based(개발자가 직접 컨벤션에 맞도록)하게 처리하지 않는다. (오류가 아예 발생하지 않거나, 혹은 이미 실패 처리가 완료된 경우에 `Never`를 쓰는 것 처럼)
- Combine 에서는 실패를 감지하고 복구할 수 있는 다양한 연산자를 제공한다.
1. `assertNoFailure`: 가장 간단한 방법 - 실패가 발생하지 않는다고 선언하기

```swift
	.assertNoFailure() // Output: MagicTrick, Failure: Never
```

정상 값이 업스트림에서 도착하면 다운스트림 Subscriber에 잘 보낸다.

에러가 업스트림에서 도착하면, 프로그램이 크러시 나게 된다.

1. `catch`: 에러가 도착하면 원래의 Publisher를 새로운 Publisher로 교체한다.

```swift
	.catch {
		return Just(MagicTrick.placeholder) // Recovery 클로저
	} // Output: MagicTrick, Failure: Never
```

정상 값이 업스트림에서 도착한다면 다운스트림 Subscriber에 잘 보낸다.

에러가 업스트림에서 도착하면, 현재 존재하는 업스트림 커넥션이 종료되고, 제공된 `Recovery`클로저가 호출되어 새로운 Publisher를 생성한다. 이후 생성된 Publisher를 구독하여 새로운 값을 받을 수 있게 된다.

→ 하지만 Subscription을 종료시켰으므로, 기존 업스트림과의 관계가 끊어지게 된다.

1. `flatMap`: 데이터가 들어 올 때마다 새로운 Publisher를 생성
    1. 중첩된 퍼블리셔 (위의 `catch`처럼 Publisher가 새로운 Publisher를 생성하는 경우)를 하나의 단일 퍼블리셔로 만들어 줌
        1. 아래 예제에서는 `decode`의 Output, Failure, `catch` Output, Failure가 다 다른데, 이것들을 하나의 `<MagicTrick, Never>` 퍼블리셔로 만듦
    2. 우선 위의 `catch`의 문제, 새로운 데이터가 도착했을 때, 기존 업스트림과의 관계가 끊어져있는 상황을 방지하는게 가능 (`flatMap`내부의 `catch`문은 해당 스코프 내부의 관계만 끊음)

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

1. `publisher(for:)`: 타입 키 패스

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

> 이벤트가 전달되는 시점과 장소를 설명한다.
> 
1. `delay`: 이벤트 전달을 특정 미래 시간으로 미룬다.
2. `throttle`: 이벤트가 특정 속도보다 더 빠르게 전달되지 않도록 한다.
3. `receive(on:)`: 다운스트림에서 수신한 이벤트가 특정 스레드나 큐에서 처리될 수 있도록 보장한다.

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
```

세 가지 이벤트가 함수가 호출되는 규칙

1. subscribe 호출에 응답하여, Publisher는 `receive(subscription:)`을 한번 호출한다.
2. Publisher는 Subscriber가 요청한 만큼 0개 이상의 값을 다운스트림으로 제공할 수 있다. (`receive(_:)`)
3. Publisher는 최대 한번의 completion을 보낼 수 있다. 이 이후에는 더 이상 값을 퍼블리시 할 수 없다.

completion을 ‘최대 한번’ 받을 수도 있다는 것은, 일부 스트림은 무한할 수도 있기 때문에 completion을 받지 못할 수도 있음  NotificationCenter처럼

### Kinds of Subscriber

1. `assign`: 연산자

```swift
let rickNamePublisher = ... // <String, Never>
let canceller = trickNamePublisher.assign(to: \.someProperty, on: someObject)
// ...
canceller.cancel()
```

- `sink`: 연산자

```swift
let trickNamePublisher = ... // <String, Never>
let canceller = trickNamePublisher.sink { trickName in
	// Do something with trickName
}
```

수신된 모든 값에 대해 클로저가 호출되어 원하는 사이드 이펙트를 수행할 수 있다. `assign`과 마찬가지로, `sink`는 구독을 종료하는데 사용할 수 있는 `Cancellable` 객체를 리턴한다.

→ 더 정확하게는 `AnyCancellable` 객체를 리턴한다.

### Cancellation

- Built into Combine
- Terminate subscriptions early

```swift
protocol Cancellable {
	func cancel()
}

final class AnyCancellable: Cancellable {} // 소멸될 때 자동으로 `cancel()`호출
```

`AnyCancellable`:소멸될 때 자동으로 `cancel()`을 호출하여 명시적으로 `cancel()`호출하는 경우를 줄여줌

### Subjects

- Behave like both Publisher and Subscriber
- Broadcast values to multiple subscribers

```swift
protocol Subject: Publisher, AnyObject {
	func send(_ value: Output)
	func send(completion: Subscribers.Completion<Failure>)
}
```

여러 다운스트림 Subscriber에게 값을 브로드캐스트하거나, `send()`를 통해 직접 전송할 수도 있음.

1. Passthrough: 값을 저장하지 않는 Subject → Subscriber가 연결된 이후에 발생한 값 만을 받을 수 있다.
2. CurrentValue: 마지막으로 받은 값을 저장하는 Subject → Subscriber가 연결될 때, 마지막 값을 수신할 수 있다.

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

> SwiftUI owns the `Subscriber`
You just need to bring a `Publisher`
> 

```swift
protocol BindableObject { // 현재는 ObservableObject로 이름이 바뀜
	associatedtype PublisherType: Publisher where PublisherType.Failure == Never
	var didChange: PublisherType { get }
}
```

- `PublisherType`: 실패할 가능성이 없는 퍼블리셔 타입
    - Publisher가 publish 한 값이 UI에 반영되기 전에 Swift의 타입 시스템이 업스트림의 오류를 처리하도록 하기 때문에 UI 프레임워크 작업에서 유용함
    - → Swift는 컴파일 타임에 타입 에러를 잡아내기 때문에, UI 업데이트 이전에 타입이 유효하다고 보장할 수 있음
    - → 하지만 오해하면 안 되는 것, `PublisherType`이 실제로 보내지는 값의 타입이 아니다.
- `didChange`: state가 변했을 때, 변경 이벤트를 보내는 Publisher, 속성의 값이 변화했음을 UI에 알려주는 역할
    - state 변화에 따른 UI 업데이트가 자동으로 이루어지기 때문에 특정 타입을 보낼 필요는 없음. `<Void, Never>`꼴
    - SwiftUI 프레임워크에선 `body`에서 호출된 내용을 기반으로 처리 → `didChange`에서 이벤트를 수신하게 된다면, 자동으로 `body`를 다시 호출(보다는 evaluate)해서 UI를 업데이트 하는 방식, 결국 `didChange`가 직접 값을 보낼 이유가 없다.
    
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
    
    - `trick`의 state가 변하게 된다면, `didSet`에 의해서 `didChange`가 이벤트를 publish하고 → `@ObjectBinding`으로 래핑된 model의 상태 변화에 반응해서 `body`프로퍼티를 다시 evaluate하게 된다.
    - 자세한건 Data Flow in SwiftUI 비디오에서…

## Integrating Combine

### Designed for composition

```swift
@Published var password: String = ""
@IBAction func passwordChanged(_ sender: UITextField) {
	password = send.text ?? ""
}
```

### @Published

`@Published`프로퍼티 래퍼를 사용해서 프로퍼티에 퍼블리셔를 추가할 수 있다.

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

- `eraseToAnyPublisher()`: API의 경계를 명확하게 정의하고, 내부 구현을 감추고, 필요한 정보만 알게 함
    - API 경계를 명확하게 정의한다: 입/출력을 명확하게 하고, API를 사용할 때 기대할 수 있는 동작을 규정한다.
    - 내부 구현을 감추고, 필요한 정보만 알게 한다: 기존 타입이 `CombineLastest<…>` 타입이였는데 이를 `AnyPublisher<String?, Never>`로 바꿔서 내부 구현에 신경쓰지 않도록 만듦

```swift
@Published var username: String = ""

var validatedUsername: AnyPublisher<String, Never> {
	return $username
		.debounce(for: 0.5, scheduler: RunLoop.main)
		.removeDuplicates() // <String, Never>
		.eraseToAnyPublisher() // <String, Never>
}
```

- `debounce`: 특정한 window(시간의 간격)를 설정하여 그 간격보다 짧은 시간 내에 새로운 값이 발생되면 이전 값을 무시하고, 그 간격이 지나도록 새로운 값이 발생되지 않는다면, 마지막 값을 퍼블리시하는 연산자
    - → 만약 window가 0.5초인 경우, 사용자가 타이핑을 하는 동안 계속해서 새로운 값이 발생하므로 값은 퍼블리시되지 않고, 타이핑이 멈춘 후 0.5초가 지나면 최종 값이 퍼블리시된다.
- `removeDuplicates`: 연속적으로 퍼블리시 되는 값들 중, 중복된 값을 제거하는 기능을 제공하는 연산자.

### Future

> 비동기 작업의 결과를 퍼블리셔의 형태로 리턴하게 해주는 Publisher
클로저 기반, `promise`를 사용하여 작업의 성공 또는 실패 결과를 전달
> 

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

- 비동기 처리를 위해 `Future` 퍼블리셔가 필요하므로 `flatMap`으로 중첩된 퍼블리셔 처리
- `promise`: 비동기 작업이 성공적으로 완료되었으면, 결과값을 퍼블리시 한다. 실패했다면, 실패 상태를 퍼블리시한다.

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
