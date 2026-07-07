---
title: "SwiftUI Tutorials. Handling User Input"
date: 2024-06-25
categories: ["iOS"]
series: ["SwiftUI"]
tags: ["SwiftUI"]
draft: false
original: "https://junmusu.tistory.com/189"
---

랜드마크 앱에서 사용자는 좋아하는 장소를 플래그하고, 그들이 좋아하는 장소만 필터해서 볼 수 있다. 이런 기능을 만들기 위해서, 리스트에 스위치를 추가하여 유저들이 그들이 좋아하는 장소에만 포커스를 맞출 수 있도록 해야한다. 그리고 별 모양 버튼을 추가하고, 탭하면 유저들이 랜드마크에 favorite 플래그를 할 수 있도록 한다.

## Section 1. Mark favorite landmarks

리스트를 개선해서 사람들이 한 눈에 favorite를 찾을 수 있도록 시작한다. `Landmark` 스트럭처에 프로퍼티를 하나 추가해서, 이 랜드마크가 favorite인지 초기 상태를 읽을 수 있도록 한다. 그리고 favorite 표시된 랜드마크에는 별 아이콘을 보여준다.

### Step 1, 2

`isFavorite` 프로퍼티를 `Landmark` 스트럭처에 추가한다.


```swift
struct Landmark: Hashable, Codable, Identifiable {
        ...
    var isFavorite: Bool
    ...
}
```
 

`landmarkData` 파일은 이러한 이름의 키를 각각의 `landmark`마다 가지고 있다. `Landmark`가 `Codable`을 컨펌하기 때문에, 해당 키와 동일한 이름을 가진 프로퍼티를 새로 생성함으로써 key와 연관된 값을 읽어올 수 있다.

### Step 3, 4

`LandmarkRow`에서 현재 랜드마크가 favorite인지 아닌지 판단하기 위해 `if` 구문 안에 별 이미지를 넣는다.


```swift
struct LandmarkRow: View {
    var landmark: Landmark
    var body: some View {
        HStack {
            ...
            Spacer()
            if landmark.isFavorite {
                Image(systemName: "star.fill")
            }
        }
    }
}
```
 

SwiftUI 블럭 내부에서, `if` 구문을 사용해서 뷰를 조건부로 포함시킬 수 있다.

### Step 5

시스템 이미지들은 벡터 기반이기 때문에, `foregroundSytle(_:)` modifier를 이용해 색상을 변경할 수 있다.


```swift
if landmark.isFavorite {
    Image(systemName: "star.fill")
        .foregroundColor(Color.yellow)
}
```
 

랜드마크의 `isFavorite` 프로퍼티가 true일 때, 별이 표시된다.

## Section 2. Filter the list view

리스트 뷰를 모든 랜드마크를 보여주거나, 유저의 favorite만 보여주도록 커스터마이즈 할 수 있다. 이를 위해 `LandmarkList` 타입에 state를 추가해야 한다.

State는 시간에 따라 변화할 수 있는 값 혹은 값들의 셋이다. 그리고 그 변화는 뷰의 동작, 컨텐트 혹은 레이아웃에 영향을 끼치게 된다. 프로퍼티에 `@State`를 사용해서 뷰에 state를 추가할 수 있다.

### Step 1, 2

`false`로 초기화 된 `@State` 프로퍼티 `showFavoritesOnly`를 `LandmarkList`에 추가한다.


```swift
struct LandmarkList: View {
    @State private var showFavoritesOnly = false
    var body: some View {
            ...
    }
}
```
 

state 프로퍼티를 해당 뷰와 그 서브뷰에서 쓰는 정보를 저장하기 때문에, state를 항상 `private` 로 선언한다.

### Step 3

프로퍼티를 더하거나 수정한 것과 같이 뷰의 구조에 변화를 주면, 캔버스는 자동으로 리프레시 된다.

![](/images/swiftui-tutorials-03-handling-user-input/image-001.png)

### Step 4, 5

`showFavoritesOnly` 프로퍼티와 각 `landmark.isFavorite` 값을 확인해서 필터된 랜드마크 리스트를 계산한다.

그리고 필터된 랜드마스크 리스트를 `List`에서 사용한다.


```swift
import SwiftUI

struct LandmarkList: View {
    @State private var showFavoritesOnly = false
    var filteredLandmarks: [Landmark] {
        landmarks.filter { landmark in
            !showFavoritesOnly || landmark.isFavorite
        }
    }
    var body: some View {
        NavigationSplitView {
            List(filteredLandmarks) { landmark in
                    ...
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 

### Step 6

`showFavoriteOnly` 의 초기 값을 `true`로 변경시키면서 리스트가 어떻게 반응하는지 확인한다.

![](/images/swiftui-tutorials-03-handling-user-input/image-002.png)

## Section 3. Add a control to toggle the state

사용자가 리스트의 필터를 컨트롤 할 수 있게 하려면, `showFavoriteOnly`의 값을 변화시킬 수 있는 컨트롤을 추가할 필요가 있다. 이는 바인딩을 토클 컨트롤에 전달해서 할 수 있다.

바인딩은 변화 가능한 상태의 참조처럼 동작한다. 유저가 토글을 off에서 on으로, 그리고 다시 off로 탭했을 때, 컨트롤은 바인딩을 통해 뷰의 상태를 그에 맞게 업데이트한다.

### Step 1

landmark를 row로 바꾸기 위해 중첩된 `ForEach` 그룹을 생성한다.


```swift
struct LandmarkList: View {
        ...
    var body: some View {
        NavigationSplitView {
            List {
                ForEach(filteredLandmarks) { landmark in
                    NavigationLink {
                        LandmarkDetail(landmark: landmark)
                    } label: {
                        LandmarkRow(landmark: landmark)
                    }
                }
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 

스태틱 뷰와 다이나믹 뷰를 조합하거나, 혹은 두 개 이상의 그룹의 다이나믹 뷰를 조합하려면, `List`에 데이터의 컬렉션을 전달하는 대신에 `ForEach` 타입을 사용한다.

💡 

주)

처음에 햇갈렸던게, `List`가 컬렉션을 받으면 클로저 내부에서 셀을 하나식 만들길래 `ForEach`를 넣으면 그냥 셀 하나에 `ForEach`에서 생성하는 모든 뷰가 다 들어있어야 하나? 싶었는데

다시 생각해보니 다른 이니셜라이저니까,,, 그냥 전달되는 클로저의 역할 자체가 다른 것 같다. 컬렉션 받는 경우에는 셀 하나씩 만들고, 그냥 `List { ... }` 꼴은 클로저 내부의 모든 뷰를 리스트로 묶어주는 방식인걸로 추측,,,

### Step 2

`List`의 뷰의 첫 번째 차일드 뷰로 `Toggle` 뷰를 추가하고, `showFavoritesOnly` 를 전달한다.


```swift
struct LandmarkList: View {
    ...
    var body: some View {
        NavigationSplitView {
            List {
                Toggle(isOn: $showFavoritesOnly) {
                    Text("Favorites only")
                }
                ...
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 

`$` 프리픽스는 상태 변수나, 그 상태 변수의 프로퍼티에 대한 바인딩에 접근할 때 사용한다.

### Step 3

`animation(_:)` modifier를 추가해서 `filteredLandmarks` 값이 변할 때 시작되는 필터링 애니메이션을 향상시킨다.


```swift
struct LandmarkList: View {
        ...
    var body: some View {
        NavigationSplitView {
            List {
                                ...
            }
            .animation(.default, value: filteredLandmarks)
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 

### Step 4, 5

`showsFavoritesOnly` 를 다시 `false` 로 바꾸고, 프리뷰를 이용해서 토글을 탭하여 새 기능을 시도해본다.

![](/images/swiftui-tutorials-03-handling-user-input/image-003.png)

## Section 4. Use observation for storage

사용자가 특정 랜드마크를 즐겨찾기로 설정할 수 있도록 하려면, 먼저 랜드마크 데이터를 `Observable()` 매크로를 사용해서 저장한다.

Observation을 사용하면, SwiftUI 뷰는 프로퍼티 래퍼나 바인딩 없이 데이터 변경을 처리할 수 있다. SwiftUI는 뷰에 영향을 줄 수 있는 observable 프로퍼티의 변경을 감지하고, 변경 이후에 알맞은 버전의 뷰를 표시한다.

### Step 1, 2

`ModelData` 파일에서 `Observable()` 매크로를 사용해서 새로운 모델 타입을 선언한다.


```swift
@Observable
class ModelData {
}
```
 

SwiftUI는 observable 프로퍼티가 변하고, 뷰의 body가 직접 읽고 있을 때만 뷰를 업데이트한다.

### Step 3

`landmarks` 배열을 모델 안으로 이동시킨다.


```swift
@Observable
class ModelData {
    var landmarks: [Landmark] = load("landmarkData.json")
}
```
 

## Section 5. Adopt the model object in your views

만든 `ModelData` 객체를 앱의 데이터 저장소로 사용하도록 뷰들을 업데이트 해야한다.

### Step 1

`LandmarkList` 에서 `@Environment` 프로퍼티 래퍼를 뷰에 추가한다. 그리고 `environment(_:)` modifier를 프리뷰에 추가한다.


```swift
struct LandmarkList: View {
    @Environment(ModelData.self) var modelData
    ...
}

#Preview {
    LandmarkList()
        .environment(ModelData())
}
```
 

`environment(_:)` modifier가 부모에 적용되어 있으면, `modelData` 프로퍼티는 자동으로 값을 받는다. `@Environment` 프로퍼티 래퍼는 현재 뷰에서 모델 데이터를 읽게 해준다. `environment(_:)` modifier를 추가하면, 데이터 객체가 environment을 통해서 하위 뷰로 전달된다.

### Step 2

`modelData.landmarks` 를 랜드마크를 필터링 하는 데이터로 사용한다.


```swift
struct LandmarkList: View {
    @Environment(ModelData.self) var modelData
    ...
    var filteredLandmarks: [Landmark] {
        modelData.landmarks.filter { landmark in
            !showFavoritesOnly || landmark.isFavorite
        }
    }
    ...
}
```
 

### Step 3, 4

`LandmarkDetail` 뷰를 environment에 있는 `ModelData` 객체와 동작하도록 업데이트 한다.


```swift
#Preview {
    LandmarkDetail(landmark: ModelData().landmarks[0])
}
```
 

`LandmarkRow` 프리뷰를 `ModelData` 객체와 동적하도록 업데이트 한다.


```swift
#Preview {
    let landmarks = ModelData().landmarks
    return Group {
        LandmarkRow(landmark: landmarks[0])
        LandmarkRow(landmark: landmarks[1])
    }
}
```
 

### Step 5

`ContentView` 프리뷰를 environment에 있는 모델 객체를 추가해서 업데이트한다. 해당 객체를 모든 하위 뷰에서 사용할 수 있도록 한다.


```swift
#Preview {
    ContentView()
        .environment(ModelData())
}
```
 

프리뷰에 있는 뷰가 `environment(_:)` modifier를 적용하지 않았는데, 해당 뷰의 서브 뷰가 environment에 등록된 모델 객체를 필요로 하면, 프리뷰가 실패하게 된다.

### Step 6

> 시뮬레이터나 실제 기기에서 앱을 실행할 때, 모델 객체를 environment에 넣을 수 있도록 앱 인스턴스를 수정한다.

모델 인스턴스를 생성하고, `environment(_:)` modifier를 사용해서 `ContentView` 에 전달하도록 `LandmarksApp` 을 업데이트한다.


```swift
@main
struct LandmarksApp: App {
    @State private var modelData = ModelData()
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(modelData)
        }
    }
}
```
 

모델 객체를 초기화 할 때, 뷰 내부의 프로퍼티를 초기화 하는 것과 똑같은 방법으로 모델 오브젝트를 `@State` 어트리뷰트를 사용해서 초기화 한다.

SwiftUI가 뷰의 생명주기 동안 한 번만 초기화 하듯이, 앱의 state도 한 번만 초기화 된다.

### Step 7

`LandmarkList`로 돌아와서 모든 것이 정확하게 동작하는지 확인한다.

![](/images/swiftui-tutorials-03-handling-user-input/image-004.png)

## Section 6. Create a favorite button for each landmark

랜드마크 앱은 이제 필터된 뷰와 필터되지 않은 뷰를 스위치 할 수 있다. 하지만 favorite 랜드 마크는 여전히 하드 코딩되어있다. 유저가 favorite를 추가하고 삭제할 수 있도록, 랜드마크의 상세 뷰에 favorite 버튼을 추가한다.

### Step 1, 2

`FavoriteButton.swift` 뷰를 만들고, 버튼의 현재 상태를 나타내는 `isSet` 바인딩을 추가한다. 그리고 프리뷰에 상수 값을 제공한다.


```swift
import SwiftUI

struct FavoriteButton: View {
    @Binding var isSet: Bool
    var body: some View {
        Text("Hello, World!")
    }
}

#Preview {
    FavoriteButton(isSet: .constant(true))
}
```
 

binding 프로퍼티 래퍼는 데이터를 저장하는 프로퍼티와, 데이터를 표시하고 수정하는 뷰 사이에서 읽기와 쓰기를 가능하게 해준다. binding을 사용하기 때문에, 이 뷰 안에서 이루어진 변경은 원래 데이터 소스로 다시 전달된다.

### Step 3

`isSet` state를 토글하는 액션을 가진 버튼을 만든다. 그리고 버튼의 모양을 `isSet` state에 따라 모양이 바뀌게 만든다.


```swift
struct FavoriteButton: View {
    @Binding var isSet: Bool
    var body: some View {
        Button {
            isSet.toggle()
        } label: {
            Label("Toggle Favorite", systemImage: isSet ? "star.fill" : "star")
                .labelStyle(.iconOnly)
                .foregroundStyle(isSet ? .yellow : .gray)
        }
    }
}
```
 

버튼의 레이블에 제공한 title 스트링은 `iconOnly` 레이블을 사용하면 UI에 표시되지 않는다, 하지만 보이스오버는 접근성을 향상시키기 위해 이를 이용한다.

### Step 4

> 프로젝트가 성장하면, 계층을 추가하는 것이 좋은 아이디어다. 계속 진행하기 전에 그룹을 몇개 더 만들고 간다.

`CircleImage`, `MapView`, `FavoriteButton` 파일을 Helpers 그룹에, 그리고 랜드마크 뷰들을 Landmarks 그룹에 모은다.

![](/images/swiftui-tutorials-03-handling-user-input/image-005.gif)

### Step 5

> FavoriteButton 을 디테일 뷰에 추가한다. 버튼의 isSet 프로퍼티를 해당 랜드마크의 isFavorite 프로퍼티에 바인딩한다.

`LandmarkDetail` 뷰로 넘어가서, 모델 데이터와 비교하여 입력으로 받은 랜드마크의 인덱스를 계산한다.


```swift
struct LandmarkDetail: View {
    @Environment(ModelData.self) var modelData
    var landmark: Landmark
    var landmarkIndex: Int {
        modelData.landmarks.firstIndex(where: { $0.id == landmark.id })!
    }
    ...
}

#Preview {
    let modelData = ModelData()
    return LandmarkDetail(landmark: modelData.landmarks[0])
        .environment(modelData)
}
```
 

이를 위해서 environment의 모델 데이터에도 접근할 필요가 있다.

### Step 6

body 프로퍼티 내부에서, `Bindable` 래퍼를 사용하는 모델 데이터를 추가한다. 랜드마크 이름을 `HStack`으로 감싸서 `FavoriteButton`과 함께 배치한다. 버튼에는 `$`를 사용해서 `isFavorite` 프로퍼티에 대한 바인딩을 전달한다.


```swift
import SwiftUI

struct LandmarkDetail: View {
    @Environment(ModelData.self) var modelData
    var landmark: Landmark
    var landmarkIndex: Int {
        modelData.landmarks.firstIndex(where: { $0.id == landmark.id })!
    }
    var body: some View {
        @Bindable var modelData = modelData
        ScrollView {
            MapView(coordinate: landmark.locationCoordinate)
                .frame(height: 300)
            CircleImage(image: landmark.image)
                .offset(y: -130)
                .padding(.bottom, -130)
            VStack(alignment: .leading) {
                HStack {
                    Text(landmark.name)
                        .font(.title)
                    FavoriteButton(isSet: $modelData.landmarks[landmarkIndex].isFavorite)
                }
                HStack {
                    Text(landmark.park)
                    Spacer()
                    Text(landmark.state)
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
                Divider()
                Text("About \(landmark.name)")
                    .font(.title2)
                Text(landmark.description)
            }
            .padding()
        }
        .navigationTitle(landmark.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```
 

`modelData` 객체의 `landmarkIndex` 를 사용해서 원본 모델 데이터의 `isFavorite` 프로퍼티가 업데이트 되도록 한다.

### Step 7

`LandmarkList` 로 돌아와서, 라이브 프리뷰가 동작하는지 확인한다.

![](/images/swiftui-tutorials-03-handling-user-input/image-006.gif)

리스트에서 상세 뷰로 이동해서 버튼을 탭하면, 리스트로 돌아와도 그 변경사항이 유지된다. 두 뷰가 Environment에 있는 같은 모델 객체를 사용하고 있기 때문에 두 화면이 항상 일관성을 유지한다.

## 정리

이번 튜토리얼에서 다룬 내용은 다음과 같다.

- `@State`를 이용한 뷰 상태 관리
- `Toggle`과 `@Binding`을 이용한 양방향 데이터 바인딩
- `@Observable`, `@Environment`, `@Bindable`을 이용한 데이터 공유
- `List`와 `ForEach`를 이용한 동적 리스트 구성
- 조건에 따른 리스트 필터링
- `NavigationSplitView`에서 모델 데이터 전달
- 사용자 입력에 따른 UI 업데이트
- 여러 뷰가 하나의 모델 객체를 공유하는 구조

* * *

> 출처: [SwiftUI Tutorials](<https://developer.apple.com/tutorials/swiftui>)
