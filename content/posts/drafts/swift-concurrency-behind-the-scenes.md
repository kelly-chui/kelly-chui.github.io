---
title: "WWDC Note. Swift Concurrency: Behind the Scenes"
date: 2025-08-25

categories:
series:
tags:

draft: true
original: ""
---

// TODO: 너무 노션 노트 문체라서, 한번 다듬고 포스팅 완료하기.

## Threading model

예시 앱으로 뉴스 피드 리더 앱이 있다고 했을때, 앱의 상위 컴포넌트는 다음과 같은 것들이 있다.

- 사용자 인터페이스를 담당하는 메인 스레드
- 사용자가 구독한 뉴스 피드를 추적하는 데이터베이스
- 최신 콘텐츠를 가져오는 네트워킹 서브시스템

만약 유저가 최신 뉴스 보기를 요청한다면:

- 메인 스레드에서 이벤트 제스처 처리
- 데이터베이스 작업을 처리하는 직렬 큐로 요청을 비동기적으로 디스패치
    - 작업을 다른 큐로 보내면 메인 스레드가 무거운 작업(데이터 베이스 작업을 기다리지 않고 사용자 입력을 계속 반응할 수 있기 때문에)
    - 직렬 큐가 상호 배타를 보장하므로, 데이터 베이스 접근이 보장된다.
- 데이터베이스 큐에선 사용자가 구독한 피드에 URLSession을 통해 콘텐츠를 다운로드하는 네트워크 요청을 스케줄링
- 결과가 도착하면 URLSession의 콜백이 Delegate Queue 위에서 호출되어서 각 결과의 Completion Handler가 동기적으로 데이터베이스를 업데이트한다.
- MainThread를 깨워서 UI를 리프레시한다.

보기엔 아주 합리적인 방법이다. 메인스레드를 블록하지 않고, 네트워크 요청을 동시에 처리해 프로그램에서 병렬처리의 이점을 활용할 수 있다.

코드를 살펴보자.

```swift
let urlSession = URLSession(configuration: .default, delegate: self,
                            delegateQueue: concurrentQueue)
```

`URLSession`을 만들고, `delegateQueue`를 `concurrentQueue`로 설정한다.

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

업데이트가 필요한 뉴스 피드를 순회하고, 각각의 피드마다 data task를 스케줄한다. `delegateQueue`에서 실행될 data task의 컴플리션 핸들러에서는 다운로드한 결과를 역직렬화(deserialize)하여 아티클로 만든다. 결과를 피드에 업데이트 하기 전에, DB 큐에 동기적으로 디스패치한다.

이 코드들은 직선적이지만, 숨겨진 성능 문제가 있다. 이 문제를 이해하려면 먼저 GCD 큐에 있는 작업을 처리하기 위해 어떻게 스레드들이 생성되는지 자세하게 살펴봐야한다. GCD에서 작업이 큐에 들어가게 되면, 시스템은 해당 작업 아이템을 처리하기 위해 스레드를 생성하게 된다. 동시성 큐는 한번에 여러 작업을 처리할 수 있기 때문에, CPU 코어 수만큼 스레드를 만든다. 하지만 어떤 스레드가 블록되고, 큐에 처리할 다른 작업들이 있다면, 시스템은 추가 스레드를 생성해서 남은 작업을 처리한다. 이유는 두가지다.

1. 프로세스에 다른 스레드를 줌으로써, 각 코어들이 작업을 실행하는 스레드를 가지는 것을 계속 보장할 수 있게 된다.
2. 블록된 스레드가 세마포어같은 자원을 기다리고 있을 수 있으므로, 새 스레드가 그것을 해제할 수 있도록 하기 위해서

만약 2코어 기기에서는, GCD는 피드 업데이트 결과를 처리하기 위해 두 개의 스레드를 생성한다. 데이터베이스 큐에 접근하기 위해 스레드가 블록된다면, 네트워킹 큐에서 지속적으로 작업하기 위해 다른 스레드들이 생성된다. 네트워킹 작업을 처리하기 위해 CPU가 다른 스레드들 사이에서 컨텍스트 스위칭을 해야한다. 이는 우리 앱이 쉽게 수많은 스레드들을 가지게 된다.

스레드를 많이 가지게 되는게 문제점이 뭐냐? CPU 코어보다 필요 이상으로 많은 스레드를 가지게 된다. 이러한 현상을 Thread explosion이라고 한다.

Thread explosion은 또한, 즉각적으로 명백하지 않은 메모리와 스케줄링 오버해드를 동반한다.

1. 각 블록된 스레드가 다시 실행되기 기다리는 동안, 가치있는 메모리와 자원을 점유하고 있다.
2. 각 스레드는 스택을 가지고 있고, 스레드를 추적하기 위한 연관 커널 데이터 구조도 가지고 있다.
3. 이 스레드들중 일부는 다른 스레드가 실행되는 동안 필요한 락을 점유하고 있을 수 있다.

진행되지 않고 있는 스레드를 위해서 많은 메모리와 자원이 필요하다 → 이게 바로 스케줄링 오버헤드

새로운 스레드가 올라올 때마다, CPU는 스레드 컨텍스트 스위칭을 수행해야 한다. 블록된 스레드가 다시 실행되기 위해, 스케줄러는 스레드를 CPU에 시분할 해야한다. 

Thread explosion 상태에서는, 수백의 스레드를 시분할 하는것은. 과도한 컨텍스트 스위칭을 하게 만들어서 CPU의 효율성을 나쁘게 한다.

## Swift Concurrency

GCD와 다르게 Swift Concurrency에서는 컨텍스트 스위치가 없고, 블록된 스레드 대신 작업 재개를 추적하기 위한 continuation이라는 경량 객체를 대신 가지고 있다.

스레드가 Swift Concurrency로 실행되면, 스레드 컨텍스트 스위치 대신 continuation들을 스위치 하게 된다. 이는 코스트가 단지 함수 호출이 된다는 것을 의미한다. 

Swift Concurrency의 런타임 동작

1. CPU의 코어 개수만큼의 스레드만 만들고, 스레드가 차단되었을 때, 작업들이 저렴하고 효율적으로 전환한다.
2. 추론하기 쉬운 직선적인 코드를 작성하게 한다.
3. 안전하고 통제 가능한 동시성을 얻는다.

이를 위해서는

1. 스레드가 차단되지 않을 것이라는 런타임 계약
2. 언어가 해당 기능을 제공해야한다.

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

헬퍼 함수의 비동기 구현 만들고, 디스패치 큐가 아닌 태스크 그룹 사용해서 동시성 관리하기

async 함수를 부를땐 await 사용

### Async 함수

기존 함수는 스레드마다 하나의 스택을 가지고 있고 → 스레드가 함수 호출을 하면 새로운 로컬 변수, 리턴 주소 및 기다 정보들을 저장하고 있는 프레임이 스택에 푸시된다.

함수가 리턴되어서 종료되면, 해당 스택 프레임은 팝된다.

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

1. updateDatabase에서 add 호출
2. add의 스택 프레임 저장
    1. add의 스택 프레임에는 await를 넘어 사용하지 않을 지역 변수를 저장한다. 여기선 id랑 article
    2. 힙에는 updateDatabase와 add를 위한 두 개의 비동기 프레임이 저장된다.
        1. 비동기 프레임에는 일시 중단 지점을 넘어서도 사용 가능해야하는 정보를 저장한다. newArticle같은. 즉, add의 비동기 프레임은 newArticle을 추적한다.
3. save 실행 → add의 스택 프레임이 save의 스택 프레임으로 대체
    1. 새로운 스택 프레임을 추가하는 대신, 미래에 필요할 모든 변수가 이미 비동기 프레임 목록에 있다. 따라서 최상위 스택 프레임이 대체된다
4. save 함수도 비동기 프레임을 생성한다. save 함수가 실행되는 동안, 스레드를 차단하지 않고 다른 작업을 실행한다.
5. 일시 중단 지점을 넘어 유지되는 모든 정보는 힙에 저장되므로, 나중에 실행을 계속하는데 사용될 수 있다. 이 비동기 프레임 목록이 바로 Continuation의 런타임 표현이다.
6. 데이터베이스 요청이 완료되고 어떤 스레드가 자유로워진다. 이 스레드는 이전과 같은 스레드일 수도 있고 아닐 수도 있다. save 함수가 이 스레드에서 실행을 재개한다고 가정한다.
7. 실행을 완료하고 ID를 반환하면, save의 스택 프레임은 다시 add의 스택 프레임으로 대체된다. 그 후에 스레드는 zip을 실행한다.
    1. zip은 비동기 작업이 아니므로, 스택 프레임을 생성한다.Swift는 운영 체제 스택을 계속 사용하므로 Swift코드는 C 및 Objective-C로 효율적으로 호출할 수 있다. 더해서, C혹은 Objective C 코드는 비동기가 아닌 Swift 코드를 계속 효율적으로 호출할 수 있다.
8. zip이 끝나면, 해당 스택 프레임은 팝되고 실행은 계속된다.

updateDatabase에서 add 호출하면 가장 최근의 스택 프레임은 add를 위한 프레임, 일시 중단 지점을 넘어 사용할 필요가 없는 지역 변수를 저장한다. add에는 하나의 await가 있다. 로컬 변수 id와 article은 정의 이후에 중단되지 않고 for 루프에서 사용된다. 따라서 스택 프레임에 저장된다. 추가로 힙에는 updateDatabase와 add를 위한 두 개의 비동기 프레임이 있다. 비동기 프레임은 일시 중단 지점을 넘어 사용 가능해야 하는 정보를 저장한다. (오 힙에 저장~)  newArticle은 await 이전에 정의되지만, await 이후에도 사용가능해야한다. 이는 add의 비동기 프레임이 newArticles를 추적해야 한다는 것을 의미한다.

save 함수가 실행되기 시작하면 add의 스택 프레임은 save의 스택 프레임으로 대체된다. 새로운 스택 프레임을 추가하는 대신, 미래에 필요할 모든 변수가 이미 비동기 프레임에 저장되어 있으므로, 최상위 스택 프레임이 대체된다. → (뭔 뜻이야????) 

## 런타임의 작업 간 종속성 추적

함수는 await 지점에서 컨티뉴에이션으로 분해될 수 있다. → Swift 런타임에 의해 추적되는 종속성 위 코드에서 URLSession 데이터는 비동기 함수이고, 그 이후의 나머지 작업은 (let articles 에서 return articles) 컨티뉴에이션이다. 컨티뉴에이션은 비동기 함수가 완료된 후에만 실행될 수 있다.

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

태스크 그룹에서, 부모 태스크는 여러 자식 태스크를 만든다.

부모 태스크가 진행되기 전에, 자식 태스크가 완료되어야 한다. 이는 태스크 그룹의 스코프에 의해 코드에 표현되는 종속성이므로, Swift 컴파일러와 런타임에 명시적으로 알려져 있다.

Swift에서, 태스크는 컨티뉴에이션이든 자식 태스크이든 Swift 런타임에 알려진 다른 태스크만 await할 수 있다. → 따라서 Swift Concurrency의 기본 요소로 구조화된 코드는 런타임에 태스크 간의 종속성 체인에 대한 명확한 이해를 제공한다.

SwiftConcurrency는 await에서 태스크를 일시 중지할 수 있고, 실행 중인 스레드는 태스크 종속성에 대해 추론하고 다른 태스크를 선택할 수 있다. → Swift Concurrency는 스레드가 항상 동작하는 것을 보장한다.

이 런타임 계약을 활용하여 Swift 동시성을 위한 통합 OS 지원을 구축했다… 이건 뭐 SwiftConcurrency 자랑? 

이건 Swift Concurrency를 기본 executor로 하기 위한 새로운 협력적 스레드 풀의 형태… 새로운 스레드 풀은 CPU 코어수만큼만 스레드를 생성하여 시스템을 과도하게 커밋하지 않는다. GCD의 동시 큐와 다르게…

### 새 기능을 채택하기 전에

동기 코드를 비동기 코드로 변경할 때의 성능

1. 추가적인 메모리 할당 및 Swift 런타임의 로직과 같은 동시성과 관련된 몇가지 비용에 대해 이야기했다. 코드에 동시성을 도입하는 비용이 이를 관리하는 비용보다 클 때만 Swift Concurrency를 이용한다.

```swift
async let isThumbnailView = 
    userDefaults.bool(forKey: "ViewType")
if await isThumbnailView {
    // Perform thumbnail view layout
} else {
    // Perform list view layout
}
```

이런 코드는 자식 태스크가 수행하는 작업이 태스크를 생성하고 관리하는 비용에 의해 감소하기 때문에. 실제 이점을 얻지 못할 수 있다.

{{< callout type="note" title="참고" >}}
Swift Concurrency를 사용할땐 Instrument를 잘 찍어서 코드의 성능 특성을 이해하자.
{{< /callout >}}

#### await and atomicity

스위프트는 이전의 코드를 실행한 스레드가 continuation을 선택한 스레드와 동일하다는 보장이 없음, await는 코드의 원자성이 깨졌다는 것을 나타내는 명시적 지점(태스크가 자발적으로 스케줄에서 제외됨). 따라서 await를 가로질러 Lock을 하지 말자 마찬가지로 스레드 지역성을 기대하는 코드는 await를 검토해라

#### 런타임 계약

스레드가 항상 진행한다는 점을 기억하자. Swift에선 협력적 스레드 풀이 기본 익스큐터다. Swift Concurrency를 채택했으니까 이 협력적 스레드 풀이 최적으로 기능할 수 있도록 코드에서도 도와줘라 await, 액터, 태스크 그룹과 같은 기본 요소를 사용해서 종속성을 컴파일 타임에 알리고, NSLock 같은건 짧게 잘 쓰면 스레드 데이터 동기화할때 안전할수도 있는데, 세마포어랑 조건 변수는 쓰면 안된다. ㅇㅇ

{{< callout type="note" title="참고" >}}
세마포어랑 조건 변수 쓰지 말라한 이유: 종속성이 숨겨진다.
{{< /callout >}}

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

이 코드처럼 태스크 경계를 넘어서 종속성을 도입하지 마라 (서로 다른 스레드가 깨워줘야함) → 스레드의 전진 진행에 대한 런타임 계약 위반 

안전하지 않은거 찾으려면 프로젝트 스키마에서 환경 변수 이거 사용해라 `LIBDISPATCH_COOPERATIVE_POOL_STRICT=1`

### 새로운 세계에서 상태 동기화하기

액터: 변경 가능한 상태를 동시 접근에서 보호하기

상호 배재

액터의 상태가 동시에 접근되지 않는다. → 데이터 레이스 방지

액터는 스레드 재사용이랑 논블로킹~

한 액터에서 다른 액터로 실행이 전환된다 → 액터 hopping

### 액터 재진입성

시스템이 작업을 잘 우선순위화 하게하는 법

일단 GCD에서는…직렬 큐를 생각해보자. 우선순위 높은 작업과 낮은 작업을 받게된다. 이 작업들을 그냥 랜덤한 순서로 받아을 때, 직렬 큐는 선입선출이므로 우선순위 높은 작업이 낮은 작업보다 낮게 실행될 수 있음. (우선순위 역전)

이때 직렬 큐는 높은 우선순위 작업보다 앞선 큐의 모든 작업의 우선순위를 높여서 우선순위 역전을 해결하려한다. 그런데 이것도 결국 선입 선출이고, 이걸 해결하는게 액터 재진입성

액터는 FIFO를 엄밀하게 적용하지 않는다~ 상호 배제만 해줄 뿐, 그래서 우선순위가 높은 걸 해줄 수 있슴

### 메인 액터

UI 업데이트 할때, MainActor 호출하고, MainActor로부터 호출을 받아야한다. - 협력적 풀에 있지 않음~ 

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

두 번의 컨텍스트 전환을 해야해 하나는 메인 액터에서 데이터베이스 액터로 호핑 다른 하나는 다시 돌아오기, 루프가 별로 없고, 각 반복에서 작업이 길다면 괜찮은데, 아니라면 (자주 메인 액터 오가면) 스레드 전환오버헤드 쌓인다. 이런 경우엔 메인 액터를 위한 작업을 일괄 처리하도록 코드를 재구성하자. 메인 액터는 스레드가 메인 스레드로 고정이니까 발생하는 문제임

뭐 이런 경우엔

```swift
func loadArticle(with id: [ID]) async throws -> [Article]

@MainActor func updateUI(for article: [Article]) async
@MainActor func updateArticles(for ids: [ID]) async throws {
    let article = try await database.loadArticle(with: ids) // 
    await updateUI(for: articles)
}
```

이렇게, 호핑 전에 미리 아티클을 모아놓고 한번에 업데이트 하는 방식으로 컨텍스트 스위칭을 줄일수 있다.
