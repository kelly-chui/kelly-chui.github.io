---
title: "[Swift] Concurrency(동시성) - 3"
date: 2023-06-26
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Concurrency"]
weight: 31

draft: false
original: "https://junmusu.tistory.com/106"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

### Actors

태스크를 이용하여 프로그램을 분리된 동시성 조각으로 나눌 수 있다. 태스크는 서로 독립적이기 때문에 동시에 실행되어도 안전하다. 하지만 가끔씩 태스크들 사이에 정보를 공유해야 하는 경우가 있다. 액터는 동시성 코드 사이에 정보를 안전하게 공유하도록 해준다.

클래스처럼 액터는 레퍼런스 타입이다. 따라서 Classes Are Reference Types에서 값 타입과 레퍼런스 타입을 비교한 것이 액터에도 적용된다. 클래스와 다르게, 액터는 한번에 하나의 작업만 변경 가능한 상태(mutable state)에 접근하도록 허용하기 때문에, 여러 태스크가 액터의 한 인스턴스에 상호작용하는 것을 안전하게 해준다. 예를 들어 다음은 온도를 기록하는 액터이다.


```swift
actor TemperatureLogger {
    let label: String
    var measurements: [Int]
    private(set) var max: Int


    init(label: String, measurement: Int) {
        self.label = label
        self.measurements = [measurement]
        self.max = measurement
    }
}
```
 

actor 키워드를 통해 액터를 도입하고, 중괄호 사이에 정의를 작성한다. TemperatureLogger 액터는 액터 외부에서 접근할 수 있는 프로퍼티를 가지고 있으며, max 프로퍼티는 액터 내부에서만 최대 값을 업데이트 할 수 있도록 제한한다.

액터의 인스턴스를 스트럭처나 클래스에서 쓰던 것과 같은 이니셜라이저로 생성할 수 있다. 액터의 프로퍼티나 메소드에 접근할 때, await를 사용하여 잠재적으로 정지할 수 있는 지점을 지정해야 한다.


```swift
let logger = TemperatureLogger(label: "Outdoors", measurement: 25)
print(await logger.max)
// Prints "25"
```
 

이 예시에서, logger.max에 접근하는 것은 가능한 정지 포인트이다. 왜냐면 액터는 한 번에 하나의 태스크만 변경 가능한 상태에 접근할 수 있기 때문이다. 만약 다른 태스크의 코드가 logger와 이미 상호작용 하는 중 이라면, 코드는 프로퍼티에 접근 가능해 질 때 까지 대기하게 된다.

반대로, 액터 내부의 코드는 자신의 프로퍼티에 접근할 때 await를 사용하지 않는다. 예를 들면, 다음은 TemperatureLogger를 새 온도를 이용하여 업데이트 하는 메소드이다.


```swift
extension TemperatureLogger {
    func update(with measurement: Int) {
        measurements.append(measurement)
        if measurement > max {
            max = measurement
        }
    }
}
```
 

update(with:) 메소드는 이미 액터에서 실행되고 있기 때문에, max와 같은 프로퍼티에 접근하기 위해 await를 지정해주지 않는다. 또한 이 메소드는 왜 액터가 한 번에 하나의 태스크만 변경 가능한 상태에 접근할 수 있게 하는지 이유를 보여준다: 액터의 상태를 업데이트 하면 일시적으로 액터의 불변성이 깨진다. TemperatureLogger 액터는 온도 리스트와 최대 온도를 추적하고 새 측정값을 기록할 때, 최대 온도를 업데이트 한다. 새로운 측정 값을 추가하고 max 프로퍼티를 업데이트 하기전에 일시적으로 일관되지 않은 상태(= 불변성이 깨진 상태)가 된다. 여러 태스크가 하나의 인스턴스에 동시에 상호작용하는 것을 방지하면, 다음 순서대로 일어나는 문제를 방지할 수 있다.

  1. 코드가 update(with:) 메소드를 호출한다. 이 메소드는 measurements 배열을 우선 업데이트 한다.
  2. 코드가 max를 업데이트 하기 전에, 다른 곳의 코드가 max와 measurements 배열을 읽는다.
  3. 코드가 max를 업데이트하고 끝난다.



이 케이스에서, 다른 곳의 코드는 update(with:)호출의 중간 데이터가 일시적으로 유효하지 않을 때 끼어들었으므로, 정확하지 않은 데이터를 읽게 된다. 스위프트 액터를 사용하면, 한 시점에 하나의 태스크만 액터에 접근할 수 있고, 접근중인 코드는 await로 지정된 정지 지점에서만 인터럽트 될 수 있기 때문이다. update(with:)는 어떠한 정지 포인트도 있지 않으므로, 다른 코드가 업데이트 도중에 데이터에 접근할 수 없다.

클래스의 인스턴스처럼 액터 외부에서 이러한 프로퍼티에 접근하려고 시도하면, 컴파일 타임 에러가 발생한다.


```swift
print(logger.max)  // Error
```
 

await 없이 logger.max를 접근하는 것은 액터의 프로퍼티가 해당 액터의 고립된 로컬 상태의 일부이기 때문에 실패한다. 스위프트는 액터 내부의 코드만 액터의 로컬 상태에 접근할 수 있도록 보장한다. 이러한 보장을 _액터 분리(actor isolation)_ 라고 한다.

#### Sendable Types

태스크와 액터는 프로그램을 안전하게 동시에 실행할 수 있는 조각들로 나눈다. 태스크나 액터 인스턴스의 내부의 변수나 프로퍼티 같은 변경 가능한 상태를 포함하는 프로그램의 일부를 _동시성 도메인(concurrency domain)_ 이라고 한다. 특정 종류의 데이터는 변경 가능한 상태를 포함하지만, 동시 접근에 대한 보호를 할 수 없으므로, 동시성 도메인들 사이에서 공유될 수 없다.

동시성 도메인에서 다른 동시성 도메인으로 공유할 수 있는 타입을 _전송 가능한 타입(Sendable Type)_ 이라고 한다. 전송 가능한 타입은 액터 메소드를 호출할 때, 아규먼트로 넘어가거나 태스크의 결과로 리턴될 수 있다. 이 챕터의 앞부분의 에시들에서 전송 능력에 대해 말하지 않았는데, 그 예시들은 항상 동시성 도메인들 간에 공유에서 안전한 간단한 값 타입들을 사용했기 때문이다. 반대로 일부 타입들은 동시성 도메인들을 통해 전달하기 안전하지 않다. 예를 들어, 변경 가능한 프로퍼티를 포함하고, 그 프로퍼티에 대한 접근을 직렬화(serialize)하지 않은 클래스의 인스턴스를 다른 태스크에 전달했을 때, 예측하지 못하고 부정확한 결과를 만들어 낼 수 있다.

Sendable 프로토콜을 준수하게 하여, 타입이 전송 가능하도록 지정할 수 있다. Sendable 프로토콜은 아무 코드도 요구하지 않지만, 스위프트가 적용하는 의미론적 요구사항이 있따. 일반적으로 타입이 전송 가능하게 하려면 다음과 같은 세가지 방법이 있다:

  - 값 타입이고 변경 가능한 상태는 다른 전송 가능한 데이터로 이루어져 있는 경우 — 예) 저장 프로퍼티가 있는 스트럭처, 혹은 연관 값이 있는 열거형
  - 아무런 변경 가능한 상태가 없으면서, 변경 불가능한 상태는 다른 전송 가능한 데이터로 구성되어 있는 경우. — 예) read-only 프로퍼티들로만 이루어진 스트럭처나 클래스
  - 변경 가능한 상태의 안정성을 보장하는 코드가 있는 타입 — 예) @MainActor로 지정된 클래스 혹은 특정 쓰레드나 큐에서 프로퍼티에 대한 접근이 직렬화되어 있는 클래스



전송 가능한 프로퍼티만 가진 스트럭처나 전송 가능한 연관 값만 있는 열거형과 같은 일부 타입들은 항상 전송 가능하다.


```swift
struct TemperatureReading: Sendable {
    var measurement: Int
}


extension TemperatureLogger {
    func addReading(from reading: TemperatureReading) {
        measurements.append(reading.measurement)
    }
}


let logger = TemperatureLogger(label: "Tea kettle", measurement: 85)
let reading = TemperatureReading(measurement: 45)
await logger.addReading(from: reading)
```
 

TemperaureReading이 전송 가능한 프로퍼티만 가진 스트럭처이고 스트럭처가 public이나 @usableFromInline으로 지정되어 있지 않기 때문에 암시적으로 전송 가능하다. 다음으 암시적으로 Sendable 프로토콜을 준수하는 버전의 스트럭처이다.


```swift
struct TemperatureReading {
    var measurement: Int
}
```
 

타입을 전송 불가능하다고 명시적으로 표현하려면, extention을 사용하여, Sendable 프로토콜에 대한 암시적 준수를 오버라이드한다.


```swift
struct FileDescriptor {
    let rawValue: CInt
}


@available(*, unavailable)
extension FileDescriptor: Sendable { }
```
 

위의 코드는 POSIX 파일 데스크립터를 래핑한 코드의 일부를 보여준다. 파일 디스크립터는 정수를 사용하여 파일을 식별하고 상호작용하지만 정수가 전송 가능한 값이더라도, 파일 데스크립터는 동시성 도메인을 통해 전송하는 것이 안전하지 않다.

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
