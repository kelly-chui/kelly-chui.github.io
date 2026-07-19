---
title: "SniffMEET. ISP로 Supabase 요청 빌더 역할 나누기"
date: 2025-02-06

categories:
  - SniffMEET
series: []
tags:
  - ISP
  - Networking
  - Request Builder
  - Supabase

draft: false
original: "notion-export/블로그 이관/SniffMEET/Supabase 쿼리 전달 구조 개선하기 b14ade8f3765820bb58901949d8bd67e.md"
---

## 들어가며

Supabase REST API를 직접 감싸서 사용하다 보니, 유즈케이스 레이어에서 `eq.`, `in.`, `gte.` 같은 쿼리 문자열을 직접 조립하는 코드가 늘어났다.

처음에는 단순했지만, 요청이 많아질수록 오타 가능성이 커지고 Supabase의 세부 문법이 상위 레이어로 새어 나오는 문제가 있었다. 이번 글은 이 쿼리 구성 책임을 Supabase DB Layer 안으로 옮기기 위해 요청 빌더와 쿼리 파라미터 래퍼를 도입한 과정을 정리한다.

## 기본 구조

SNMNetwork의 동작을 간단하게 설명하면, `SNMRequestConvertible`을 채택하는 객체의 정보로 네트워크 요청을 생성하고, 통신한 다음, 응답을 반환하는 방식으로 동작한다.

따라서 각 Supabase Manager는 (Auth, Session, DB, Storage 모두) `SNMRequestConvertible`을 채택한 `enum` 타입의 요청을 생성하고, `SNMNetworkProvider`에 넘겨주는 방식으로 구현되어 있다.

### 기존 Supabase가 통신하는 방법 (fetchData 예제)

![spdbfd.jpg](/images/sniffmeet-dev-log-supabase-request-interface-segregation/image-001.jpg)

이 구조 자체는 변하지 않지만, DBManager에서 DB 요청을 만드는 부분이 수정되었다.

#### 유즈케이스가 `fetchData(from:query:)` 호출

```swift
struct RequestMateInfoUsecaseImpl: RequestMateInfoUseCase {
    // ...
    func execute(mateId: UUID) async throws -> UserInfoDTO? {
        let mateInfoData = try await remoteDBManager.fetchData(
            from: "user_info",
            query: ["id": "eq.\(mateId.uuidString)"]
        )
        // ...
    }
}
```

#### `SupabaseDBManager`에서 `SupabaseDBRequest` 생성 및 초기화

```swift
extension SupabaseDBRequest: SNMRequestConvertible {
    var endpoint: Endpoint {
        switch self {
        case .fetchData(let table, _, let query):
            return Endpoint(
                baseURL: SupabaseConfig.baseURL,
                path: "rest/v1/\(table)",
                method: .get,
                query: query
            )
        // ...
        }
    }
    var requestType: SNMRequestType {
        switch self {
        case .fetchData(_, let accessToken, _):
            return .header(with: createAuthHeader(accessToken: accessToken))
        // ...
    }
}
```

#### 생성된 `SupabaseDBRequest`로 `SNMNetworkProvider`의 `request(with:)` 호출

```swift
func fetchData(from table: String, query: [String: String]) async throws -> Data {
    do {
        // ...
        let response = try await networkProvider.request(
            with: SupabaseDBRequest.fetchData(
                table: table,
                accessToken: session.accessToken,
                query: query
            )
        )
        return response.data
    } catch {
        throw SupabaseDBError.fetchDataFailed
    }
}
```

### 쿼리 문제

이 과정에서 쿼리는 `Dictionary<String, String>` 꼴로 유즈케이스에서 작성되어, `NetworkProvider`로 그대로 전달된다.

회의 과정에서 이런 방식으로 사용하면 `NetworkProvider`를 그대로 쓰는 거랑 크게 다를 바가 없다는 이야기가 나왔다. DBManager가 요청 생성을 감싸고 있기는 하지만, 실제 쿼리 구성 책임은 여전히 유즈케이스에 남아 있었기 때문이다.

이 방식의 문제는 크게 세 가지였다.

- 유즈케이스가 Supabase REST 쿼리 문법을 알아야 한다.
- `"eq.\(id)"`처럼 문자열 조합에 의존해서 오타를 컴파일 타임에 잡기 어렵다.
- DBManager가 Supabase 요청 생성을 충분히 추상화한다고 보기 어려워진다.

그래서 Supabase Layer에서 자체적으로 쿼리를 구성하는 방법을 도입하기로 했다.

## SDK에서는 어떻게 구성할까?

SDK에서는 `SupabaseClient`가 전체적인 Supabase 관련 동작을 관리하고, 메소드 체이닝을 통해 요청을 생성한다.

1. 클라이언트 객체
2. 쿼리 빌더(SQL DML 구성) 객체 호출
3. 필터 빌더(요청 쿼리 구성) 객체 호출
4. 트랜스폼 빌더(JOIN 등 수행)
5. `execute`로 통신 수행

`PostgrestQueryBuilder` (이외에도 빌더 클래스 더 있음):

```swift
public final class PostgrestQueryBuilder: PostgrestBuilder, @unchecked Sendable {
  // ...
  public func select(...) -> PostgrestFilterBuilder {
    // ...
    return PostgrestFilterBuilder(self)
  }
  public func insert(...) throws -> PostgrestFilterBuilder {
    // ...
    return PostgrestFilterBuilder(self)
  }
  public func update(...) throws -> PostgrestFilterBuilder {
    // ...
    return PostgrestFilterBuilder(self)
  }
  // ...
}
```

호출:

```swift
try await supabase // SupabaseClient
  .from("profiles") // PostgrestQueryBuilder
  .select() // PostgrestFilterBuilder
  .eq("id", value: currentUser.id) // PostgrestFilterBuilder
  .single() // PostgrestTransformBuilder
  .execute() // PostgrestResponse
  .value // PostgrestResponse
```

프로젝트에 SDK를 그대로 도입하려는 것은 아니지만, 요청을 단계적으로 구성하고 마지막에 실행하는 흐름은 참고할 만했다.

## 개선 사항

### 요청 빌더 도입

위에서 말한 것처럼 기존 구조에서는 쿼리를 구성하기 위해 직접 문자열로 모든 쿼리를 만들어서 딕셔너리로 전달해야 했다.

SDK의 빌더를 사용한 메소드 체이닝 컨셉을 일부 가져와서 다음 순서로 개선했다.

1. Config, AuthManager, SessionManager, DBManager, StorageManager 구조는 유지한다.
2. DBManager가 수행해야 할 작업을 세분화한다.
   - fetch (SQL: `SELECT`, HTTP: `GET`)
   - insert (SQL: `INSERT`, HTTP: `POST`)
   - update (SQL: `UPDATE`, HTTP: `PATCH`)
   - rpc (SQL: `-`, HTTP: `POST`)
3. 각 작업들이 필요로 하는 부분을 구분한다.
   - 공용: `path`, `method`, `accessToken`, `table`
     - 패스 지정(기본 경로 + API 경로 + 테이블 경로) -> 메소드 선택 -> 헤더에 토큰 추가
   - fetch: `query`
     - 기본 작업 -> 쿼리 추가(옵션)
   - insert: `body`
     - 기본 작업 -> 바디 추가
   - update: `body`, `query`
     - 기본 작업 -> 바디 추가 -> 쿼리 추가
   - rpc: `body`, `query`
     - 기본 작업 -> 바디 추가 -> 쿼리 추가
4. `SupabaseRequest`가 자동으로 구성해주는 부분은 빌더에서 제외한다.
   - 테이블을 제외한 패스 지정
   - 메소드 선택
   - 헤더 추가
5. 필요한 빌더 메소드와 각 빌더들이 어떻게 연결되어야 할지 결정했다.
   - 경로 구성하는 메소드
   - 바디 추가하는 메소드
   - 쿼리 추가하는 메소드
   - `SNMRequestConvertible`을 만드는 메소드 (`request`)
   - 마지막으로 통신을 수행하는 메소드

액세스 토큰은 요청을 실행하는 시점에 세션에서 가져와 주입하도록 했다. 빌더가 요청의 모양을 구성하고, Manager가 실제 인증 정보와 통신 실행을 담당하는 형태다.

### 빌더 구현 후 호출 변경사항

```swift
// 이전
try await remoteDBManager.updateData(
    in: Environment.SupabaseTableName.userInfo,
    at: id,
    with: userData
)

// 이후
try await remoteDBManager.updateData()
    .setTable(Environment.SupabaseTableName.userInfo)
    .setBody(userData)
    .setQuery(key: "id", value: "eq.\(id)")
    .request()
```

기존 `SupabaseDBManager`는 현재 프로젝트에 맞춰진 부분이 있었다. 예를 들어 `updateData`는 특정 row를 갱신하는 경우를 전제로 `id`를 직접 요구했다.

빌더를 도입하면서 `setTable`, `setBody`, `setQuery`를 조합해 요청을 만들 수 있게 되었고, DBManager의 메소드가 특정 유즈케이스에 덜 묶이게 되었다.

다만 이 단계에서도 쿼리는 아직 `String`으로 넘어가고 있었다. 특히 오퍼레이터를 사용할 때 `eq.`, `in.` 같은 값을 리터럴로 작성해야 했기 때문에, 자주 쓰는 쿼리 형식을 한 번 더 래핑할 필요가 있었다.

### 쿼리 파라미터 래핑하기

```swift
enum SupabaseQueryParameter {
    case equal(String, SupabaseQueryRepresentable)
    // ...
    case custom(String, SupabaseQueryRepresentable)
    
    var key: String { ... }
    
    var value: String {
        switch self {
        case .equal(_, let value):
            return "eq." + value.queryValue
        // ...
        case .custom(_, let value):
            return value.queryValue
        }
    }
}
```

`SupabaseQueryParameter` enum을 만들어서 쿼리 오퍼레이터를 쉽게 만들 수 있도록 했다.

`SupabaseQueryRepresentable`은 `Int`, `Bool`, `Double`, `UUID` 등 다양한 타입들을 `String`으로 변환해주는 역할을 한다.

이제 다음과 같이 쿼리를 구성할 수 있다.

```swift
// 이전
try await remoteDBManager.updateData()
    .setTable(Environment.SupabaseTableName.userInfo)
    .setBody(userData)
    .setQuery(key: "id", value: "eq.\(id)")
    .request()

// 이후
try await remoteDBManager.updateData()
    .setTable(Environment.SupabaseTableName.userInfo)
    .setBody(userData)
    .setQuery(.equal("id", id))
    .request()
```

이렇게 바꾸면 유즈케이스는 Supabase REST 쿼리 문자열을 직접 만들지 않아도 된다. 대신 `.equal("id", id)`처럼 의미가 드러나는 형태로 쿼리를 표현할 수 있다.

## 남은 고민

### 빌더 호출 순서를 어떻게 보장할까?

현재 구조에서는 `setTable`, `setBody`, `setQuery` 호출 여부를 컴파일 타임에 강제하지 못한다. 그래서 필수 값이 누락된 상태에서 `request()`가 호출될 경우 에러를 던지도록 처리했다.

타입으로 상태를 나누는 방식도 가능하다. 예를 들어 `TableSet`, `BodySet` 같은 상태 타입을 나누고, 필수 값이 채워진 경우에만 `request()`를 노출하면 잘못된 호출 순서를 컴파일 타임에 막을 수 있다.

다만 현재 프로젝트 규모에서는 구현 복잡도에 비해 이점이 크지 않다고 판단했다. 우선은 런타임 에러로 필수 값 누락을 처리하고, 빌더 사용처가 더 많아지면 타입 기반 상태 관리를 다시 고려해볼 수 있을 것 같다.

### SQL 기준과 HTTP 기준 중 무엇이 더 자연스러울까?

fetch(select), insert, update 등 SQL 기반의 메소드보다 HTTP 메소드를 기준으로 만드는 것이 더 나을 수도 있다.

`fetchData`와 `rpc`는 SQL 관점에서는 다른 작업이지만, HTTP 요청 구조만 보면 비슷한 부분이 많았다. SQL의 의미를 기준으로 나누면 도메인 의도는 잘 드러나지만, 실제 요청 구성 코드에서는 중복이 생길 수 있다.

반대로 HTTP 메소드를 기준으로 나누면 구현은 단순해질 수 있지만, 호출하는 쪽에서 작업의 의미가 덜 드러날 수 있다. 이 부분은 DBManager가 어디까지 Supabase의 의미를 감싸야 하는지와 함께 더 고민해볼 문제다.

## 정리

이번 개선으로 유즈케이스는 Supabase REST 쿼리 문자열을 직접 조립하지 않아도 되었다. DBManager는 단순히 `NetworkProvider`에 요청을 넘기는 역할에서 한 단계 더 나아가, Supabase 요청을 구성하는 책임을 갖게 되었다.

아직 빌더의 호출 순서를 타입 레벨에서 강제하지 못한다는 한계는 있지만, 반복되는 문자열 쿼리를 줄이고 쿼리 오퍼레이터를 명시적으로 표현할 수 있게 된 점에서 충분한 개선이었다.

## 부록: conform과 adopt

### 프로토콜 conform(준수)과 adopt(도입)의 차이

- conform은 특정 타입이 프로토콜의 모든 요구사항을 준수하도록 구현했다는 의미
- adopt는 특정 타입에 프로토콜을 도입, 채택하겠다는 의미

즉, 타입이 프로토콜을 adopt 하려면 conform 해야 한다.
