---
title: "Software Engineering. DI와 DIP"
date: 2025-03-27

categories:
    - Software Engineering
series:
tags:
    - Dependency Injection
    - DIP
    - SOLID

draft: false
original: "notion-export/블로그 이관/Article/의존성 주입 fbaade8f376582b282a501a2586d7bbb.md"
---

## 의존성 주입(Dependency Injection)

의존성 주입은 객체가 필요한 의존성을 내부에서 직접 생성하지 않고 외부에서 전달받는 방식이다. 별도의 DI 프레임워크나 주입 전용 객체가 반드시 필요한 것은 아니다. 생성자를 통해 객체를 전달하는 것만으로도 의존성 주입이 된다.

## 의존의 의미

> `A → B`: `A`가 `B`에 의존한다.
> 

`A`가 동작하기 위해 `B`의 타입이나 기능을 사용한다면 `A`는 `B`에 의존한다. `B`의 공개 인터페이스가 바뀌면 `A`도 영향을 받을 수 있다.

다음 코드에서 `Greeter`는 구체 타입인 `EnglishGreetingProvider`를 직접 생성한다.

![Screenshot 2024-09-29 at 4.21.47 PM.png](/images/se-dependency-injection/image-001.png)

```swift
final class EnglishGreetingProvider {
    func greeting() -> String {
        "Hello, World!"
    }
}

final class Greeter {
    private let provider = EnglishGreetingProvider()

    func greet() {
        print(provider.greeting())
    }
}
```

이 구조에서는 구현을 교체하거나 테스트 대역을 사용하려면 `Greeter`를 직접 수정해야 한다.

## DI와 DIP의 관계

DIP(Dependency Inversion Principle)는 다음 두 원칙을 말한다.

- 상위 모듈은 하위 모듈에 의존해서는 안 된다. 둘 다 추상화에 의존해야 한다.
- 추상화는 세부사항에 의존해서는 안 된다. 세부 사항은 추상화에 따라 달라져야 한다.

DI와 DIP는 같은 개념이 아니다. DI는 의존성을 전달하는 방법이고, DIP는 의존성 방향에 관한 설계 원칙이다. 구체 타입을 외부에서 주입하면 DI는 적용했지만 DIP는 적용하지 않았을 수도 있다. 추상화에 의존하도록 만들고 구현체를 주입하면 두 개념을 함께 적용할 수 있다.

![Screenshot 2024-09-29 at 4.25.20 PM.png](/images/se-dependency-injection/image-002.png)

```swift
protocol GreetingProviding {
    func greeting() -> String
}

struct EnglishGreetingProvider: GreetingProviding {
    func greeting() -> String {
        "Hello, World!"
    }
}

final class Greeter {
    private let provider: any GreetingProviding

    init(provider: any GreetingProviding) {
        self.provider = provider
    }

    func greet() {
        print(provider.greeting())
    }
}

let greeter = Greeter(provider: EnglishGreetingProvider())
greeter.greet()
```

`Greeter`는 구체 구현을 알지 못하고 `GreetingProviding`이라는 계약에만 의존한다. 실제 구현은 외부에서 생성자 주입으로 전달한다.

## 의존성 주입의 장단점

### 장점

- 구현체와 테스트 대역을 쉽게 교체할 수 있다.
- 객체가 필요한 의존성이 생성자에 드러난다.
- 객체 생성과 사용의 책임을 분리할 수 있다.

### 단점

- 프로토콜과 조립 코드가 늘어날 수 있다.
- 단순한 객체까지 무조건 추상화하면 구조가 실제 요구사항보다 복잡해질 수 있다.
