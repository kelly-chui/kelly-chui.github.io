---
title: "SniffMEET. 세션 저장 메소드를 공개해도 괜찮을까?"
date: 2025-02-10

categories: ["SniffMEET"]
series: []
tags: []

draft: true
original: "notion-export/블로그 이관/SniffMEET/SessionManager와 AuthManager 역할 분리하기 f37ade8f376583d99abf817d3597c14d.md"
---

## 세션 저장하기

`AuthManager`와 `SessionManager`의 역할을 분리하고 나니, 세션을 받아오는 쪽과 저장하는 쪽이 서로 달라지는 문제가 발생했다.

(AuthManager가 세션도 관리하던)기존 구조에서는 `saveSession(for:)`가 외부에 노출되어 있지 않았는데, 역할이 옮겨진 뒤에는 AuthManager에서 받아온 세션을 SessionManager로 전달해야 했다.

### 고민한 점

`saveSession(for:)`는 사실상 `AuthManager`가 세션을 받아온 상황에서만 필요한 메소드다.

그런데 이 메소드를 공개하면 캡슐화가 약해진다는 생각을 했고, 다시 AuthManager로 돌리면 SessionManager가 맡아야 할 책임을 되돌리는 것이 되었다.

따라서 몇 가지 방법을 떠올려 봤다.

- (최종 선택) `saveSession(for:)`를 공개한다
- `saveSession(for:)`를 `AuthManager`로 다시 옮긴다
- 같은 로직을 `AuthManager`와 `SessionManager`에 각각 작성한다
- 세션이 갱신됐다는 이벤트를 따로 전달할 수 있는 통신 레이어를 만든다

처음에 가장 괜찮아 보였던 건 세션 갱신 이벤트를 따로 전달하는 방식이었다.

Notification Center처럼 전역적으로 퍼지는 구조보다는, Supabase 내부에서만 사용할 수 있는 작은 이벤트 버스를 두면 어떨까 싶었다.

아래는 이벤트 버스를 상상하며 작성한 PoC 코드다:

```swift
// 세션 이벤트 버스
final class SessionEventBus {
    private var sessionHandler: ((SupabaseSession) -> Void)?
    func subscribe(to handler: @escaping (SupabaseSession) -> Void) {
        self.sessionHandler = handler
    }
    func publish(session: SupabaseSession) {
        sessionHandler?(session)
    }
}

enum SupabaseConfig {
    static let sessionEventBus = SessionEventBus()
}

final class AuthManager {
    func signInAnonymously() async throws {
        // ...
        SupabaseConfig.sessionEventBus.publish(session: session)
    }
}

final class SessionManager {
    private init() {
        SupabaseConfig.sessionEventBus.subscribe { [weak self] session in
            do {
                try self?.saveSession(session)
            } catch {
                throw SupabaseSessionError.saveSessionFailed
            }
        }
    }
}
```

### 그런데, 그 메소드 꼭 감춰야 하나?

이벤트 버스는 처음엔 꽤 그럴듯해 보였지만(뭔가 꽂혀있었다), 다시 생각해보니 너무 비효율적이고 조잡해 보였다.

위에서 말했듯이, `saveSession(for:)`는 내부에서 사용하는 것이 아닌, AuthManager에서 받아온 세션을 저장하기 위해 호출하는 API에 더 가까웠다.

그래서 최종적으로는 `saveSession(for:)`를 공개해 두고, `AuthManager`에서 받아온 세션을 `SessionManager`가 직접 저장하는 방식으로 정리했다.

결국 이벤트 버스는 PoC 코드로만 남겨 두고, 실제 적용은 하지 않았다.

### 개발 중 알게 된 점

`NotificationCenter` 객체는 독립적으로 만들 수 있다는 점을 확인했다.  
처음에는 `default`라는 이름 때문에 전역 객체에만 붙는 줄 알았는데, 직접 만들어 쓰는 것도 가능했다.

## 정리

- `saveSession(for:)`를 공개하는 방식은 세션 저장 API로 보면 충분히 자연스럽다.
- AuthManager로 되돌리면 역할 분리가 흐려진다.
- 이벤트 버스는 고민했지만, 실제 적용은 하지 않고 `saveSession(for:)` 공개하는 걸로 마무리 지었다.
