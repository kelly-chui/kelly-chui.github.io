---
title: "SwiftUI Tutorials. Building Lists and Navigation"
date: 2024-06-25

categories:
  - iOS
series:
  - SwiftUI
tags:
  - Identifiable
  - List
  - Navigation

draft: false
original: "https://junmusu.tistory.com/188"
---

사용자가 전체 랜드마크 목록을 보고 각 위치에 대한 세부 정보를 볼 수 있는 방법을 제공해야 한다.

모든 랜드마크에 대한 정보를 표시할 수 있는 뷰를 생성하고 사용자가 탭하여 랜드마크에 대한 디테일 뷰를 볼 수 있는 스크롤 목록을 동적으로 생성한다. UI를 미세 조정하고 싶으면 Xcode를 사용하여 다양한 장치 크기에서 미리보기를 렌더링 하면 된다.

## Section 1. Create a landmark model

첫 번째 튜토리얼에선, 모든 정보들을 커스텀 뷰에 하드코딩했다. 이제는 뷰로 전달할 수 있는 데이터를 저장하는 모델을 만들 것이다.

### Step 1

landmarkData.json 파일 가져오기

### Step 2, 3

Landmark.swift 파일을 생성하고, landmarkData 데이터 파일에 있는 키와 매칭되는 프로퍼티를 가진 `Landmark` 스트럭처를 생성한다.

```swift
import Foundation

struct Landmark: Hashable, Codable {
    var id: Int
    var name: String
    var park: String
    var state: String
    var description: String
}
```
 
스트럭처가 `Codable` 프로토콜을 따르도록 하면, 구조체와 데이터 파일 사이에 데이터를 쉽게 주고받을 수 있게 된다. 이 섹션의 후반부에서는 파일에서 데이터를 읽어오기 위해 `Codable` 프로토콜의 Decodable 기능을 사용할 것이다.

### Step 4

프로젝트의 에셋 카탈로그에 JPG 파일들을 가져온다. Xcode는 각각의 이미지들에 대해 새로운 이미지 셋을 만들어준다.

### Step 5

데이터에서 이미지 이름을 불러오기 위해 `imageName` 프로퍼티와 에셋 카탈로그에서 이미지를 로드해오는 컴퓨티드 이미지 프로퍼티를 추가한다.

```swift
import Foundation
import SwiftUI

struct Landmark: Hashable, Codable {
    var id: Int
    var name: String
    var park: String
    var state: String
    var description: String

    private var imageName: String
    var image: Image {
        Image(imageName)
    }
}
```

사용자들은 이미지 자체에만 관심이 있기 때문에, `imageName`은 `private`으로 한다.

### Step 6

`Landmark` 스트럭처에 JSON 데이터 구조를 반영하는 중첩된 `Coordinates` 타입을 사용해서 `coordinates` 프로퍼티를 추가한다.

```swift
struct Landmark: Hashable, Codable {
    var id: Int
    var name: String
    var park: String
    var state: String
    var description: String

    private var imageName: String
    var image: Image {
        Image(imageName)
    }

    private var coordinates: Coordinates

    struct Coordinates: Hashable, Codable {
        var latitude: Double
        var longitude: Double
    }
}
```
 
다음 스텝에서 공개 컴퓨티드 프로퍼티를 계산할 때만 사용할 것이기 때문에 `private`으로 지정한다.

### Step 7

MapKit 프레임워크에서 사용하기 유용한 `locationCoordinate` 프로퍼티를 계산한다.

```swift
import CoreLocation

struct Landmark: Hashable, Codable {
    var id: Int
    var name: String
    var park: String
    var state: String
    var description: String

    private var imageName: String
    var image: Image {
        Image(imageName)
    }

    private var coordinates: Coordinates
    var locationCoordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        )
    }
    struct Coordinates: Hashable, Codable {
        var latitude: Double
        var longitude: Double
    }
}
```

### Step 8-10

ModelData.swift 파일을 만들고, 앱의 메인 번들에서 주어진 이름으로 JSON 데이터를 가져오는 `load(_:)` 메소드를 만든다. 그리고 landmarkData.json으로 초기화 한 배열 `landmarks`를 만든다.

```swift
import Foundation

var landmarks: [Landmark] = load("landmarkData.json")

func load<T: Decodable>(_ filename: String) -> T {
    let data: Data

    guard let file = Bundle.main.url(forResource: filename, withExtension: nil)
    else {
        fatalError("Couldn't find \(filename) in main bundle.")
    }

    do {
        data = try Data(contentsOf: file)
    } catch {
        fatalError("Couldn't load \(filename) from main bundle:\n\(error)")
    }

    do {
        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    } catch {
        fatalError("Couldn't parse \(filename) as \(T.self):\n\(error)")
    }
}
```

### Step 11

ContentView, CircleImage, MapView 파일을 Views 그룹에 넣고, landmarkData를 Resource 그룹, Landmark와 ModelData를 Model 그룹에 넣는다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-001.png)

## Section 2. Create the row view

이 튜토리얼에서 만들 첫 번째 뷰는 각 랜드마크에 대한 세부 정보을 표시하는 행이다. 이 행 뷰는 표시되는 랜드마크에 대한 정보를 프로퍼티에 저장하므로 하나의 뷰에서 모든 종류의 랜드마크를 표시할 수 있다. 나중에 여러 행을 결합하여 랜드마크 리스트를 만든다.

### Step 1-3

LandmarkRow.swift 파일을 만들고, `landmark`라는 프로퍼티를 만든다.

```swift
import SwiftUI

struct LandmarkRow: View {
    var landmark: Landmark
    var body: some View {
        Text("Hello, World!")
    }
}

#Preview {
    LandmarkRow()
}
```

`landmark` 프로퍼티를 추가하면, 프리뷰 캔버스가 멈추게 된다. `LandmarkRow` 타입은 초기화 하는데 `landmark` 프로퍼티가 필요하기 때문이다.

프리뷰 매크로 내부에서 `LandmarkRow` 이니셜라이저에 `landmark` 매개변수를 추가하여 `Landmarks` 배열의 첫 번째 요소를 지정한다.

```swift
#Preview {
    LandmarkRow(landmark: landmarks[0])
}
```
 
### Step 4-6

`HStack`과 이미지, 텍스트 뷰를 조합하여 row를 완성한다.

```swift
import SwiftUI

struct LandmarkRow: View {
    var landmark: Landmark
    var body: some View {
        HStack {
            landmark.image
                .resizable()
                .frame(width: 50, height: 50)
            Text(landmark.name)
            Spacer()
        }
    }
}
```

> 💡 Kelly 주  
> `resizable()`은 이미지 크기를 조절 가능하게 만들어주는 modifier이다.

## Section 3. Customize the row preview

Xcode는 뷰의 소스 파일에서 매크로로 선언한 프리뷰를 자동으로 인식한다.

캔버스는 한 번에 하나의 미리보기만 표시하지만 캔버스에서 여러 미리보기를 정의하고 그 중에서 선택할 수 있다. 또는 뷰를 함께 그룹화하여 하나 이상의 뷰 버전에 대한 단일 미리보기를 생성할 수 있다.

### Step 1

`landmark` 배열의 두 번째 원소를 사용하는 두 번째 미리보기를 만든다.

```swift
#Preview {
    LandmarkRow(landmark: landmarks[0])
}

#Preview {
    LandmarkRow(landmark: landmarks[1])
}
```
 

프리뷰를 추가하는 것은, 뷰가 다른 데이터가 들어왔을 때 어떻게 동작하는지를 보여준다.

### Step 2, 3

캔버스 안에 있는 컨트롤을 사용해서 두 번째 프리뷰를 선택할 수 있다. 기본적으로 캔버스는 프리뷰가 있는 라인 넘버로 레이블을 매긴다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-002.png)

프리뷰 매크로는 프리뷰에 레이블을 붙일 수 있는 추가적인 이름 파라미터를 받는다.

```swift
#Preview("Turtle Rock") {
    LandmarkRow(landmark: landmarks[0])
}

#Preview("Salmon") {
    LandmarkRow(landmark: landmarks[1])
}
```

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-003.png)

### Step 5

> 뷰의 다른 버전을 나란히 보려면, 단일 컬렉션 뷰로 함께 그룹화할 수 있다.

두 번째 프리뷰를 지우고, 두 버전의 다른 행을 Group 으로 래핑한다.

```swift
#Preview("Turtle Rock") {
    Group {
        LandmarkRow(landmark: landmarks[0])
        LandmarkRow(landmark: landmarks[1])
    }
}
```

Group은 뷰 컨텐스트를 그루핑하는 컨테이너다. Xcode는 그룹의 자식 뷰를 하나의 프리뷰에 쌓아서 렌더링한다.

## Section 4. Create the list of landmarks

SwiftUI의 `List` 타입을 사용하면 플랫폼별 뷰 리스트를 표시할 수 있다. 리스트의 요소는 이전에 생성한 스택의 하위 뷰와 같이 정적일 수도 있고 동적으로 생성될 수도 있다. 정적인 뷰와 동적으로 생성된 뷰를 혼합할 수도 있다.

### Step 1, 2

LandmarkList.swift 스위프트 파일을 생성하고, 처음 두 개의 랜드마크가 리스트의 자식으로 있는 `LandmarkRow` 인스턴스를 제공한다.

```swift
import SwiftUI

struct LandmarkList: View {
    var body: some View {
        List {
            LandmarkRow(landmark: landmarks[0])
            LandmarkRow(landmark: landmarks[1])
        }
    }
}

#Preview {
    LandmarkList()
}
```
 

프리뷰는 iOS에 적합한 스타일로 렌더링 된 두 개의 랜드마크를 보여준다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-004.png)

## Section 5. Make the list dynamic

리스트의 원소를 개별적으로 지정하는 대신에, 컬렉션으로 부터 직접 행들을 만들 수 있다.

데이터 컬렉션과 컬렉션의 각 원소에 대한 뷰를 제공하는 클로저를 전달하여 컬렉션의 원소를 표시하는 리스트를 만들 수 있다. 리스트는 제공된 클로저를 사용하여 컬렉션의 각 원소를 자식 뷰로 변환시킨다.

### Step 1

두 개의 정적 행을 지우고 모델 데이터의 `landmarks` 어레이를 `List` 이니셜라이저에 전달한다.

```swift
struct LandmarkList: View {
    var body: some View {
        List(landmarks, id: \.id) { landmark in

        }
    }
}
```
 

목록은 식별 가능한 데이터와 동작한다. 데이터를 식별 가능하게 하는 두 가지 방법이 있다: 각 원소를 고유하게 식별하는 프로퍼티에 대한 키 패스를 데이터와 함께 전달하거나, 데이터 타입을 `Identifiable` 프로토콜을 준수하도록 만든다.

### Step 2

클로저에서 `LandmarkRow`를 리턴하여 동적으로 생성되는 리스트를 완료한다.

```swift
struct LandmarkList: View {
    var body: some View {
        List(landmarks, id: \.id) { landmark in
            LandmarkRow(landmark: landmark)
        }
    }
}
```

이것은 랜드마크 배열의 각 원소에 대해 하나의 `LandmarkRow`를 만든다.

### Step 3

> Landmark 타입이 Identifiable을 컨펌하도록 하여 List를 더 단순하게 만들 수 있다.

Landmark.swift로 가서 `Identifiable` 프로토콜을 컨펌하도록 한다.

```swift
struct Landmark: Hashable, Codable, Identifiable {
```
 
랜드마크 데이터는 이미 `Identifiable` 프로토콜에서 요구하는 `id` 프로퍼티를 가지고 있다. 데이터를 읽어올 때, 이 값을 디코딩할 수 있도록 프로퍼티만 추가해주면 된다.

### Step 4

LandmarkList.swift로 돌아와서 `id` 매개변수를 제거한다.

```swift
var body: some View {
    List(landmarks) { landmark in
        LandmarkRow(landmark: landmark)
    }
}
```

이제부터는 랜드마크 원소들의 컬렉션을 직접 사용할 수 있다.

## Section 6. Set up navigation between list and detail

목록이 제대로 렌더링되지만, 아직 각 랜드마크를 탭하여 해당 랜드마크의 세부 정보 페이지를 볼 수 없다.

리스트에 네비게이션 기능을 추가하려면, `NavigationSplitView`에 리스트을 삽입한 다음 각 행을 `NavigationLink`로 감싸서 대상 뷰로 전환될 수 있도록 설정한다.

### Step 1, 2

LandmarkDetail.swift를 생성한 다음에, `ContentView`의 `body` 프로퍼티를 복사해온다.

```swift
import SwiftUI

struct LandmarkDetail: View {
    var body: some View {
        VStack {
            MapView()
                .frame(height: 300)
            CircleImage()
                .offset(y: -130)
                .padding(.bottom, -130)
            VStack(alignment: .leading) {
                Text("Turtle Rock")
                    .font(.title)
                HStack {
                    Text("Joshua Tree National Park")
                    Spacer()
                    Text("California")
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
                Divider()
                Text("About Turtle Rock")
                    .font(.title2)
                Text("Descriptive text goes here.")
            }
            .padding()
            Spacer()
        }
    }
}

#Preview {
    LandmarkDetail()
}
```

### Step 3

`ContentView`를 `LandmarkList`를 표시하도록 변경한다.

```swift
struct ContentView: View {
    var body: some View {
        LandmarkList()
    }
}
```
 
### Step 4, 5

동적으로 생성된 랜드마크 리스트를 `NavigationSplitView`에 임베드하고, `navigationTitle(_:)` 모디파이어로 리스트가 보여질 때, 내비게이션 바의 타이틀을 설정한다.

```swift
struct LandmarkList: View {
    var body: some View {
        NavigationSplitView {
            List(landmarks) { landmark in
                LandmarkRow(landmark: landmark)
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 
### Step 6

리스트의 클로저 내에서 리턴된 행을 `NavigationLink`로 감싸고 `LandmarkDetail` 뷰를 목적지로 지정합니다.

```swift
struct LandmarkList: View {
    var body: some View {
        NavigationSplitView {
            List(landmarks) { landmark in
                NavigationLink {
                    LandmarkDetail()
                } label: {
                    LandmarkRow(landmark: landmark)
                }
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```

### Step 7

프리뷰에서 직접 네비게이션을 시도해볼 수 있다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-005.png)

## Section 7. Pass data into child views

`LandmarkDetail` 뷰는 여전히 하드 코딩된 세부 정보를 사용하여 랜드마크를 표시한다. `LandmarkRow`와 마찬가지로 `LandmarkDetail` 타입과 그로 구성된 뷰는 `landmark` 프로퍼티를 데이터 소스로 사용해야 한다.

자식 뷰부터 `CircleImage`, `MapView`, `LandmarkDetail`을 변환하여 각 행을 하드 코딩하는 대신 전달된 데이터를 표시하도록 한다.

### Step 1

`CircleImage` 스트럭처에 `image` 프로퍼티를 추가한다.

```swift
struct CircleImage: View {
    var image: Image
    var body: some View {
        image
            .clipShape(Circle())
            .overlay {
                Circle().stroke(.white, lineWidth: 4)
            }
            .shadow(radius: 7)
    }
}
```

이는 SwiftUI를 사용하여 뷰를 만들 때 일반적인 패턴이다. 커스텀 뷰는 종종 특정 뷰의 modifier를 래핑하고 캡슐화한다.

### Step 2

프리뷰가 Turtle Rock 이미지를 전달받도록 업데이트 한다.

```swift
#Preview {
    CircleImage(image: Image("turtlerock"))
}
```

프리뷰 로직을 수정했지만 빌드가 실패하여 프리뷰가 업데이트 되지 않는다. `DetailView` 안에서 `CircleImage`를 만들고 있는데, 이 `CircleImage`를 만들 때 필요한 파라미터가 전달되지 않아서 빌드가 실패한다.

### Step 3

`MapView` 스트럭처에 `coordinate` 프로퍼티를 추가하고 프리뷰를 업데이트하여 고정된 좌표를 전달한다.

```swift
import SwiftUI
import MapKit

struct MapView: View {
    var coordinate: CLLocationCoordinate2D
    var body: some View {
        Map(initialPosition: .region(region))
    }
    private var region: MKCoordinateRegion {
        MKCoordinateRegion (
            center: CLLocationCoordinate2D(latitude: 34.011_286, longitude: -116.166_868),
            span: MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2)
        )
    }
}

#Preview {
    MapView(coordinate: CLLocationCoordinate2D(latitude: 34.011_286, longitude: -116.166_868))
}
```

이 또한 디테일 뷰가 새로운 파라미터가 필요한 맵 뷰를 가지고 있으므로 빌드에 영향을 끼친다.

### Step 4

`regeion` 변수 안에 있는 `center` 파라미터에 좌표를 전달한다.

```swift
private var region: MKCoordinateRegion {
    MKCoordinateRegion (
        center: coordinate,
        span: MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2)
    )
}
```

SwiftUI는 이 뷰에 대한 좌표 입력이 변경되면 알아차리고 본문을 다시 계산하여 뷰를 업데이트한다. 그것은 차례로 새로운 입력 값을 사용하여 `region`을 다시 계산한다.

### Step 5

값이 변경될 때 지도가 업데이트 되도록, 위치 값을 입력으로 받는 새로운 이니셜라이저를 사용한다.

```swift
    var body: some View {
        Map(position: .constant(.region(region)))
    }
```

이 새 이니셜라이저는 `position`에 대한 바인딩을 기대한다. 하지만 사용자가 지도를 통해 위치를 변경할 필요가 없으므로, `.constant()` 바인딩을 사용해서 고정된 값을 전달한다.

> 💡Kelly 주  
> 이 부분은 설명이 잘 안되어있는 것 같다. 나중에 나올 데이터 바인딩에서 좀 더 깊게 들어갈 부분인 것 같다.

### Step 6

`LandmarkDetail`에서 `LandmarkDetail` 타입의 `Landmark` 프로퍼티를 추가한다.

```swift
import SwiftUI

struct LandmarkDetail: View {
    var landmark: Landmark
    var body: some View {
        VStack {
            MapView()
                .frame(height: 300)
            CircleImage()
                .offset(y: -130)
                .padding(.bottom, -130)
            VStack(alignment: .leading) {
                Text("Turtle Rock")
                    .font(.title)
                HStack {
                    Text("Joshua Tree National Park")
                    Spacer()
                    Text("California")
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
                Divider()
                Text("About Turtle Rock")
                    .font(.title2)
                Text("Descriptive text goes here.")
            }
            .padding()
            Spacer()
        }
    }
}

#Preview {
    LandmarkDetail(landmark: landmarks[0])
}
```

### Step 7

`LandmarkList`에서 현재 랜드마크를 `LandmarkDetail`의 목적지로 전달한다.

```swift
struct LandmarkList: View {
    var body: some View {
        NavigationSplitView {
            List(landmarks) { landmark in
                NavigationLink {
                    LandmarkDetail(landmark: landmark)
                } label: {
                    LandmarkRow(landmark: landmark)
                }
            }
            .navigationTitle("Landmarks")
        } detail: {
            Text("Select a Landmark")
        }
    }
}
```
 
### Step 8, 9

`LandmarkDetail` 파일에서 커스텀 타입에 필요한 데이터를 전달한다.

`VStack`을 `ScrollView`로 바꿔서 사용자들이 설명 콘텐트를 스크롤 할 수 있게 하고, 더 이상 필요하지 않은 Spacer를 삭제한다.

```swift
struct LandmarkDetail: View {
    var landmark: Landmark
    var body: some View {
        ScrollView {
            MapView(coordinate: landmark.locationCoordinate)
                .frame(height: 300)
            CircleImage(image: landmark.image)
                .offset(y: -130)
                .padding(.bottom, -130)
            VStack(alignment: .leading) {
                Text(landmark.name)
                    .font(.title)
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
    }
}
```

모든 것이 연결되면, 프리뷰는 다시 동작한다.

### Step 10

마지막으로, `navigationTitle(:_)` modifier를 호출하여 디테일 뷰가 표시될 때의 내비게이션 바에 타이틀을 준다. 그리고 `navigationBarTitleDisplayMode(_:)` modifier를 이용해서 타이틀이 인라인으로 보이게 한다.

```swift
struct LandmarkDetail: View {
    var landmark: Landmark
    var body: some View {
        ScrollView {
            MapView(coordinate: landmark.locationCoordinate)
                .frame(height: 300)
            CircleImage(image: landmark.image)
                .offset(y: -130)
                .padding(.bottom, -130)
            VStack(alignment: .leading) {
                Text(landmark.name)
                    .font(.title)
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
 
내비게이션 변경 사항은 뷰가 내비게이션 스택의 일부인 경우에만 적용된다.

### Step 11

`LandmarkList` 프리뷰로 돌아가서 목록에서 탐색할 때 올바른 랜드마크가 보이는지 확인한다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-006.png)

## Section 8. Generate previes dynamically

다음으로, 다양한 장치 구성에 대한 리스트 뷰의 프리뷰를 렌더링한다.

기본적으로 프리뷰는 액티브 스키마에 있는 장치 크기로 렌더링된다. 대상을 변경하거나 캔버스에서 장치를 오버라이딩하여 다른 장치에서 렌더링할 수 있다. 기기 방향과 같은 다른 프리뷰 변수들도 탐색해볼 수 있다.

### Step 1

프리뷰가 iPad를 표시하도록 디바이스 셀렉터를 변경한다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-007.png)

Portait 방향에서 `NavigationSplitView`는 기본적으로 detail pane을 표시하고, 툴바 안에 사이드바를 표시하는 버튼을 제공한다.

### Step 2

툴바 버튼을 탭하여 사이드바를 표시하고 랜드마크 중 하나로 이동한다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-008.png)

디테일 뷰가 사이드바 아래의 선택한 랜드마크로 변경됩니다. 사이드바는 디테일 뷰의 아무 곳이나 탭하면 사라진다.

### Step 3

캔버스에서 Device Settings을 선택하고 Landscape Left를 선택한다.

![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-009.png) ![](/images/swiftui-tutorials-02-building-lists-and-navigation/image-010.png)

가로 방향에서 `NavigationSplitView`는 사이드 바와 디테일 패널을 나란히 표시한다.

### Step 4

Device Setting에서 다른 장치 및 컨픽을 실험하여 다른 조건에서 뷰가 어떻게 보이는지 확인하자.

## 정리

이번 튜토리얼에서 다룬 내용은 다음과 같다.

- `Codable`을 이용한 JSON 데이터 디코딩
- `Hashable`, `Identifiable`을 이용한 모델 식별
- `Bundle.main`에서 리소스 파일 읽기
- `List`를 이용한 정적/동적 목록 구성
- `NavigationSplitView`와 `NavigationLink`를 이용한 화면 전환
- 부모 뷰에서 자식 뷰로 데이터 전달
- `ScrollView`를 이용한 상세 화면 구성
- `#Preview`와 `Group`을 이용한 프리뷰 구성
- iPad 방향에 따른 `NavigationSplitView` 동작 확인

* * *
 
> 출처: [SwiftUI Tutorials](<https://developer.apple.com/tutorials/swiftui>)
