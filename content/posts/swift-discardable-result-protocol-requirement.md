---
title: "Swift. 프로토콜 요구사항과 메소드 어트리뷰트"
date: 2025-02-10

categories:
  - Swift
series: []
tags:
  - "@discardableResult"
  - Method Dispatch
  - Protocol

draft: false
---

`RemoteDBRequestBuildable` 프로토콜을 추가한 뒤, 이전에는 나타나지 않던 unused-result 경고가 발생했다.

![프로토콜을 통한 호출에서 발생한 unused-result 경고](/images/swift-discardable-result-protocol-requirement/image-001.png)

## 구체 타입에서는 사라졌던 경고

기존 구현의 `request()`에는 `@discardableResult`가 붙어 있었다. 반환값을 사용하지 않아도 경고가 발생하지 않았다.

```swift
final class SupabaseDBRequestBuilder {
    @discardableResult
    func request() async throws -> Data {
        Data()
    }
}

let concrete = SupabaseDBRequestBuilder()
try await concrete.request()
```

이후 Builder를 프로토콜로 추상화했지만 프로토콜 요구사항에는 해당 어트리뷰트를 붙이지 않았다.

```swift
protocol RemoteDBRequestBuildable {
    func request() async throws -> Data
}

extension SupabaseDBRequestBuilder: RemoteDBRequestBuildable {}

let abstract: any RemoteDBRequestBuildable = SupabaseDBRequestBuilder()
try await abstract.request()
```

구체 구현에는 여전히 `@discardableResult`가 있는데도, 프로토콜 타입으로 호출하면 경고가 다시 나타났다.

## 호출을 검사하는 선언과 실행할 구현

컴파일러는 호출 지점의 정적 타입을 기준으로 사용할 메서드 선언을 해석한다.

- `concrete.request()`에서는 `SupabaseDBRequestBuilder.request()` 선언이 보인다.
- `abstract.request()`에서는 `RemoteDBRequestBuildable.request()` 요구사항이 보인다.

프로토콜을 통한 호출은 개념적으로 witness table에서 구체 구현을 찾아 실행한다. 하지만 반환값을 사용했는지에 대한 경고는 런타임 디스패치 과정이 아니라 컴파일 시점에 결정된다. 따라서 구체 구현에 붙은 어트리뷰트를 다시 찾아 호출부에 적용하지 않는다.

`@discardableResult`는 함수 구현의 동작을 바꾸는 것이 아니라, 함수 선언에 붙어 호출부의 컴파일러 진단에 영향을 주는 어트리뷰트다. 프로토콜을 API로 사용한다면 이 의도도 프로토콜 요구사항에 표현해야 한다.

```swift
protocol RemoteDBRequestBuildable {
    @discardableResult
    func request() async throws -> Data
}
```

프로토콜 타입에서는 프로토콜 요구사항이 호출부에 보이는 API 계약이고, 구체 타입은 실제로 실행할 구현을 제공한다. 이번 경고는 두 역할의 차이를 드러낸 사례였다.

## 참고

- [Swift Reference Manual: Attributes](https://docs.swift.org/swift-book/ReferenceManual/Attributes.html)
