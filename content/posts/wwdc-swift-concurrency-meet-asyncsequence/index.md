---
title: "Swift Concurrency. Meet AsyncSequence - WWDC21"
date: 2026-09-02T20:39:16+09:00

categories:
  - WWDC
series:
tags:
  - Swift Concurrency
  - AsyncSequence

draft: false
original: ""
---

`AsyncSequence`는 시간이 지나며 비동기적으로 만들어지는 여러 값을 순서대로 다루기 위한 프로토콜이다. 파일이나 네트워크에서 데이터를 조금씩 읽거나, 끝나지 않는 이벤트를 계속 전달받는 상황에서 사용할 수 있다.

이 포스팅에서는 WWDC21의 Meet AsyncSequence 세션을 공부하고 정리했다. 이 세션에서는 `AsyncSequence`의 동작 방식과 Apple SDK가 제공하는 API를 살펴보고, 직접 `AsyncSequence`로 변환도 해본다.

세션을 보면서 Combine의 `Publisher`가 생각났는데. 모두 시간에 따라 여러 값을 전달할 수 있다. 하지만 `AsyncSequence`는 `for-await-in`로 값을 하나씩 순서대로 처리하는 데 적합하고, `Publisher`는 여러 subscriber에게 값을 전달하거나 Combine operator로 데이터 흐름을 조합하는데 특화되어 있다.

## What is AsyncSequence?

데이터를 다운로드 하는 작업은 시간이 꽤 걸리기 때문에 비동기 task로 작성한다. 

하지만 모든 데이터가 다운로드 될 때 까지 기다리지 않고, 데이터를 받는 즉시 하나씩 보여주고 싶다면 어떻게 해야할까?

다음 예시 코드를 보자:

```swift
@main
struct QuakesTool {
    static func main() async throws {
        let endpointURL = URL(string: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv")!

        // skip the header line and iterate each one 
        // to extract the magnitude, time, latitude and longitude
        for try await event in endpointURL.lines.dropFirst() {
            let values = event.split(separator: ",")
            let time = values[0]
            let latitude = values[1]
            let longitude = values[2]
            let magnitude = values[4]
            print("Magnitude \(magnitude) on \(time) at \(latitude) \(longitude)")
        }
    }
}
```

{{< callout type="note" title="`URL.lines`가 전달하는 값" >}}
이 URL은 지진 정보를 CSV 형식으로 제공한다. `lines`는 전체 응답을 한 번에 `Data`로 만든 뒤 나누는 것이 아니라, 응답에서 읽은 한 줄을 `String`으로 전달한다.

예를 들어 `2026-09-01T12:05:53.740Z,38.8238,-122.766,2.31,0.99,...`라는 한 줄에서 앞의 다섯 값은 각각 발생 시각, 위도, 경도, 깊이, 규모다. 그래서 예제에서는 `split(separator: ",")`한 뒤 필요한 인덱스의 값만 꺼낸다.
{{< /callout >}}

이 예시 코드에서는 async sequence 기능을 사용해서 URL에서 다운받은 데이터를 한 줄씩 내보낸다.

데이터를 다 다운 받은 이후에 표시하지 않고 다운받는 즉시 값을 내보내기 때문에 이 코드는 굉장히 반응적이다.

또한 기존의 sequence에서 사용하던 메소드들을 이러한 비동기 환경에서도 사용할 수 있다.

async sequence는 새로운 `for-await-in`을 사용해서 값을 순회하고, `map`, `filter`, `reduce`와 같은 고차 함수나 위의 예제처럼 `dropFirst`를 사용할 수도 있다.

### How AsyncSequence Works

[Meet async/await in Swift]({{< relref "posts/wwdc-swift-concurrency-meet-async-await-in-swift-1" >}})에서 말한 것 처럼 Swift Concurrency에서는 `await`를 사용하면 콜백 없이 동시성 코드를 작성할 수 있다.

async/await로 만든 비동기 함수는 일시 중단 될 수 있고, 중단된 경우에는 값이나 에러가 만들어지면 다시 실행을 재개한다.

비슷하게 `AsyncSequence`는 각각의 원소를 기다리는 지점에서 실행을 일시 중단한 다음, 내부의 iterator가 값을 만들어 내거나 에러를 던지면 실행을 다시 재개한다.

`AsyncSequence`는 시간의 흐름에 따라 값들이 어떻게 만들어지는지를 표현하는 추상화다.

{{< callout type="warning" title="Swift 6에서 확장됨" >}}
WWDC21 당시의 `AsyncSequence`는 원소 타입과 함께, 순회 중 에러를 던질 수 있다는 사실을 주로 `next() async throws -> Element?` 형태로 표현했다. 그래서 어떤 구체적인 에러가 발생하는지는 타입에서 알기 어려웠다.

최근 SDK의 `AsyncSequence`는 `Element`뿐 아니라 `Failure`도 연관 타입으로 둔다. 따라서 최신 환경에서는 `AsyncSequence<Element, Failure>`처럼 원소와 실패 타입을 함께 제약할 수 있다. (이 문서의 `for-try-await` 설명 자체는 여전히 유효하다)
{{< /callout >}}

`Sequence`와 같이 `AsyncSequence`는 0개 이상의 값을 만들어 내고, 더 이상 만들어 낼 값이 없으면. `nil`을 리턴하여 순회를 종료한다.

{{< callout type="note" title="일반 `Sequence`도 `nil`로 끝난다" >}}
일반 `Sequence`의 이터레이터도 `next() -> Element?`를 제공하며, 다음 원소가 없으면 `nil`을 반환한다. `for-in`은 이 과정을 감춰 주는 문법일 뿐이다.

`AsyncSequence`도 종료 방식은 같지만, 다음 원소를 얻기 전에 기다려야 할 수 있으므로 `next()`가 `async`가 된다. 에러를 던질 수 있는 시퀀스라면 여기에 `throws`도 추가된다.
{{< /callout >}}

에러가 발생한 경우에도 순회가 종료되어서 `next()`를 호출하더라도 `nil`을 리턴한다.

`AsyncSequence`의 동작을 일반 `Sequence`를 순회하는 `for-in` 루프와 비교해보자:

```swift
for quake in quakes {
    if quake.magnitude > 3 {
        displaySignificantEarthquake(quake)
    }
}
```

이 코드는 `quakes`에서 원소를 하나씩 보면서, `magnitude`가 3보다 큰 경우에 함수를 호출한다. 

컴파일러는 `for-in` 루프를 대략적으로 다음과 같이 변환한다:

```swift
var iterator = quakes.makeIterator()
while let quake = iterator.next() {
    if quake.magnitude > 3 {
        displaySignificantEarthquake(quake)
    }
}
```

이 코드를 봤을 때, `AsyncSequence`를 순회하기 위해서는 `next()`를 단순히 비동기 함수로 바꾸면 된다:

```swift
var iterator = quakes.makeAsyncIterator()
while let quake = await iterator.next() {
    if quake.magnitude > 3 {
        displaySignificantEarthquake(quake)
    }
}
```

`while` 코드가 `for-in` 루프에 대응하는 규칙과 마찬가지로, 위 코드도 `for-await-in` 루프로 작성할 수 있다:

```swift
for await quake in quakes {
    if quake.magnitude > 3 {
        displaySignificantEarthquake(quake)
    }
}
```

만약 `AsyncSequence`가 에러를 던진다면, `for-try-await-in` 루프를 사용할 수도 있다.

```swift
do {
    for try await quake in quakes {
        // ...
    }
} catch {
    // ...
}
```

### Controlling Iteration and Cancellation

기존 `for-in` 루프에서 사용하던 `break`나 `continue` 역시 사용할 수 있다. 순회를 일찍 끝내고 싶으면 `break`를 사용할 수 있다:

```swift
for await quake in quakes {
    if quake.location == nil {
        break
    }
    // ...
}
```

어떤 값을 건너 뛰고 싶다면 `continue`를 쓸 수도 있다:

```swift
for await quake in quakes {
    if quake.depth > 5 {
        continue
    }
    // ...
}
```

`AsyncSequence`는 비동기적으로 ... 하기 때문에 에러가 발생할 수도 있다. 이러한 경우에는 `for-try-await-in`을 사용한다:

```swift
let iteration2 = Task {
    do {
        for try await quake in quakeDownload {
            ...
        }
    } catch {
        ...
    }
}
```

에러를 던지는 경우엔 함수와 마찬가지로 `try`가 필요하다. 만약 `try`를 쓰지 않았다면, Swift 컴파일러가 에러로 잡아내서 에러를 제대로 처리하도록 강제한다.

만약 `AsyncSequence` 순회를 다른 작업과 동시에 실행하고 싶다면, `Task { ... }`로 감싸서 새로운 비동기 task를 만들 수도 있다:

```swift
Task {
    let iteration2 = Task {
        do {
            for try await quake in quakeDownload {
                ...
            }
        } catch {
            ...
        }
    }
}
```

이렇게 비동기 task로 만드는 방식은 `AsyncSequence`가 끝나지 않고 계속해서 값을 만들어 낼 가능성이 있을 때 유용하게 사용한다. 이런 경우에는 외부에서 순회를 취소해야 하는 경우도 있다. 

다음은 두 순회를 동시에 진행하고, 나중에 취소할 수 있는 예시 코드이다:

```swift
let iteration1 = Task {
    for await quake in quakes {
        // ...
    }
}

let iteration2 = Task {
    do {
        for try await quake in quakeDownload {
            // ...
        }
    } catch {
        // ...
    }
}

//... later on  
iteration1.cancel()
iteration2.cancel()
```

이처럼 Swift Concurrency를 사용하면, 종료 시점이 정해지지 않은 순회 task의 생명주기를 특정 객체나 컨테이너에 맞출 수 있다.

## Usage and APIs

애플 SDK에서 기본적으로 제공하는 `AsyncSequence` API는 많다. 이 포스팅에서는 일부만 살펴본다.

다음은 파일을 읽어서 들어오는 데이터를 라인 단위로 비동기적으로 읽는 예시 코드이다:

{{< callout type="warning" title="`URL.resourceBytes` 권장" >}}
`FileHandle.standardInput.bytes.lines`는 현재도 사용할 수 있는 API다. 다만 Apple은 파일을 비동기적으로 읽기 위해 새 `FileHandle`을 만드는 경우에는, `file://` URL의 `resourceBytes`를 대신 사용하는 방법을 안내한다.

`URL`의 바이트 시퀀스 프로퍼티는 현재 `bytes`가 아니라 `resourceBytes`다. 텍스트를 한 줄씩 읽을 때는 기존처럼 `url.lines`를 사용할 수 있다.
{{< /callout >}}

```swift
for try await line in FileHandle.standardInput.bytes.lines {
    // ...
}
```

`FileHandle`에 있는 `bytes` 프로퍼티를 이용해서 읽어오는 바이트들을 `AsyncSequence` 형태로 사용할 수 있다. 마찬가지로 `URL`에서도 직접 `bytes`, `lines`을 사용할 수 있다.

네트워크에서 데이터를 가져올 때는 응답과 인증에 신경써야 한다. 

`URLSession`에는 바이트를 `AsyncSequence` 형태로 가져올 수 있는 `bytes` 함수가 있다.

```swift
let (bytes, response) = try await URLSession.shared.bytes(from: url)

guard let httpResponse = response as? HTTPURLResponse,
      httpResponse.statusCode == 200 /* OK */
else {
    throw MyNetworkingError.invalidServerResponse
}

for try await byte in bytes {
    ...
}
```

마찬가지로 노티피케이션 도착을 비동기적으로 기다리게 할 때도 `AsyncSequence` API를 사용할 수 있다.

다음 예제는 `storeUUID`와 일치하는 첫 번째 알림이 도착할 때까지 기다린다:

```swift
let center = NotificationCenter.default
let notification = await center.notifications(named: .NSPersistentStoreRemoteChange).first {
    $0.userInfo[NSStoreUUIDKey] == storeUUID
}
```

`Seqeunce`에서 사용할 수 있는 대부분의 연산은 `AsyncSequence`에서도 사용할 수 있다. 위 예제에서도 `first(where:)`를 사용해서 `storeUUID`인 알람을 찾아낸다.

## Adopting AsyncSequence

위에서는 SDK에서 직접적으로 제공하는 API를 살펴봤고, 이제 `AsyncSequence`를 직접 만들어보자.

`AsyncSequence`로 만들기 좋은 상황은 어떤 값이 새로 발생했다는 사실을 전달하기만 하고, 그에 대한 응답을 다시 받을 필요가 없는 경우다.

handler를 사용하는 코드를 직접 `AsyncSequence`를 만들어보자:

```swift
class QuakeMonitor {
    var quakeHandler: (Quake) -> Void
    func startMonitoring()
    func stopMonitoring()
}
```

`QuakeMonitor` 클래스는 `quakeHandler` 프로퍼티와 `start()`, `stop`을 가지고 있다. 

이 코드를 사용하기 위해서는 먼저 `QuakeMonitor`를 생성하고, 값을 전달받기 위한 handler를 지정해야 한다. 그리고 monitor를 시작하면, 발생한 지진 데이터가 handler로 전달된다:

```swift
let monitor = QuakeMonitor()
monitor.quakeHandler = { quake in
    // ...
}
monitor.startMonitoring()
monitor.stopMonitoring()
```

이걸 `AsyncStream` 타입을 이용해서 쉽게 `AsyncSequence`로 변환할 수 있다:

```swift
let quakes = AsyncStream(Quake.self) { continuation in
    let monitor = QuakeMonitor()
    monitor.quakeHandler = { quake in
        continuation.yield(quake)
    }
    continuation.onTermination = { @Sendable _ in
        monitor.stopMonitoring()
    }
    monitor.startMonitoring()
}
```

`AsyncStream`을 생성할 때는 전달할 요소의 타입(`Quake.self`)과 생성 클로저(`{ continuation in ... }`)을 지정해야 한다.

생성 클로저에는 `continuation`이 전달된다. `continuation`을 사용하면, 값을 여러 번 `yield`하거나 스트림을 `finish`할 수 있으며, 스트림이 종료될 때의 동작도 처리 가능하다. (자세한 내용은 [Meet async/await in Swift]({{< relref "posts/wwdc-swift-concurrency-meet-async-await-in-swift-2" >}})에 정리했다.)

위 예제에서는 새로운 지진 데이터가 들어올 때 마다 `continuation`에 `yield` 하여 값을 전달하고, `onTermination`에서는 취소했을 때 필요한 정리 작업을 처리한다.

이처럼 `AsyncStream`은 기존 코드를 `AsyncSequence`에서 필요한 기능을 제공하도록 만들어주고, 버퍼링도 처리해준다.

{{< callout type="note" title="버퍼링" >}}
`AsyncStream`에서는 값을 만들어 내는 속도와 소비하는 속도가 다를 수 있다. `continuation.yield()`로 새로운 값이 전달되었지만 아직 이전 값을 처리하고 있다면, 바로 소비하지 못한 값을 어딘가에 보관해야 한다. `AsyncStream`은 이런 값들을 버퍼에 저장해 두었다가 소비자가 준비되면 순서대로 전달한다.
{{< /callout >}}

마지막으로 `startMonitoring()`을 호출해서 실제 모니터링을 시작한다. 이렇게 기존에 사용하던 `monitor`의 생성, 설정, 종료, 시작 로직을 `AsyncStream` 코드 내부에 캡슐화해서 재사용 할 수 있다.

이제 `QuakeMonitor`를 일반적인 `AsyncSequence`처럼 사용할 수 있다:

```swift
let significantQuakes = quakes.filter { quake in
    quake.magnitude > 3
}

for await quake in significantQuakes {
    // ...
}
```

이처럼 복잡한 로직을 신경 쓸 필요 없이 단순히 `for-await-in`으로 순회하면 되기 때문에, 사용하는 쪽에서는 값이 어떻게 전달되는지보다 실제로 어떤 값을 처리할지에 집중할 수 있다.

## 정리

`AsyncSequence`는 시간에 따라 비동기적으로 여러 값을 전달하기 위한 프로토콜이다. 

일반적인 `Sequence`와 비슷하지만, 각각의 값이 비동기적으로 전달되기 때문에 `for-await-in`을 사용하여 순회한다. 실패할 수 있는 경우에는 `for-try-await-in`을 사용한다.

기존 `Sequence`의 사용법을 알고 있다면 `AsyncSequence`도 익숙한 방식으로 사용할 수 있다.

`break`, `continue`뿐만 아니라 `map`, `filter`, `reduce`, `first(where:)` 등의 연산도 사용할 수 있다. async/await도 마찬가지고, Structured Task도 마찬가지고, Swift Concurrency의 기본 모델은 '동기 코드와 사용감이 거의 비슷하게'인 것같다.

종료 시점이 정해져 있지 않은 `AsyncSequence`는 별도의 task에서 순회하고, 필요할 때 task를 취소하여 생명주기를 관리할 수 있다. 이 부분은 pub-sub 패턴을 조금 닮았다.

기존 callback이나 delegate 기반 API는 `AsyncStream`을 이용해 `AsyncSequence`로 변환할 수 있다. 

`Continuation`의 `yield()`로 새로운 값을 전달하고, `onTermination`에서 취소나 리소스 정리를 처리할 수 있다. 에러가 발생할 수 있는 경우에는 `AsyncThrowingStream`을 사용할 수 있다.
