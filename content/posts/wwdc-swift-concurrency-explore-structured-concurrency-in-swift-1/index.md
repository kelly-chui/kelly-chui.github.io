---
title: "Swift Concurrency. Explore Structured Concurrency in Swift (1) - WWDC21"
date: 2026-08-15T15:54:01+09:00

categories:
  - Swift
  - WWDC
series:
  - Swift Concurrency
tags:
  - Concurrency

draft: false
original: ""
---

[앞서 정리한 세션]({{< relref "wwdc-swift-concurrency-meet-async-await-in-swift-1" >}})에서는 completion handler 기반의 비동기 코드를 async/await로 작성하면서, 비동기 코드에서도 return, throw, try-catch와 같은 일반적인 제어 흐름을 사용할 수 있게 되었다.

이번 포스팅에서는 WWDC21의 Explore Structured Concurrency in Swift 세션을 정리한다. async/await가 비동기 코드의 제어 흐름을 구조화했다면, structured concurrency는 여기서 더 나아가 동시에 실행되는 여러 task의 관계와 수명을 구조화한다.

## Explore Structed Concurrency in Swift

Swift Concurrency는 구조화된 프로그래밍(structured programming)의 아이디어에 기반한 structured concurrency라는 개념을 활용한다.

옛날에는 프로그램에서 명령어를 나열하고, 컨트롤 플로우가 여기저기로 자유롭게 점프해서 코드를 읽기가 매우 어려웠다. (C의 `goto`를 생각해보자)

```c
if (score >= 60) goto passed;
goto retry;
passed:
    printf("통과\n");
    goto end;
retry:
    printf("재시험\n");
end:
    return 0;
```

Swift와 같은 요즘 시대의 언어들은 `if-then`같이 표현되는 구조화된 구문들이 제어 흐름을 표현한다. 특히 Swift는 이런 블록이 static scoping을 따르기 때문에, 이름의 가시성과 변수의 수명도 쉽게 파악할 수 있게 해준다.

```swift
if score >= 60 {
    print("통과")
} else {
    print("재시험")
}
```

구조화된 제어 흐름은 자연스럽게 나열되거나 서로 중첩될 수 있다. 덕분에 코드를 위에서 아래로 읽을 수 있다.

하지만 비동기 코드나 동시성 코드들은 구조화된 프로그래밍의 방식을 활용하기 어려웠다.

{{< callout type="note" title="asynchronous vs. concurrency" >}}
비동기(asynchronous)는 작업을 시작한 뒤 그 작업이 끝날 때까지 현재 실행 흐름이 반드시 기다리지 않아도 된다는 실행 방식이다. 동시성(concurrency)은 여러 작업이 서로 겹치는 시간 동안 진행될 수 있도록 구성하는 방식이다.

예를 들어 네트워크 요청은 비동기적으로 실행할 수 있다. 여기에 이미지와 메타데이터 요청을 동시에 시작하면 두 작업이 겹쳐 진행되므로 동시성도 활용하는 셈이다. 반대로 비동기 API 하나를 사용한다고 해서 자동으로 여러 작업이 동시에 실행되는 것은 아니다.
{{< /callout >}}

다음은 인터넷에서 이미지를 다운로드하고, 썸네일을 만드는 코드이다.

```swift
func fetchThumbnails(
    for ids: [String],
    completion handler: @escaping ([String: UIImage]?, Error?) -> Void
) {
    guard let id = ids.first else { return handler([:], nil) }
    let request = thumbnailURLRequest(for: id)
    let dataTask = URLSession.shared.dataTask(with: request) { data, response, error in
        guard let response = response,
              let data = data
        else {
            return handler(nil, error)
        }
        // ... check response ...
        UIImage(data: data)?.prepareThumbnail(of: thumbSize) { image in
            guard let image = image else {
                return handler(nil, ThumbnailFailedError())
            }
            fetchThumbnails(for: Array(ids.dropFirst())) { thumbnails, error in
                // ... add image to thumbnails ...
            }
        }
    }
    dataTask.resume()
}
```

이 함수는 호출했을 때 비동기 작업의 결과나 에러를 반환하지 않고 completion handler의 아규먼트로 전달한다. 

따라서 결과를 `return`으로 받을 수 없고, `throw`와 `do-catch`를 이용한 구조화된 에러 핸들링 대신, completion handler 내부에서 직접 분기해야 한다.

```swift
guard let response = response,
      let data = data
else {
    return handler(nil, error)
}
```

또한 루프도 사용할 수 없다. 함수의 비동기 작업이 끝난 뒤에 실행될 코드는 completion handler 내부에 있어야 하기 때문에 재귀를 사용해야 한다.

```swift
fetchThumbnails(for: Array(ids.dropFirst())) { thumbnails, error in
    // ... add image to thumbnails ...
}
```

### async/await로 제어 흐름 가져오기

이 코드를 async/await를 사용하도록 작성하자. 

먼저 completion handler 아규먼트를 제거하고 함수의 시그니처에 `async throws`를 추가하고, 값을 리턴하도록 한다.

```swift
func fetchThumbnails(for ids: [String]) async throws -> [String: UIImage] {
    var thumbnails: [String: UIImage] = [:]
    for id in ids {
        let request = thumbnailURLRequest(for: id)
        let (data, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response)
        guard let image = await UIImage(data: data)?.byPreparingThumbnail(ofSize: thumbSize) else {
            throw ThumbnailFailedError()
        }
        thumbnails[id] = image
    }
    return thumbnails
}
```

`await`를 추가해서, 비동기 작업 이후에 실행되는 코드는 더 이상 completion handler에 작성할 필요가 없다. 

이제 completion handler가 없어졌으므로, `for` 루프를 사용해서 썸네일을 순차적으로 만들 수 있고, 에러도 `throw` `catch`로 핸들링할 수 있다. 

async/await 이렇게 코드를 짧아지게 해준다. 또한 제어 흐름 안에서 비동기 작업을 작성하게 해주고, 심지어 이 과정을 Swift가 검사해준다. (Swift Concurrency는 Swift의 빌트인 기능이다.)

그런데 만약 수천 장의 이미지의 썸네일을 만들어야 한다면, 각 썸네일의 크기가 고정되어 있는 것이 아니라면, 또 다른 URL에서 따로 다운로드 해야한다면, 이렇게 순차적으로 처리하는 방식은 별로다.

단순한 비동기 실행을 넘어서 concurrency가 필요한 때가 온다.

## Tasks in Swift

Swift에서는 `Task`를 사용해서 앱에 동시성을 추가한다. `Task`는 비동기 코드를 실행하기 위한 실행 컨텍스트를 제공한다.

서로 다른 task는 동시에 실행될 수 있고, 가능한 경우에는 런타임이 병렬로 실행시킬 수도 있다.

다만, `async` 함수를 호출한다고 해서, 그 호출을 위한 새로운 `Task`가 생성되는 것은 아니고, 명시적으로 생성해야 한다.

Swift에는 몇 가지 서로 다른 종류의 task가 있는데, 이 종류들을 하나씩 살펴보면서 어떤 트레이드 오프를 가지고 있는지 알아보자.

## Async-let tasks

평범한 `let` 바인딩을 생각해보자.

```swift
// preceding statements
let result = URLSession.shared.data(...)
// following statements
```

Swift는 `let` 바인딩에 도달하면 `=` 오른쪽의 표현식을 평가해서 값을 만든다.

위 예제에서는 데이터를 다운로드 하고, 그 결과를 `result`에 바인딩 한 뒤, 그 다음 문장들을 계속 실행한다.

{{< image src="image-001-optimized-image.webp" align="center">}}

다운로드에 시간이 걸리는 동안, (task 내부의)다른 작업을 진행하고 싶으면 `let` 앞에 `async`만 붙이면 된다.

```swift
// preceding statements
async let result = URLSession.shared.data(...)
// following statements
```

Swift는 `async let` 바인딩을 만나면 새로운 현재 task의 child task를 생성한다.

{{< image src="image-002-optimized-image.webp" align="center">}}

이제 child task, parents task의 두 실행 흐름이 생기게 된다.

우선, child task는 즉시 데이터 다운로드를 시작한다. parent task는 `result`에 플레이스 홀더 값을 바인딩하고, `async let` 바인딩 다음에 있는 구문들을 계속 실행한다.

parent task가 실제 `result` 값이 필요한 부분에 도달하면, parent task는 child task가 데이터 다운로드를 완료할 때까지 기다린다.

{{< image src="image-003-optimized-image.webp" align="center">}}

child task가 완료되면, `result`의 플레이스 홀더는 실제 값으로 채워진다.

앞선 썸네일 불러오기 코드에 `async-let`을 추가해보자. 

아래 함수에서는 서로 다른 두 URL에서 데이터를 다운로드 하는데, 하나는 이미지, 하나는 썸네일 크기가 들어 있는 metadata를 위한 것이다:

```swift
func fetchOneThumbnail(withID id: String) async throws -> UIImage {
    let imageReq = imageRequest(for: id), metadataReq = metadataRequest(for: id)
    let (data, _) = try await URLSession.shared.data(for: imageReq)
    let (metadata, _) = try await URLSession.shared.data(for: metadataReq)
    guard let size = parseSize(from: metadata),
          let image = await UIImage(data: data)?.byPreparingThumbnail(ofSize: size)
    else {
        throw ThumbnailFailedError()
    }
    return image
}
```

첫 번째 다운로드를 기다린 뒤(`try await`니까) 두 번째 다운로드를 시작하므로 두 다운로드 순차적으로 실행된다.

메타데이터와 이미지 다운로드를 동시에 이루어지게 하려면 두 `let` 앞에 모두 `async`를 붙인다. 다운로드는 더 이상 parent task의 흐름이 아닌 child task의 흐름이기 때문에. `async let` 선언부에는 더 이상 `try await`를 작성하지 않는다.

```swift
async let (data, _) = URLSession.shared.data(for: imageReq)
async let (metadata, _) = URLSession.shared.data(for: metadataReq)
```

다운로드가 동시에 수행되는 효과는 바인딩된 변수들을 사용할 때 parent task에서 관찰된다:

```swift
guard let size = parseSize(from: try await metadata),
      let image = try await UIImage(data: data)?.byPreparingThumbnail(ofSize: size)
```

따라서 metadata와 이미지 데이터를 읽는 표현식 앞에 `try await`를 작성해야 한다.

여기서 주목할 부분이 하나 더 있는데, `async let`으로 바인딩한 변수를 사용할 때, 무슨 작업을 거칠 필요 없이 그냥 쓴다. 즉, `async let` 바인딩의 결과는 `let` 바인딩을 한 변수와 동일한 타입을 가진다.

### Task Tree

비동기 함수에서 다른 비동기 함수를 호출할 때는 같은 task에서 실행이 이어지며, child task를 생성하면 parent task의 여러 어트리뷰트가 child task로 상속된다.

structured concurrency에서는 이러한 parents task와 child task가 task tree를 이룬다.

이 task tree는 어트리뷰트를 child task에 상속해서 task의 동작에 영향을 미치는 중요한 구조다.

{{< callout type="note" title="task tree를 통한 상속" >}}
비동기 함수 호출 자체는 새로운 task를 만들지 않는다. 호출한 task가 일시 중단되었다가 다시 실행되면서 호출된 함수의 작업을 이어간다. 반면 `async let`이나 task group으로 child task를 만들면 새로운 task가 생기고, parent task의 priority, cancellation, task-local variable 같은 컨텍스트가 child task에 전달된다.

이런 parent-child 연결이 있기 때문에 구조화된 동시성에서는 작업의 생명주기와 실행 맥락을 추적하기 쉽다.
{{< /callout >}}

### child task parents task link

`async let`은 현재 동작중인 task의 child task를 만든다. 이 task는 자신을 생성한 함수의 child가 아니지만, 수명은 함수나 블록의 scope에 묶일 수 있다.

tree는 parent task와 child task 간의 링크를 만들어서 parents task가 모든 child task가 종료했을 때만 종료할 수 있도록 강제한다. 

이 규칙은 정상적이지 않은 제어 흐름이 발생헤서 child task를 명시적으로 기다리지 못하는 경우에도 유지된다.

```swift
guard let size = parseSize(from: try await metadata),
      let image = try await UIImage(data: data)?.byPreparingThumbnail(ofSize: size)
```

위의 코드에서는 이미지보다 메타데이터를 먼저 불러온다. 만약 메타데이터 task가 에러를 던지면서 종료되면, `fetchOneThumbnail`은 그 에러를 던지면서 종료되어야 한다.

메타데이터 다운로드가 비정상적으로 종료되었으므로 이미지도 이제 필요하지 않다. 따라서 Swift는 `await` 하지 않은 이미지 다운로드 child task를 자동으로 취소 상태로 표시하고, 그 task가 종료될 때 까지 기다린 뒤, 에러를 던지고 빠져나간다.

task를 취소 상태로 표시한다는 것은 task를 강제로 종료하는 것이 아니라, 그 작업의 결과가 더 이상 필요하지 않다는 것을 표시하는 것이다. 이 취소는 task tree를 따라서 모든 자식 task에게도 전파된다.

```text
Parent
└── Image Task  ← canceled
     └── Child Task  ← canceled
```

따라서 `fetchOneThubnail` 함수는 직접 또는 간접적으로 생성한 모든 child task가 종료된 후에야, 최종적으로 에러를 던지고 스코프를 빠져나갈 수 있다.

이렇게 모든 child task가 종료되어야 parents task도 종료될 수 있는 제약을 통해, 실수로 task가 계속 남아 있는 task leak을 방지할 수 있다.

### Cooperative cancellation

취소된 task는 실제로 언제 멈추는지 알아보자.

Swift의 cancellation은 cooperative다. 중요한 트랜잭션을 처리하고 있거나 네트워크 커넥션 같은 자원을 정리해야 할 수도 있기 때문에 런타임이 task를 임의의 지점에서 강제로 멈추지 않는다.

대신 task가 cancellation 여부를 명시적으로 확인하고, 상황에 적절한 방식으로 종료해야한다.

```swift
func fetchThumbnails(for ids: [String]) async throws -> [String: UIImage] {
    var thumbnails: [String: UIImage] = [:]
    for id in ids {
        try Task.checkCancellation()
        thumbnails[id] = try await fetchOneThumbnail(withID: id)
    }
    return thumbnails
}
```

이 함수가 취소된 task 안에서 호출되었으면, `try Task.checkCancellation()` 덕분에 task가 취소된 경우에 에러를 던진다.

현재 task의 cancellation 상태를 `Bool` 타입의 값으로 가져오는 것도 가능하다. 

```swift
if Task.isCancelled { break }
```

위의 예시 코드는 task가 취소되어도 부분적인 결과를 리턴한다. 하지만 완전한 결과만이 필요한 경우에는 부분적인 결과가 리턴되는 것이 예측 불가능한 상황을 일으킬 수 있다. 

따라서, 이 같은 경우에는 부분적인 결과를 리턴한다고 API에 명확하게 명시해야 한다.

{{< callout type="note" title="부분 결과를 반환해도 될까?" >}}
서버에 결제 요청을 전송하거나 파일을 저장하는 것처럼 원자성이 중요한 작업은 부분적인 결과를 리턴하면 안된다. 이런 API는 취소를 확인하더라도 이미 시작한 트랜잭션을 안전하게 마무리하거나, 작업이 완료되지 않았음을 명확한 오류로 알려야 한다.

반대로 검색 결과나 이미지 목록처럼 일부 결과만 있어도 화면을 갱신할 수 있는 작업은 취소 시점까지 준비된 부분 결과를 리턴하도록 설계할 수 있다. 중요한 것은 API의 호출자가 cancellation 이후에 완전한 결과를 받는지, 부분 결과를 받는지, 오류를 받는지를 예측할 수 있도록 API에 명확하게 알려줘야 한다.
{{< /callout >}}

## Group tasks

`aysnc let`은 심플하고 동시성 작업의 개수가 정적으로 고정되어 있을 때 적합하다.

하지만, 동시성 작업의 개수가 동적이라면 어떻게 해야할까?

```swift
for id in ids {
  thumbnails[id] = try await fetchOneThumbnail(withID: id)
}
```

위 예제에서 `for` 루프의 각 iteration에서 `fetchOneThumbnail`을 호출해서 2개의 child task를 만들지만, `await` 때문에, 이 함수의 scope가 종료되어야만 다음 iteration으로 넘어갈 수 있다.

즉, 이미지와 메타데이터는 동시에 다운로드 받지만, 이미지들은 여전히 순차적으로 처리된다. 그런데 `async let`을 써서 이 이미지들을 전부 동시에 다운로드 받게 하기엔, `ids`의 원소 개수에 따라 생성해야 하는 task의 수가 다르기 때문에 불가능하다.

이처럼 동적인 개수의 child task를 만들고 싶을 때, task group을 사용한다. 

```swift
func fetchThumbnails(for ids: [String]) async throws -> [String: UIImage] {
    var thumbnails: [String: UIImage] = [:]
    try await withThrowingTaskGroup(of: Void.self) { group in
        for id in ids {
            group.async {
                // Error: Mutation of captured var 'thumbnails' in concurrently executing code
                thumbnails[id] = try await fetchOneThumbnail(withID: id)
            }
        }
    }
    return thumbnails
}
```

`withThrowingTaskGroup`은 에러를 던질 수 있는 child task를 생성하기 위한 스코프가 정해진 task group을 만든다.

`group`에 추가된 task들은 `group`의 스코프 안에서만 실행된다. 여기서는 `for` 루프를 통해 동적인 개수의 task를 생성한다. 

```swift
for id in ids {
    group.async {
        // Error: Mutation of captured var 'thumbnails' in concurrently executing code
        thumbnails[id] = try await fetchOneThumbnail(withID: id)
    }
}
```

생성된 child task는 즉시 실행되고, 완료 순서는 보장되지 않는다.

Task group 역시 구조화된 동시성이므로, `group`의 스코프는 child task들이 모두 종료되기 전에 끝나지 않는다.

{{< callout type="note" title="암시적 대기" >}}
task group의 scope를 빠져나갈 때 개발자가 각각의 child task를 하나씩 `await`하지 않아도, Swift가 group에 속한 모든 task가 끝날 때까지 기다리도록 강제한다. 이것이 암시적 대기다. group 바깥으로 task가 몰래 살아남을 수 없도록 보장하는 구조화된 동시성의 규칙이기도 하다.

`async let`도 본질적으로 같은 생명주기 규칙을 따른다. 다만 일반적으로 바인딩한 값을 사용하는 표현식에서 `await`가 드러나고, scope를 빠져나갈 때 아직 끝나지 않은 child task가 있으면 컴파일러와 런타임이 필요한 대기를 보장한다. 즉 `async let`이 구조적으로는 명시적 대기를 요구하는 것이 아니라, 결과를 읽는 지점에서 기다림이 표현되는 것이다.
{{< /callout >}}

이제 각 `fetchOneThumbnail` 호출마다 하나의 task가 생기고, 그 함수 내부에서는 다시 `async let`을 사용해 2개의 child task를 생성하게 된다.

{{< image src="image-004-optimized-image.webp" align="center">}}

이처럼 task group 안에서 async let을 사용할 수도 있고, 반대로 async let으로 만든 task 안에서 task group을 만들 수도 있다.

### Data race

앞의 코드엔 데이터 레이스 문제가 있다.

```swift
group.async {
  thumbnails[id] = try await fetchOneThumbnail(withID: id)
}
```

각 child task가 하나의 딕셔너리 `thumbnails`를 동시에 수정하는데, 딕셔너리는 여러 task가 동시 변경해도 안전이 보장되는 타입이 아니기 때문이다.

{{< callout type="note" title="서로 다른 키인데 왜 data race가 발생할까?" >}}
단순히 현재 입력에서 키가 겹치는지의 문제가 아니라. 컴파일러가 모든 실행 순서와 Dictionary의 내부 변경 과정을 안전하다고 증명할 수 없기 때문에, `@Sendable` closure에서 공유된 mutable 변수인 `thumbnails`를 수정하는 코드 자체를 허용하지 않는다. 

여러 task가 만든 결과를 parent task가 순차적으로 Dictionary에 넣도록 바꾸면 공유 mutable 상태를 동시에 수정하지 않게 된다.
{{< /callout >}}

만약 두 child task가 동시에 썸네일을 삽입하려 하면 크러시나 데이터가 손상될 수 있다. 

Swift는 이를 방지하기 위해서 새로운 task가 수행할 작업은 `@Sendable` 클로저 안에서 실행되도록 하고, 공유되는 값이 안전한지 정적으로 검사한다.

`@Sendable` 클로저의 body는 자신이 만들어진 lexical context에 있는 mutable한 변수들을 캡처하는 것이 제한된다. task가 실행된 이후에도 그 변수들이 다른 곳에서 수정될 수 있기 때문이다. 

즉, task가 capture하는 값은 여러 실행 컨텍스트 사이에서 안전하게 공유할 수 있는 값이어야 한다. 관련 내용은 [The Swift Programming Language. Concurrency (3)]({{< relref "the-swift-programming-language-31-concurrency-3" >}})에서 더 자세히 확인할 수 있다.

{{< callout type="note" title="Lexical context란?" >}}
현재 코드가 작성되어 있는 위치를 기준으로 봤을 때, 그 코드가 접근할 수 있는 바깥의 스코프들을 말한다.
{{< /callout >}}

data race를 해결하기 위해 child task는 자신의 결과만 리턴하게 하고, parent task가 그 결과를 모아 `thumbsnails` 딕셔너리를 수정하도록 만들 수 있다.

```swift
func fetchThumbnails(for ids: [String]) async throws -> [String: UIImage] {
    var thumbnails: [String: UIImage] = [:]
    try await withThrowingTaskGroup(of: (String, UIImage).self) { group in
        for id in ids {
            group.async {
                return (id, try await fetchOneThumbnail(withID: id))
            }
        }
        // Obtain results from the child tasks, sequentially, in order of completion.
        for try await (id, thumbnail) in group {
            thumbnails[id] = thumbnail
        }
    }
    return thumbnails
}
```

위 코드에서 각 child task는 `(String, UIImage)` 튜플을 리턴한다. 

그리고 parent tasks는 `for await` 루프를 사용해서 child task의 리턴 값을 순회하면서 `thumbnails` 딕셔너리를 업데이트한다.

child task가 완료되는 순서대로 결과가 나오지만, `for await` 루프는 parents task에서 순차적으로 실행되기 때문에 data race 문제를 해결할 수 있다.

### async let과 task group 의 task tree 규칙 차이

async let과 task group은 모두 구조화된 동시성을 만든다.

에러가 발생한 경우에는 `async let`과 같다. `group` 결과를 순회하던 중, 어떤 child task가 에러를 블록 바깥으로 던지고 종료되면, `group` 내부의 모든 task는 암시적으로 cancel되고, child task가 모두 종료될 때 까지 기다린다.

하지만 `group` 블록을 정상적으로 빠져나갔을 때는 cancellation이 자동으로 일어나지 않고, `group` 내부의 모든 task들은 취소되지 않고 모두 완료될 때까지 기다린다.

{{< callout type="note" title="Task group의 정상 종료" >}}
task group에서 결과를 개별적으로 소비할 필요가 없는 작업들인 경우엔 명시적인 await를 작성하는 것이 더 어색한 경우가 있다. 예를 들어 여러 파일을 저장하고, 함수가 끝나기 전에 모두 끝났다는 사실만 보장하면 된다고 해보자.

```swift
await withTaskGroup(of: Void.self) { group in
    for file in files {
        group.addTask {
            await save(file)
        }
    }
}
```
이 경우에 group 외부에서 `save`의 결과를 굳이 꺼낼 필요가 없이, 각 `save` 작업이 완료되었다는 것만 보장하면 된다.
{{< /callout >}}

덕분에 task group으로 fork-join 패턴을 자연스럽게 표현할 수 있다. 물론 블록을 빠져나가기 전에 `group.cancelAll()`을 호출해서 `group` 안의 모든 task를 명시적으로 직접 취소할 수도 있다.

{{< callout type="note" title="Fork-join 패턴" >}}
fork-join은 하나의 작업을 여러 child task로 나누어 동시에 시작하는(fork) 뒤, 모든 결과가 준비될 때까지 기다려 하나의 결과로 합치는(join) 패턴이다.

task group은 입력 배열의 각 ID를 별도의 task로 fork하고, `for try await` 루프에서 완료된 결과를 하나씩 받아 Dictionary에 join하는 구조를 표현한다. 결과가 완료되는 순서와 입력 순서가 달라도, parent task가 결과를 모아 최종 결과를 만들 수 있다.
{{< /callout >}}

## 정리

- `async let`과 `group task`는 Swift에서 scope에 묶인 구조화된 동시성을 제공하는 두 가지 방법이다.
- `async let`은 작업의 개수가 고정되어 있고 각 결과를 특정 변수로 사용할 때 적합하다.
- task group은 입력 데이터에 따라 task의 개수가 달라지거나, 여러 작업의 결과를 동적으로 수집해야 할 때 적합하다.
- 두 방식 모두 child task의 수명과 오류, cancellation을 parent task의 scope 안에서 관리해 task leak과 data race를 줄여준다.
- cancellation은 항상 task tree의 아래로 전파된다.
