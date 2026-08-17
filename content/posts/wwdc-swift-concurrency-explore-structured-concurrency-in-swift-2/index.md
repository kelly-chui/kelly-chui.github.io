---
title: "Swift Concurrency. Explore Structured Concurrency in Swift (2) - WWDC21"
date: 2026-08-17T19:50:17+09:00

categories:
series:
tags:

draft: false
original: ""
---

[앞선 포스팅]({{< relref "posts/wwdc-swift-concurrency-explore-structured-concurrency-in-swift-1" >}})에서는 구조화된 동시성이 task 계층 구조를 활용해 제어 흐름을 일반 동기 코드처럼 만들고, 에러 전파와 cancellation을 단순하게 만드는 방식을 정리했다.

이 포스팅에서는 계층 구조가 없는 task, 즉 unstructured task(구조화되지 않은 동시성)에 대해 정리한다.

## Not all tasks fit a structured pattern

동기 코드에서 처음으로 비동기 연산을 시작하는 경우처럼 parent task가 존재하지 않거나, task의 생명주기가 하나의 스코프에 들어맞지 않는 경우가 있을 수 있다.

이런 경우는 특히 UIKit에서 delegate를 구현할 때 자주 발생한다. 

아래 예제에서는 앞서 만든 `fetchThumbnails` 함수를 사용해 컬렉션 뷰 아이템이 화면에 표시될 때 네트워크에서 썸네일을 가져온다:

```swift
@MainActor
class MyDelegate: UICollectionViewDelegate {
    func collectionView(_ view: UICollectionView,
                        willDisplay cell: UICollectionViewCell,
                        forItemAt item: IndexPath) {
        let ids = getThumbnailIDs(for: item)
        let thumbnails = await fetchThumbnails(for: ids)
        display(thumbnails, in: cell)
    }
}
```

우선, UI 작업은 MainActor에서 수행해야 하므로 `@MainActor` 어트리뷰트를 붙인다.

delegate 메소드는 async 함수가 아니므로, 비동기 작업을 시작하려면 `Task`가 필요하다.

하지만 이 task의 생명주기를 이 delegate method 하나의 scope에 묶고 싶지는 않다.

{{< callout type="note" title="왜 delegate method의 scope에 묶을 수 없을까?" >}}
`willDisplay`는 item이 화면에 나타난 순간 호출되는 동기 delegate 메소드다. 

이 메소드는 즉시 리턴해야 하므로, 썸네일을 가져오는 작업을 이 scope 안에서 기다릴 수가 없다.

또한 이 작업의 실제 생명주기는 하나의 method에 머물지 않는다. item이 화면에서 사라졌다는 사실은 나중에 `didEndDisplaying` callback으로 전달되며, 그 시점에 task를 취소해야 한다. 

즉, 작업의 시작과 종료가 서로 다른 delegate callback에 걸쳐 있으므로, 하나의 lexical scope에 묶인 structured task보다 직접 수명을 관리하는 unstructured task가 적합하다.

어짜피 동기 코드라서 `await`를 사용 못하기도 하지만...
{{< /callout >}}

`await`를 사용하려면, 이 위치에서 직접 `Task`를 생성해야 한다. 

비동기적으로 실행할 코드를 클로저로 옮긴 뒤 Task에 전달하면, 동기 delegate 메소드 안에서도 async 작업을 시작할 수 있다.

```swift
@MainActor
class MyDelegate: UICollectionViewDelegate {
    func collectionView(_ view: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt item: IndexPath) {
        let ids = getThumbnailIDs(for: item)
        Task {
            let thumbnails = await fetchThumbnails(for: ids)
            display(thumbnails, in: cell)
        }
    }
}
```

task 생성 지점에 도달하면 런타임은 이 task가 생성된 컨텍스트와 같은 actor(이 경우엔 MainActor)에서 실행되도록 스케줄링한다.

제어권은 즉시 caller에게 리턴되고, task는 delegate 메소드를 실행 중인 main thread를 블록하지 않고 MainActor가 실행할 여유가 생겼을 때 진행된다.

## Unstructured tasks

위의 코드처럼 `Task { ... }`로 직접 생성한 task는 생성 시점의 컨텍스트를 일부 상속한다. 이를 unstructured task라고 한다.

생성 지점이 actor에 격리되어 있다면 같은 actor에서 실행되며, priority와 task-local value 같은 특성도 함께 전달받는다.

하지만 unstructured task는 task group이나 `async let`으로 만든 child task처럼 구조화된 task tree에 속하지 않는다.

따라서 생성한 scope가 끝나도 task의 생명주기는 계속될 수 있고, 비동기 코드가 아닌 동기 코드에서도 만들 수 있다.

하지만 이런 유연성의 대가로 structured concurrency가 자동으로 처리하던 작업은 직접 관리해야 한다. 

예를 들어 task 취소와 에러는 생성한 쪽에서 자동으로 전파되지 않으며, task의 결과도 암시적으로 기다려주지 않는다. 

필요하다면 리턴받은 `Task` 값을 저장하고, 직접 취소하거나 `value`를 `await`로 기다려야 한다.

위 코드에서는 썸네일을 가져오는 unstructured task를 시작했다. 썸네일을 가져오기 전에 item이 화면 밖으로 사라지면 task를 취소하고 싶으면 어떻게 해야 할까?

이 경우에는 취소 상태가 자동으로 전파되지 않으므로, 직접 관리해야 한다.

```swift
class MyDelegate: UICollectionViewDelegate {
    var thumbnailTasks: [IndexPath: Task<Void, Never>] = [:]

    func collectionView(_ view: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt item: IndexPath) {
        let ids = getThumbnailIDs(for: item)
        thumbnailTasks[item] = Task {
            let thumbnails = await fetchThumbnails(for: ids)
            display(thumbnails, in: cell)
        }
    }
}
```

먼저 task를 생성한 뒤 생성 결과를 저장한다. 이 값을 아이템의 인덱스를 key로 하는 딕셔너리에 넣어 두면, task를 취소해야 할 때 해당 값을 쉽게 찾을 수 있다.

{{< callout type="note" title="Task { ... }의 리턴값은?" >}}
`Task { ... }` 표현식은 클로저의 실행 결과가 아니라, 새로 생성한 task를 제어할 수 있는 `Task<Success, Failure>` 값을 리턴한다.

클로저가 값을 리턴하면 그 값이 `Success`가 된다. 이 예제처럼 클로저가 아무 값도 리턴하지 않으면 `Success`는 `Void`이므로, 생성 결과의 타입은 `Task<Void, Never>`다.

이 값을 저장해 두면 `cancel()`로 취소를 요청하거나, `value`를 await하여 task가 끝날 때까지 기다릴 수 있다. unstructured task는 스코프를 벗어날 때 자동으로 완료를 기다려주지 않으므로, 기다림이 필요하다면 직접 `value`를 await해야 한다.
{{< /callout >}}

task가 끝나면 딕셔너리에서 제거해야 하므로 `defer`를 사용한다.

```swift
defer { thumbnailTasks[item] = nil }
```

컬렉션 뷰 아이템이 화면에서 사라지면, 저장해둔 task 값의 `cancel()` 메소드를 호출해 해당 task에 취소를 요청할 수 있다. 

task 취소는 cooperative하므로 `fetchThumbnails`도 취소를 확인하거나 취소 가능한 API를 사용해야 빠르게 종료된다.

위 예제에서는 그냥 컬렉션 뷰의 delegate 메소드에서 제공해주니까, 그걸 쓰면 된다:

```swift
func collectionView(
    _ view: UICollectionView,
    didEndDisplay cell: UICollectionViewCell,
    forItemAt item: IndexPath
    ) {
    thumbnailTasks[item]?.cancel()
}
```

## Detached tasks

앞에서 만든 unstructured task는 스코프에 묶이지 않으면서도, 생성한 위치의 actor와 priority 같은 실행 문맥을 상속했다.

하지만 생성 시점의 컨텍스트와 완전히 독립된 task가 필요한 경우에는 이런 경우에 detached task를 사용한다.

detached task 역시 생명주기가 스코프에 묶이지 않는 unstructured task다. 다만 생성 시점의 컨텍스트에서 actor, priority, task-local value 같은 특성을 상속하지 않는다. 

따라서 같은 actor에서 실행될 필요도, 같은 priority를 사용할 필요도 없는 경우에 detached task를 사용하면 된다.

예시 코드에서 server에서 썸네일을 가져온 뒤, 같은 네트워크 요청을 반복하지 않도록 디스크 캐시에 썸네일을 저장한다고 해보자.

```swift
@MainActor
class MyDelegate: UICollectionViewDelegate {
    var thumbnailTasks: [IndexPath: Task<Void, Never>] = [:]
    
    func collectionView(_ view: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt item: IndexPath) {
        let ids = getThumbnailIDs(for: item)
        thumbnailTasks[item] = Task {
            defer { thumbnailTasks[item] = nil }
            let thumbnails = await fetchThumbnails(for: ids)
            Task.detached(priority: .background) {
                writeToLocalCache(thumbnails)
            }
            display(thumbnails, in: cell)
        }
    }
}
```

cache 저장은 UI 작업이 아니며, 생성 시점의 컨텍스트의 actor, priority, cancellation 상태를 상속할 필요가 없다.

또한 썸네일을 가져오는 task가 취소되더라도 이미 가져온 결과를 cache에 저장하지 않을 이유가 없다. 나중에 쓸 수 있으니까.

따라서 같은 액터에서 실행될 필요도 없고, 태스크 취소를 전파받을 이유도 없으니 detached task를 사용한다.

만약 썸네일에 background task를 추가하고 싶으면 여러 개의 detached task를 만들어 추가할 수 있다.

하지만 detached task 내부에서 structured concurrency를 사용할 수도 있다.

{{< callout type="warning" title="문법 변경됨" >}}
아래 예제의 `g.async`는 WWDC21 당시의 API다. 

현재 Swift에서는 `group.addTask`를 사용하고, `withTaskGroup`이 끝날 때까지 기다려야 하므로 호출 앞에 `await`를 붙인다.

```swift
await withTaskGroup(of: Void.self) { group in
    group.addTask { writeToLocalCache(thumbnails) }
    group.addTask { log(thumbnails) }
}
```
{{< /callout >}}

```swift
@MainActor
class MyDelegate: UICollectionViewDelegate {
    var thumbnailTasks: [IndexPath: Task<Void, Never>] = [:]
    
    func collectionView(
        _ view: UICollectionView,
        willDisplay cell: UICollectionViewCell,
        forItemAt item: IndexPath
    ) {
        let ids = getThumbnailIDs(for: item)
        thumbnailTasks[item] = Task {
            defer { thumbnailTasks[item] = nil }
            let thumbnails = await fetchThumbnails(for: ids)
            Task.detached(priority: .background) {
                withTaskGroup(of: Void.self) { g in
                    g.async { writeToLocalCache(thumbnails) }
                    g.async { log(thumbnails) }
                    g.async { ... }
                }
            }
            display(thumbnails, in: cell)
        }
    }
}
```

여기서는 작업 수가 동적이므로 task group을 사용했지만, 정해진 개수의 작업이라면 `async let`도 사용할 수 있다.

나중에 background task를 취소해야 한다면 detached task 하나만 취소해도, 그 아래 task group의 child task까지 취소가 자동으로 전파된다. (detached task도 자기 자신의 task tree를 가진다.)

## 정리

[앞선 포스팅]({{< relref "posts/wwdc-swift-concurrency-explore-structured-concurrency-in-swift-1" >}})과 이번 포스팅에서 총 4가지 종류의 task를 정리했다. 

- async let은 개수가 정해진 child task를 변수 바인딩 형태로 생성할 때 적합하다. child task는 scope에 묶이며, scope를 벗어날 때 취소와 오류 전파가 자동으로 관리된다.
- 생성할 child task의 수가 동적이지만, 모든 작업을 하나의 scope 안에서 끝내야 한다면 task group을 사용한다.
- 작업의 생명주기를 하나의 scope에 묶기 어렵지만, 작업을 시작한 문맥의 actor나 priority를 이어받아야 한다면 unstructured task를 사용한다. 이 경우 취소, 결과, 에러 처리는 직접 관리해야 한다.
- 작업을 시작한 문맥과 완전히 독립되어야 한다면 detached task를 사용한다. detached task는 actor, priority, task-local value 같은 특성을 상속하지 않는다.

각 task의 수명과 필요한 실행 컨텍스트에 맞는 task를 선택하면, 동시성 작업을 안전하게 관리하면서 앱의 핵심 기능에 집중할 수 있다!
