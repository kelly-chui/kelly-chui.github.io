---
title: "The Swift Programming Language. Access Control (2)"
date: 2025-01-29
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Access Control"]
weight: 56

draft: false
original: "https://junmusu.tistory.com/155"
---

## Custom Types

커스텀 타입에 대한 명시적인 액세스 레벨을 지정하고 싶으면, 타입을 정의할 때 하면 된다. 새로운 타입은 액세스 레벨이 허용하는 곳이라면 어디에서든 사용할 수 있다. 예를 들어, file-private한 클래스를 정의하면, 그 클래스가 정의된 소스 파일 내부에서 프로퍼티나, 함수의 파라미터 혹은 리턴 타입으로만 사용할 수 있다.

또한 타입의 액세스 컨트롤 레벨은 타입의 _멤버_(프로퍼티, 메소드, 이니셜라이저, 서브스크립트)의 기본 액세스 레벨에도 영향을 끼친다. 만약 타입의 액세스 레벨을 private이나 file private으로 정의했다면, 멤버들의 기본 액세스 레벨도 private이나 file private이 된다. 만약 타입의 액세스 레벨을 internal 이나 public으로 정의했다면(혹은 액세스 레벨을 명시적으로 지정하지 않아 기본 액세스 레벨 internal을 사용한다면), 타입의 멤버의 기본 액세스 레벨은 internal이 된다.

> IMPORTANT  
> public은 기본적으로 public멤버가 아닌 internal 멤버를 가지도록 되어있다. 만약 타입 멤버를 public으로 사용하고 싶다면, 명시적으로 표시를 해줘야한다. 이 요구사항은 타입의 공개 API가 의도적으로 게시한 것임을 보장하고, 타입의 내부 동작이 실수로 인해 공개 API로 나타나는 것을 방지한다.


```swift
public class SomePublicClass {                  // explicitly public class
    public var somePublicProperty = 0            // explicitly public class member
    var someInternalProperty = 0                 // implicitly internal class member
    fileprivate func someFilePrivateMethod() {}  // explicitly file-private class member
    private func somePrivateMethod() {}          // explicitly private class member
}

class SomeInternalClass {                       // implicitly internal class
    var someInternalProperty = 0                 // implicitly internal class member
    fileprivate func someFilePrivateMethod() {}  // explicitly file-private class member
    private func somePrivateMethod() {}          // explicitly private class member
}

fileprivate class SomeFilePrivateClass {        // explicitly file-private class
    func someFilePrivateMethod() {}              // implicitly file-private class member
    private func somePrivateMethod() {}          // explicitly private class member
}

private class SomePrivateClass {                // explicitly private class
    func somePrivateMethod() {}                  // implicitly private class member
}
```
 

### Tuple Types

튜플 타입의 액세스 레벨은 튜플 내부에서 사용하는 타입 중 가장 제한적인 액세스 레벨이 된다. 예를 들어 두 개의 다른 타입으로 튜플을 구성했고, 하나가 internal 액세스 그리고 다른 하나가 private 액세스일 때, 이 튜플 타입의 액세스 레벨은 private이 된다.

> NOTE  
> 튜플 타입은 클래스, 스트럭처, 이뉴머레이션, 그리고 함수와 다르게 독립적인 정의를 가지지 않는다. 튜플 타입의 액세스 레벨은 해당 튜플 타입을 만드는 타입으로 결정되고, 명시적으로 지정할 수 없다.

### Function Types

함수 타입의 액세스 레벨은 함수의 파라미터 타입과 리턴 타입 중 가장 제한적인 액세스 레벨로 계산된다. 만약 함수의 계산된 액세스 레벨이 컨텍스트 기본 값과 일치하지 않는 경우에는 명시적으로 액세스 레벨을 작성해줘야 한다.

아래의 예시는 액세스 레벨 수식어를 붙이지 않고 글로벌 함수 `someFunction()`을 정의한다. 이 함수가 기본 액세스 레벨인 “internal”을 가질 것이라고 예상할 수 있지만, 이 경우에는 그렇지 않다. 실제로 아래에 작성된 `someFunction()`은 컴파일 되지 않는다:


```go
func someFunction() -> (SomeInternalClass, SomePrivateClass) {
    // function implementation goes here
}
```
 

이 함수의 리턴 타입은 위 Custom Types 섹션에서 정의한 커스텀 클래스를 조합한 튜플 타입이다. 이 클래스 중 하나는 internal로 정의되어 있고, 다른 하나는 private으로 정의되어 있다. 그러므로, 해당 튜플의 전체적인 액세스 레벨은 private(튜플을 구성하는 타입 중 가장 낮은 액세스 레벨)이 된다.

함수의 리턴 타입이 private이기 때문에, 함수의 선언이 유효하도록 하려면 반드시 함수의 전체적인 액세스 레벨을 `private` 수식어로 표시해야한다:


```go
private func someFunction() -> (SomeInternalClass, SomePrivateClass) {
    // function implementation goes here
}
```
 

함수의 public 혹은 interanal 유저가 함수의 리턴 타입에서 사용하는 private 클래스를 적합하지 않게 접근할 수 있으므로, `someFunction()`의 정의에서 `public`이나 `internal` 혹은 internal 기본 설정을 사용하여 표시하는 것은 유효하지 않다.

### Enumeration Types

이뉴머레이션의 개별 케이스는 소속된 이뉴머레이션의 액세스 레벨을 받게 된다. 개별 케이스에 다른 액세스 레벨을 정의할 수 없다.

아래의 예시에서, `CompassPoint` 이뉴머레이션은 public이라는 명시적인 액세스 레벨을 가지고 있다. 그러므로 이뉴머레이션 케이스 `north`, `south`, `east`, 그리고 `west`는 public 액세스 레벨을 가지게 된다:


```crystal
public enum CompassPoint {
    case north
    case south
    case east
    case west
}
```
 

#### Raw Values and Associated Values

이뉴머레이션의 정의에서 사용하는 로우 밸류나 어소시에이티드 타입의 타입은 최소한 해당 이뉴머레이션의 액세스 레벨보다 높아야 한다. 예를 들어, internal 액세스 레벨의 이뉴머레이션 타입의 원시 값으로 private 타입을 사용할 수 없다.

### Nested Types

네스티드 타입의 액세스 레벨은 그 타입을 포함하고 있는 타입의 액세스 레벨이 public이 아니면 같다. public 타입 내부에 정의된 네스티드 타입은 자동으로 internal 액세스 타입을 가지게 된다. 만약 public 타입 내부의 네스티드 타입을 공개적으로 사용하게 하려면, 네스티드 타입을 public으로 명시적으로 선언해야 한다.

## Subclassing

컨텍스트에서 접근할 수 있고, 같은 모듈에 있는 클래스를 서브클래스 할 수 있다. 또한 다른 모듈에 정의된 open 클래스도 서브클래스 할 수 있다. 서브클래스는 슈퍼클래스보다 높은 액세스 레벨을 가질 수 없다—예를 들어, internal 슈퍼클래스의 public 서브클래스를 작성할 수 없다.

추가적으로, 동일한 모듈에 정의된 클래스의 경우, 특정 액세스 컨텍스트에서 볼 수 있는 다른 클래스의 멤버(메소드, 프로퍼티, 이니셜라이저, 혹은 서브스크립트)를 오버라이드 할 수 있다. 다른 모듈에 정의된 클래스의 경우에는 open 클래스 멤버를 오버라이드할 수 있다.

오버라이드는 상속된 클래스 멤버를 슈퍼클래스 버전보다 좀 더 쉽게 접근 가능하도록 할 수 있다. 아래의 예시에서 클래스 `A`는 file-private 메소드 `someMethod()`를 가진 public 클래스다. 클래스 `B`는 감소된 액세스 레벨 “internal”을 가진 `A`의 서브클래스이다. 그럼에도 클래스 `B`는 원본 `someMethod()`의 액세스 레벨보다 _높은_ “internal” 액세스 레벨의 `someMethod()`의 오버라이드를 제공한다:


```swift
public class A {
    fileprivate func someMethod() {}
}

internal class B: A {
    override internal func someMethod() {}
}
```
 

슈퍼클래스 멤버에 대한 호출이 가능한 액세스 레벨의 컨텍스트 내부에서 이루어지면(즉, 슈퍼클래스의 file-private 멤버호출을 위해서 같은 소스 파일에 있거나, 슈퍼클래스의 internal 멤버 호출을 위해서 같은 모듈에 있거나), 서브클래스 멤버가 서브클래스 멤버보다 액세스 권한이 낮은 슈퍼클래스 멤버를 호출하는 것도 유효하다:


```swift
public class A {
    fileprivate func someMethod() {}
}

internal class B: A {
    override internal func someMethod() {
        super.someMethod()
    }
}
```
 

슈퍼클래스 `A`와 서브클래스 `B`가 같은 소스 파일에 정의되어 있으므로, `B`의 `someMethod`구현이 `super.someMethod()`를 호출하는 것은 유효하다.

* * *

> 이 포스트는 The Swift Programming Language의 내용을 직접 번역한 내용에 주석을 달아 정리한 것입니다.   
> 원문: The Swift Programming Language (Swift 6.2)
