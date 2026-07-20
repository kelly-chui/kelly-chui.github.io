---
title: "The Swift Programming Language. Concurrency (1)"
date: 2023-06-23

categories:
  - Swift
series:
  - The Swift Programming Language
tags:
  - Concurrency

weight: 29

draft: false
original: "https://junmusu.tistory.com/104"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Concurrency

스위프트는 구조화된 방식의 비동기적이고 병렬 수행되는 코드 작성에 대한 지원이 내장되어있다. _비동기(Asynchronuous)_ 코드는 일시중단 되었다가 나중에 재개할 수 있지만, 한번에 프로그램의 한 부분만 실행된다. 프로그램에서 코드를 중단하고 재개하면 네트워크에서 데이터를 불러오거나, 파일 파싱과 같은 긴 시간이 걸리는 작업을 계속 진행하면서 UI 업데이트와 같은 짧은 시간이 걸리는 작업을 계속할 수 있다. _병렬 코드(Parallel code)_ 는 동시에 실행되는 코드들을 의미한다 — 예를 들어 4코어 프로세서를 가진 컴퓨터는 각각의 코어가 코드 하나씩을 실행하게 하여, 네 개의 코드를 동시에 실행할 수 있다. 병렬과 비동기 코드를 사용하는 프로그램은 한번에 여러 작업을 수행하고, 외부 시스템을 기다리는 작업을 일시 중단한다. 이 챕터의 나머지 부분에서 용어 _동시성(concurrency)_ 는 비동기 및 병렬 코드를 지칭한다.

병렬 또는 비동기 코드의 추가 스케줄링 유연성은 복잡성이 증가하는 비용이 있다. 스위프트는 일부 컴파일 타임 체킹으로 의도를 표현할 수 있게 해준다. —예를 들면, 액터를 사용하여 변경 가능한 상태(mutable state)에 안전하게 접근할 수 있다. 하지만, 너무 느리거나 버그가 있는 코드에 동시성을 추가한다고 해서 그 코드가 빨라지거나, 정확하게 동작한다는 보장은 없다. 실제로 동시성을 추가하면 코드 디버깅이 더 힘들어질 수도있다. 하지만 동시성이 필요한 코드에 스위프트의 언어 레벨의 동시성 지원을 사용하면 컴파일 타임에 문제를 캐치하는데 도움을 줄 수 있다.

> Note  
> 동시성 코드를 이전에 작성해 봤으면 스레드와 함께 사용했을 것이다. 스위프트의 동시성 모델은 스레드 위에 빌드되지만, 직접적으로 스레드와 상호작용할 필요는 없다. 스위프트의 비동기 함수는 실행 중인 스레드를 포기할 수 있다. 첫 번째 함수가 중단되면 그 스레드의 다른 비동기 함수가 실행된다. 비동기 함수가 재개되면, 스위프트는 함수가 실행된 스레드에 어떠한 보장도 하지 않는다.

스위프트의 언어 지원이 없더라도 동시성 코드를 작성할 수 있지만, 그러한 코드들의 가독성은 나쁘다. 예를 들어 다음의 코드는 사진의 이름 리스트를 다운받고, 리스트 안의 첫 번째 사진을 다운받고, 그 사진을 유저에게 보여주는 코드이다.


```reasonml
listPhotos(inGallery: "Summer Vacation") { photoNames in
    let sortedNames = photoNames.sorted()
    let name = sortedNames[0]
    downloadPhoto(named: name) { photo in
        show(photo)
    }
}
```
 

이러한 간단한 케이스에도, 컴플리션 핸들러가 연속적으로 작성되어야 하므로 중첩된 클로저를 작성하게 된다. 이러한 스타일에서는 더 깊은 중첩이 있는 코드를 빠르게 다루기 어려워진다.

### Defining and Calling Asynchronous Functions

비동기 함수(혹은 메소드, 이하 메소드는 생략)는 실행 도중 일시정지 할 수 있는 특별한 종류의 함수이다. 이는 완료될 때 까지 실행되거나, 에러를 발생시키거나, `Never`를 리턴하는(Kelly 주: `Never`를 리턴한다는 것은 함수가 리턴을 하지 않는다는 뜻이다. 즉, 함수가 리턴되지 않기 때문에 절대로 정상적인 흐름으로 돌아갈 수 없게 된다. 대표적인 예시로는 `fatalError`가 있다.) 일반적인 동기 함수와는 대조된다. 비동기 함수도 여전히 저 세가지중 하나를 하지만, 무언가를 기다릴 때는 잠시 정지할 수도 있다. 비동기 함수의 본문에서, 실행이 일시중단될 수 있는 부분을 지정해야 한다.

함수가 비동기 함수임을 나타내려면, `throws` 키워드를 작성하는 것과 비슷하게 함수의 파라미터 뒤에 `async` 키워드를 작성한다. 함수가 값을 리턴한다면, `async`의 앞에 리턴 화살표(`->`)를 작성한다. 예를 들어, 다음은 갤러리에서 사진들의 이름을 불러오는 코드이다.


```rust
func listPhotos(inGallery name: String) async -> [String] {
    let result = // ... some asynchronous networking code ...
    return result
}
```
 

비동기 함수면서, 쓰로잉 함수인 경우에는 `async`를 `throws` 앞에 작성한다(`async throws`).

비동기 메소드를 호출하면, 해당 메소드가 리턴할 때 까지 실행이 중단된다. 중단이 가능한 지점을 지정하기 위해 호출 앞에 `await`를 작성한다. 쓰로잉 함수를 호출할 때, `try`를 쓰는 것과 비슷하다. 비동기 메소드 안에서, 실행 플로우는 다른 비동기 메소드를 호출할 때만 중단된다 — 중단은 절대로 암시적이거나 선점적이지 않다 — 이는 중단이 가능한 모든 지점이 `await`로 표시되어야 한다는 것을 뜻한다.

예를 들어 아래의 코드는 갤러리 내부의 모든 사진의 이름을 불러오고, 첫 번째 사진을 보여준다.


```reasonml
let photoNames = await listPhotos(inGallery: "Summer Vacation")
let sortedNames = photoNames.sorted()
let name = sortedNames[0]
let photo = await downloadPhoto(named: name)
show(photo)
```
 

`listPhotos(inGallery:`)와 `downloadPhoto(named:)` 함수 둘 다 네트워크 요청을 해야하므로, 완료될 때까지 오랜 시간이 걸릴것이다. 두 함수의 리턴 애로우 앞에 async를 작성하여 둘 다 비동기 함수로 만들면, 이 코드가 사진이 준비될 때 까지 기다리는 시간 동안, 앱의 나머지 코드가 계속 실행된다.

다음은 위 예제에서 가능한 실행 순서중 하나를 나열한 것이다.

  1. 코드는 첫 번째 줄에서 시작되어 첫 번째 `await`까지 실행된다. `listPhotos(inGallery:)` 함수를 실행하고, 그 함수가 리턴할 때 까지 (코드의)실행을 중단한다.
  2. 코드의 실행이 중단되었을 때, 프로그램 내부의 다른 동시성 코드가 실행된다. 예를 들면, 새 포토 갤러리의 리스트를 업데이트 하는것과 같은 백그라운드 작업을 한다. 그러한 코드 역시, 다음 await를 만나거나 작업을 완료할 때 까지 실행된다.
  3. `listPhotos(inGallery:)`가 리턴되면, 이 코드는 해당 지점에서 다시 재개된다. 이 경우에는 `photoNames`에 리턴된 값을 할당한다.
  4. `sortedNames`와 `name`을 정의하는 라인은 `await`가 없기 때문에, 일반적인 동기 코드다. 따라서 정지할 수 있는 부분이 존재하지 않는다.
  5. 다음 `await`는 `downloadPhoto(named:)` 함수 호출에 표시되어 있다. 이 코드는 함수가 리턴할 때 까지, 다시 한번 실행을 멈추고, 다른 동시성 코드가 실행될 기회를 준다.
  6. `downloadPhoto(named:)`가 리턴하면, 그 리턴 값은 `photo`에 할당되고, `slow(\_:)`의 아규멘트로 넘어간다.



코드에서 `await`로 표시된 정지 가능한 지점은 비동기 함수나 메소드가 리턴할 때 까지 기다리는 동안, 현재 코드가 실행을 멈출수도 있다는 것을 나타낸다. 이것은 _스레드 양보(yielding the thread)_ 라고도 하는데, 스위프트는 현재 스레드에 있는 코드의 실행을 멈추고 그 스레드에 있는 다른 코드를 실행하기 때문이다. `await`가 있는 코드는 실행을 멈출 수 있어야 하기 떄문에 다음과 같은 프로그램의 특정 부분에서만 비동기 함수나 메소드를 호출할 수 있다:

  - 비동기 함수, 메소드, 프로퍼티의 본문에 있는 코드
  - `@main`으로 지정된 스트럭처, 클래스, 열거형의 `static main()` 메소드 내부의 코드
  - 구조화 되지 않은 차일드 태스크(`child task`)



정지 가능한 지점 사이에 있는 코드는 다른 동시성 코드가 인터럽션 할 가능성 없이 순차적으로 실행된다. 예를 들면, 아래의 코드는 하나의 갤러리에서 다른 갤러리로 사진을 옮긴다.


```stylus
let firstPhoto = await listPhotos(inGallery: "Summer Vacation")[0]
add(firstPhoto, toGallery: "Road Trip")
// At this point, firstPhoto is temporarily in both galleries.
remove(firstPhoto, fromGallery: "Summer Vacation")
```
 

`add(_:toGallery:)`와 `remove(_:fromGallery)`사이에 다른 코드를 실행할 방법은 존재하지 않는다. 그 시간 동안, 첫 번째 사진은 두 갤러리에 동시에 존재하여 일시적으로 앱의 불변성을 깨뜨린다.(주: 앱의 불변성이 깨진 불안정한 시점이기 때문에 동시성 작업이 존재해서 코드가 중단되면 안되고, 작업을 마무리 지어야 한다.) 이 코드에 `await`가 추가되면 안되는 것을 명확하게 나타내기 위해, 이 코드를 동기 함수로 리팩토링 할 수 있다.


```groovy
func move(_ photoName: String, from source: String, to destination: String) {
    add(photoName, toGallery: destination)
    remove(photoName, fromGallery: source)
}
// ...
let firstPhoto = await listPhotos(inGallery: "Summer Vacation")[0]
move(firstPhoto, from: "Summer Vacation", to: "Road Trip")
```
 

위의 예시에서 `move(_:from:to:)`은 동기 함수이므로, 이 함수가 중단 가능한 지점을 절대 포함할 수 없다는 것을 보장할 수 있다. 나중에 이 함수에 동시성 코드를 추가하려 하면, 버그가 아닌 컴파일 타임 에러가 발생한다.

> Note  
> Task.sleep(until:tolerance:clock:)메소드는 동시성을 배우기 위해 간단한 코드를 작성할 때 유용한 메소드이다. 이 메소드는 아무것도 하지 않지만, 리턴하기 전에 주어진 ns만큼 대기한다. 다음은 네트워크 작업에 걸리는 시간을 시뮬레이션 하기 위해 sleep(until:tolerance:clock:)을 사용하는 버전의 listPhotos(inGallery:)함수이다.
> 
> 
```rust
func listPhotos(inGallery name: String) async throws -> [String] {
    try await Task.sleep(until: .now + .seconds(2), clock: .continuous)
    return ["IMG001", "IMG99", "IMG0404"]
}​
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
