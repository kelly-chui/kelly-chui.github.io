---
title: "Swift Concurrency. Meet async/await in Swift (2) - WWDC21"
date: 2026-08-03T23:01:47+09:00

categories:
  - Swift
  - WWDC
series:
  - Swift Concurrency
tags:
  - Concurrency
features:
  - mermaid

draft: false
original: ""
aliases:
  - /posts/wwdc-swift-concurrency-meet-async-await-in-swift-2/
---

1편에서는 async await를 어떻게 사용했는지 알아봤다면, 여기서는 테스트와 실제 앱 코드에서 async/await를 사용하는 법을 알아본다. 또한 기존에 존재하는 completion handler 기반 API를 continuation을 사용하여, async/await를 사용하는 async alternative로 변환하는 방법을 알아본다.

## 비동기 코드 테스트하기

async/await를 쓰면 비동기 코드도 동기 코드만큼 쉽게 테스트할 수 있다. XCTest는 `async` 테스트를 지원한다.

아래는 completion handler 방식의 비동기 코드를 테스트하는 코드이다.

```swift
class MockViewModelSpec: XCTestCase {
    func testFetchThumbnails() throws {
        let expectation = XCTestExpectation(description: "mock thumbnails completion")
        self.mockViewModel.fetchThumbnail(for: mockID) { result, error in
            XCTAssertNil(error)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5.0)
    }
}
```

{{< callout type="note" title="fulfill" >}}
`fulfill()`은 expectation을 충족된 상태로 표시하는 메소드다. 일반적으로 비동기 작업이 완료되었을 때 호출한다.
{{< /callout >}}

기존에는 `XCTestExpectation`을 만들고, API를 호출한 뒤 expectation을 fulfill 하고, 지정한 시간 동안 기다리도록 작성해야 했다. 

async/await 함수는 그냥 테스트 함수에 `async`를 붙여서 비동기 컨텍스트를 만들고 `await`로 비동기 함수를 호출하여 테스트 할 수 있다. expectation, wait는 더 이상 필요하지 않다.

```swift
class MockViewModelSpec: XCTestCase {
    func testFetchThumbnails() async throws {
        let thumbnail = try await self.mockViewModel.fetchThumbnail(for: mockID)
        XCTAssertNotNil(thumbnail)
    }
}
```

## 애플리케이션 코드에 적용하기

{{< callout type="warning" title="이제는 Observation" >}}
iOS 17 이후부터는 SwiftUI 모델의 상태 변화를 관찰하는 용도라면 Combine의 `@ObservableObject`, `@Published` 기반 코드보다 Observation의 `@Observable` 매크로를 사용하자.
{{< /callout >}}

{{< image src="image-003-optimized-image.webp" width="360px" align="center">}}

리스트의 각 row에 있는 섬네일 View를 담당하는 SwiftUI 코드를 보자.

```swift
struct ThumbnailView: View {
    @ObservedObject var viewModel: ViewModel
    var post: Post
    @State private var image: UIImage?

    var body: some View {
        Image(uiImage: self.image ?? placeholder)
            .onAppear {
                self.image = try? await self.viewModel.fetchThumbnail(for: post.id)
            }
    }
}
```

`onAppear`는 평범한 동기 클로저를 받기 때문에 이대로 작성하면 Xcode에서 에러가 출력된다.

```text
async 'fetchThumbnail(for:)' used in a context that does not support concurrency
```

`async` 함수는 `async` 함수 안에서만 호출 가능하기 때문에, 이러한 에러가 출력된다. 언젠가는 동기 코드와 비동기 코드를 브리징 해줘야 한다. 즉, 동기 함수 내에서 처음으로 `async` 함수를 호출할 수 있는 부분이 있어야 하고, 이런 역할을 `Task`가 한다.

{{< callout type="note" title="Task의 타입은?" >}}
`Task`는 함수가 아니라 `Task<Success, Failure>`라는 제네릭 구조체다. `Task { ... }`는 trailing closure 문법으로 이 타입의 이니셜라이저를 호출해 비동기 작업을 생성한다.

세션에서 “`Task` 함수가 필요하다”라고 한 것은 비동기 작업을 시작한다는 뜻으로 간단히 표현한 것이다. 이렇게 만든 Task는 현재 작업과 별개로 실행되는 unstructured task다.
{{< /callout >}}

```swift
.onAppear {
	Task {
		self.image = try? await self.viewModel.fetchThumbnail(for: post.id)
	}
}
```

`Task`는 클로저 안의 작업을 하나의 비동기 작업으로 묶는다. `.onAppear`와 같은 동기 컨텍스트 안에서도 `Task`를 통해 비동기 컨텍스트를 시작할 수 있다.

{{< callout type="warning" title=".onAppear와 .task" >}}
`onAppear` 안에서 직접 `Task`를 생성하면 View가 사라진 뒤에도 작업이 계속 실행될 수 있다. 

실제 화면의 생명주기에 맞춰 작업을 시작하고 취소하려면 `.task(id:)` Modifier를 사용하는 방법이 더 깔끔하다. 세션에서는 `Task`를 사용하는 방법을 보여주기 위해 `.onAppear`와 `Task`의 조합을 사용한 것 같다.
{{< /callout >}}

## SDK의 async alternatives

Apple의 많은 SDK는 기존 completion handler API에 대응하는 `async` API를 제공한다. completion handler API는 동작은 다르지만 기본적인 패턴은 동일하다.

> 함수를 호출하면, 그 함수는 작업을 마친 뒤 얻은 결과를 completion handler에 전달하여 호출한다.

Objective-C completion handler API 중 일부는 Swift importer에 의해 대응하는 `async` 함수로 제공된다.

```swift
// before
URLSession.dataTask(with: URLRequest, completionHandler: @escaping (Data?, URLResponse?, Error?) -> Void)

// after
URLSession.data(for: URLRequest) async throws -> (Data, URLResponse)
```

{{< callout type="note" title="Swift importer란?" >}}
Swift importer는 Objective-C로 작성된 Apple SDK 선언을 Swift에서 자연스럽게 쓸 수 있는 형태로 가져오는 컴파일러 기능이다. 이 과정에서 이름과 타입을 Swift식으로 바꾸며, 정해진 형태의 completion handler API에는 대응하는 async/throws API도 만들어 준다.

따라서 `dataTask(with:completionHandler:)`의 구현이 Swift Concurrency로 바뀐 것은 아니다. 같은 기능을 Swift에서 `try await`로 호출할 수 있도록, importer가 별도의 Swift 인터페이스를 제공하는 것이다.
{{< /callout >}}

### SDK에서 제공하는 Delegate API의 async alternative

기존에는 Delegate를 이렇게 작성했다.

```swift
import ClockKit

extension ComplicationController: CLKComplicationDataSource {
	func getCurrentTimelineEntry (
		for complication: CLKComplication,
		withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
	) {
		let date = Date()
		self.viewModel.fetchThumbnail(for: post.id) { thumbnail, error in
			guard let thumbnail = thumbnail else {
				return handler(nil)
			}
			let entry = self.createTimelineEntry(for: thumbnail, date: date)
			return handler(entry)
		}
	}
}
```

이 코드도 모든 실행 경로에서 completion handler를 반드시 호출해서 `getCurrentTimelineEntry`에 리턴값이나 에러를 전달해야 한다. 결국 호출 지점이 많아지고, 누락이 생길 가능성이 높아져서 코드가 복잡해진다.

이 코드를 `async` API를 사용해서 리팩토링 해보자. ClockKit은 이 delegate 메소드에 대응하는 async alternative를 제공한다.

```swift
import ClockKit

extension ComplicationController: CLKComplicationDataSource {
    func currentTimelineEntry(for complication: CLKComplication) async -> CLKComplicationTimelineEntry? {
        let date = Date()
        let thumbnail = try? await self.viewModel.fetchThumbnail(for: post.id)
        guard let thumbnail = thumbnail else {
            return nil
        }

        let entry = self.createTimelineEntry(for: thumbnail, date: date)
        return entry
    }
}
```

`async` 함수는 completion handler와 다르게 직접 값을 리턴하기 때문에, get같은 접두어를 사용하지 않는 것을 권장한다.

{{< callout type="note" title="직접 반환하면 왜 get을 빼나?" >}}
직접적인 인과관계라기보다 Swift API Design Guidelines의 이름 규칙이다. Swift에서는 값을 반환하는 쿼리 메소드가 이미 결과를 표현하므로 `get`을 붙이지 않는다. 예를 들어 `currentTimelineEntry(for:)`는 “현재 타임라인 엔트리를 구한다”는 뜻을 반환값과 함께 충분히 전달한다.

반대로 Objective-C의 `getCurrentTimelineEntry(_:withHandler:)`처럼 결과를 handler로 나중에 전달하는 API는 `get`으로 작업의 시작을 표현하는 이름으로 자주 사용했다.
{{< /callout >}}

이 메소드 말고도 SDK는 수많은 async alternative를 제공한다. 잘 활용해 보자.

### Continuation을 이용하여 직접 async alternative 만들기

```swift
// Existing function
func getPersistentPosts(completion: @escaping ([Post], Error?) -> Void) {       
    do {
        let req = Post.fetchRequest()
        req.sortDescriptors = [NSSortDescriptor(key: "date", ascending: true)]
        let asyncRequest = NSAsynchronousFetchRequest<Post>(fetchRequest: req) { result in
            completion(result.finalResult ?? [], nil)
        }
        try self.managedObjectContext.execute(asyncRequest)
    } catch {
        completion([], error)
    }
}
```

예제 앱에서는 `getPersistentPosts` 함수를 사용해서 Core Data에 저장해 둔 포스트를 가져온다. 기존 호출부를 한꺼번에 `async`로 바꾸기는 어렵기 때문에, completion handler API를 단계적으로 연결해 보자.

이 함수는 `NSAsynchronousFetchRequest`를 사용하고 있다. 이 completion handler API를 `async` 함수로 연결해 보자.

{{< callout type="note" title="NSAsynchronousFetchRequest?" >}}
Core Data 페치 요청을 비동기적으로 실행하고, 완료 시 결과를 completion handler로 전달하는 API다.
{{< /callout >}}

먼저 `async` 함수를 만들고 리턴 타입을 비동기 방식으로 바꾼다. 에러를 던질 수 있으므로 `throws`도 함께 붙인다.

```swift
func persistentPosts() async throws -> [Post]
```

다음에 completion Handler `getPersistentPosts`을 함수의 본문에 가져온다.

```swift
func persistentPosts() async throws -> [Post] {
	self.getPersistentPosts { post, error in
		// Return `result` back somehow? Throw the error too?
	}
}
```

여기에서 문제가 하나 생기는데 문제는 completion handler에서 전달받은 결과를 `persistentPosts`를 호출한 함수에 다시 전달할 수가 없다.

(`persistentPosts`를) 호출한 함수는 `persistentPosts`의 결과를 기다리며 일시 중단된 상태다. 적절한 시점에 결과를 전달해 caller 함수가 나머지 작업을 계속 진행하도록 해야 한다. (`persistentPosts`가 `async` 함수니 당연히 이를 호출한 함수도 `async` 함수다)

{{<image src="image-004-optimized-image.webp" >}}

현재 원하는 동작은 `async` 버전의 `persistentPosts`가 호출되면 Core Data를 fetch 하고, 시간이 지나 Core Data가 completion handler를 호출하면 조회 결과가 `persistentPosts`를 기다리던 호출자에게 돌아가는 것이다.

섬네일 예제에서는 `fetchThumbnail` 함수가 Core Data가 아니라 시스템에게 일시 중단된 `async` 함수를 다시 재개 해달라고 맡겼다. 

따라서 completion handler가 호출될 때까지 기다리고, 그 completion handler에 전달된 결과를 사용해 일시 중단된 작업을 resume하는 브리징이 필요하다.

{{< callout type="note" title="시스템이 아닌 Core Data에 스레드를 넘기나?" >}}
`withCheckedThrowingContinuation` 안에서 `getPersistentPosts`를 호출하면 Core Data fetch가 시작되고, 그 직후 현재 task는 continuation 지점에서 일시 중단된다. 이때 task가 사용하던 스레드는 Swift 런타임으로 돌아가 다른 작업을 실행할 수 있다.

Core Data는 fetch 작업이 실행되는 큐에서 작업을 처리하고, 완료되면 completion handler를 호출한다. handler가 `continuation.resume(...)`을 호출하면 기다리던 Swift task가 재개 가능한 상태가 되고, 런타임이 적절한 스레드에서 다시 스케줄링한다.
{{< /callout >}}

### Continuation으로 연결하기

completion handler 기반 메소드를 `async` 함수로 감쌀 때는 completion handler가 호출될 때까지 현재 작업을 일시 중단한다. 결과가 도착하면 continuation을 재개하고, 일시 중단 지점 이후의 코드를 이어서 실행하면 된다.

`async` 함수가 동작하는 방식과 같은 원리다. Swift는 이를 위해 Continuation을 생성하고 관리하며, 재개할 수 있는 기능을 제공한다.

```swift
func persistentPosts() async throws -> [Post] {
	typealias PostContinuation = CheckedContinuation<[Post], Error>
	return try await withCheckedThrowingContinuation { (continuation: PostContinuation) in
		self.getPersistentPosts{ post, error in
			if let error = error {
				continuation.resume(throwing: error)
			} else {
				continuation.resume(returning: post)
			}
		}
	}
}
```

`withCheckedThrowingContinuation` 함수는 에러를 전달하는 completion handler를 `throws`를 사용하는 `async` 함수로 변환해 준다. 만약 에러가 절대 발생하지 않는 함수라면 `withCheckedContinuation`을 사용하면 된다.

{{< callout type="note" title="withCheckedContinuation에서 'Check'는 뭘까?" >}}
`withCheckedContinuation`은 continuation을 정확히 한 번 재개했는지 검사하기 때문에 Checked를 붙였다. continuation을 resume하지 않고 버리거나 두 번 resume하면 런타임이 이를 진단한다. 두 번째 resume은 프로그램 오류이며 trap으로 이어질 수 있다.

이 검사를 생략한 `withUnsafeContinuation`도 있지만, 일반적인 completion handler 변환에는 checked 버전을 사용하는 편이 안전하다.
{{< /callout >}}

이 함수는 일시 중단된 `async` 함수를 재개할 수 있는 Continuation 값에 접근하는 방법을 제공한다. 또한 `getPersistentPosts` 호출을 `await`할 수 있도록 만들어 준다.

마지막으로 completion handler에서 받은 결과를 `resume` 함수에 전달하면 된다. `resume`은 `persistentPosts`의 결과를 기다리며 일시 중단된 task를 재개 가능한 상태로 만들고, 런타임은 이 task를 이후에 다시 스케줄링한다.

하지만 반드시 기억할 것, 모든 실행 경로에서 `resume`은 정확히 단 한번만 호출되어야 한다.

{{< callout type="note" title="Continuation을 resume하지 않으면?" >}}
`resume`이 되지 않으면 기다리던 `async` 함수가 영원히 재개되지 못한 채 멈춰 있다. completion handler를 호출하지 않는것과 거의 유사하다! `CheckedContinuation`은 이런 규칙 위반을 런타임에서 검사하고 기록한다.
{{< /callout >}}

```swift
if let error = error {
	continuation.resume(throwing: error)
} else {
	// resume 없으면 경고
}
```

{{< image src="image-001-optimized-image.webp">}}

반대로 `resume`을 여러 번 호출하는 것은 프로그램 오류다. 두 번째 `resume`이 호출되면 런타임은 trap으로 앱을 종료한다.

```swift
if let error = error {
	continuation.resume(throwing: error)
} else {
	continuation.resume(returning: posts)
	continuation.resume(returning: posts) // fatal error!
}
```

{{< image src="image-002-optimized-image.webp">}}

### Delegate를 직접 async alternative로 바꾸기

많은 API는 이벤트 기반으로 동작하는데, 이런 API는 중요한 시점마다 delegate 메소드를 호출하여 앱에 이벤트를 알려주고 앱이 적절하게 대응할 수 있도록 한다. 이런 API를 async alternative로 바꾸려면, Continuation을 저장해 두었다가 나중에 재개해야 한다.

```swift
class ViewController: UIViewController {
    private var activeContinuation: CheckedContinuation<[Post], Error>?
    func sharedPostsFromPeer() async throws -> [Post] {
        try await withCheckedThrowingContinuation { continuation in
            self.activeContinuation = continuation
            self.peerManager.syncSharedPosts()
        }
    }
}

extension ViewController: PeerSyncDelegate {
    func peerManager(_ manager: PeerManager, received posts: [Post]) {
        self.activeContinuation?.resume(returning: posts)
        self.activeContinuation = nil // guard against multiple calls to resume
    }

    func peerManager(_ manager: PeerManager, hadError error: Error) {
        self.activeContinuation?.resume(throwing: error)
        self.activeContinuation = nil // guard against multiple calls to resume
    }
}
```

먼저 checked continuation을 생성해 `activeContinuation`에 저장한 뒤 실제 작업을 시작한다. 활성화된 continuation은 반드시 재개되어야 하며, 이후 값을 `nil`로 만들어 실수로 두 번 resume하지 않도록 한다.

checked continuation 값(여기서는 `activeContinuation`)은 API를 기다리고 있는 task를 재개 가능 상태로 만들 수 있는 권한을 의미한다. 따라서 모든 실행 경로에서 반드시 `resume`되어야 한다는 것을 기억하자.

## 정리

async/await를 적용한다고 해서 기존 API를 한 번에 전부 바꿔야 하는 것은 아니다. SDK가 제공하는 async alternative부터 사용하고, 기존 completion handler API는 필요한 경계에서 continuation으로 감싸면 된다. 이렇게 하면 호출하는 쪽은 callback을 중첩하지 않고도 `return`, `throw`, `try await`로 작업의 순서와 실패를 자연스럽게 표현할 수 있다.

이 글에서 살펴본 내용을 정리하면 다음과 같다.

- XCTest의 `async` 테스트에서는 expectation과 `wait` 없이 비동기 결과를 기다리고 검증할 수 있다.
- SwiftUI처럼 동기 클로저에서 비동기 작업을 시작해야 할 때는 `Task`를 만들 수 있다. View의 생명주기와 함께 취소되어야 하는 작업이라면 `.task(id:)`를 우선 고려한다.
- Apple SDK에는 completion handler와 delegate API에 대응하는 async alternative가 많이 있다. 먼저 이 API가 있는지 찾아보는 편이 직접 브리징하는 것보다 간단하고 안전하다.
- 직접 async alternative를 만들어야 한다면 `withCheckedThrowingContinuation`으로 completion handler의 결과를 `return` 또는 `throw`로 연결할 수 있다.
- continuation은 모든 실행 경로에서 정확히 한 번 `resume`해야 한다. 하나의 결과를 기다리는 데 적합하며, 여러 이벤트를 계속 전달하는 delegate API에는 `AsyncStream`이 더 잘 맞을 수 있다.
