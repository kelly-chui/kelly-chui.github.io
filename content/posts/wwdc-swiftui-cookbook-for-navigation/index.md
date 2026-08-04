---
title: "SwiftUI. The Swiftui Cookbook for Navigation - WWDC22"
date: 2026-07-23T22:36:54+09:00

categories:
  - iOS
  - WWDC
series:
  - SwiftUI
tags:
  - Navigation
  - WWDC

draft: false
original: ""
aliases:
  - /posts/wwdc-swiftui-cookbook-for-navigation/
---

## The SwiftUI cookbook for navigation

SwiftUI의 새로운 내비게이션 API를 발표한 WWDC 세션을 정리했다. 이 내비게이션 API는 각각의 `NavigationLink`가 관리하는 대신, 스택 전체의 상태를 데이터로 표현하고 직접 조작할 수 있게 만든다.

이 구조를 사용하면 버튼을 눌러 이동하는 기본적인 내비게이션뿐만 아니라, 딥 링크나 특정 화면으로 바로 이동하기, 루트 화면으로 돌아가기, 현재 내비게이션 상태 저장까지 같은 모델로 처리할 수 있다.

- New naviation API: 새로운 Data-driven 내비게이션 API
- Recipes for navigation: 탐색을 프로그래밍 방식으로 완전히 제어하기
- Persistent state: 새로운 API를 이용하여 앱의 내비게이션 상태를 유지하기

{{< callout type="note" title="갑자기 프로그래밍 방식?" >}}
SwiftUI는 처음부터 코드로 UI를 작성하는 프레임워크였기 때문에, 기존 `NavigationView`도 `isActive`나 `selection`을 이용해 화면을 프로그래밍 방식으로 전환할 수 있었다.

여기서 말하는 Programmatic Navigation은 화면 전환 자체가 아니라, 내비게이션 스택 전체를 데이터로 표현하고 직접 제어하는 방식을 의미한다. 이전에는 각 `NavigationLink`가 자신의 상태를 관리했지만, 새로운 API에서는 스택 전체를 하나의 데이터로 다루므로 딥 링크, 특정 화면으로 이동, 루트로 돌아가기, 상태 복원 등을 일관된 방식으로 구현할 수 있다.
{{< /callout >}}

### 기존 API의 문제점

기존 API에서는 `NavigationLink`가 이동할 View(destination)와 이동 여부를 함께 가지고 있었다.

```swift
NavigationLink(
    "Details",
    isActive: $item.showDetail
) { DetailView() }
```

이 방식의 가장 큰 문제는 각각의 `NavigationLink`마다 별도의 Binding이 필요해서 링크가 많아질수록 상태가 여러 곳으로 흩어진다. (`isActive` 역할을 할 상태가 링크 개수만큼 있어야 한다!)

새로운 API에서는 이 Binding을 각각의 링크가 아니라 `NavigationStack` 이 관리한다.

```swift
NavigationStack(path: $path) {
    NaviagtionLink("Details", value: value)
}
```

`path`는 스택에 push되어 있는 모든 값을 나타내는 컬렉션이다. `NavigationLink`는 이동할 때 값을 `path`에 추가하는 방식으로 직접 수정해 딥 링크를 만들 수 있고, `path`의 모든 값을 제거해 루트 View로 돌아갈 수도 있다.

새로운 Navigation API가 어떻게 data-driven 방식으로 프로그래밍 가능한 내비게이션을 구현하는지 살펴본다.

## New navigation API

앱의 내비게이션 구조를 표현하기 위한 두 가지 컨테이너 타입과, 사용자가 그 구조 안을 이동할 수 있도록 도와주는 새로운 `NavigationLink`가 추가되었다.

### Navigation Stack

```swift
NavigationStack(path: $path) {
    RecipeDeatil
}
```

`NavigationStack`은 화면을 순서대로 쌓고 마지막 화면부터 제거하는 push-pop 방식의 인터페이스를 표현한다. UIKit의 `UINavigationController`와 비슷한 구조지만, 화면 자체가 아니라 데이터로 스택의 상태를 표현한다.

### NavigationSplitView

`NavigationSplitView`는 Mac이나 iPad의 Mail, Notes처럼 여러 개의 컬럼을 사용하는 앱에 적합하다.

```swift
NavigationSplitView {
    RecipeCategories()
} detail: {
    RecipeGrid()
}
```

화면이 좁은 iPhone이나 iPad의 Slide Over 환경에서는 SwiftUI가 여러 컬럼을 단일 컬럼 내비게이션 형태로 자동 변환한다.

### 새로운 NavigationLink

예전에는 `title`과 표시할 Destination View를 함께 가지고 있었다. 새로운 `NavigationLink`도 `title`은 가지고 있지만, Destination View 대신 Value를 전달한다.

전달된 Value를 어떻게 화면으로 바꿀지는 링크가 아니라 상위 `NavigationStack`에 등록된 `navigationDestination`이 결정한다.

### 첫 번째 예제

{{< video src="video-001-optimized-video.mp4" width="360" autoplay="true" loop="true" align="center" >}}
- 기본적인 View 스택, 카테고리마다 하나의 Section이 있고, 누르면 Detail로 들어간다.
- 어떤 레시피에서든 관련 레시피를 탭하면 해당 레시피가 다시 스택 위로 push된다.
- 뒤로 가기 버튼을 누르면 원래 레시피로 돌아오고, 다시 한번 뒤로 가면 카테고리 목록으로 돌아간다.

`NavigationStack`을 만들고, 그 안에 모든 카테고리를 순회하는 `List`와 `navigationTitle`을 넣는다.

`List` 안에는 각 카테고리마다 하나의 Section이 있고, Section 안에 `NavigationLink`를 추가한다.

```swift
var body: some View {
    NavigationStack {
        List(Category.allCases) { category in
            Section (category.localizedName) {
                ForEach (dataModel. recipes(in: category)) { recipe in
                    NavigationLink(recipe.name) {
                        RecipeDetail(recipe: recipe)
                    }
                }
            }
        }
        .navigationTitle("Categories")
    }
}
```

여기까지는 기존 `NavigationView`를 사용하는 방식과 크게 다르지 않다. 기존의 Destination View를 받는 `NavigationLink`를 사용하는데, 기본적인 내비게이션은 잘 동작한다.

프로그래밍 방식으로 내비게이션을 제어하려면 Value와 View를 분리한다.

```swift
var body: some View {
    NavigationStack {
        List(Category.allCases) { category in
            Section (category.localizedName) {
                ForEach (dataModel. recipes(in: category)) { recipe in
                    NavigationLink(recipe.name, value: recipe)
                }
            }
        }
        .navigationTitle("Categories")
        .navigationDestination(for: Recipe.self) { recipe in
            RecipeDetail(recipe: recipe)
        }
    }
}
```

Destination View를 `NavigationLink`에서 꺼내 새로운 `navigationDestination` modifier로 옮긴다. 이 modifier는 자신이 어떤 데이터 타입을 처리하는지 선언한다. (여기서는 `Recipe`)

이후에는 View Builder를 받아, `Recipe` Value가 전달되었을 때 스택 위에 어떤 View를 push할지 정의한다.

하나의 타입에 대해 서로 다른 destination이 필요하다면, 전달하는 Value의 타입이나 별도의 경로 모델을 구분해야 한다. 같은 `Recipe` 타입만으로는 어떤 화면으로 이동해야 하는지 구분할 수 없기 때문이다.

새로운 `NavigationLink`는 View 대신 `Recipe` Value만 전달한다. 이제 이 값이 `NavigationStack` 안에서 어떻게 화면으로 연결되는지 살펴보자.

### 내부 동작

모든 `NavigationStack`은 현재 스택에 표시되고 있는 모든 데이터를 나타내는 `path`를 관리한다.

우선, 스택이 RootView를 표시하고 있을 때는 `path`가 비어 있다.

```swift
path = []
```

스택은 자신 안에서 선언된 모든 `navigationDestination`과, 스택에 push된 View 안에서 선언된 destination도 함께 관리한다. 따라서 하위 View에서 선언한 destination도 해당 스택의 경로를 해석하는 데 사용할 수 있다.

개념적으로는 여러 타입에 대한 destination 매핑을 관리하지만, 이 예제에서는 destination이 하나뿐이다.

```swift
// navigation destinations
(Recipe) -> some View
```

Value를 전달하는 `NavigationLink`를 탭하면 그 값이 `path`에 추가된다.

`NavigationStack`은 등록된 destination들을 `path`의 각 값에 매핑하여 어떤 View를 스택에 push해야하는지 결정한다.

즉, 다음 과정을 거친다.

1. `NavigationLink`가 value를 `path`에 전달
2. `path`에 append된 값을 `navigation destinations`가 매핑하여 어떤 뷰를 push할지 결정
3. 결정된 뷰를 stack에 push
4. 뒤로가기 버튼을 누르면 마지막 값이 stack과 `path`에서 함께 제거된다.

`path`가 화면 스택의 원본 상태이기 때문에, 화면을 제거할 때도 해당 값이 함께 제거된다.

### path와 Binding으로 연결하기

코드에서 `path`를 Binding하려면 State를 만든다.

```swift
@State private var path: [Recipe] = []

var body: some View {
    NavigationStack(path: $path) {
        List(Category.allCases) { category in
            Section (category.localizedName) {
                ForEach (dataModel. recipes(in: category)) { recipe in
                    NavigationLink(recipe.name, value: recipe)
                }
            }
        }
        .navigationTitle("Categories")
        .navigationDestination(for: Recipe.self) { recipe in
            RecipeDetail(recipe: recipe)
        }
    }
}
```

이 예제에서는 push되는 모든 값이 `Recipe`이므로 `path`를 `[Recipe]`로 표현할 수 있다. path State를 만들었으면 `NavigationStack`에 `path` 아규먼트를 추가하고, 그 Binding을 전달한다.

그러면 `path`를 조작해서, 특정 레시피로 즉시 이동하는 메서드나 언제나 루트 화면으로 돌아갈 수 있는 메소드도 만들 수 있다.

```swift
func showRecipeOfTheDay() {
    path = [dataModel.recipeOfTheDay]
}
func popToRoot() {
    path.removeAll()
}
```

여러 종류의 데이터를 하나의 스택에서 함께 다뤄야 한다면, type-erasing collection인 `NavigationPath`를 사용할 수 있다.

### Multi-column 예제

{{< video src="video-002-optimized-video.mp4" width="360" autoplay="true" loop="true" align="center" >}}
큰 화면의 기기에서는 여러 화면을 계속 push하지 않고도 계층 구조를 한 번에 확인할 수 있어 유용하다.

```swift
@State private var selectedCategory: Category?
@State private var selectedRecipe: Recipe?

var body: some View {
    NavigationSplitView {
        List(Category.allCases, selection: $selectedCategory) { category in
            NavigationLink(category.localizedName, value: category)
        }
        .navigationTitle("Categories")
    } content: {
        List (dataModel.recipes(in: selectedCategory), selection: $selectedRecipe) { recipe in
            NavigationLink(recipe.name, value: recipe)
        }
        .navigationTitle(selectedCategory?.localizedName ?? "Recipes")
    } detail: {
        RecipeDetail(recipe: selectedRecipe)
    }
}
```

각 `List`의 `selection`은 변경 가능한 상태에 연결하기 위해 Binding으로 전달한다. `selection`과 같은 타입의 Value를 전달하는 `NavigationLink`를 해당 List 안에 넣으면, 링크를 탭하거나 클릭했을 때 SwiftUI가 `selection`을 자동으로 업데이트한다.

즉, 사용자가 사이드바에서 카테고리를 선택하면 SwiftUI가 `selectedCategory`를 자동으로 변경한다. 이 값의 변경이 두 번째 컬럼과 상세 컬럼의 내용을 갱신한다.

{{< callout type="note" title="selection과 NavigationLink는 어떻게 연결될까?" >}}
`List`가 `selection` Binding을 가지고 있고, 그 안의 `NavigationLink`가 같은 타입의 Value를 전달하면 SwiftUI가 링크의 Value와 선택 상태를 연결한다. 그래서 링크를 직접 조작하지 않아도 `selection`을 바꾸는 것만으로 같은 이동을 코드에서 수행할 수 있다.
{{< /callout >}}

만약 오늘의 추천 레시피로 이동하고 싶다면, selection State만 변경하면 된다.

List의 `selection`과 `NavigationSplitView`를 함께 사용하면 SwiftUI가 좁은 화면에서 SplitView를 단일 `NavigationStack` 형태로 변환한다.

`selection`의 변화는 iPhone에서 적절한 push와 pop으로 자동 변환된다.
좁은 화면에서는 선택 상태의 변화가 단일 컬럼 내비게이션의 push와 pop으로 변환된다.

`NavigationSplitView`는 `NavigationStack`의 상위호환이라기보다, 여러 컬럼과 좁은 화면에서의 적응형 표시를 담당하는 별도의 컨테이너로 보는 편이 정확하다.

### NavigationSplitView와 NavigationStack을 둘 다 사용해서 만든 예제

{{< video src="video-003-optimized-video.mp4" width="360" autoplay="true" loop="true" align="center" >}}
이제 카테고리 선택과 Detail 영역 안의 화면 이동을 하나의 구조에서 함께 사용할 수 있다.
카테고리를 선택하면 Detail 영역에서 해당 카테고리의 모든 레시피가 Grid 형태로 표시된다.

레시피를 탭하면 Detail 영역 안의 `NavigationStack` 위로 push된다.

관련 레시피를 탭하면 그것 역시 스택 위에 push된다.

뒤로 가기를 사용하면 다시 레시피 Grid로 돌아온다.

`NavigationSplitView`의 컬럼 안에는 `List`뿐 아니라 `NavigationStack`도 넣을 수 있다. 이때 바깥의 SplitView는 컬럼 간 선택을 관리하고, 안쪽의 NavigationStack은 해당 컬럼 안에서 이어지는 화면 스택을 관리한다.

{{< callout type="note" title="NavigationStack을 중첩하는 이유" >}}
중첩된 `NavigationStack`은 단순히 `NavigationLink`를 여러 개 넣는 것과 다르다. 각 컨테이너가 자신의 내비게이션 상태를 관리하기 때문에, SplitView의 컬럼 선택과 Detail 영역 안의 push-pop 흐름을 분리해서 제어할 수 있다.
{{< /callout >}}

```swift
@State private var selectedCategory: Category?

var body: some View {
    NavigationSplitView {
        List(Category.allCases, selection: selectedCategory) { category in
            NavigationLink(category.localizedName, value: category)
        }
        .navigationTitle("Categories")
    } detail: {
        NavigationStack {
            RecipeGrid(category: selectedCategory)
        }
    }
}
```

여기에서 `NavigationStack`의 RootView는 `RecipeGrid`다.

```swift
struct RecipeGrid: View {
    var category: Category?
    var body: some View {
        if let category = category {
            ScrollView {
                LazyVGrid(columns: columns) {
                    ForEach(dataModel.recipes(in: category)) { recipe in
                        NavigationLink(value: recipe) { RecipeTile (recipe: recipe) }
                    }
                }
            }
            .navigationTitle(category.name)
            .navigationDestination(for: Recipe.self) { recipe in RecipeDetail(recipe: recipe) }
        } else { ... }
    }
}
```

`RecipeGrid`는 `category`를 파라미터로 받는 View다. `ForEach`로 모든 레시피를 순회하고, 각 레시피마다 Value를 전달하는 `NavigationLink`를 만든다.

`NavigationLink`는 `Recipe` 값을 전달한다. trailing closure에 있는 link의 Label은 썸네일과 제목을 표시하는 `RecipeTile`이다.

이제 `path`를 저장하기 위한 State를 추가하고 `NavigationStack`에 Binding한다. 내비게이션 상태가 데이터로 분리되었으므로, 오늘의 추천 레시피를 보여주는 메소드도 간단하게 만들 수 있다.

```swift
@State private var selectedCategory: Category?
@State private var path: [Recipe] = []

var body: some View {
    NavigationSplitView { ... }
}

func showRecipeOfTheDay() {
    let recipe = dataModel.recipeOfTheDay
    selectedCategory = recipe.category
    path = [recipe]
}
```

## 내비게이션 상태를 저장하기

새로운 Navigation API는 내비게이션 스택을 데이터로 표현하기 때문에, 이 데이터를 저장했다가 다시 복원하는 것만으로도 사용자가 보고 있던 화면을 그대로 재현할 수 있다.

이 예제에서는 다음과 같은 순서로 상태 복원을 구현한다.

1. 내비게이션 상태를 `NavigationModel`이라는 타입으로 캡슐화하기
2. `NavigationModel`을 `Codable`로 만들기
3. `SceneStorage`를 사용하여 모델을 저장하고 복원하기

### 1. NavigtionModel 타입 만들기

```swift
class NavigationModel: ObservableObject {
    @Published var selectedCategory: Category?
    @Published var path: [Recipe] = []
}
```

`NavigationModel` 클래스를 만들고, `ObservableObject`를 채택한다. 이 객체는 여러 View에 흩어져 있던 내비게이션 상태를 한곳에서 관리한다.

State들을 이 모델 객체로 옮기고, 더 이상 SwiftUI View 내부의 저장 프로퍼티로 관리하지 않으므로 Property Wrapper도 `@State`에서 `@Published`로 변경한다.

그리고 NavigationModel 인스턴스를 보관하기 위해 `@StateObject`를 추가하고, 기존 코드가 이 새로운 모델을 사용하도록 수정한다.

```swift
@StateObject private var navModel = NavigationModel()

var body: some View {
    NavigationSplitView {
        List(Category.allCases, selection: $navModel.selectedCategory) { category in
            NavigationLink(category.localizedName, value: category)
        }
        .navigationTitle("Categories")
    } detail: {
        NavigationStack(path: $navModel.path) {
            RecipeGrid(category: navModel.selectedCategory)
        }
    }
}
```

### 2. Codable 만들기

Swift는 `Codable` 구현을 자동으로 생성할 수 있지만, 여기서는 `Recipe` 전체가 아니라 상태 복원에 필요한 Identifier만 저장하기 위해 직접 구현한다.

{{< callout type="note" title="NavigationModel을 Codable로 만들어도 될까?" >}}
이 예제에서는 세션의 흐름에 맞춰 `NavigationModel`이 내비게이션 상태의 보관과 인코딩까지 함께 담당한다.

실제 앱에서는 도메인 모델과 복원 모델의 변경 주기가 다를 수 있으므로, 상태 저장용 타입을 별도로 두는 편이 더 명확할 수도 있다. 여기서는 `SceneStorage`에 저장할 데이터의 형태를 설명하기 위해 한 타입에 함께 작성했다.
{{< /callout >}}

```swift
class NavigationModel: ObservableObject, Codable {
    @Published var selectedCategory: Category?
    @Published var path: [Recipe] = []
    
    enum CodingKeys: String, CodingKey {
        case selectedCategory
        case recipePathIDs
    }
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(selectedCategory, forkey: .selectedCategory)
        try container.encode(path.map(\.id), forkey: .recipePathIds)
    }
    required init(from decoder: Decoder) throws {
        let container = try decoder. container (keyedBy: CodingKeys.self)
        self. selectedCategory = try container.decodelfPresent (
            Category. self, forkey: .selectedCategory)
        let recipePathIds = try container.decode([Recipe.ID].self, forkey: .\recipePathIds)
        self path = recipePathIds. compactMap { DataModel.shared[$0] }
    }
    var jsonData: Data? { ... }
}
```

`path`에는 `Recipe` 전체가 아니라 `Recipe`의 Identifier만 저장한다. `encode` 메소드에서 keyed container를 만들고, 선택된 `Category`를 저장한다.

다음으로 Recipe path의 Identifier들을 저장한다.

이렇게 하면 모델의 전체 데이터를 저장하지 않고도 내비게이션 경로를 복원할 수 있다.

### 3. SceneStorage

NavigationModel을 저장하기 위한 `SceneStorage`를 추가한다. SceneStorage는 자신의 값을 자동으로 저장하고 복원한다.

```swift
@StateObject private var navModel = NavigationModel()
@SceneStorage("navigation") private var data: Data?

var body: some View {
    NavigationSplitView { ... }
}
```

새로운 Scene이 생성될 때 저장된 값이 없으면 `nil`이고, 기존 Scene을 복원할 때는 `SceneStorage`의 값이 복원되도록 SwiftUI가 관리한다.

이 기능을 사용해서 `NavigationModel`을 저장하겠다.

View에 `task` modifier 추가하기

```swift
@StateObject private var navModel = NavigationModel()
@SceneStorage("navigation") private var data: Data?

var body: some View {
    NavigationSplitView { ... }
        .task {
            if let data = data {
                navModel.jsonData = data
            }
            for await _ in navModel.objectWillChangeSequence {
                data = navModel.jsonData
            }
        }
}
```

`objectWillChangeSequence`를 통해 `NavigationModel`의 변경 사항을 계속 관찰하는 비동기 for 루프를 시작한다. `NavigationModel`이 변경될 때마다 루프가 실행된다.

따라서 루프 안에서 `NavigationModel`을 `SceneStorage`에 계속 저장하면 된다.

## 정리

- `List`와 새로운 `NavigationSplitView`, `NavigationStack`은 서로 함께 사용하도록 설계되었다.
- `NavigationStack`을 사용할 때 `navigationDestination`은 Stack 안이나 그 하위 View에 둘 수 있다. 하위 View에서 선언된 destination도 해당 Stack의 destination 매핑에 포함된다.
- `NavigationLink` 근처에 destination을 두면 흐름을 읽기 쉽지만, Lazy Container 안에 destination을 두면 destination 등록 시점이 불명확해질 수 있으므로 안정적인 상위 View에 두는 편이 좋다.
- 여러 컬럼을 사용하는 앱이라면 처음부터 `NavigationSplitView`를 기준으로 구조를 잡는 편이 좋다. 좁은 화면에서는 SwiftUI가 이를 단일 컬럼 형태로 바꿔 표시할 수 있기 때문이다.
