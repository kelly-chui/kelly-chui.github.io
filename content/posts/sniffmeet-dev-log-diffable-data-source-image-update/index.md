---
title: "SniffMEET. Diffable Data Source에서 이미지가 갱신되지 않은 이유"
date: 2025-01-20

categories:
  - Project
series:
  - SniffMEET
tags:
  - Diffable Data Source
  - Hashable
  - iOS
  - UIKit

draft: false
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 9/Diffable DataSource 적용하기 6a506eb4772c4dd48b445257691bd10c.md"
---

## 들어가며

SniffMeet의 메이트 리스트 화면은 `UITableViewDataSource`를 직접 구현해서 셀을 구성하고 있었다. 이후 테이블 뷰와 컬렉션 뷰에서 Diffable DataSource를 사용해보기로 했고, 먼저 메이트 리스트 화면에 적용해보려고 했다.

처음에는 어렵지 않을 거라고 생각했다. 섹션과 아이템 타입을 만들고, snapshot을 적용하면 기존 `reloadData()`보다 깔끔하게 업데이트할 수 있을 것 같았다. 하지만 실제로는 이미지 갱신이 제대로 동작하지 않았다. 더 정확히는 프로필 이미지 데이터는 받아오는데, Diffable DataSource가 셀을 다시 구성할 때는 이미지가 계속 `nil`로 남아 있었다.

결국 이 작업은 성공적으로 마무리하지 못했다. 그래도 실패한 이유를 다시 정리해보니, 문제는 Diffable DataSource API 자체가 아니라 item의 identity와 표시 상태를 제대로 구분하지 못한 데 있었다.

## 기존 구조

기존에는 `UITableViewDataSource`를 채택해서 직접 셀을 구성했다.

```swift
extension MateListViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        presenter?.output.mates.value.count ?? 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(
            withIdentifier: Identifier.mateCellID,
            for: indexPath
        )
        // ...
        return cell
    }
}
```

프로필 이미지는 메이트 목록을 먼저 불러온 뒤, 별도 요청으로 받아왔다. 이미지 데이터가 도착하면 뷰 컨트롤러가 가지고 있던 이미지 캐시에 저장하고, 현재 화면에 보이는 셀이 있으면 바로 이미지를 반영했다.

```swift
private var mateCellDictionary: [UUID: UITableViewCell] = [:]
private var imageDataSource: [UUID: Data] = [:]
```

```swift
presenter?.output.profileImageData
    .receive(on: RunLoop.main)
    .sink { [weak self] (mateID, imageData) in
        self?.imageDataSource[mateID] = imageData

        guard let cell = self?.mateCellDictionary[mateID],
              let imageData,
              let profileImage = UIImage(data: imageData) else { return }

        cell.configure(image: profileImage)
    }
```

이 구조가 이상적이라고 보기는 어렵다. 셀은 재사용되기 때문에 셀 참조를 딕셔너리에 저장하는 방식은 조심해야 한다. 그래도 기존 구조에서는 이미지 상태의 원본이 `imageDataSource`라는 점은 비교적 분명했다.

## Diffable DataSource로 옮기기

Diffable DataSource를 적용하기 위해 먼저 section과 item identifier를 만들었다.

```swift
enum MateListSection: Hashable {
    case mateList
}

struct MateListItem: Hashable {
    let mateInfo: Mate
    var thumbnailImageData: Data?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(mateInfo.userID)
    }
    
    static func == (lhs: MateListItem, rhs: MateListItem) -> Bool {
        return lhs.mateInfo.userID == rhs.mateInfo.userID
    }
}
```

`MateListItem`의 identity는 `mateInfo.userID`로 잡았다. 같은 메이트인지 판단하는 기준은 프로필 이미지가 아니라 유저 ID라고 생각했기 때문이다.

셀 구성도 Diffable DataSource의 cell provider 안으로 옮겼다.

```swift
dataSource = UITableViewDiffableDataSource<MateListSection, MateListItem>(
    tableView: tableView
) { [weak self] tableView, indexPath, item in
    let cell = tableView.dequeueReusableCell(
        withIdentifier: Identifier.mateCellID,
        for: indexPath
    )

    var content = cell.defaultContentConfiguration()
    content.image = .app

    if let thumbnailImageData = item.thumbnailImageData {
        content.image = UIImage(data: thumbnailImageData)
    } else {
        self?.presenter?.didTableViewCellLoad(
            mateID: item.mateInfo.userID,
            imageName: item.mateInfo.profileImageURLString
        )
    }

    content.text = item.mateInfo.name
    cell.contentConfiguration = content
    return cell
}
```

여기까지는 크게 어색해 보이지 않았다. 문제는 이미지를 비동기로 받아온 뒤 snapshot에 반영하는 부분에서 생겼다.

## 실패한 업데이트 로직

프로필 이미지 데이터가 도착하면 현재 snapshot에서 해당 메이트의 item을 찾고, `thumbnailImageData`를 넣은 뒤 `reconfigureItems`를 호출했다.

```swift
presenter?.output.profileImageData
    .receive(on: RunLoop.main)
    .sink { [weak self] (mateID, imageData) in
        guard self?.imageLoadState[mateID] != true,
              var snapshot = self?.dataSource.snapshot(),
              var itemToEdit = snapshot.itemIdentifiers.first(
                where: { $0.mateInfo.userID == mateID }
              ),
              let imageData else {
            return
        }

        self?.imageLoadState[mateID] = true
        itemToEdit.thumbnailImageData = imageData
        snapshot.reconfigureItems([itemToEdit])
        self?.dataSource.apply(snapshot, animatingDifferences: true)
    }
```

의도는 단순했다. 기존 item에 이미지 데이터를 채우고, 해당 item의 셀만 다시 구성하고 싶었다.

하지만 실제로는 이미지가 반영되지 않았다. Combine으로 이미지 데이터를 정상적으로 받았지만, cell provider에서 `item.thumbnailImageData`를 확인하면 계속 `nil`이었다.

## 처음 세운 가설들

### Hashable이 문제일까?

처음에는 `MateListItem`의 `Hashable` 구현이 문제라고 생각했다.

Diffable DataSource는 snapshot 간 차이를 비교해서 UI를 갱신한다. 그런데 `MateListItem`은 `userID`만 비교하고 있었기 때문에, 이미지 데이터가 바뀌어도 변화를 감지하지 못하는 것 아닌가 싶었다.

그래서 `==` 비교에 이미지 값도 포함해보았다. 하지만 이 방향은 맞지 않았다. 오히려 업데이트 과정에서 런타임 에러가 발생했다.

돌아보면 당연한 일이었다. `userID`는 item의 identity지만, `thumbnailImageData`는 identity가 아니라 content다. 같은 메이트의 이미지가 나중에 도착했다고 해서 그 메이트가 다른 item이 되는 것은 아니다.

### 레이스 컨디션일까?

다음으로는 Diffable DataSource의 snapshot apply와 이미지 다운로드 사이의 타이밍 문제를 의심했다.

이미지 요청은 비동기로 수행되고, 셀 구성도 테이블 뷰의 시점에 따라 다시 호출된다. 그래서 이미지가 도착하기 전에 셀이 먼저 구성되고, 이후 다시 갱신되지 않는 문제가 아닐까 생각했다.

```swift
private var imageLoadState: [UUID: Bool] = [:]
```

이미지 로드 상태를 딕셔너리로 관리해 중복 요청을 막아보기도 했다. 이 방법으로 무한 로딩처럼 보이던 현상은 줄었지만, 이미지가 셀에 반영되지 않는 문제는 해결되지 않았다.

이 시점에서 레이스 컨디션이 핵심 원인은 아니었다고 보는 편이 더 맞다. 비동기 작업이 얽혀 있기는 했지만, 진짜 문제는 이미지 데이터가 도착한 뒤 그 상태를 Diffable DataSource가 믿는 데이터 원본에 제대로 반영하지 못한 데 있었다.

## 실제로 놓친 부분

문제의 핵심은 `MateListItem` 안에서 identity와 content를 동시에 해결하려고 했다는 점이었다.

```swift
struct MateListItem: Hashable {
    let mateInfo: Mate
    var thumbnailImageData: Data?
}
```

`userID`는 `MateListItem`의 identity로 적절했다. 하지만 `thumbnailImageData`는 identity가 아니라 표시 상태였다.

그런데 나는 snapshot에서 item을 꺼내 `thumbnailImageData`를 수정하면, snapshot 안의 item도 바뀐다고 생각했다.

```swift
var itemToEdit = snapshot.itemIdentifiers.first {
    $0.mateInfo.userID == mateID
}

itemToEdit.thumbnailImageData = imageData
snapshot.reconfigureItems([itemToEdit])
```

이 코드는 snapshot 안의 item을 안정적으로 교체한다고 보기 어렵다. `itemToEdit`는 snapshot에서 꺼낸 값 타입 복사본이고, `reconfigureItems`는 해당 item을 다시 구성하라고 표시하는 API에 가깝다. snapshot이 들고 있는 데이터 원본을 새로운 item으로 갈아끼우는 코드가 아니다.

그래서 cell provider가 다시 호출되더라도, 그 provider가 받는 item에는 여전히 `thumbnailImageData`가 없을 수 있다.

결국 실패한 이유를 한 줄로 정리하면 이렇다.

{{< callout type="note" title="참고" >}}
`userID`는 identity였고, `thumbnailImageData`는 content였다. 나는 content를 바꿨다고 생각했지만, snapshot이 믿는 데이터 원본을 제대로 바꾸지 못했다.
{{< /callout >}}

## 어떻게 접근했어야 했을까?

지금 다시 설계한다면 두 가지 중 하나를 선택했을 것 같다.

첫 번째는 snapshot의 item을 실제로 교체하는 방식이다. 이미지가 도착했을 때 기존 item을 삭제하고, 이미지 데이터가 들어간 새 item을 같은 위치에 다시 넣는 식으로 snapshot의 데이터 자체를 바꿔야 한다.

두 번째는 이미지 데이터를 item의 identity와 분리해서 외부 상태로 관리하는 방식이다. 예를 들어 `[UUID: Data]` 형태의 이미지 캐시를 따로 두고, cell provider에서는 item의 `userID`로 캐시를 조회해서 이미지를 구성할 수 있다. 이 경우 `reconfigureItems`는 userID에 해당하는 셀을 다시 그리는 역할만 맡는다.

둘 중 어느 쪽이든 중요한 점은 같다. Diffable DataSource에서 item의 `Hashable`은 같은 item인지 판단하는 기준이고, 비동기로 바뀌는 표시 상태를 어디에 둘지는 별도로 결정해야 한다.

## 정리

이 작업은 완전히 성공하지 못했다. 처음에는 Diffable DataSource를 `reloadData()`를 더 편하게 대체하는 API 정도로 생각했지만, 실제로는 snapshot이 어떤 데이터를 원본으로 삼는지, item의 identity를 무엇으로 볼지 먼저 정해야 했다.

쉬운 API처럼 보였는데, 어려운 부분은 API 호출이 아니었다. 무엇을 같은 아이템으로 볼 것인지, 그리고 변하는 표시 상태를 어디에 둘 것인지 정하는 일이었다.

이번 실패 덕분에 Diffable DataSource를 사용할 때는 item의 identity와 content를 분리해서 생각해야 한다는 점을 배웠다. 특히 비동기로 이미지처럼 나중에 채워지는 데이터가 있다면, 그 데이터를 snapshot item 안에 둘지 외부 캐시에 둘지 먼저 정해야 한다.
