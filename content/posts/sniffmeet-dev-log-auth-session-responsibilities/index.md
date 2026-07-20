---
title: "SniffMEET. AuthManager와 SessionManager의 책임 분리하기"
date: 2025-02-10

categories:
  - SniffMEET
series: []
tags:
  - Authentication
  - Session
  - Singleton
  - Swift

draft: false
original: "notion-export/블로그 이관/SniffMEET/SessionManager와 AuthManager 역할 분리하기 f37ade8f376583d99abf817d3597c14d.md"
---

## 작업 배경

AuthManager와 SessionManager는 서로 매우 밀접하게 연관된 작업을 한다. AuthManager는 사용자의 계정 인증을 담당하고 세션을 받아오며, SessionManager는 그 세션을 관리한다.

하지만 기존 코드에서는 세션 관리를 포함한 대부분의 작업을 `AuthManager`가 처리하고, `SessionManager`는 세션을 소유하는 역할만 하고 있었다.

### 역할 분리

기존에는 `AuthManager`에서 세션 갱신, 복원, 저장, 로드 작업을 처리하고 있었고, `SessionManager`는 세션의 만료 여부 확인과 세션 객체를 소유하는 역할만 맡고 있었다.

```swift
// AuthManager 인터페이스 프로토콜
protocol AuthManager {
    static var shared: AuthManager { get }
    var authStateSubject: PassthroughSubject<AuthState, Never> { get set }
    func signInAnonymously() async throws
    func restoreSession() async throws
    func refreshSession() async throws
    func loadTokens() throws
}

// SessionManager 클래스
final class SessionManager {
    static let shared = SessionManager()
    var session: SupabaseSession?
    var isExpired: Bool {
        guard let session else { return true }
        // 세션 만료를 파악할 때는 30초의 여유시간을 줍니다.
        return Date(timeIntervalSince1970: TimeInterval(session.expiresAt + 30)) < Date()
    }
    private init() {}
}
```

그래서 세션 관리는 `SessionManager`, 인증은 `AuthManager`가 맡도록 기능을 다시 정의했다.

```swift
// AuthManager 인터페이스 프로토콜
protocol AuthManageable {
    func signInAnonymously() async throws
}

// SessionManager 인터페이스 프로토콜
protocol SessionManageable {
    var userID: Result<UUID, SupabaseSessionError> { get }
    var accessToken: Result<String, SupabaseSessionError> { get }
    func restoreSession() async throws
    func saveSession(for session: SupabaseSession?) throws
    func checkSession() async throws
}
```

기존 `AuthManager`가 담당하던 세션 복원, 갱신, 로드, 저장 역할을 `SessionManager`로 옮겼다.

### 싱글톤 판단

`AuthManager`는 세션을 받아오는 것 외에는 세션에 관여하지 않기 때문에, 더 이상 앱 전반적으로 상태가 공유될 필요가 없었다.

그래서 싱글톤을 해제하고, 유즈케이스를 만들어 `AuthManager`를 주입하는 방식으로 로그인하도록 리팩토링했다.

```swift
protocol SignInUseCase {
    func execute() async throws
}

struct SignInUseCaseImpl: SignInUseCase {
    private let authManager: any AuthManageable
    
    init(authManager: any AuthManageable) {
        self.authManager = authManager
    }
    
    // TODO: 파라미터에 따라서 로그인 방식을 구분할 수 있도록 확장 가능할 것 같아. 그때 싱글톤도 함께 정리하면 될 것 같다.
    func execute() async throws {
        try await authManager.signInAnonymously()
    }
}
```

반대로 `SessionManager`는 앱 전반적으로 세션의 상태를 공유할 필요가 있었다.

`SessionManager`의 싱글톤 구조를 해제하는 것보다 유지하는 쪽이 이점이 크다고 판단해서, 싱글톤 구조는 그대로 두었다.

## 정리

- `AuthManager`는 로그인만 담당하고, `SessionManager`는 세션 상태만 관리하도록 역할을 나눴다.
- `AuthManager`는 싱글톤을 해제하고 유즈케이스로 감싸 주입하는 방식으로 정리했다.
- `SessionManager`는 앱 전반에서 세션을 공유해야 하므로 싱글톤을 유지했다.

세션 저장 책임은 별도로 더 고민할 필요가 있어서, 그 부분은 다음 글로 나눠서 정리했다.
