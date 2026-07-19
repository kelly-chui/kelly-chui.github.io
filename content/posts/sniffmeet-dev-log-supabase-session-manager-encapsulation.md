---
title: "SniffMEET. 세션 갱신과 정보 접근을 SessionManager에 캡슐화하기"
date: 2025-02-10

categories: ["SniffMEET"]
series: []
tags: []

draft: false
original: "notion-export/블로그 이관/SniffMEET/Supabase Session 구조 개선하기 302ade8f376582dc878d813cfb5f67ba.md"
---

## SessionManager 사용성 개선

### 세션을 갱신하는 방법

Supabase 서버와의 통신이 필요할 때, 우선 세션의 유효성을 검증해야 한다. 

기존 방식에선 직접 AuthManager의 싱글톤 객체에서 세션을 갱신하는 작업을 했지만

- AuthManager와 SessionManager의 역할 명확하게 분리
- AuthManager의 싱글톤 해제

와 같은 변화점이 있었고, 기존 AuthManager가 담당하던 세션 갱신, 복원 작업이 SessionManager로 옮겨졌다. SessionManager의 싱글톤 객체에서 세션의 유효성을 체크하는 컴퓨티드 프로퍼티의 부울리언 값을 체크하여 세션을 갱신하는 메소드를 호출하는 방식을 사용했다:

```swift
if try SessionManager.shared.isExpired {
    try await SessionManager.shared.refreshSession()
}
```

이 방식은 SessionManager의 싱글톤 객체 호출이 두 번 일어나고, `refreshSession`이라는 메소드를 직접 노출해서, SessionManager가 세션을 갱신하는 방법을 직접 노출하는 문제가 있다.

`refreshSession`메소드는 세션을 갱신하는 메소드이지만, 외부에서 직접적으로 세션을 갱신을 요청할 필요는 없다. 즉 외부에서 요청 전에 세션이 만료 되었는지 확인 후, 만료 되었으면 세션 갱신을 요청하는 것 보다는 요청 전에 세션을 유효하게 만드는 방식으로 처리하는 것이 더 캡슐화 원칙을 잘 지키면서, 자동으로 세션이 유지되도록 할 수 있다. 

`refreshSession()` 메소드를 `private`으로 처리함으로써, 세션 갱신 로직을 SessionManager 내부에서만 관리할 수 있도록 변경했다.

```swift
func checkSession() async throws {
    guard let session else { throw SupabaseSessionError.sessionNotExist }
    if Date(timeIntervalSince1970: TimeInterval(session.expiresAt + 30)) < Date() {
        try await refreshSession()
    }
}
```

따라서 개선된 방식에선 Supabase 요청 전에 다음과 같이 세션을 체크하면 자동으로 갱신이 된다:

```swift
try await sessionManager.checkSession()
```

### 세션 정보를 불러오는 방법

기존 방식에서는 `userID`나 `accessToken`과 같은 세션 정보를 불러올때, 직접 `SessionManager`의 싱글톤 객체에 접근한 다음 `session`에서 필요한 프로퍼티 값을 가져와서 옵셔널 바인딩을 하는 방식을 이용했다.

```swift
guard let accessToken = SessionManager.shared.session?.accessToken else {
    throw SupabaseSessionError.sessionNotExist
}
```

디미터 법칙의 관점에서 봤을 때, 이 방법은 체인 호출이 매우 깊어져 좋은 방법이 아니라고 생각했으며, 프로퍼티가 실제로 존재하지 않을 때(`nil`일 때) 에러를 직접 발생시켜야 하는 문제가 있었다.

그래서 세션에서 가장 많이 쓰는 정보인 `accessToken`과 `userID`를 직접 접근할 수 있도록 따로 분리했다:

```swift
protocol SessionManageable {
    var userID: Result<UUID, SupabaseSessionError> { get }
    var accessToken: Result<String, SupabaseSessionError> { get }
    ...
}
```

따로 꺼내서 접근할 수 있도록 한 `userID`와 `accessToken` 프로퍼티를 옵셔널 바인딩과 직접  없이 직접 사용할 수 있도록 `Result` 타입의 객체로 선언했다.

세션에서 정보를 호출할 때는 `get()` 메소드를 `try`와 함께 써서 호출할 수 있다.

```swift
let accessToken = try sessionManager.accessToken.get()
```

세션 정보를 필요로 하는 메소드 대부분이 `throws`메소드라 `try`를 사용하면 옵셔널 바인딩이 필요 없고, 직접 에러를 발생시키지 않고 세션 정보를 호출하여 사용할 수 있다.
