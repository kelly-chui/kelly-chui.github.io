---
title: "SniffMEET. 비동기 태스크와 액터 점검하기 (2)"
date: 2025-01-08

categories:
    - Project
series:
    - SniffMEET
tags:
    - Swift
    - iOS
    - Swift Concurrency
    - Combine

draft: true
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 13/비동기 태스크 0950504942d74c1fba07907b5934bb68.md"
---

## 작업 내역

### 메이트 요청

`didTabAcceptButton`과 `saveMateInfo`를 따라가 보니 유스케이스 실행을 위해 `Task`가 존재했고, Combine 내부에도 `Task`가 들어가 있었다. Interactor에서 태스크를 묶으면 저장 완료를 알리는 메서드가 따로 필요해 보였다.

최종적으로는 Presenter에서 태스크가 묶이도록 수정했고, `View`에서는 `Task`를 제거했다.

```swift
acceptButton.publisher(event: .touchUpInside)
    .sink { [weak self] in
        Task {
            await self?.presenter?.didTapAcceptButton(id: self?.profile.id ?? DogProfileDTO.example.id)
            self?.presenter?.closeTheView()
        }
    }
    .store(in: &cancellables)
    
// RequestMatePresenter
func closeTheView() {
    if let view {
        router?.dismissView(view: view)
    }
}
func didTapAcceptButton(id: UUID) async {
    SNMLogger.info("id: \(id)")
    await interactor?.saveMateInfo(id: id)
}
```

### 산책 요청 및 응답

#### `RespondWalkPresenter`

산책 요청은 `Task`로 Interactor에 존재했고, 위치 변환은 Presenter에서 `await`로 처리했다.

Interactor에서는 불필요하게 `Task`로 한 번 더 감싸지 말고, 함수 자체를 `async` 흐름으로 직접 이어가도록 수정이 필요했다. 즉, 호출하는 쪽에서 `await`로 처리하고, 메서드 내부에서는 `Task`를 새로 만들지 않는 방향이다. - `convertLactaionToText`

```swift
func convertLocationToText(latitude: Double, longtitude: Double) async {
    Task {
        let locationText: String? = await convertLocationToTextUseCase.execute(
            latitude: latitude, longtitude: longtitude
        )
        presenter?.didConvertLocationToText(with: locationText)
    }
}
```

`didFetchUserInfo`에서는 `walkRequest` 생성 부분을 밖으로 옮겨도 가능했다. `didFetch~`는 메인이 아닌 곳에서 실행되지만, `showRequestDetail`은 UI 작업이라 메인에서 돌아가야 해서 `@MainActor`를 붙였다. 

다만 이 경계가 조금 복잡해서, 나중에 더 정리할 필요가 있어 보였다.

```swift
func didFetchUserInfo(senderInfo: UserInfoDTO) {
    Task { @MainActor [weak self] in
        guard let self else { return }
        let walkRequest = WalkRequestDetail(
            // ...
        )
        self.view?.showRequestDetail(request: walkRequest)
    }
}
```

#### `RespondWalkInteractor`

순서가 중요했기 때문에 유지했다. `respondWalkRequest`의 경우 `walkNoti`까지는 밖으로 분리할 수 있었다.

```swift
func respondWalkRequest(isAccepted: Bool, receivedNoti: WalkNoti) {
    let walkNotiCategory: WalkNotiCategory = isAccepted ? .walkAccepted : .walkDeclined
    Task {
        do {
            guard let date = receivedNoti.createdAt?.convertDateToISO8601String(),
                  let userID = SessionManager.shared.session?.user?.userID else { 
                return 
            }
            let userInfo = try loadUserUseCase.execute()
            let walkNoti = WalkNotiDTO(
                // ...
            )
            // 여기까지 분리
            try await respondWalkRequestUseCase.execute(requestID: receivedNoti.id, walkNoti: walkNoti)
        }
        catch {
            presenter?.didFailToSendWalkRequest(error: error)
        }
    }
    presenter?.didSendWalkRespond()
}
```

Router는 유지했다. 이후 다른 함수의 `Task` 부분도 수정이 필요했고, Interactor에서는 태스크를 분리하는 쪽이 맞아 보였다.

```swift
func convertLocationToText(latitude: Double, longtitude: Double) async {
    Task {
        let locationText: String? = await convertLocationToTextUseCase.execute(
            latitude: latitude,
            longtitude: longtitude
        )
        presenter?.didConvertLocationToText(with: locationText)
    }
}
func fetchProfileImage(urlString: String) {
    Task { [weak self] in
        let imageData = try await self?.requestProfileImageUseCase.execute(fileName: urlString)
        self?.presenter?.didFetchProfileImage(with: imageData)
    }
}
```

### 산책 요청

전체적인 구조는 유지했다.

`textViewDidBeginEditing`에서는 산책을 보내는 화면에서 텍스트뷰를 누르면 키보드가 올라오는데, 그때 스크롤 위치를 맞추기 위해 딜레이를 주는 용도로 `Task.sleep`를 사용했다. 

비동기 처리보다는 `sleep`을 위한 `Task`에 가까웠고, 실제로 `sleep`이 메인 액터에서 도는지도 breakpoint로 확인했다. 

결과적으로 `sleep` 자체는 메인 액터가 아니었지만, `scrollRectToVisible`이 `UIScroll` 계열이라 UI 쪽으로 이어졌다.

```swift
func textViewDidBeginEditing(_ textView: UITextView) {
    Task { [weak self] in
        try? await Task.sleep(nanoseconds: 10_000_000) // 50ms (0.05초)
        self?.scrollView.scrollRectToVisible(textView.frame, animated: true)
    }
    // ...
}
```

`submitButton` 바인딩은 이벤트 자체가 메인이라고 볼 수 있으니 `debounce`에 `RunLoop.main`을 사용했다.

```swift
submitButton.publisher(event: .touchUpInside)
    .debounce(for: .seconds(EventConstant.debounceInterval), scheduler: RunLoop.main)
    .sink { [weak self] _ in
        // ...
    }
    .store(in: &cancellables)
```

Presenter는 따로 없고, Interactor에서는 `requestProfileImage`를 메인 액터에서 빼고 `async`로 바꾸는 쪽이 맞아 보였다.

`Task`는 Presenter 쪽으로 옮기는 방향이 더 깔끔했다.

```swift
func requestProfileImage(imageName: String?) {
    Task { @MainActor in
        let fileName = mate.profileImageURLString ?? ""
        let imageData = try await requestProfileImageUseCase.execute(fileName: fileName)
        presenter?.didFetchProfileImage(imageData: imageData)
    }
}
```

### 산책 장소 선택 뷰

`View`와 Presenter는 전체적으로 동일한 개선 사항만 있었다.

### 산책 답변에 대한 뷰

Presenter의 `didFetchUserInfo`는 `@MainActor`를 유지했다. Interactor는 유지하되, `convertLocationToText`에는 `async`가 빠져 있어서 응답 쪽과 동일하게 개선이 필요했다.

### Supabase

전체적으로 `do-catch`를 확인할 필요가 있었다. 다행히 확인 결과 큰 문제는 없었다.

### 로컬 네트워크

`MPCManager`에서는 `MainActor` 제거 테스트가 필요했고, `receive` 부분에서도 동일하게 `MainActor`를 제거해 보는 테스트가 필요했다. 이 경우에는 바인딩 쪽에 `RunLoop`를 추가해야 했다.

```swift
if let tokenData = receivedData.token {
    Task { @MainActor in
        receivedTokenPublisher.send(tokenData)
    }
} else if let profile = receivedData.profile {
    Task { @MainActor in
        receivedDataPublisher.send(profile)
    }
} else if let message = receivedData.transitionMessage {
    Task { @MainActor in
        receivedViewTransitionPublisher.send(message)
    }
}
```

`NIManager`는 `RunLoop.main`으로 받아야 하는지, 거리 방향 조건만 만족하면 되는 경우라면 `MainActor`가 꼭 필요한지도 다시 봐야 했다.

### 캐시

`FileManager` 부분에서 동일한 주소에 동시에 접근하는 상황을 막기 위해 처리가 필요해 보였다. 액터를 사용하면 개선할 수 있을 것 같다.

### 유스케이스

#### CreateAccount

순차적으로 진행되는 부분이 `do-catch`로 많이 흩어져 있었다. `TaskGroup`으로 나누면 개선할 수 있을 것 같았다.

```swift
// CreateAccountUseCase.swift

struct CreateAccountUseCaseImpl: CreateAccountUseCase {
    func execute(info: UserInfoDTO) async {
        let encoder = JSONEncoder()
        do {
            let userData = try encoder.encode(info)
            try await SupabaseDatabaseManager.shared.insertData(
                into: Environment.SupabaseTableName.userInfo,
                with: userData
            )
        } catch {
            SNMLogger.error("\(error.localizedDescription)")
        }
        do {
            let mateListData = try encoder.encode(MateListInsertDTO(id: info.id))
            try await SupabaseDatabaseManager.shared.insertData(
                into: Environment.SupabaseTableName.matelist,
                with: mateListData
            )
        } catch {
            SNMLogger.error("mate list insert error: \(error.localizedDescription)")
        }
        do {
            let notiListData = try encoder.encode(WalkNotiListInsertDTO(id: info.id))
            try await SupabaseDatabaseManager.shared.insertData(
                into: Environment.SupabaseTableName.notificationList,
                with: notiListData
            )
        } catch {
            SNMLogger.error("notifiaction list insert error: \(error.localizedDescription)")
        }
    }
}
```

#### `RespondWalkRequestUseCase`

`Task`를 지우는 방향으로 정리했다. 이미 `execute`가 `async throws`인데 테이블 업데이트만 따로 분리하면 흐름이 끊기기 때문이다. 

`try await`로 직접 처리하면 요청과 업데이트 순서가 명확해지고, 에러도 같은 흐름 안에서 다룰 수 있다.

```swift
func execute(requestID: UUID, walkNoti: WalkNotiDTO) async throws {
    guard let requestData = try? encoder.encode(walkNoti) else { return }
    let request = try PushNotificationRequest.sendWalkRespond(data: requestData).urlRequest()
    let _ = try await session.data(for: request)

    // MARK: - walk-request 테이블 업데이트
    var tableData: WalkRequestUpdateDTO?
    switch walkNoti.category {
    case .walkAccepted:
        tableData = WalkRequestUpdateDTO(state: .accepted)
    case .walkDeclined:
        tableData = WalkRequestUpdateDTO(state: .declined)
    default:
        break
    }
    guard let tableData else { return }
    let data = try JSONEncoder().encode(tableData)
    Task {
        try await remoteDatabaseManager.updateData(
            into: Environment.SupabaseTableName.walkRequest,
            at: requestID,
            with: data
        )
    }
}
```

### 동일하게 개선 필요

태스크를 어디에서 묶을지 정해야 했다. Presenter에서 조건 분기가 일어나도록 두고, `throw` 처리와 함께 정리하는 방향이 자연스러워 보였다.

`Router`를 `MainActor`로 지정할지도 추후 결정이 필요했다. 그렇게 하면 전체적으로 `await`를 더 많이 맞춰야 해서 수정 범위가 커진다.

바인딩에서 `RunLoop.main`이 꼭 필요한 부분과 아닌 부분도 다시 나눠 봐야 했다. `MainActor`를 쓰는 것과 같은 의미인지도 함께 확인이 필요했고, 꼭 UI 작업이 아닐 수도 있었다.

1편에서 화면별 비동기 경계를 점검했다면, 2편에서는 실제로 남아 있던 태스크 묶음과 유스케이스 정리까지 이어서 살펴봤다.  
두 글을 함께 보면, SniffMeet의 비동기 흐름을 어디에서 끊고 어디에서 이어 붙였는지 한 번에 볼 수 있다.
