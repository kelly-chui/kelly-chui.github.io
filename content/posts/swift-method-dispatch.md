---
title: "Swift. C부터 시작하는 메소드 디스패치"
date: 2025-05-31

categories:
  - Swift
series:
  - Article
tags:
  - C
  - C++
  - Method Dispatch
  - Objective-C
  - Vtable

draft: false
original: "https://junmusu.tistory.com/174"
---

## Introduction

메소드 호출이란 과연 무엇일까? 우리가 평소에 사용하는 메소드 호출은 내부적으로 어떻게 동작하는지 궁금해진 적이 있다. C++로 PS를 풀 때 가끔 함수 포인터를 써야 하는 경우가 생기는데, Swift에서 클로저를 이용하는 것과 비슷하지만 주변 값을 캡처할 수 없다는 특징이 있다. 함수 포인터는 C에도 존재하는 개념이므로, 다음과 같이 생각이 뻗어나갔다.

> 함수 포인터와 C 스타일 스트럭처를 사용하면 C언어에서도 OOP 스타일의 메소드가 구현 가능할 것 같다.

생각이 계속 확장되다 보니 실제 OOP 언어의 클래스 구현도 이런 방식으로 되어있지 않을까? 라는 생각에 도달했고, 메소드 디스패치를 포함해서 여러 개념들을 이어서 생각해볼 수 있었다.

이 글의 키워드는 다음과 같다.

  - 함수 포인터
  - 클로저
  - 캡처
  - 메모리 구조

## What is a function pointer?

모든 것은 C에서 시작한다. C에서 함수 포인터란 함수가 저장되어 있는 코드 영역의 주소를 가리키는 포인터이다. 아래는 변수 포인터 `int * var_pointer`와 함수 포인터 `int (*func_pointer)`가 각각 가리키는 영역을 나타내는 그림이다.

![](/images/swift-method-dispatch/image-001.png)

## OOP in C

C는 주로 절차적(Procedural) 프로그래밍 언어라고 소개된다. C에도 스트럭처가 존재하지만, 이 스트럭처는 단순히 여러 변수를 묶는 정도의 역할밖에 하지 못한다. 하지만 포인터는 단순히 ‘메모리 주소 값’을 저장하는 변수이기 때문에 C 스트럭처에도 충분히 함수 포인터를 저장할 수 있다.

아래 코드는 자기 자신을 소개하는 함수인 `intro_hgd`를 구현하고, 이 함수를 가리키는 포인터 `intro`를 멤버로 포함하는 C 스트럭처다.

```c
#include <stdio.h>

typedef void (*Method)(struct HGD*);

struct HGD {
    char name[10];
    Method intro;
};

void intro_hgd(struct HGD* self) {
    printf("My name is %s\n", self->name);
}

int main() {
    struct HGD me = {"Kelly", intro_hgd}; // 함수 이름은 곧 함수 포인터
    me.intro(&me); // "My name is Kelly"
    return 0;
}
```

`me.intro(&me);` 처럼 마치 C 스트럭처가 메소드를 가지고 있고, 이 메소드를 호출한 것 처럼 사용할 수 있게 되었다. 우리가 C++이나 Swift에서 쓰는 메소드와 다르게 약간 다른 점이 있다면 파라미터로 자기 자신을 넘겨줘야 한다. 이는 `intro_hgd`이 결국 외부 함수라서 자기 자신(self)를 캡처하지 못하기 때문이다. (우리는 그냥 함수 포인터로 외부 함수를 호출한 것이기 때문에)

> Python이 클래스 메소드를 선언할 때 self를 쓰게 하는 건 단순한 문법적 특징이다. 파이썬 메소드는 캡처를 아주 잘 한다.

## introducing a vtable

C++, Objective-C의 클래스도 C 스트럭처 기반으로 구현되었으며, 위의 방법과 유사한 방식으로 클래스와 메소드를 구현한다. 차이점은 특히 C++은 클래스 내부에 있는 모든 메소드를 함수 포인터 배열의 형태로 관리한다. 이것은 C에서 함수 포인터 배열을 이용해 메소드를 관리하는 구조와 유사하다.

아래 코드는 함수 포인터 배열을 통해서 함수 포인터를 관리하는 C 스트럭처를 구현한 코드이다.

```c
#include <stdio.h>

enum HGDMethodIndex {
    HGD_INTRO_METHOD = 0,
    HGD_METHOD_COUNT
};

struct HGD;
typedef void (*HGDMethod)(struct HGD*);

struct HGD {
    char name[10];
    HGDMethod * vtable;  // 메소드 테이블 (함수 포인터 배열)
};

// 메소드 구현
void hgd_intro(struct HGD* self) {
    printf("My name is %s\n", self->name);
}

HGDMethod HGD_VTABLE[HGD_METHOD_COUNT] = {
    [HGD_INTRO_METHOD] = hgd_intro
};

int main() {
    struct HGD me = {"Kelly", HGD_VTABLE};
    me.vtable[HGD_INTRO_METHOD](&me); // "My name is Kelly"
    return 0;
}
```

위 코드는 `vtable`에서 직접 함수 포인터를 꺼내오는 방식으로 메소드를 호출하는 방법을 사용한다. 하지만 Swift, Python, C++ 등 객체 지향 언어들은 이 과정이 추상화 되어있다. 즉, vtable 안에 있는 함수 포인터를 직접 꺼내 쓰지 않고, 런타임 혹은 컴파일 타임에 자동으로 함수 포인터를 찾아주는 방식으로 메소드 호출을 구현합니다. 이 과정을 **디스패치** 라고 한다.

여기서 C++와 Objective-C의 방법이 조금 다르다.

- C++ 은 vptr을 쓴다. 객체 내부에 `vptr`이라는 포인터를 숨겨놓고, vtable에서 해당 포인터가 가리키는 메소드의 주소를 가져오는 방식을 쓴다.
- Objective-C는 메소드 이름을 `selector`라는 고유한 식별자로 변환한다. 이 selector를 통해서 런타임에 동적으로 함수 포인터를 찾아 호출하는 방식을 사용한다.

## Dispatch in Objective-C

C++보다는 Objective-C의 방식에 더 포커싱을 맞춰보자. UIKit에서 버튼 액션 설정할 때 아직도 selector를 써야하는 경우가 있다. Objective-C는 C++스타일의 vtable을 사용하지 않지만 ‘함수 포인터 배열’이라는 개념은 유지된다. Objective-C의 메소드 디스패치 과정을 설명하기 전에 최대한 간략화한 메소드 구조를 살펴보자.

```c
typedef void (*IMP)(void*); // 함수 포인터에 별칭(IMP) 설정
typedef struct {
    SEL sel; // 셀렉터(식별자)
    IMP imp; // 실제 함수 구현(함수 포인터)
} Method;
```

Objective-C의 메소드는 하나의 C 스트럭처로 표현할 수 있다. 이 스트럭처에는 `sel`, `imp` 두 개의 멤버 변수가 있는데, 각각 식별자와 함수 포인터를 의미한다.

다음은 매우 간략화한 객체의 구조이다. 함수 포인터 배열을 볼 수 있다.

```cpp
typedef struct {
    const char* name; // 인스턴스 이름
    Method* methods; // 함수 포인터 배열
    int method_count; // 메소드 개수 (C에서 포인터로 표현된 배열은 개수를 알 수 없으니까)
} Object;
```

이제 대략적으로 구조를 추측했으니, Objective-C의 디스패치 과정을 살펴보자.
1. 메소드를 호출한다.
2. 함수 포인터 배열에서 호출한 메소드와 같은 식별자 `sel`을 가진 `Method` 객체를 찾는다. 
    1. 이걸 수행하는 함수를 실제로는 `objc_msgSend`라고 한다.
3. 찾았으면 `imp` 에 저장되어있는 함수 포인터가 가리키는 함수 실행

즉, 메소드 호출 과정은 selector를 통해 메소드를 식별하고, `objc_msgSend`가 이를 받아 해당 메소드의 IMP(함수 포인터)를 찾아서 실행하는 흐름이다.

> 버튼 액션에서 selector를 사용하는 이유는 UIKit이 여전히 Objective-C 런타임에서 동작하기 때문이다.
>
> 버튼을 눌렀을 때 어떤 메소드를 호출할지는 Objective-C의 다이나믹 디스패치를 이용하기 때문에 `@objc`로 키워드를 적어줘서 메소드를 Objective-C 런타임에 등록해야 한다. 왜 이걸 명시적으로 해줘야 할까? 
>
> Swift가 컴파일 타임에 모든 것을 알고 싶어하는 정적 타입 언어이기 때문이다. 따라서 이렇게 예외적인 상황에서는 이 메소드가 Objective-C 스타일로 호출된다는 것을 명확하게 해주는 것이 필요하다.

## Why is a closure a first class object?

인과 관계가 약간 뒤바뀐 것일 수도 있지만, Swift에서 클로저가 1급 객체인 이유를 이제 대략 감을 잡을 수 있을 것 같다. 위 글에서 이미 Objective-C에서 부터 메소드는 ‘단일 함수 포인터’가 아닌 C 스트럭처로 감싸진 하나의 ‘객체’ 인 것을 확인했다.

C 코드는 이제 그만 보고, Swift 코드를 하나 작성해보겠다. 많은 언어에서 캡처 개념을 익힐 때 예제로 사용하는 adder 코드다.

```swift
func makeAdder(_ x: Int) -> (Int) -> Int {
    var total = 0
    return { y in
        total += x + y
        return total
    }
}
let add5 = makeAdder(5)
print(add5(3)) // 8
print(add5(3)) // 16
```
 
`makeAdder(_:)`함수는 `(Int) -> Int` 타입 클로저를 리턴하는 함수이다. 동시에 `total`, `x` 두 변수를 캡처한다. `makeAdder(_:)`함수는 변수 `add5`에 `{ y in total += x + y; return total }`이라는 클로저를 할당하고 리턴된다.

일반적으로 함수가 리턴(종료)되면, 메모리의 스택 영역에서 pop되면서 `total`이나 `x`와 같은 로컬 변수들도 같이 해제되어야 하는데. add5를 호출될 때 마다. 마치 `total`과 `x`가 어딘가에 저장되어 있는 것 처럼 동작한다. 이게 바로 클로저의 캡처 기능 덕분이다. 여기서 중요한 사실을 하나 추론해 낼 수 있다.

> 캡처된 변수는 함수가 종료된 이후에도 존재해야 하므로 Stack이 아닌 Heap에 할당된다.

그런데 여기서 한 가지 더 생각해보자. 함수를 불러오기 위해선 함수 포인터를 사용해야 할 것이고, Swift 이므로 Objective-C의 selector는 더 이상 필요하지 않다. 하지만 캡처한 컨텍스트를 저장할 프로퍼티는 필요하다.

이 즈음에서 Swift에서 클로저 객체의 구현을 간략하게 추측해볼 수 있다. 여기서 `HeapBox`라는 이름은 캡처한 값을 힙에 저장하여 생명주기를 유지하는 개념적인 저장소를 의미한다.

```swift
final class ClosureObject {
    let functionPointer: RawPointer // 함수 포인터
    let capturedContext: AnyObject // 클로저가 캡처한 변수들을 힙에 저장하기 위한 객체
}
```

![](/images/swift-method-dispatch/image-002.png)

`ClosureObject`는 메모리의 주소값을 저장하고 있는 `functionPointer`와 힙에 있는 스트럭처(혹은 클래스)를 가리키는 `capturedContext`를 저장하고 있는 클래스이다.

`functionPointer`는 함수 자체를 가리키기 때문에 코드영역, `capturedContext`는 캡처한 환경을 가리키기때문에 힙 영역에 할당되어 있다. 물론 실제 Swift 클로저는 클래스로 구현되어 있지 않지만 Function Type의 생김새를 클래스로 유추해 보고, 왜 Swift에서 함수 혹은 클로저가 변수에 할당되고, 파라미터로 넘겨줄 수 있는지를 직관적으로 이해할 수 있다.

### Dynamic Dispatch in Swift

Swift가 아무리 정적 타입 언어라고 하더라도, 결국엔 `final` 없이 서브클래싱을 하거나, 프로토콜로 실제 구현이 숨겨진 경우엔 다이나믹 디스패치를 해야 한다. 사실 프로그래머가 직접 작성한 메소드는 스태틱 디스패치만큼 다이나믹 디스패치를 하거나 혹은 더 많이 할 수도 있다고 생각한다.

스위프트의 다이나믹 디스패치는 크게 2가지로 분류할 수 있다.

  - 위에서 봤던 VTable 을 이용하는 경우, 대표적으로 오버라이드 된 메소드 호출
  - Witness Table을 이용하는 경우, 대표적으로 프로토콜로 타입이 숨겨진 객체의 메소드 호출


Witness Table을 간단하게 정리하면, 각 프로토콜을 컨폼하는 타입마다 생성되는 함수 포인터의 배열이다. 각 타입마다 프로토콜의 요구사항을 다르게 구현했을 것으로 기대되기 때문에 따로 구분할 필요가 있다. Witness Table은 그 자체만으로도 설명할 내용이 많으므로, 별도의 글에서 자세히 다루기로 하겠다.

## 정리

이 글에서는 함수 포인터에서 시작해서 메소드 디스패치까지 이어지는 과정을 하나의 흐름으로 살펴봤다.

C에서는 함수 포인터를 직접 다루고, C++은 vtable을, Objective-C는 selector와 `objc_msgSend`를 이용해 적절한 함수를 찾아 호출한다. Swift 역시 문법은 훨씬 추상화되어 있지만, 결국에는 적절한 함수 구현을 찾아 호출한다는 점에서는 같은 아이디어를 공유한다.

클로저 역시 같은 관점에서 바라볼 수 있다. 함수 포인터만으로는 캡처한 상태를 유지할 수 없기 때문에, 함수와 캡처한 컨텍스트를 함께 묶은 하나의 객체처럼 동작해야 한다. 그래서 클로저는 변수에 저장하거나 다른 함수에 전달할 수 있는 1급 객체가 될 수 있다.

정리하면 다음과 같다.

- 함수 포인터는 메소드 디스패치를 이해하는 가장 단순한 출발점이다.
- C++과 Objective-C는 서로 다른 방식으로 적절한 함수 포인터를 찾는다.
- Swift의 클로저는 함수와 캡처한 컨텍스트를 함께 관리하는 객체처럼 이해할 수 있다.
- Swift의 Dynamic Dispatch도 결국 적절한 함수 구현을 찾아 호출하는 과정이다.

결국 메소드 호출도 적절한 함수를 찾아 실행하는 과정이다. 언어마다 그 방법은 다르지만, 함수 포인터라는 가장 단순한 개념에서 출발하면 그 흐름을 훨씬 자연스럽게 이해할 수 있다.
