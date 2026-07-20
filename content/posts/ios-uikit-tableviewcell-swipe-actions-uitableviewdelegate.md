---
title: "UIKit. TableViewCell 스와이프 동작 넣기"
date: 2024-09-20

categories:
  - iOS
series:
  - UIKit
tags:
  - UITableView

draft: false
original: "notion-export/블로그 이관/UIKit/TableViewCell 스와이프 동작(UITableViewDelegate) ff1ade8f376583c4bc4081992b3a303e.md"
---

## 기본 메소드들

```swift
// 오른쪽에서 왼쪽으로 스와이프
tableView(_:trailingSwipeActionsConfigurationForRowAt:)

// 왼쪽에서 오른쪽으로 스와이프
tableView(_:leadingSwipeActionsConfigurationForRowAt:)
```

## 구현 순서

### 1. `UIContextualAction`을 사용해서 액션 구현
    
```swift
let deleteAction = UIContextualAction(style: .destructive, title: "삭제") { (action, view, completionHandler) in
    // 삭제 로직
    completionHandler(true)
}
```
    
### 2. `UISwipeActionsConfiguration`에 액션 등록
    
```swift
// 액션 여러개 등록 가능
let configuration = UISwipeActionsConfiguration(actions: [deleteAction])
```
    
### 3. 전체 코드
    
```swift
func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let deleteAction = UIContextualAction(style: .destructive, title: "삭제") { (action, view, completionHandler) in
            // 삭제 로직
            completionHandler(true)
        }
    
    let configuration = UISwipeActionsConfiguration(actions: [deleteAction])
    configuration.performsFirstActionWithFullSwipe = false
    
    return configuration
}
```

### 기타

색깔, 이미지 지정 가능

```swift
deleteAction.backgroundColor = .systemRed
deleteAction.image = UIImage(systemName: "trash")
```

`performsFirstActionWithFullSwipe`

- `true`: 스와이프 하면 첫 번째 액션이 즉시 실행
- `false`: 스와이프 된 상태에서 나타는 버튼을 눌러서 액션 실행

### 실제 적용 코드 (이슈 트래킹 앱)

```swift
func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
    let deleteAction = makeDeleteAction()
    let closeAction = makeCloseAction()
    
    let configuration = UISwipeActionsConfiguration(actions: [deleteAction, closeAction])
    configuration.performsFirstActionWithFullSwipe = false
    
    return configuration
}

private func makeDeleteAction() -> UIContextualAction  {
    let deleteAction = UIContextualAction(style: .destructive, title: nil) { (action, view, completionHandler) in
        // TODO: 얼럿 띄우고 삭제 로직
        completionHandler(true)
    }
    deleteAction.image = UIImage(systemName: "trash")
    return deleteAction
}

private func makeCloseAction() -> UIContextualAction  {
    let closeAction = UIContextualAction(style: .normal, title: nil) { (action, view, completionHandler) in
        // TODO: 이슈 닫기 로직
        completionHandler(true)
    }
    closeAction.image = UIImage(systemName: "archivebox.fill")
    closeAction.backgroundColor = .systemIndigo
    return closeAction
}
```
