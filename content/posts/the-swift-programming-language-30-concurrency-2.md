---
title: "The Swift Programming Language. Concurrency (2)"
date: 2023-06-26
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Concurrency"]
weight: 30

draft: false
original: "https://junmusu.tistory.com/105"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Asynchronous Sequences

이전 섹션의 listPhotos(inGallery:) 함수는 모든 배열의 원소들이 준비된 후, 비동기적으로 전체 배열을 리턴한다. 다른 접근 방법으로는 _비동기 시퀀스(asynchronous Sequence)_ 를 사용하여 컬렉션의 요소 하나를 한 번에 하나씩 기다리는 것이다. 다음은 비동기 시퀀스를 반복하는 모습이다.


```swift
import Foundation

let handle = FileHandle.standardInput
for try await line in handle.bytes.lines {
    print(line)
}
```
 

일반적인 for-in 루프를 사용하는 대신에, 위의 예시는 for 다음에 await를 작성한다. 비동기 함수나 메소드를 호출할 때 처럼 await를 쓰는 것은 정지 가능한 지점을 나타낸다. for-await-in 루프는 각 반복이 시작될 때, 다음 원소가 준비될 때 까지 기다리는 동안 실행을 정지한다.

같은 방법으로, Sequence 프로토콜을 준수하도록 하여, for-in 루프에서 자체 타입을 사용할 수 있는 것 처럼 for-await-in 루프도 AsyncSequence 프로토콜을 준수하는 타입은 자체 타입을 사용할 수 있다.

### Calling Asynchronous Functions in Parallel

await를 사용하여 비동기 함수를 호출하는 것은, 한 시점에 하나의 코드만 실행한다. 비동기 코드가 실행될 때, 호출자는 다음 코드 라인을 실행하기 위해서는 실행중인 코드가 멈출때 까지 기다려야 한다. 예를 들어 갤러리에서 앞부터 3장의 사진을 불러올 때, 다음처럼 downloadPhoto(named:) 호출을 세 번 기다려야 한다.


```swift
let firstPhoto = await downloadPhoto(named: photoNames[0])
let secondPhoto = await downloadPhoto(named: photoNames[1])
let thirdPhoto = await downloadPhoto(named: photoNames[2])

let photos = [firstPhoto, secondPhoto, thirdPhoto]
show(photos)
```
 

이 접근 방법에는 중요한 단점이 있다: 다운로드가 비동기적이고, 진행되는 동안 다른 작업을 진행할 수 있어도 한 시점에는 하나의 downloadPhoto(named:)만 실행된다. 각 사진 다운로드는 다음 사진의 다운로드가 시작하기 전에 완료된다. 하지만 각 사진은 같은 시간에 독립적으로 다운로드 할 수 있기 때문에 이러한 작업을 기다릴 필요가 없다.

비동기 함수를 부르고, 주변 코드와 병렬 실행을 하기 위해서는 상수를 정의할 때 let 앞에 async를 작성하고, 그 상수들을 사용할 때 마다, await를 사용하면 된다.


```swift
async let firstPhoto = downloadPhoto(named: photoNames[0])
async let secondPhoto = downloadPhoto(named: photoNames[1])
async let thirdPhoto = downloadPhoto(named: photoNames[2])

let photos = await [firstPhoto, secondPhoto, thirdPhoto]
show(photos)
```
 

이 예시에서, downloadPhoto(named:)의 세 호출 모두 전의 코드가 끝나기 전 까지 기다리지 않고 시작한다. 만약 가용할 수 있는 시스템 리소스가 있다면, 이 세 호출 전부 동시에 실행된다. 이 함수들은 코드가 함수의 결과를 기다리지 않기 떄문에 await로 지정되지 않는다. (함수의 결과를 기다리지 않고) photos가 정의되어 있는 라인 까지 실행된다. — 그 시점(photos가 정의되어 있는 라인)에서, 프로그램은 이 비동기 호출에 대한 결과가 필요하다, 따라서 await를 작성하여 실행을 일시 정지시키고, 이 세 사진이 다운로드가 끝날 때 까지 기다린다.

다음은 이 두 가지 접근 방법의 차이에 대해서 생각하는 방식이다.

  - 다음 줄의 코드가 함수의 결과에 영향을 받는다면, await를 이용하여 비동기 함수를 호출한다. 이렇게 하면 순차적으로 실행되는 작업이 생성된다.
  - 코드에서 함수의 결과가 필요하지 않을 경우에는, async-let을 사용하여 비동기 함수를 호출한다. 이렇게 하면 병렬적으로 실행되는 작업이 생성된다.
  - await와 async-let 둘 다 일시 정지 했을 때, 다른 코드가 실행되는 것을 허용한다.
  - 두 케이스에서, await를 사용하여 정지 가능한 지점을 지정하여 필요할 경우, 비동기 함수의 결과가 리턴될 때 까지 실행이 중단될 수 있다는 것을 나타낸다.



이 두개의 접근 방법을 같은 코드에서 섞어서 사용할 수도 있다.

### Tasks and Task Groups

_태스크(task)_ 는 프로그램의 일부분으로 비동기적으로 실행될 수 있는 작업 단위이다. 모든 비동기 코드는 태스크의 일부분으로 실행된다. 이전 섹션에서 설명한 async-let 구문은 _자식 태스크(child task)_ 를 생성한다. 또한 태스크 그룹을 만들고 그룹에 자식 태스크를 추가하면 우선순위(priority)와 태스크 취소(cancellation)에 대해 더 많은 제어권을 가지게 되고, 태스크의 개수를 유동적으로(dynamic number of tasks) 만들수 있게 된다.

태스크는 계층 구조로 정렬된다. 태스크 그룹에 있는 각각의 태스크는 같은 _부모 태스크(parents task)_ 를 가지고 있으며, 자식 태스크를 가질수 있다. 태스크와 태스크 그룹은 명시적 관계를 가지고 있기 떄문에, 이 접근 방식은 _구조화된 동시성(structured concurrency)_ 이라고 한다. 정확성에 대한 일부 책임은 프로그래머한태 있지만, 이 명시적인 태스크 간의 부모-자식 관계는 스위프트가 취소 전파(propagating cancellation)과 같은 일부 동작들을 처리할 수 있게 해주고, 컴파일 타임에 일부 에러를 감지하게 해준다.


```swift
await withTaskGroup(of: Data.self) { taskGroup in
    let photoNames = await listPhotos(inGallery: "Summer Vacation")
    for name in photoNames {
        taskGroup.addTask { await downloadPhoto(named: name) }
    }
}
```
 

#### Unstructured Concurrency

이전 섹션에서 설명한 구조화된 동시성 외에도 스위프트는 구조화되지 않은 동시성도 지원한다. 태스크 그룹에 소속된 태스크와 달리 구조화되지 않은 태스크는 부모 태스크를 가지지 않는다. 구조화되지 않은 태스크는 프로그램이 원하는 방향대로 관리하는데 완벽한 유연성이 있지만, 태스크에 대한 정확성에 대한 완벽한 책임을 져야한다. 현재 액터에서 실행되는 구조화되지 않은 태스크를 생성하려면, Task.init(priority:operation:)이니셜라이저를 호출한다. 현재 액터의 일부가 아닌 분리된 작업(detached task)으로 알려진 구조화되지 않은 태스크를 생성하려면 Task.detached(priority:operation:) 클래스 메소드를 호출한다. 두 작업 모두 상호 작용(결과를 기다리거나, 취소할 수 있는)할 수 있는 태스크를 리턴한다.


```swift
let newPhoto = // ... some photo data ...
let handle = Task {
    return await add(newPhoto, toGalleryNamed: "Spring Adventures")
}
let result = await handle.value
```
 

더 많은 정보는 Task에 있다.(포스팅 예정)

#### Task Cancellation

스위프트의 동시성은 협력적 취소 모델을 사용한다. 각 태스크는 적합한 시점에 취소되었는지 체크하고, 적절한 방법으로 취소에 응답한다. 이는 수행 중인 작업에 따라, 다음 중 하나를 의미한다.

  - CancellationError와 같은 에러를 발생시킨다.
  - nil이나 빈 컬렉션을 리턴한다.
  - 부분적으로 완료된 작업을 리턴한다.



취소를 체크하기 위해, 태스크가 취소되었을 때 쓰는 CancellationError를 발생시키는 Task.checkCancellation()을 호출하거나, Task.isCancelled의 값을 체크하여, 취소를 코드 내에서 처리한다. 예를 들어, 갤러리에서 사진들을 다운 받는 태스크는 부분적으로 다운로드 된 것을 삭제하고, 네트워크 연결을 닫는 것이 필요할 수도 있다.

수동으로 취소를 전파하려면 Task.cancel()을 호출한다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
