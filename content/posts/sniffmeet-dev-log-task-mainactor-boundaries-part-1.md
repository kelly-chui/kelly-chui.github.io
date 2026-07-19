---
title: "SniffMEET. 비동기 태스크와 액터 점검하기 (1)"
date: 2025-01-08

categories:
  - Project
series:
  - SniffMEET
tags:
  - Combine
  - MainActor
  - Swift
  - Swift Concurrency

draft: true
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 13/비동기 태스크 0950504942d74c1fba07907b5934bb68.md"
---

## 작업 내역

이번 작업에서는 `Task`, `async/await`, `@MainActor`가 섞여 있던 부분을 화면별로 점검했다.  

앱 시작 흐름부터 프로필 등록, 메이트 목록, 산책 응답까지 비동기 경계를 다시 살펴보고, 각 화면에서 책임이 어디에 있어야 하는지 정리했다.

### 앱 시작 플로우

`UIWindow`의 루트 뷰 컨트롤러를 결정하는 흐름은 `@MainActor`로 두고, 그 안에서 세션 복원이 끝나기를 기다렸다. `await`로 대기하는 동안에는 메인 액터를 점유하지 않는다.

`displayInitialScreen`이 `MainActor` 안에서 실행되는지 breakpoint로 확인했고, `displayOnBoardingView`는 그대로 `MainActor`에 남겨 두었다.

```swift
// AppRouter.swift

func displayInitialScreen() {
    Task { @MainActor in
        do {
            try await SupabaseAuthManager.shared.restoreSession()
            displayTabBar()
        } catch {
            displayOnBoardingView()
        }
    }
}
```

### 프로필 입력 및 등록

프로필 입력 부분은 전달만 하는 역할이라 비동기 처리가 필요하지 않았다.

프로필 등록 부분에서는 이미지 교체가 UI에 해당하므로 `@MainActor`로 보는 편이 자연스러웠다. `loadImage`는 클로저 기반이라 `async/await` 형태로 통일해도 좋겠다고 판단했다.

```swift
// ProfileCreateViewController.swift

if let itemProvider = itemProvider,
       itemProvider.canLoadObject(ofClass: UIImage.self) {
    itemProvider.loadObject(ofClass: UIImage.self) { image, error in
        guard let selectedImage = image as? UIImage else { return }
        Task { @MainActor [weak self] in
            // ...
            self?.profileImageView.image =  selectedImage
        }
    }
}
```

등록 흐름은 더 고민이 많이 필요한 부분이었다. 4개의 비동기 작업이 한 줄로 이어지면서 딜레이가 생겼고, 동시에 분리되어 동작하지는 않았다. 순서를 유지해야 해서 무작정 쪼개기도 어려웠다.

태스크를 조각내는 것도 가능해 보여서 태스크 그룹으로 나누는 방향도 떠올랐다. 다만 등록 후 다음 화면을 언제 보여줄지, 그리고 어느 흐름을 기준으로 `saveUserInfo`를 호출할지도 함께 정해야 했다. 최종적으로는 로컬 정보 저장, 이미지 업로드, 원격 정보 저장의 순서를 유지하는 방향으로 정리했다.

```swift
// ProfileCreateInteractor.swift

func signInWithProfileData(dogInfo: UserInfo, imageData: (png: Data?, jpg: Data?)) {
    Task {
        do {
            await SupabaseAuthManager.shared.signInAnonymously()
            // ...
            try saveUserInfoUseCase.execute(
                dog: UserInfo(
                    name: dogInfo.name,
                    age: dogInfo.age,
                    // ...
                )
            )
            // ...
            var fileName: String? = nil
            if let jpgData = imageData.jpg {
                fileName = try await saveProfileImageUseCase.execute(
                    imageData: jpgData
                )
            }
            guard let userID = SessionManager.shared.session?.user?.userID else {
                return
            }
            await saveUserInfoRemoteUseCase.execute(
                info: UserInfoDTO(
                    id: userID,
                    dogName: dogInfo.name,
                    age: dogInfo.age,
                    // ...
                )
            )
            // ...
            presenter?.didSaveUserInfo()
        } catch {
            presenter?.didFailToSaveUserInfo(error: error)
        }
    }
}
```
        
### 홈 화면

`loadInfo`와 `saveDeviceToken`은 유지했다. `profileCardView`에서 이미지를 로딩하는 부분은 현재 로컬에서 읽어오므로 별도 `Task`는 없었지만, 로컬에서 가져오는 경우에도 비동기 처리로 바꾸는 쪽이 더 나아 보였다.

```swift
// LoadUserInfoUseCase.swift

// 현재는 비동기 처리하지 않음. 
func execute() throws -> UserInfo {
    var userInfo = try dataLoadable.loadData(
        forKey: Environment.UserDefaultsKey.dogInfo,
        type: UserInfo.self
    )
    userInfo.profileImage = try imageManageable.image(forKey: Environment.FileManagerKey.profileImage)
    return userInfo
}
```
    
- Supabase 세션 매니저에서 `userID`를 바로 확인할 수 있도록 추가 수정해도 좋을 듯

```swift
guard let userID = SessionManager.shared.session?.user?.userID else { 
	return 
}
```

### 정보 수정

프로필(정보) 등록과 거의 동일한 방식으로 구현되어 있어서, 비슷한 방식으로 개선할 수 있다.

### 메이트 목록

`requestMateList`는 당시 `MainActor`를 사용하고 있었는데, `alert.show` 때문에 UI와 연동이 필요한 것 아닐까 생각했다.

확인 결과 네트워크 요청 자체에는 `MainActor`가 필요하지 않았고, `requestProfileImage`도 동일했다.

다만 `output.mate` 쪽에는 `reloadData`가 있고, `output.profileImage` 데이터는 `reloadRow`에서 사용하고 있어서 UI 반영은 메인 스레드에서 처리해야 했다. 여기서는 네트워크 요청과 UI 반영을 분리하는 방향이 맞아 보였다.
    
```swift
// MateListInteractor.swift

// View에서 이미 Main Thread로 전환하고 있기 때문에 @MainActor가 필요하지 않음
func requestMateList(userID: UUID) {
    Task { @MainActor in
        // ...
    }
}

func requestProfileImage(id: UUID, imageName: String?) {
    Task { @MainActor in
        // ...
    }
}
```
    
### 메이트 목록 - 이미지 fetch

테이블 뷰 각 셀이 로드될 때마다 요청이 발생해서 이미지 로드에 시간차가 생겼다. 이미지를 요청하는 역할을 따로 맡길 타입이 필요한지도 고민했다.

결론적으로는 셀을 일단 그린 뒤 필요한 이미지를 요청하고, 이미지 응답이 오면 셀 리로드가 일어나는 방식으로 정리했다. 이미 Combine이 있는 구조라서 더 자연스러웠다.

```swift
// MateListViewController.swift

func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    // ...
    if let imageData = imageDataSource[mate.userID] {
        // 셀 이미지가 로드된 경우
        var profileImage = UIImage(data: imageData)
        profileImage = profileImage?.clipToSquareWithBackgroundColor(
            with: ItemSize.profileImageSize.width
        )
        content.image = profileImage
    } else {
        // 아직 이미지가 없으면 요청만 보냄
        presenter?.didTableViewCellLoad(
            mateID: mate.userID,
            imageName: mate.profileImageURLString
        )
    }
    // ...
    return cell
}
```

### 쉬어가기

이번 점검을 통해 비동기 작업 전체를 `MainActor`에 두기보다 네트워크 요청과 UI 반영의 경계를 나누는 것이 중요하다는 점을 확인했다. 또한 여러 비동기 작업은 실행 순서와 완료 시점을 먼저 정한 뒤, 필요한 경우에만 별도의 태스크로 분리해야 했다.

여기까지가 1편이다. 남은 태스크 정리와 산책 요청/응답, 유스케이스 쪽 내용은 2편에서 이어서 정리했다.  
흐름이 길어져서 중간에서 나눴고, 비동기 경계의 나머지는 다음 글에서 계속 본다.
