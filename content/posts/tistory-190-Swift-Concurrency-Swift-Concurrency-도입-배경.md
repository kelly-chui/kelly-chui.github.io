---
title: "[Swift Concurrency] Swift Concurrency 도입 배경"
date: 2025-08-03
categories: ["Swift"]
series: ["Swift Concurrency"]
tags: ["Swift Concurrency"]
draft: false
original: "https://junmusu.tistory.com/190"
---

Swift Concurrency는 Swift 5.5에서 도입된 기능이다. `Foundation`을 import 해야 쓸 수 있는 GCD와 다르게, Swift 언어 자체에 내장된 동시성 모델이다.

Swift Concurrency는 크게 두 가지 부분으로 나뉘어진다.

  1. `async`, `await` 로 작성하는 새로운 동시성 모델
  2. 애플리케이션을 여러 동시성 태스크로 분할하는 Actor

이 포스트에서는 Swift Concurrency의 도입 배경을 알아본다.

## GCD의 한계

GCD는 Objective-C에서부터 사용해온 애플이 만든 비동기 API다. Queue 기반으로 작업을 스케줄링 하고, 스레드 위에서 추상화 되어있기 때문에 스레드를 직접 생성하거나 관리할 필요가 없다.

Swift에서 GCD는 주로 콜백과 함께 쓰인다. 꼭 콜백을 사용해야 하는 것은 아니지만 비동기 작업의 결과를 외부로 전달하거나 상태를 공유해야 할 때, 콜백이 가장 직관적이다.

> 💡 Kelly 주  
> 비동기 작업을 하는 함수는 비동기 작업을 큐에 등록한 뒤, 즉시 리턴하여 다른 작업을 계속 진행할 수 있게 한다.
>
> 만약 비동기 작업이 끝날 때까지 기다리고 그 결과를 return 하려면, 함수의 실행이 중단되지 않고 지속되어야 한다. 이 경우는 결국 함수가 동기적으로 실행된다는 것을 의미하고, 동시성 코드를 작성하는 이점이 아예 사라지게 된다. 
> 
> 따라서 GCD는 호출 함수가 리턴되어 사라져도 남아있을 수 있는 이스케이핑 클로저를 이용해 결과를 외부에 전달하는 방법을 사용한다.

하지만 비동기 작업이 깊어지고 많아질수록, 이 콜백도 깊어져서 pyramid of doom 이라고 알려진 문제를 일으키게 된다.

### Pyramid of doom

```swift
func processImageData1(completionBlock: (result: Image) -> Void) {
    loadWebResource("dataprofile.txt") { dataResource in
        loadWebResource("imagedata.dat") { imageResource in
            decodeImage(dataResource, imageResource) { imageTmp in
                dewarpAndCleanupImage(imageTmp) { imageResult in
                    completionBlock(imageResult)
                }
            }
        }
    }
}
```

GCD의 문제점을 설명할 때, 자주 사용되는 코드 스니펫이다. 이 코드의 흐름은 다음과 같다:

  1. `loadWebResource` 함수에서 `dataprofile.txt` 파일을 열어 `dataResource`를 가져온다.
  2. `loadWebResource` 함수에서 `imagedata.dat` 파일을 열어 `imageResource`를 로드한다.
  3. `dataResource`와 `imageResource`를 `decodeImage` 함수에 파라미터로 전달하여, `imageTmp`로 디코딩한다.
  4. 디코딩한 결과 `imageTmp`를 `dewarpAndCleanupImage` 함수에 전달하여 왜곡을 보정한다.
  5. 위 작업들이 끝났으면 `completionBlock`을 결과에 넣어 실행한다.

모든 작업 하나하나가 다 무거운 작업들이기 때문에 비동기적으로 실행되도록 작성하고, 두 `loadWebResource` 함수를 제외하곤 명확한 선후관계가 존재하므로, 위와 같은 코드가 탄생한다. 보기에 그렇게 깔끔하진 않지만, 이해하는데 큰 문제는 없다. 하지만 진짜 문제는 에러 처리에서 일어난다.

```swift
func processImageData2(completionBlock: (result: Image?, error: Error?) -> Void) {
    loadWebResource("dataprofile.txt") { dataResource, error in
        guard let dataResource = dataResource else {
            completionBlock(nil, error)
            return
        }
        loadWebResource("imagedata.dat") { imageResource, error in
            guard let imageResource = imageResource else {
                completionBlock(nil, error)
                return
            }
            decodeImage(dataResource, imageResource) { imageTmp, error in
                guard let imageTmp = imageTmp else {
                    completionBlock(nil, error)
                    return
                }
                dewarpAndCleanupImage(imageTmp) { imageResult in
                    guard let imageResult = imageResult else {
                        completionBlock(nil, error)
                        return
                    }
                    completionBlock(imageResult)
                }
            }
        }
    }
}
```

콜백 기반의 비동기 코드에서는 `throw`와 `catch`를 사용해서 에러 처리를 하지 못한다. 왜냐하면, 비동기 작업을 실행한 함수는 일반적으로 비동기 작업의 결과를 기다리지 않고 return한다. 즉, 비동기 작업에서 에러를 throw 해도 call stack에 에러를 받을 함수가 없다. 따라서 Swift는 컴파일 타임에서 이러한 에러 핸들링을 막게 된다.

그래서 위 코드에서는 에러가 발생하면 직접 `completionBlock`을 호출해서 에러를 전달한 다음, 비동기 작업을 early return하여 다음 작업이 진행되지 않도록 한다. 이런 방법은 가독성도 좋지 않고, 조기 리턴 때문에 흐름을 따라가기가 복잡해진다.

### Thread Explosion

pyramid of doom은 코드 작성 시의 프로그래머의 고충이라면, thread Explosion은 실제 성능에 영향을 끼치는 문제점이다. thread Explosion은 스레드가 너무 많이 생성되는 것이다. 스레드가 너무 많이 생기면, 잦은 스레드 컨텍스트 스위칭이 일어나게 되고. 결국에는 이 모든 컨텍스트 스위칭이 다 CPU 오버헤드가 되어 성능에 악영향을 끼치게 된다. 스레드는 프로세스 간의 컨텍스트 스위칭이 무거워서 등장했는데, 굉장히 아이러니한 상황이 발생한 것이다.

앞서 말했듯이 GCD를 사용하면 스레드를 직접 생성하거나 관리하지 않아도 된다. GCD가 미리 관리하는 thread pool 안에서 작업을 효율적으로 스케줄링 하기 때문이다. 하지만 기본적으로 GCD는 스레드를 생성하고, 교체하면서 작업을 처리한다. 다음 코드를 보자.

```swift
for _ in 0..<100_000 {
    DispatchQueue.global().async {
        for _ in 0..<1000 {
            usleep(100)
        }
    }
}
```

100,000개의 작업을 concurrency queue에 추가하는 코드다. 각 작업은 0.1ms 동안 스레드를 sleep시켜 블록하는 동작을 1,000번 반복한다. GCD는 이 모든 작업을 동시에 처리하기 위해 수많은 스레드를 생성하게 된다.

직접 실행해보기 전에 코드의 동작을 미리 예측해보자.

  1. 동시성 큐에 스레드를 블록시키는 동작이 있는 작업을 10만개 추가한다.
  2. GCD는 이 작업들을 처리하기 위해 스레드에 할당한다. 동시성 큐이므로, GCD가 알아서 스레드를 분배한다.
  3. 스레드에서 작업들이 실행되고, 0.1ms간격으로 sleep를 계속 반복하며 스레드의 상태를 변화시킨다.
  4. 블록된 스레드에는 절대로 작업을 넣지 않기 때문에, GCD는 큐에 남아있는 태스크들을 처리하기 위해 새로운 스레드를 만든다.
  5. 하지만 새롭게 생성된 스레드도 작업이 실행되면 0.1ms 간격으로 sleep를 반복한다.

이러한 연쇄 때문에 폭발적으로 스레드가 생성된다. 이게 바로 thread explosion이다. 그러면 위 코드를 Instruments로 분석해보자. RunLoop를 계속 실행되게 설정했으므로, 10초 후에 자동으로 종료되게 한다.

![](/images/tistory/tistory-190-Swift-Concurrency-Swift-Concurrency-도입-배경/image-001.png)

직접 세어보니 60개 이상의 스레드가 생성되었고, 약 11초간 18,282,348회의 컨텍스트 스위칭이 감지되었다. 컨텍스트 스위칭은 결국 CPU 오버헤드다. 위는 극단적이고, 비현실적인 예시지만, 실제 애플리케이션에서 스레드를 블록하는 작업은 많다. 대표적으로 I/O 작업이나, NSLock, 세마포어를 이용한 접근 제어등이 있다.

여기서 중요한 점은 GCD가 가능한 한 큐에 있는 작업을 계속 실행하려고 한다는 것이다. 하지만 이미 작업을 실행 중인 스레드가 `sleep`, I/O, `NSLock`, 세마포어 등으로 블록되어 있다면, 해당 스레드에는 새로운 작업을 배치할 수 없다. 큐에는 아직 처리하지 못한 작업이 많이 남아 있으므로, 시스템은 이를 처리하기 위해 새로운 스레드를 생성하게 된다.

## Swift Concurrency 소개

### async/await

async/await 모델은 Swift에 내장된 동시성 모델이다. 즉 GCD처럼 Foundation을 import 할 필요 없이, Swift 자체적으로 제공해준다. 이미 C#이나 Python 같은 언어에서 이미 사용하고 있는 검증된 모델이다.

Swift에서는 함수에 마치 `throws`를 쓰듯이 `async` modifier 를 붙여 코루틴 함수임을 명시한다.

> 💡 Kelly 주  
> 코루틴은 현재 상태를 저장하고 잠시 실행을 중단(suspend)하고, 나중에 다시 실행을 재개(resume)할 수 있는 함수를 말한다. GCD는 비동기 작업을 큐에 등록하고 바로 리턴하므로 코루틴이 아니다.

`await`는 `try`를 사용하는 것과 비슷한 문법으로 작성한다. `await`는 해당 지점에서 비동기 태스크가 완료될 때까지 함수의 실행을 일시 중단하고, 완료 이후에 다시 재개할 수 있다. 이를 통해서 동기 함수처럼 비동기 코드를 작성할 수 있게 한다.

위의 pyramid of doom 코드를 async/await 모델로 다시 작성해보자.

```swift
func loadWebResource(_ path: String) async -> Resource
func decodeImage(_ r1: Resource, _ r2: Resource) async -> Image
func dewarpAndCleanupImage(_ i : Image) async -> Image

func processImageData1() async -> Image {
    let dataResource  = await loadWebResource("dataprofile.txt")
    let imageResource = await loadWebResource("imagedata.dat")
    let imageTmp      = await decodeImage(dataResource, imageResource)
    let imageResult   = await dewarpAndCleanupImage(imageTmp)
    return imageResult
}
```

코드의 가독성이 훨씬 좋아진다. 이 코드에서는 `processImageData1` 함수에 `async` modifier를 붙여 코루틴 함수임을 명시한다. 동작은 다음과 같다.

  1. `loadWebResource` 함수에서 `dataprofile.txt` 파일을 열어 `dataResource`를 가져온다. `await` 키워드가 붙어있으므로, `loadWebResource` 함수가 태스크를 마칠 때 까지 일시 중단되어, 스레드가 다른 태스크를 실행 가능하도록 한다.
  2. `loadWebResource` 함수에서 `imagedata.dat` 파일을 열어 `imageResource`를 로드한다. 마찬가지로, 태스크가 완료 될 때 까지 일시 중단된다.
  3. `dataResource`와 `imageResource`를 `decodeImage` 함수에 파라미터로 전달하여, `imageTmp`로 디코딩한다. 디코딩 태스크가 완료 될 때 까지 함수가 잠시 중단된다.
  4. 디코딩한 결과 `imageTmp`를 `dewarpAndCleanupImage` 함수에 전달하여 왜곡을 보정한다. 마찬가지로 보정 태스크가 끝날 때 까지 함수가 잠시 중단된다.
  5. 결과로 나온 `imageResult`를 리턴하면서 함수가 종료된다.

이전에 본 GCD 코드와 실행 순서가 같다. 콜백을 쓰지 않으므로 결과값을 직접 리턴할 수도 있으며, 복잡한 콜백 없이 동기 코드처럼 순서를 제어할 수 있다. 즉 Swift Concurrency에선 pyramid of doom 문제가 전혀 없다.

코루틴 모델은 thread explosion 문제도 완화할 수 있다. `await`는 스레드를 블록하는 것이 아니라 함수의 실행만 일시 중단(suspend)하기 때문이다. 따라서 다른 작업을 처리하기 위해 새로운 스레드를 계속 생성할 필요가 줄어든다. 이 동작 원리는 다음 포스트에서 조금 더 자세히 살펴보겠다.

### Actor 모델과 데이터 격리

GCD는 디스패치 큐로 애플리케이션의 비동기 작업들을 분류한다. 대표적으로 메인 큐가 있고, 글로벌 큐, 그리고 다양한 커스텀 큐들로 비동기 작업들이 나뉘어서 처리된다.

Swift Concurrency에서는 디스패치 큐가 아닌 액터로 애플리케이션의 태스크들을 분할할 수 있다. 액터는 데이터를 안전하게 사용하게 해주는 동시성 단위이다. 내부적으로는 순차적으로 작업을 실행하는 executor와, 이를 통해서만 접근할 수 있는 격리된 데이터 영역을 가진다. 이해를 위해 GCD의 serial queue와 비슷한 역할을 한다고 생각해도 무방하다.

애플리케이션은 여러 액터들로 태스크가 분할되고, 각 액터는 자신의 데이터를 외부로부터 격리하여 데이터 레이스와 같은 문제로부터 보호한다. 외부에서 이 격리된 데이터에 접근하기 위해서는 액터에 메시지를 보내야한다. 이 메시지를 통해서 해당 액터 내부의 메소드를 호출하여 데이터에 접근할 수 있다. 이러한 호출은 `await` 키워드로 작성하여 해당 태스크가 비동기적으로 실행되여 일시 중단될 수 있음을 보여준다.

```swift
actor Counter {
    private var value = 0
    func increment() {
        value += 1
    }
    func getValue() -> Int {
        return value
    }
}
```

위 코드는 아주 간단한 액터 예제이다. 앞서 공부한 내용을 바탕으로 이 코드를 분석해보자.

  - `actor`는 `class`, `struct`, `enum`과 같이 커스텀 타입으로 선언된다.
  - `value`는 액터에서 격리하는 데이터이다. 액터 외부에서 접근할 수 없다.
  - `increment()`와 `getValue()`는 이 `value`를 다루는 메소드다.

앞서, 액터 내부에 격리된 데이터(여기서는 `value`)에 접근하기 위해서는 액터에 메시지를 보내야 한다고 말했다. 이 메시지는 커스텀 타입 내부의 메소드를 호출하는 것과 같다. 즉 일반 클래스의 메소드의 호출하듯이, 액터의 메소드를 호출하는 것이 곧 액터에게 메시지를 보내는 것이다.

```swift
var counter = Counter()
await counter.increment()
```

여기서 주목해야할 점은 `counter.increment()`의 앞에 `await` keyword가 붙어있는 것이다. 분명히 `increment()` 메소드는 `async`로 선언되지 않았음에도 `await` 접근을 해야한다.

그 이유는 액터 내부에 있는 serial queue로 메시지를 보내기 때문이다. 즉, `counter.increment()`가 즉시 실행되지 않고, 나중에 스케줄될 수 있음을 명시적으로 표현하는 것이다.

## 정리

Swift Concurrency는 기존 GCD를 대체하기 위해 등장한 것이 아니라, 기존의 동시성 모델이 가지고 있던 한계를 언어 차원에서 개선하기 위해 도입된 모델이다.

기존의 동시성 모델은 다음과 같은 문제를 가지고 있었다.

- GCD의 콜백 기반 코드는 Pyramid of Doom을 만들기 쉽다.
- 스레드를 블록하는 작업이 많아지면 Thread Explosion이 발생할 수 있다.

이를 해결하기 위해 Swift Concurrency는 다음과 같은 기능을 제공한다.

- `async`/`await`를 통해 비동기 코드를 순차적인 코드처럼 작성할 수 있다.
- Actor를 통해 공유 데이터를 격리하여 데이터 레이스를 방지할 수 있다.

결국 Swift Concurrency는 기존 동시성 모델의 가독성과 안전성을 개선하기 위해 도입된 모델이라고 볼 수 있다.

* * *

## 레퍼런스

[Swift Concurrency Manifesto](<https://gist.github.com/lattner/31ed37682ef1576b16bca1432ea9f782#part-1-asyncawait-beautiful-asynchronous-apis>)

[The Swift Programming Language (6.2) Concurrency](<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency>)
