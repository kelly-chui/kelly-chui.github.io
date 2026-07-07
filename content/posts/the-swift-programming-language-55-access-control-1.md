---
title: "[Swift] Access Control(액세스 컨트롤) - 1"
date: 2025-01-28
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Access Control"]
weight: 55

draft: false
original: "https://junmusu.tistory.com/154"
---

![](/images/the-swift-programming-language-55-access-control-1/image-001.dat)

# Access Control

액세스 컨트롤은 다른 소스 파일이나 모듈에서 코드의 일부분에 접근하는 것을 제한한다. 이 기능은 코드의 구체적인 구현 사항을 숨기면서 해당 코드에 접근하고 사용할 선호하는 인터페이스를 지정할 수 있게 해준다.

개별 타입들 (클래스, 스트럭처, 이뉴머레이션) 뿐만 아니라 해당 타입에 포함된 프로퍼티, 메소드, 이니셜라이저, 서브스크립트에도 접근 레벨을 지정할 수 있다. 프로토콜도 특정 컨텍스트로 제한할 수 있으며, 글로벌 상수, 변수, 함수도 가능하다.

다양한 레벨의 액세스 컨트롤을 제공하는 것에 더해서, Swift는 일반적인 시나리오에 대해서 기본 액세스 레벨을 제공해서 명시적으로 액세스 컨트롤 레벨을 지정할 필요를 줄였다. 만약 싱글 타겟 앱을 작성하고 있다면, 아마도 명시적인 액세스 컨트롤을 지정할 필요가 없을 것이다.

> NOTE  
> 액세스 컨트롤을 적용할 수 있는 코드의 다양한 요소들(프로퍼티, 타입, 함수 등)을 간결성을 위해서 아래 섹션에서부터는 “엔티티”라고 하겠다.

## Modules and Source Files

Swift의 액세스 컨트롤 모델은 모듈과 소스 파일의 개념을 기반으로 한다.

_모듈(module)_ 은 코드의 단일 배포 단위이다—하나의 단위로 빌드되며 다른 모듈에서 Swift의 `import`키워드를 통해 가져올 수 있는 프레임워크나 애플리케이션.

Xcode에서 각각의 빌드 타겟(앱 번들이나 프레임워크 같은)은 Swift에서 별개의 모델로 다뤄진다. 만약 앱 코드의 일부를 스탠드 얼론 프레임워크로 묶으면—아마도 캡슐화하고 여러 애플리케이션에서 재사용 하기 위해—그 프레임워크 내부에서 정의한 모든 것은 앱 내부나 혹은, 다른 프레임워크 내부에서 가져오고 사용할 때 별개의 모듈의 일부가 된다.

_소스 파일(source file)_ 은 모듈 안의 단일 Swift 소스 코드 파일을 말한다(사실상, 앱 혹은 프레임워크 내부의 하나의 파일을 말한다). 개별 타입들을 분리된 다른 소스 코드 파일에 정의하는 것이 일반적이지만, 하나의 소스 파일은 여러 타입들의 정의나 함수 등을 저장할 수도 있다.

## Access Levels

Swift는 다섯 가지의 다른 _액세스 레벨(access levels)_ 을 제공한다. 이 액세스 레벨은 엔티티가 정의된 소스 파일과 관련이 있고, 또한 그 소스 파일이 소속된 모듈에도 관련이 있다.

  - _Open_ 액세스와 _public_ 액세스는 엔티티가 정의된 모듈의 모든 소스 파일 뿐만 아니라, 해당 모듈을 가져온 다른 모듈에서도 사용할 수 있게 한다. 일반적으로 프레임워크에서 공용 인터페이스를 지정할 때 opend이나 public 액세스를 사용한다. open과 public 액세스의 차이점은 아래에서 설명한다.
  - _Internal_ 액세스는 엔티티가 정의된 모듈의 모든 소스 파일에서 사용할 수 있지만, 해당 모듈의 외부의 소스 파일에서는 사용할 수 없다. 일반적으로 앱이나 프레임워크의 내부적인 구조를 정의할 때 internal을 사용한다.
  - _File-private_ 액세스는 엔티티가 정의된 소스파일 내부에서만 사용할 수 있도록 제한한다. 파일 내부 전체적으로 사용되는 기능의 구체적인 구현을 숨기는데 file-private 액세스를 사용한다.
  - _Private_ 액세스는 엔티티가 감싸여 있는 선언과 같은 파일 내부에 있는 해당 선언의 익스텐션으로 사용을 제한한다. 단일 선언에서만 사용되는 기능의 구체적인 구현을 숨기는데 private 액세스를 사용한다.



Open 액세스는 가장 높은(가장 제한이 없는) 액세스이며, private 액세스는 가장 낮은(가장 제한적인) 액세스 레벨이다.

Open 액세스는 클래스나 클래스 멤버들에만 적용 가능하며, public 엑세스와는 모듈 외부에서 서브클래스와 오버라이드를 허용하는 점이 다르다, 아래 Subclassing 섹션에서 논의한 대로. 클래스를 open으로 명시적으로 표현하는 것은 다른 모듈이 해당 클래스를 슈퍼 클래스로 사용하는 것의 임팩트를 고려했으며, 그에 따라서 클래스의 코드를 설계했다는 것을 나타낸다.

### Guiding Principle of Access Levels

Swift의 액세스 레벨이 따르는 전반적인 지침이 있다: _어떠한 엔티티도 접근 수준이 더 낮은(더 제한적인) 다른 엔티티를 기준으로 정의될 수 없다._

  - public 변수는 internal, file-private, private 타입으로 정의될 수 없다. 그 타입이 public 변수가 사용되는 모든 곳에서 사용 가능하지 않을 수 있기 때문이다.
  - 함수는 파라미터 타입이나 리턴 타입보다 더 높은 액세스 레벨을 가질 수 없다. 해당 함수가 감싸진 코드에서 구성 타입들(주: 파라미터, 리턴 타입)이 사용 가능하지 않은 상황에서 사용될 수 있기 때문이다.



이 지침이 언어의 다양한 방면에 미치는 구체적인 영향은 아래에서 자세히 다룬다.

### Default Access Levels

코드 내부의 모든 엔티티는(이 챕터의 후반부에 다룰 몇 예외를 제외하고는) 명시적으로 액세스 레벨을 지정하지 않으면 기본 액세스 레벨로 internal을 가진다. 결과적으로, 많은 경우에 코드 내부에서 명시적으로 액세스 레벨을 지정할 필요가 없다.

### Access Levels for Single-Target Apps

간단한 싱글 타겟 앱을 작성할 때, 앱의 코드는 일반적으로 앱 내부에서 자체적으로 포함되어 있고, 앱의 모듈 외부에서 사용 가능하게 만들 필요가 없다. 기본 액세스 레벨인 internal은 이 요구사항에 이미 알맞는다. 그러므로 액세스 레벨을 지정할 필요가 없다. 하지만 일부 코드에 file private나 private를 사용하여 앱 모듈 내부의 다른 코드로부터 구체적인 구현을 숨길 수 있다.

### Access Levels for Frameworks

프레임워크를 개발할 때, 해당 프레임워크를 가져온 앱처럼 다른 모듈에서 보고 접근 가능하도록 프레임워크의 공개 인터페이스를 open이나 public을 사용하여 표시하면 된다. 이 공개 인터페이스는 프레임워크의 애플리케이션 프로그래밍 인터페이스(API)가 된다.

> NOTE  
> 프레임워크의 내부적인 구체적인 구현도 여전히 기본 액세스 레벨로 internal을 사용하며, private이나 file private을 사용하여 프레임워크 내부의 다른 코드로부터 숨길 수도 있다. 프레임워크의 API로 사용하고 싶은 엔티티들만 open 혹은 public으로 표시할 필요가 있다.

### Access Levels for Unit Test Targets

유닛 테스트 타겟과 함께 앱을 작성할 때, 앱의 코드를 테스트하기 위해서는 해당 모듈(주: 유닛 테스트 타겟)에서 사용 가능해야 한다. 기본적으로 open이나 public으로 작성된 엔티티만 다른 모듈에서 접근 가능하지만, 유닛 테스트 타겟은 프로덕트 모듈(주: 앱)의 import 선언을 `@testable` 어트리뷰트를 사용하여 표시하고, 테스트 가능하도록 컴파일하면 internal 엔티티에 접근 가능하다.

## Access Control Syntax

엔티티 선언 시작 부분에 `open`, `public`, `internal`, `fileprivate`, 혹은 `private`중 수식어 중 하나를 위치하여 액세스 레벨을 정의할 수 있다.


```swift
public class SomePublicClass {}
internal class SomeInternalClass {}
fileprivate class SomeFilePrivateClass {}
private class SomePrivateClass {}

public var somePublicVariable = 0
internal let someInternalConstant = 0
fileprivate func someFilePrivateFunction() {}
private func somePrivateFunction() {}
```
 

특별히 지정하지 않으면, 앞서 말한 것 처럼 기본 액세스 레벨은 internal이다. 이는 `SomeInternalClass`와 `someInternalConstant`가 액세스 레벨 수식어를 사용하지 않고도 internal 액세스 레벨을 가지도록 작성할 수 있다는 것을 의미한다:


```angelscript
class SomeInternalClass {}              // implicitly internal
let someInternalConstant = 0            // implicitly internal
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
