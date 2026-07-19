---
title: "SniffMEET. 닉네임 검증 개선 고민"
date: 2025-02-13

categories:
    - Project
series:
    - SniffMEET
tags:
    - Swift
    - iOS
    - UIKit

draft: false
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 7/TextField 동작 개선하기 199f6d0576c280a88517dde53e1f6852.md"
---

## 작업 내역

닉네임 TextField의 검증 방식을 다시 정리했다. 현재는 `UITextFieldDelegate`로 길이 검증과 버튼 활성화를 처리하고 있었는데, 중복 체크까지 같은 흐름에 넣을 경우 네트워크 요청이 너무 자주 발생할 수 있어 보였다.

### 현재 구현

현재는 Delegate 기반으로 다음 두 가지를 처리하고 있었다.

```swift
extension ProfileCreateViewController: UITextFieldDelegate {
    func textFieldDidChangeSelection(_ textField: UITextField) {
        guard let textCount = textField.text?.count else { return }
        submitButton.isEnabled = (textCount > 1 && textCount < 9 )
    }
    func textField(
        _ textField: UITextField,
        shouldChangeCharactersIn range: NSRange,
        replacementString string: String
    ) -> Bool {
        guard let text = textField.text else { return false }
        let newLength = text.count + string.count - range.length
        let inputTextValid = newLength <= 15
        return inputTextValid
    }
}
```

길이 검증 자체는 단순했고, 현재 사용성도 나쁘지 않았다.  

문제는 중복 체크처럼 네트워크 요청이 들어가는 검증까지 같은 방식으로 처리하기에는 부담이 커진다는 점이었다.

## 검토한 방식

이 부분은 단순히 “가능한가”보다는 “어떤 시점에 검증하는 것이 자연스러운가”를 기준으로 나눠서 봤다.

### 입력이 들어올때마다 모두 검증하기

반응성이 가장 좋은데, 다만 중복 체크까지 함께 넣으면 입력할 때마다 네트워크 요청이 발생해서 비용이 커진다.

```swift
extension ProfileCreateViewController: UITextFieldDelegate {
    func textFieldDidChangeSelection(_ textField: UITextField) {
        guard let nickname = textField.text else { return }
        updateNicknameLengthState(nickname)
        if textField.markedTextRange == nil {
            checkNicknameIfNeeded(nickname)
        }
    }

    func textFieldDidEndEditing(_ textField: UITextField) {
        guard let nickname = textField.text else { return }
        checkNicknameIfNeeded(nickname)
    }
}
```

입력 시점과 편집 종료 시점을 모두 Delegate로만 처리할 수 있다.  
다만 이 방식은 네트워크 요청을 제어하기가 어렵기 때문에, 입력할 때마다 중복 체크를 돌리면 부담이 커진다.

### 길이는 입력마다, 중복 체크는 debounce나 throttle 사용하기

길이는 입력마다 검증하고, 중복 체크만 `debounce`나 `throttle`로 늦추는 방식도 생각했다.  

이 방식은 반응성과 네트워크 부담 사이의 균형은 괜찮지만, `Delegate`와 `Combine`을 함께 써야 해서 구조가 조금 복잡해진다.

```swift
extension ProfileCreateViewController: UITextFieldDelegate {
    func textFieldDidChangeSelection(_ textField: UITextField) {
        guard let nickname = textField.text else { return }
        updateNicknameLengthState(nickname)
        nicknameSubject.send(nickname)
    }
}

nicknameSubject
    .removeDuplicates()
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .sink { [weak self] nickname in
        self?.checkNicknameIfNeeded(nickname)
    }
    .store(in: &cancellables)
```

길이는 Delegate로 즉시 검증하고, 중복 체크는 `debounce`로 늦춰서 처리할 수 있다.  
입력 반응은 유지하면서도 네트워크 요청 수를 줄일 수 있어서, 둘 사이의 균형은 가장 무난한 편이다.

모든 검증을 `Combine`으로 처리하는 방법도 있었다. 이 경우에는 흐름은 깔끔해질 수 있지만, 현재 프로젝트에서 이미 사용 중인 `Delegate` 방식과 역할이 겹치면서 오히려 과해질 수 있다고 봤다.

```swift
nicknameTextField.publisher(for: .editingChanged)
    .map { $0.text ?? "" }
    .removeDuplicates()
    .map { nickname -> (String, Bool) in
        let isLengthValid = nickname.count > 1 && nickname.count < 9
        return (nickname, isLengthValid)
    }
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .flatMap { [nicknameService] nickname, isLengthValid in
        nicknameService.checkNicknamePublisher(nickname)
            .map { isDuplicated in (isLengthValid, isDuplicated) }
    }
    .sink { [weak self] isLengthValid, isDuplicated in
        self?.submitButton.isEnabled = isLengthValid && !isDuplicated
    }
    .store(in: &cancellables)
```

길이 검증과 중복 체크를 모두 Combine으로 처리하면 선언형으로 정리되긴 한다.  

### 텍스트 편집이 끝날을 때만 중복 체크 하기

텍스트 편집이 끝났을 때만 중복 체크를 하는 방식도 가능하다. 하지만 이 경우에는 반응성이 떨어지고, 사용자가 입력 결과를 즉시 확인하기는 어렵다.

```swift
extension ProfileCreateViewController: UITextFieldDelegate {
    func textFieldDidEndEditing(_ textField: UITextField) {
        guard let nickname = textField.text, !nickname.isEmpty else { return }
        checkNicknameIfNeeded(nickname)
    }
}
```

다시 생각해보면 이 방식도 꽤 괜찮았다.

입력 중에는 아무 요청도 보내지 않아서 부담이 적고, 편집이 끝났을 때만 중복 체크를 하니 구현도 단순하다. 

실시간 반응성은 조금 떨어지지만, 닉네임처럼 한 번 입력하고 확인하는 성격의 필드라면 오히려 더 자연스러울 수도 있다.

### Swift Concurrency 사용하기?

Swift Concurrency를 써서도 충분히 처리할 수 있다. Delegate의 callback을 `withCheckedContinuation`으로 연결하면, 콜백 기반 검증도 `async/await`처럼 기다릴 수 있다.

```swift
final class ProfileCreateViewController: UIViewController, UITextFieldDelegate {
    private var nicknameCheckContinuation: CheckedContinuation<Bool, Never>?
    func textFieldDidEndEditing(_ textField: UITextField) {
        guard let nickname = textField.text, !nickname.isEmpty else { return }
        Task { [weak self] in
            guard let self else { return }
            let isDuplicated = await self.checkNickname(nickname)
            self.updateNicknameDuplicationState(isDuplicated)
        }
    }

    func checkNickname(_ nickname: String) async -> Bool {
        await withCheckedContinuation { continuation in
            nicknameCheckContinuation = continuation
            nicknameService.checkNickname(nickname) { [weak self] isDuplicated in
                self?.nicknameCheckContinuation?.resume(returning: isDuplicated)
                self?.nicknameCheckContinuation = nil
            }
        }
    }
}
```

이 방식은 Delegate가 입력 이벤트를 받고, `async`가 실제 검증을 처리하는 형태다.  

Combine처럼 퍼블리셔를 여러 개 이어 붙이지 않아도 되고, 필요할 때만 비동기 작업을 걸 수 있어서 현재 코드베이스와도 잘 맞는다.

그런데 좀 별로였다. Delegate 패턴과 비교해서 사용성이 좋아지는 것도 아니고. 괜히 코드만 복잡해 지는 느낌을 받아서, 제외했다.

### 현재 판단

일단은 기존 Delegate 방식으로 유지하기로 했다. 현재 구현만으로도 닉네임 길이 검증과 버튼 활성화는 충분히 처리되고 있었고, 실제 사용성에도 큰 문제는 없었다.

즉, 이 시점에서는 구조를 더 복잡하게 바꾸기보다, 현재 방식으로 유지하는 편이 더 적절하다고 판단했다.

## 결론

이번에는 닉네임 입력 검증을 바로 바꾸기보다는, 현재 구조를 유지하면서 어떤 선택지가 있는지 먼저 정리했다.  

문제 상황은 분명했지만, 중복 체크가 아직 본격적으로 들어오지 않은 상황에서는 Delegate 기반 구현으로도 충분했다.

지금은 Delegate로 유지하고 있다. 다만 나중에 중복 체크가 추가되거나 입력 반응을 더 세밀하게 다뤄야 하는 시점이 오면, 그때는 Swift Concurrency나 Combine 기반으로 다시 옮기는 것을 검토할 수 있다.

팀 내부에서 이 부분을 논의해서, 그때는 길이 검증과 중복 체크를 어떻게 분리할지부터 다시 보는 것이 좋겠다.
