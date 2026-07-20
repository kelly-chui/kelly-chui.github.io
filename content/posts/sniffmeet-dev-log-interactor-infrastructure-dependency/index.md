---
title: "SniffMEET. Interactor가 인프라를 직접 알아도 될까"
date: 2025-02-10

categories:
  - Project
series:
  - SniffMEET
tags:
  - Dependency Injection
  - Layered Architecture
  - VIPER

draft: false
---

## Interactor에서 직접 매니저 호출하지 않기

매니저가 변하면 인터랙터를 직접 변경해야한다. 매니저와 인터랙터 간의 의존성을 줄이고, 인터랙터는 “비즈니스 로직”만, 그리고 비즈니스 로직의 구현체인 유즈케이스에서 네트워크 요청이나 데이터 관리와 같은 인프라 로직을 담당하는 것이 좋다고 생각한다.

또한 싱글톤 객체여도 현재 주입하는 방식으로 사용중인데, 인터랙터에서 사용하면 직접 매니저의 싱글톤 객체를 호출해서 사용해야 한다:

```swift
func sendWalkRequest(message: String, latitude: Double, longtitude: Double, location: String) {
    Task {
        do {
            let myInfo = try loadUserInfoUseCase.execute()
            let id = try SessionManager.shared.userID.get()
            ...
            try await requestWalkUseCase.execute(walkNoti: walkNoti)
        } catch {
           ...
        }
    }
    presenter?.didSendWalkRequest()
}
```

위 코드에서 `id`를 얻기 위해 SessionManager의 싱글톤 객체를 호출해야 한다. 싱글톤 객체 호출 자체는 크게 문제가 되지 않을 수 있지만, 다음과 같이 생각해볼 주제가 있다.

위 코드의 전체 버전을 보면:

```swift
func sendWalkRequest(message: String, latitude: Double, longtitude: Double, location: String) {
    Task {
        do {
            let myInfo = try loadUserInfoUseCase.execute()
            let id = try SessionManager.shared.userID.get()
            let walkNoti = WalkNotiDTO(
                id: UUID(),
                createdAt: Date().convertDateToISO8601String(),
                message: message,
                latitude: latitude,
                longtitude: longtitude,
                senderId: id,
                receiverId: mate.userID,
                senderName: myInfo.name,
                category: .walkRequest
            )
            try await requestWalkUseCase.execute(walkNoti: walkNoti)
        } catch {
            // TODO: 이 부분은 Mapper를 통해 정리할 수 있을 것 같습니다.
            SNMLogger.error("RequestWalkInteractor: \(error.localizedDescription)")
        }
    }
    presenter?.didSendWalkRequest()
}
```

인터랙터에서 직접 엔티티를 생성해서 유즈케이스에 전달하는 형태로 코드가 동작한다. 엔티티를 생성하는 것 자체를 팩토리로 감싼 다음 또 다른 유즈케이스로 감싸서 호출하는 방식으로 고치는 것이 아니라. 엔티티 생성과 같은 작업도 해당 엔티티가 필요한 유즈케이스에서 동작하는 것이 좋다고 생각한다.

특히 유저 ID와 같은 정보를 SessionManager에서 가져오는 작업을 프로젝트 특성상 많이 하게 되는데, 이 작업을 유즈 케이스 내부에서 처리하는 것을 제안한다.

또한 위 코드와 같은 상황에서는 DTO → 엔티티 상황이 아니라 엔티티 → DTO 상황이기 때문에, 기존에 서로 호환되는 엔티티가 존재하지 않는 상황(사용하고 있지 않는 상황)이라면, 굳이 엔티티를 생성한 다음 이를 DTO로 변환하는 것이 아닌 처음부터 DTO로 만드는 것도 제안하고 싶다. 

이런 상황을 정리하기 위해 Mapper 클래스의 도입도 필요할 것 같다고 생각한다.

## 정리

- 인터랙터 말고 유즈케이스 내부에서 id 불러오기, 엔티티 생성과 같은 작업들을 모두 처리하자
- Mapper 클래스가 도입되면 좋을 것 같다. 엔티티 ↔ DTO 변환을 더 깔끔하고 재사용성 좋게 처리할 수 있을것으로 기대된다.
