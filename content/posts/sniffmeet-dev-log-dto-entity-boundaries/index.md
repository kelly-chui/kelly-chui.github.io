---
title: "SniffMEET. DTO와 Entity의 경계 점검하기"
date: 2025-01-11

categories:
  - Project
series:
  - SniffMEET
tags:
  - DTO
  - Entity
  - Mapper
  - Swift

draft: false
original: "notion-export/블로그 이관/SniffMEET/엔티티 정리 179ade8f37658064afc1f1e030b4d919.md"
---

## 들어가며

SniffMeet에 기능이 붙으면서 DTO와 Entity가 빠르게 늘어났다. 처음에는 필요한 타입을 그때그때 만들면 됐지만, 어느 순간부터 어떤 타입이 어느 레이어에서 쓰이는지 헷갈리기 시작했다.

특히 `UserInfoDTO`, `UserInfo`, `DogInfo`, `Mate`처럼 비슷한 정보를 담는 타입들이 여러 곳에서 서로 다른 이름으로 사용되고 있었다. 그래서 바로 코드를 고치기보다, 먼저 현재 타입들이 어디에서 쓰이고 있는지 정리해보기로 했다.

## 먼저 한 일: 사용처 조사

가장 먼저 DTO, Entity, Supabase 관련 Request/Response 타입을 나눠서 사용처를 훑어봤다.

전체 목록을 보면 타입 수가 많은 것도 문제였지만, 더 큰 문제는 몇몇 타입의 사용처가 너무 넓다는 점이었다.

대표적으로 `UserInfoDTO`는 유저 정보 업로드, 업데이트, 조회, `Mate` 변환, `UserInfo` 변환에 모두 사용되고 있었다. `DogProfileDTO`는 MPC 통신과 메이트 요청 뷰 구성에 함께 쓰였고, `MateListRequestDTO`나 `MateListDTO`처럼 아주 단순한 요청용 타입도 따로 존재했다.

Entity 쪽에서는 `Mate`, `DogInfo`, `UserInfo`가 서로 비슷한 정보를 나눠 들고 있었다. `Mate`는 메이트 리스트와 산책 요청 화면에서 사용되고, `DogInfo`는 프로필 입력 흐름에서 사용되고, `UserInfo`는 홈 화면, 프로필 생성/수정, MPC, 산책 요청/응답 화면까지 넓게 쓰이고 있었다.

Supabase 관련 타입도 비슷했다. `SupabaseSession`, `SupabaseUser`, `SupabaseSessionResponse`, `SupabaseUserResponse`가 따로 있었고, 그중 `SupabaseUser`는 사실상 userID 하나만 담는 얇은 타입이었다. `SupabaseRefreshTokenResponse`, `SupabaseTokenRequest`처럼 만들어졌지만 실제 흐름에서는 거의 쓰이지 않는 타입도 남아 있었다.

## 발견한 문제

### `UserInfoDTO`가 너무 많은 역할을 하고 있었다

`UserInfoDTO`는 원격에서 유저 정보를 받아올 때도 쓰이고, 유저 정보를 업로드할 때도 쓰이고, `Mate`와 `UserInfo`를 만드는 데도 쓰이고 있었다.

DTO 자체가 잘못된 것은 아니지만, 사용처가 넓어지면서 "서버 응답 타입"인지 "업로드 요청 타입"인지 "도메인 Entity를 만들기 위한 중간 타입"인지 경계가 흐려졌다.

### `DogInfo`, `UserInfo`, `Mate`의 경계가 흐렸다

`DogInfo`는 프로필 입력 과정에서 사용되고, `UserInfo`는 홈 화면과 저장 로직에서 사용되고, `Mate`는 메이트 리스트에서 사용된다.

하지만 실제로 담고 있는 정보는 상당히 겹쳤다. 특히 `UserDefaultsKey.dogInfo`로 `UserInfo`를 불러오는 코드처럼 이름과 실제 타입이 어긋난 부분도 있었다.

```swift
func execute() throws -> UserInfo {
    var userInfo = try dataLoadable.loadData(
        forKey: Environment.UserDefaultsKey.dogInfo,
        type: UserInfo.self
    )
    userInfo.profileImage = try imageManageable.image(
        forKey: Environment.FileManagerKey.profileImage
    )
    return userInfo
}
```

이런 코드는 당장 동작은 하지만, 나중에 읽었을 때 "dogInfo를 불러오는데 왜 UserInfo가 나오지?"라는 혼란을 만든다.

### 너무 얇은 타입이 생기고 있었다

`SupabaseUser`는 내부 프로퍼티가 사실상 `userID` 하나뿐이었다. `SupabaseSession`이 이미 세션 정보를 표현하는 타입이라면, 굳이 `SupabaseUser`를 따로 둘 필요가 있는지 의문이 들었다.

세션에서 필요한 값이 userID뿐이라면, `SupabaseSession`이 직접 `userID`를 들고 있는 편이 더 단순할 수 있다.

### 사용하지 않는 Request/Response 타입이 남아 있었다

`SupabaseRefreshTokenResponse`는 세션 갱신 정보를 받아오기 위해 만들었지만, 실제로는 `SupabaseSessionResponse`로 대체할 수 있었다.

`SupabaseTokenRequest`도 세션 갱신 요청용으로 만들었지만, 당시 refresh 요청은 문자열 JSON body로 직접 구성하고 있었다. 타입을 만들어두었지만 실제 요청 경로에서는 쓰이지 않는 상태였다.

## 정리 방향

### Mapper로 변환 책임 분리

가장 먼저 떠올린 방향은 DTO에서 Entity로 변환하는 책임을 Mapper로 분리하는 것이었다.

예를 들어 `UserInfoDTO`는 원격 데이터 형태에 가깝고, `Mate`와 `UserInfo`는 앱 내부에서 화면과 기능을 구성하는 데 쓰이는 타입이다. 그렇다면 변환 책임을 명시적으로 분리하는 편이 낫다.

```swift
final class UserInfoMapper {
    func toUserInfo(from dto: UserInfoDTO) -> UserInfo {
        UserInfo(
            name: dto.dogName,
            age: dto.age,
            sex: dto.sex,
            sexUponIntake: dto.sexUponIntake,
            size: dto.size,
            keywords: dto.keywords,
            nickname: dto.nickname,
            profileImage: nil
        )
    }

    func toMate(from dto: UserInfoDTO) -> Mate {
        Mate(
            name: dto.dogName,
            userID: dto.id,
            keywords: dto.keywords,
            profileImageURLString: dto.profileImageURL
        )
    }
}
```

이렇게 하면 `UserInfoDTO`가 여러 Entity로 변환되는 흐름은 유지하되, 변환 로직이 흩어지는 것을 줄일 수 있다.

### Supabase 타입 줄이기

`SupabaseSessionResponse`와 `SupabaseUserResponse`를 그대로 앱 내부 Entity처럼 끌고 오기보다, 앱에서 실제로 필요한 `SupabaseSession`으로 변환하는 흐름이 더 낫다고 봤다.

특히 `SupabaseUser`처럼 userID 하나만 담는 타입은 제거하고, 세션이 직접 userID를 들도록 단순화할 수 있다.

```swift
final class SupabaseSessionMapper {
    func toSession(from response: SupabaseSessionResponse) -> SupabaseSession {
        SupabaseSession(
            accessToken: response.accessToken,
            expiresAt: response.expiresAt,
            refreshToken: response.refreshToken,
            userID: response.user.userID
        )
    }
}
```

### 단순 요청 DTO를 모두 타입으로 만들 필요는 없다

`MateListRequestDTO`처럼 내부가 아주 단순한 요청도 있었다.

```swift
struct MateListRequestDTO: Encodable {
    let userId: UUID

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
    }
}
```

요청 body가 단순한 key-value 형태라면, 매번 별도 타입을 만드는 것이 오히려 과할 수 있다.

```swift
let mateListRequestDTO = [Constants.userIDKey: userID]
```

다만 이 부분은 조심해야 한다. 딕셔너리를 쓰면 타입 수는 줄지만, key 오타를 컴파일 타임에 잡기 어려워진다. 그래서 단순하다는 이유만으로 무조건 딕셔너리를 쓰기보다, 반복 사용 여부와 요청 구조의 안정성을 기준으로 결정해야 한다.

## 정리

이번 작업은 코드를 바로 고치는 리팩토링이라기보다, 리팩토링 전에 타입의 책임과 사용처를 확인하는 작업이었다.

정리하면서 가장 크게 느낀 점은 DTO와 Entity의 이름이 비슷하더라도 역할은 달라야 한다는 것이었다. DTO는 외부 데이터 형식에 가깝고, Entity는 앱 내부에서 기능을 설명하는 타입에 가까워야 한다.

기능을 붙이는 동안 생긴 타입을 그대로 두면, 나중에는 타입 이름만 보고도 어떤 레이어의 데이터인지 알기 어려워진다. 그래서 사용처를 먼저 조사하고, 변환 책임을 Mapper로 모으고, 너무 얇거나 사용하지 않는 타입을 줄이는 방향으로 정리하기로 했다.
