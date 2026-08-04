---
title: "Swift Concurrency. Behind the Scenes - WWDC21"
date: 2025-08-25

categories:
  - Swift
  - WWDC
series:
  - Swift Concurrency
tags:
  - Actor
  - Concurrency

draft: false
original: ""
aliases:
  - /posts/wwdc-swift-concurrency-behind-the-scenes/
---

## Threading model

뉴스 피드 리더 앱을 예로 들어보자. 앱의 상위 컴포넌트는 다음과 같이 나눌 수 있다.

- 사용자 인터페이스를 담당하는 메인 스레드
- 사용자가 구독한 뉴스 피드를 추적하는 데이터베이스
- 최신 콘텐츠를 가져오는 네트워킹 서브시스템

사용자가 최신 뉴스를 요청하면 다음과 같은 흐름으로 처리할 수 있다.

- 메인 스레드에서 이벤트 제스처 처리
- 데이터베이스 작업을 처리하는 직렬 큐로 요청을 비동기적으로 디스패치
    - 작업을 다른 큐로 보내면 메인 스레드는 데이터베이스 작업을 기다리지 않고 사용자 입력에 계속 반응할 수 있다.
    - 직렬 큐가 상호 배제를 보장하므로 데이터베이스 접근을 순서대로 처리할 수 있다.
- 데이터베이스 큐에선 사용자가 구독한 피드에 URLSession을 통해 콘텐츠를 다운로드하는 네트워크 요청을 스케줄링
- 결과가 도착하면 URLSession의 콜백이 Delegate Queue 위에서 호출되어서 각 결과의 Completion Handler가 동기적으로 데이터베이스를 업데이트한다.
- MainThread를 깨워서 UI를 리프레시한다.

보기에는 합리적인 방법이다. 메인 스레드를 블록하지 않으면서 네트워크 요청을 동시에 처리할 수 있기 때문이다.

코드를 살펴보자.

```swift
let urlSession = URLSession(configuration: .default, delegate: self,
                            delegateQueue: concurrentQueue)
```

`URLSession`을 만들고, `delegateQueue`를 `concurrentQueue`로 설정한다. 따라서 여러 네트워크 요청의 completion handler가 해당 큐에서 실행될 수 있다.

```swift
let feed in feedsToUpdate {
    let dataTask = urlSession.dataTask(with: feed.url) { data, response, error in
        /* ... */
        guard let data = data else { return }
        do {
            let articles = try deserializeArticles(from: data)
            databaseQueue.sync {
	              updateDatabase(with: articles)
	          }
        } catch { /* ... */ }
    }
    dataTask.resume()
}
```

업데이트가 필요한 뉴스 피드를 순회하면서 각 피드마다 data task를 스케줄한다. completion handler에서는 다운로드한 결과를 역직렬화해 Article로 만들고, 데이터베이스에 반영하기 전에 DB 큐로 동기 디스패치한다.

하지만 이 코드에는 숨은 성능 문제가 있다. GCD가 큐의 작업을 처리하기 위해 스레드를 어떻게 관리하는지 살펴봐야 한다. 동시성 큐에서 작업을 실행하던 스레드가 블록되고 아직 처리할 작업이 남아 있다면, 시스템은 남은 작업을 처리하기 위해 새로운 스레드를 만들 수 있다. 그 이유는 두 가지다.

1. 각 CPU 코어가 실행할 작업을 계속 가질 수 있도록 하기 위해서다.
2. 블록된 스레드가 세마포어 같은 자원을 기다리고 있을 때, 새 스레드가 다른 작업을 진행할 수 있도록 하기 위해서다.

2코어 기기에서 GCD가 피드 업데이트 결과를 처리하고 있다고 해보자. 데이터베이스 큐에 접근하려던 스레드가 블록되면, GCD는 네트워킹 큐의 작업을 계속 처리하기 위해 추가 스레드를 만들 수 있다. 그 결과 CPU는 여러 스레드 사이를 계속 전환해야 하고, 앱이 필요 이상으로 많은 스레드를 가지게 된다.

CPU 코어 수보다 훨씬 많은 스레드가 만들어지는 현상을 Thread explosion이라고 한다.

Thread explosion은 메모리와 스케줄링 측면에서도 비용을 만든다.

1. 블록된 스레드는 다시 실행될 때까지 메모리와 시스템 자원을 점유한다.
2. 각 스레드는 자신의 스택과 스레드를 추적하기 위한 커널 데이터 구조를 가진다.
3. 일부 스레드는 다른 스레드가 실행되기 위해 필요한 락을 점유하고 있을 수 있다.

진행되지 않는 스레드에도 이런 메모리와 자원이 필요하다는 점이 스케줄링 오버헤드로 이어진다.

새로운 스레드가 추가될 때마다 CPU는 스레드 컨텍스트 스위칭을 수행해야 한다. 블록된 스레드가 다시 실행되려면 스케줄러가 여러 스레드에 CPU 시간을 나눠 줘야 한다.

Thread explosion 상태에서 수백 개의 스레드를 시분할하면 컨텍스트 스위칭이 과도하게 발생하고 CPU 효율이 떨어진다.

## Swift Concurrency

GCD와 달리 Swift Concurrency에서는 작업이 대기할 때 스레드를 붙잡아 두지 않는다. 대신 작업을 어디서 재개해야 하는지 추적하는 continuation이라는 경량 객체를 사용한다.

작업이 중단되면 스레드 자체를 전환하는 대신 다른 작업의 continuation을 실행한다. 따라서 작업을 전환하는 비용을 함수 호출에 가까운 수준으로 줄일 수 있다.

Swift Concurrency의 런타임 동작

1. CPU 코어 개수에 가까운 수의 스레드를 유지하고, 작업이 중단되면 저렴하게 다른 작업을 실행한다.
2. 비동기 흐름을 직선적인 코드로 작성할 수 있다.
3. 작업 간의 관계를 런타임이 추적하므로 안전하고 통제 가능한 동시성을 얻을 수 있다.

이를 위해서는

1. 작업이 스레드를 차단하지 않는다는 런타임 계약
2. 이 계약을 코드로 표현할 수 있는 언어 기능

Swift의 동시성 모델과, 주변의 의미론은 이 목표를 염두에 두고 설계되었다.

Swift의 언어 수준 기능

1. await의 의미론
2. Swift 런타임에서의 작업 종속성 추적

뉴스 피드 앱 다시 작성해보기

```swift
func deserializeArticles(from data: Data) -> [Article]
func updateDatabase(with articles: [Article], for feed: Feed) async

await withThrowingTaskGroup(of: [Article].self) { group in
    for feed in feedsToUpdate {
        group.async {
            let (data, response) = try await URLSession.shared.data(from: feed.url)
            let articles = try deserializeArticles(from: data)
            await updateDatabase(with: articles, for: feed)
            // ...
            return articles
        }
        // ...
    }
    // ...
}
```

헬퍼 함수를 비동기 함수로 만들고, 디스패치 큐 대신 Task Group을 사용해 동시성을 관리한다.

`async` 함수를 호출할 때는 `await`를 사용한다.

### Async 함수

일반 함수는 스레드의 스택에 하나의 스택 프레임을 사용한다. 함수가 호출되면 지역 변수, 반환 주소, 호출에 필요한 정보가 담긴 프레임이 스택에 푸시된다.

함수가 반환되면 해당 스택 프레임은 팝된다.

비동기함수에서는

```swift
func save(...) async throws -> [ID] { ... }

func add(_ newArticles: [Article]) async throws {
		let ids = try await database.save(newArticles, for: self)
		for (id, article) in zip(ids, newAritcles) {
				articles[id] = article
		}
}

func updateDatabase(...) async {
		// skip old articles ...
		await feed.add(articles)
}
```

1. `updateDatabase`가 `add`를 호출하면 `add`의 실행에 필요한 스택 프레임이 만들어진다.
2. `add` 안의 `await` 이후에도 필요한 값은 힙의 비동기 프레임에 저장된다. 여기서는 `newArticles`가 그 대상이다.
3. `add`가 `save`를 호출하면 `save`의 스택 프레임이 현재 스레드의 최상위 프레임이 된다. `add`가 중단된 뒤에도 필요한 정보는 이미 비동기 프레임에 저장되어 있으므로, 스레드 스택에 `add`의 프레임을 계속 유지할 필요가 없다.
4. `save`가 실행되는 동안 데이터베이스 응답을 기다리더라도 스레드는 차단되지 않고 다른 작업을 실행할 수 있다.
5. 데이터베이스 요청이 끝나면 어떤 스레드에서든 `save`가 실행을 재개할 수 있다. 이전과 같은 스레드라는 보장은 없다.
6. `save`가 ID를 반환하면 `add`의 실행이 재개되고, 이어서 동기적인 `zip` 작업이 실행된다.
7. `zip`이 끝나면 해당 스택 프레임이 제거되고 다음 코드가 계속 실행된다.

비동기 프레임 목록이 바로 Continuation의 런타임 표현이다. Continuation은 일시 중단 지점을 넘어 유지해야 하는 정보를 보관하고, 작업이 재개될 때 필요한 스택 프레임을 다시 구성한다.

## 런타임의 작업 간 종속성 추적

함수는 `await` 지점에서 여러 continuation으로 나뉠 수 있다. 위 코드에서 URLSession의 데이터 요청은 비동기 작업이고, `let articles`부터 `return articles`까지의 나머지 작업은 요청이 끝난 뒤 실행되는 continuation이다.

```swift
await withThrowingTaskGroup(of: [Article].self) { group in
    for feed in feedsToUpdate {
        group.async {
            let (data, response) = try await URLSession.shared.data(from: feed.url)
            let articles = try deserializeArticles(from: data)
            await updateDatabase(with: articles, for: feed)
            // ...
            return articles
        }
        // ...
    }
    // ...
}
```

Task Group에서는 부모 태스크가 여러 자식 태스크를 만든다.

부모 태스크가 Task Group의 스코프를 빠져나가기 전에 자식 태스크들이 정리되어야 한다. 이 관계가 Task Group의 스코프로 코드에 표현되므로 Swift 런타임은 부모와 자식 태스크의 종속성을 알 수 있다.

Swift에서 태스크는 continuation이나 자식 태스크처럼 Swift 런타임이 알고 있는 다른 태스크만 `await`할 수 있다. 따라서 Swift Concurrency의 기본 요소로 구조화된 코드는 런타임에 태스크 간의 종속성 체인을 명확하게 전달한다.

Swift Concurrency는 `await`에서 태스크를 일시 중지할 수 있게 하고, 런타임은 작업 간의 종속성을 바탕으로 실행할 다음 태스크를 선택한다. 그래서 실행 가능한 작업이 있는데도 스레드가 불필요하게 대기하는 상황을 줄일 수 있다.

이 런타임 계약을 바탕으로 Swift 동시성을 위한 OS 수준의 통합 지원도 구축할 수 있다.

Swift Concurrency는 기본 executor로 협력적 스레드 풀을 사용한다. 이 스레드 풀은 CPU 코어 수에 가까운 수의 스레드만 사용해 시스템을 과도하게 커밋하지 않는다. GCD의 동시성 큐처럼 블록된 스레드를 보충하기 위해 계속 새로운 스레드를 만드는 방식과 다르다.

### 새 기능을 채택하기 전에

동기 코드를 비동기 코드로 변경할 때의 성능도 함께 고려해야 한다.

1. 비동기 프레임을 위한 추가 메모리 할당과 Swift 런타임의 작업 관리처럼 동시성에는 비용이 있다. 동시성을 도입해 얻는 이점이 이 비용보다 클 때 Swift Concurrency를 사용하는 것이 좋다.

```swift
async let isThumbnailView = 
    userDefaults.bool(forKey: "ViewType")
if await isThumbnailView {
    // Perform thumbnail view layout
} else {
    // Perform list view layout
}
```

위 예제처럼 단순한 값을 읽는 작업은 자식 태스크를 만들고 관리하는 비용이 더 클 수 있다. 모든 작업을 무조건 비동기로 바꾸는 것이 항상 빠른 것은 아니다.

> Swift Concurrency를 사용할땐 Instrument를 잘 찍어서 코드의 성능 특성을 이해하자.

#### await and atomicity

Swift는 `await` 이전의 코드를 실행한 스레드와 continuation을 실행하는 스레드가 같다고 보장하지 않는다. `await`는 태스크가 스스로 실행을 양보할 수 있는 지점이므로, 코드의 원자성이 끊길 수 있는 명시적인 경계이기도 하다. 따라서 `await`를 가로질러 Lock을 유지하지 말고, 스레드 지역성에 의존하는 코드도 `await`를 기준으로 다시 살펴봐야 한다.

#### 런타임 계약

Swift에서는 협력적 스레드 풀이 기본 executor다. 따라서 `await`, actor, Task Group처럼 작업 간의 종속성을 런타임이 알 수 있는 기본 요소를 사용해야 한다. `NSLock`처럼 짧게 사용되는 동기화 도구는 동기 코드 안에서 제한적으로 사용할 수 있지만, 세마포어나 조건 변수처럼 스레드를 오래 기다리게 만드는 도구는 cooperative pool의 전진 진행을 막을 수 있다.

- 안전: `await`, `actors`, `taskgroup`
- 주의: `os_unfair_lock`, `NSLock`(동기 코드에서만)
- 안전하지 않음: `DipatchSemaphore`, `pthread_cond`, `NSCondition`, `pthread_rw_lock` 등…

```swift
func updateDatabase(_ asyncUpdateDatabase: @Sendable @escaping () async -> Void) {
    let semaphore = DispatchSemaphore(value: 0)
    Task {
        await asyncUpdateDatabase()
        semaphore.signal()
    }
    semaphore.wait()
}
```

이 코드는 태스크 경계를 세마포어로 다시 연결한다. 태스크가 signal을 보낼 때까지 현재 스레드가 `wait()`에서 블록되므로, cooperative pool의 스레드가 모두 이런 방식으로 대기하면 작업을 진행할 스레드가 부족해질 수 있다. 이는 Swift Concurrency가 기대하는 전진 진행 계약을 위반한다.

이런 문제를 찾을 때는 프로젝트 스킴의 환경 변수에 `LIBDISPATCH_COOPERATIVE_POOL_STRICT=1`을 설정해 cooperative pool에서의 부적절한 블로킹을 확인할 수 있다.

> 세마포어 자체가 항상 잘못된 도구라는 뜻은 아니다. 문제는 Swift Concurrency의 cooperative pool 안에서 스레드를 블록하는 방식으로 태스크 간 의존성을 표현하는 것이다. `await`, actor, Task Group처럼 런타임이 이해할 수 있는 구조를 사용하면 스레드를 붙잡아 두지 않고도 같은 의존성을 표현할 수 있다.

### 새로운 세계에서 상태 동기화하기

Actor는 변경 가능한 상태를 이를 상호 배제를 통해서 동시 접근에서 보호한다. 덕분에 한 번에 하나의 작업만 접근할 수 있으므로 데이터 레이스를 방지할 수 있다.

Actor는 특정 스레드를 영구적으로 점유하지 않고, 작업이 중단되면 해당 스레드가 다른 작업을 실행할 수 있도록 한다. Actor에서 다른 Actor로 실행이 전환되는 것을 actor hopping이라고 한다.

### 액터 재진입성

Actor는 상호 배제를 보장하면서도 작업의 우선순위를 고려할 수 있어야 한다.

GCD의 직렬 큐를 생각해보자. 우선순위가 높은 작업과 낮은 작업이 함께 들어왔을 때, 직렬 큐가 엄격한 선입선출만 적용하면 낮은 우선순위 작업이 먼저 실행되고 높은 우선순위 작업이 뒤로 밀릴 수 있다. 이를 우선순위 역전이라고 한다.

GCD는 앞선 작업의 우선순위를 높이는 방식으로 이 문제를 완화할 수 있지만, 직렬 큐의 선입선출 구조 자체가 바뀌는 것은 아니다. Actor의 재진입성은 이 문제를 다른 방식으로 다룬다.

Actor는 FIFO를 엄격하게 적용하는 대신 상호 배제를 보장한다. 하나의 Actor에서 작업이 `await`로 중단되면 다른 작업이 실행될 수 있으므로, 우선순위가 높은 작업을 먼저 처리할 여지가 생긴다. 이것이 actor reentrancy다.

### 메인 액터

UI를 업데이트하는 코드는 `MainActor`에서 실행해야 한다. `MainActor`는 메인 스레드와 연결된 전역 actor이므로, UI 상태에 대한 접근을 한곳에서 직렬화한다. -> UI는 왜 메인 스레드에서 처리해야하지?

```swift
func loadArticle(with id: ID) async throws -> Article

@MainActor func updateUI(for article: Article) async
@MainActor func updateArticles(for ids: [ID]) async throws {
    for id in ids {
        let article = try await database.loadArticle(with: id) // 
        await updateUI(for: article)
    }
}
```

첫 번째 예제에서는 각 반복마다 MainActor에서 데이터베이스 actor로 hopping하고, 다시 MainActor로 돌아온다. 반복 횟수가 적고 각 작업이 충분히 길다면 문제가 되지 않지만, 짧은 작업을 반복하면서 MainActor를 자주 오가면 hopping 비용이 누적될 수 있다. 이런 경우에는 MainActor에서 처리할 작업을 한 번에 모으도록 코드를 재구성하는 편이 좋다.

뭐 이런 경우엔

```swift
func loadArticle(with id: [ID]) async throws -> [Article]

@MainActor func updateUI(for article: [Article]) async
@MainActor func updateArticles(for ids: [ID]) async throws {
    let article = try await database.loadArticle(with: ids) // 
    await updateUI(for: articles)
}
```

이렇게 하면 hopping 전에 Article을 모두 모아둘 수 있고, MainActor에서는 한 번의 전환 뒤에 UI를 일괄 업데이트할 수 있다.

## 정리

- GCD에서는 블로킹으로 인해 스레드가 계속 늘어나는 Thread Explosion이 발생할 수 있다.
- Swift Concurrency는 `await`와 continuation을 이용해 스레드를 블록하지 않고 작업을 전환한다.
- cooperative thread pool이 효율적으로 동작하도록 세마포어나 조건 변수로 스레드를 오래 블록하지 않아야 한다.
- Actor는 변경 가능한 상태를 보호하고, `MainActor`는 UI 상태를 메인 스레드에서 안전하게 관리한다.
