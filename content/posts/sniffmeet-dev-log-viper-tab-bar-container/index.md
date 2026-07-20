---
title: "SniffMEET. UITabBarController VIPER 컨테이너로 다루기"
date: 2024-11-11

categories:
  - Project
series:
  - SniffMEET
tags:
  - iOS
  - UIKit
  - UITabBarController
  - VIPER

draft: false
original: "notion-export/블로그 이관/SniffMEET/UITabBarController VIPER 아키텍처에서 사용하기 355ade8f3765831c943881c7a7ce0b3c.md"
---

VIPER 모듈을 사용하더라도, 직접 탭 바를 구현하지 않는 이상 `UITabBarController`는 사용해야 한다. 일반적인 VIPER 화면처럼 View, Presenter, Interactor, Router를 모두 갖춘 독립 모듈로 보기엔 애매한 것 같다. 

특히 Interactor는 여기서 아무 의미가 없어보이고, Router는 `UITabBarController`에 내장되어 있으니까...

## 모듈 빌더

router, interactor를 생성하고 이를 가지고 있는 presenter를 생성해서 뷰에 집어넣는 방식

`HomeModuleBuilder`는 Home 화면에 필요한 VIPER 구성 요소를 한 곳에서 조립한다. ViewController를 만들고, Router와 Interactor를 생성한 뒤 Presenter에 주입한다. 마지막으로 NavigationFactory를 통해 화면을 `UINavigationController`로 감싸서 반환한다.

```swift
class HomeModuleBuilder {
    static func build(usingNavigationFactory factory: NavigationFactory) -> UINavigationController {
        let view = HomeViewController()
        view.title = "SniffMeet"
        
        let router = HomeRouter(view: view)
        let interactor = HomeInteractor(service: StubService.shared, database: RealmDatabase.shared)
        view.presenter = HomePresenter(view: view, router: router, interactor: interactor)
        
        return factory(view)
    }
}
```

## 탭 바 추가하기

탭바도 하나의 Scene으로 판단

다만 여기서 Scene이라는 말은 비즈니스 로직을 가진 화면 모듈이라는 의미보다는, 여러 하위 모듈을 묶는 앱 진입점 혹은 컨테이너에 가깝다. 각 화면은 기존처럼 ModuleBuilder가 View, Router, Interactor, Presenter를 조립하고, 탭바는 이 화면 모듈들을 다시 한 번 묶는 상위 조립 계층으로 동작한다.

### 탭 바 추가

탭바에 들어갈 화면들은 튜플로 묶어서 전달한다. `GroceryTabBarController`는 전달받은 하위 화면들을 `viewControllers`에 넣어 UIKit의 탭 구조로 만든다.

```swift
typalias GroceryTabs = (
    home: UIViewController,
    cart: UIViewController,
    profile: UIViewController
)

class GroceryTabBarController: UITabBarController {
    init(tabs: GroceryTabs) {
        super.init(nibName: nil, bundle: nil)
        viewControllers = [tabs.home, tabs.cart, tabs.profile]
    }
}
```

### 탭 바 빌더 추가

`TabBarModuleBuilder`는 탭바 화면을 만드는 진입점 역할을 한다. 하위 모듈 목록을 받아 `TabBarRouter.tabs(usingSubmodules:)`에서 탭 아이템이 설정된 화면 목록으로 바꾸고, 이를 `GroceryTabBarController`에 넘긴다.

```swift
class TabBarModuleBuilder {
    static func build(usingSubmodules submodules: TabBarRouter.Submodules) -> UITabBarController {
         let tabs = TabBarRouter.tabs(usingSubmodules: submodules)
         let tabBarController = GroceryTabBarController(tabs: tabs)
         return tabBarController
    }
}
```

### 탭 바 라우터 추가

여기서 TabBarRouter는 일반적인 화면 전환 라우터라기보다, 각 하위 모듈에 tabBarItem을 설정하고 UITabBarController에 들어갈 탭 목록을 구성하는 역할에 가깝다.

`tabs(usingSubmodules:)` 메소드는 각 하위 화면에 `UITabBarItem`을 붙인 뒤, 탭바 컨트롤러가 받을 수 있는 `GroceryTabs` 형태로 다시 반환한다. 즉, 화면을 새로 만드는 것이 아니라 이미 만들어진 VIPER 모듈에 탭바 표현 정보를 추가하는 단계다.

```swift
class TabBarRouter {
    var viewController: UIViewController
    var submodules: Submodules
    typealias Submodules = (
        home: UIViewController,
        cart: UIViewController,
        profile: UIViewController
    )
    
    init(viewController: UIViewController, submodules: Submodules) {
        self.viewController = viewController	
        self.submodules = submodules
    }
}

extension TabBarRouter {
    static func tabs(usingSubmodules submodules: Submodules) -> GroceryTabs {
        let homeTabBarItem = UITabBarItem(title: "aaa", image: , tag: 11)
        let cartTabBarItem = UITabBarItem(title: "bbb", image: , tag: 11)
        let prftTabBarItem = UITabBarItem(title: "ccc", image: , tag: 11)
        
        submodules.home.tabBarItem = homeTabBarItem
        submodules.cart.tabBarItem = cartTabBarItem
        submodules.profile.tabBarItem = profileTabBarItem
        
        return (
            home: submodules.home,
            cart: submodules.cart,
            profile: submodules.profile
        )
    }
}
```

### SceneDelegate에서 조립하기

앱 시작 지점에서는 각 탭에 들어갈 하위 모듈을 먼저 만든다. 이후 `TabBarModuleBuilder`에 하위 모듈들을 넘기면, 탭바 컨테이너가 만들어지고 이 컨트롤러를 초기 화면으로 사용할 수 있다.

```swift
// let initialViewController = HomeModuleBuilder.build(usingNavigationFactory: NavigationBuilder.build)
let submodules = (
    home: HomeModuleBuilder.build(usingNavigation...)
)
let tabBarViewController = TabBarModuleBuilder.build(usingSubmodules: submodules)
```

`UITabBarController`를 VIPER의 일반 화면 모듈처럼 다루기보다는, VIPER 모듈들을 담는 UIKit 컨테이너로 두는 편이 자연스럽다. 각 탭의 내부 로직은 개별 VIPER 모듈이 담당하고, 탭바는 모듈 조립과 탭 전환 구조만 담당하도록 역할을 제한한다.
