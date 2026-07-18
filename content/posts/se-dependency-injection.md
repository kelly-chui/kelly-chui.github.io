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

draft: true
original: "notion-export/블로그 이관/Article/의존성 주입 fbaade8f376582b282a501a2586d7bbb.md"
---

## 의존성 주입 (Dependency Injection)

메인 모듈이 직접 다른 하위 모듈에 대한 의존성을 주기보다는 중간에 의존성 주입자가 이 부분을 가로채 메인 모듈이 간접적으로 의존성을 주입하는 방식

## 의존의 의미

> `A → B`: `A`가 `B`에 의존한다.
> 

`B`가 변하면 `A`에 영향을 끼치는 관계 (`A`도 변경이 되는 관계)

ex) 

- `B`의 멤버 이름이 변하면, `A`에서 사용하고 있는 모든 `B`의 멤버 이름을 바꿔야함

- `B`의 메소드 동작이 달라지면, `B`의 메소드를 사용하는 `A`의 메소드들의 동작도 달라짐

![Screenshot 2024-09-29 at 4.21.47 PM.png](/images/se-dependency-injection/image-001.png)

```swift
class B {
    func hello { print("Hello, World!") }
}

class A {
    func hello { B().hello } 
    // B의 hello 메소드 명이 바뀌면 이 코드도 바뀌어야 한다.
    // B의 hello 메소드 동작이 바뀌면 이 메소드의 동작도 바뀐다.
}
```

### DI를 적용한다 ≈ DIP를 적용한다.

DIP: 의존성 역전 법칙
- 상위 모듈은 하위 모듈에 의존해서는 안 된다. 둘 다 추상화에 의존해야 한다.
- 추상화는 세부사항에 의존해서는 안 된다. 세부 사항은 추상화에 따라 달라져야 한다.

더 이상 `A`가 `B`에 의존하지 않고 `C`에 의존하게 되고, `B`가 `C`에 의존하게 됨. (`C`는 인터페이스 혹은 프로토콜)

`B`의 화살표 방향을 보면 역전된 것을 알 수 있음

![Screenshot 2024-09-29 at 4.25.20 PM.png](/images/se-dependency-injection/image-002.png)

```swift
protocol C {
    func printHello()
}

class B: C { // C 채택
    func printHello() {
        hello()
    }
    
    func hello { print("Hello, World!")
}

class A {
    private let c: C
    
    init(c: C) {
        self.c = c
    }
    
    func hello { c.printHello }
    // B의 hello 메소드의 이름이 바뀌어도 이 코드를 직접 바꿀 필요가 없어진다.
    // B의 printHello()의 내부 구조만 바꾸면 되니까
}

let a = A(c: B()) // 이니셜라이저를 통한 의존성 주입
a.hello() // Hello, World!
```

## 의존성 주입의 장단점

### 장점

- 외부에서 모듈을 생성하여 집어넣는 구조가 되기 때문에 모듈들을 쉽게 교체할 수 있는 구조가 된다.
- 단위 테스팅과 마이그레이션이 쉬워진다.
- 애플리케이션 의존성 방향이 좀 더 일관되어 코드를 추론하기가 쉬워진다.

### 단점

- 코드의 절대적인 양이 늘어남 (코스트가 늘어남)
