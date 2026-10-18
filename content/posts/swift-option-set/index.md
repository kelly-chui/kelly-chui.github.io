---
title: "Swift. OptionSet을 이용한 비트마스킹"
date: 2026-08-23T15:23:07+09:00

categories:
  - Swift
series:
tags:
  - Bit Masking
  - Bitwise Operation
features:
  - katex

draft: false
original: ""
---

[LeetCode 3116]({{< relref "ps/2026/ps-leetcode-3116-kth-smallest-amount-with-single-denomination" >}})을 풀면서 비트마스킹을 다시 한번 봐야 했다. (문제 자체는 DFS로 풀었다.)

예전에 비트마스킹을 공부하면서 Swift에서 비트마스킹을 추상화한 자료구조 비슷한게 있었던 것이 기억나는데, 이번 기회에 한번 정리했다.

비트 연산 자체와 비트마스크로 집합을 구현하는 방법은 [Algorithm. Bit masking]({{< relref "posts/cs-algorithm-bit-masking" >}})에 따로 정리되어 있다.

## OptionSet이란

Swift의 `OptionSet`은 여러 플래그를 하나의 값으로 표현하는 프로토콜이다. 

각 옵션을 서로 다른 비트에 배치하기 때문에 여러 옵션을 효율적으로 조합할 수 있고, 일반적인 집합처럼 포함 여부를 확인하거나 옵션을 추가,삭제할 수 있다.

`OptionSet` 프로토콜을 채택하려면 `rawValue`를 선언해야 한다. `rawValue`는 `Int`, `UInt8`처럼 정수 타입이어야 한다.

## 기본 구현

각 옵션은 1, 2, 4, 8처럼 하나의 비트만 켜진 값을 사용한다. Swift의 비트 시프트 연산자 `1 << n`을 사용하면 쉽게 만들 수 있다.

```swift
struct Features: OptionSet {
    let rawValue: Int

    static let search = Features(rawValue: 1 << 0)
    static let sort = Features(rawValue: 1 << 1)
    static let filter = Features(rawValue: 1 << 2)
}
```

각 옵션은 다음과 같은 비트 값을 가진다.

$$
\begin{aligned}
\text{search} &= 1 \\\\
\text{sort} &= 2 \\\\
\text{filter} &= 4
\end{aligned}
$$

## 옵션 조합과 확인

여러 옵션은 배열 리터럴로 조합할 수 있다.

```swift
let features: Features = [.search, .filter]

features.contains(.search) // true
features.contains(.sort)   // false
```

내부적으로 `search`와 `filter`의 비트가 함께 켜져 있는 상태다. `contains` 외에도 `insert`, `remove`, `union`, `intersection` 같은 집합 연산을 사용할 수 있다.

여러 옵션을 미리 조합한 값도 정의할 수 있다. 배열 리터럴로 선언한 값 역시 하나의 `OptionSet` 값이며, 실제 비트 조합은 `rawValue`에서 확인할 수 있다.

```swift
extension Features {
    static let searchableList: Features = [.search, .sort]
}

Features.searchableList.rawValue // 3
```

```swift
var features: Features = [.search]

features.insert(.sort)
features.remove(.search)

features.contains(.sort) // true
```

## 정리

솔직히 PS에서 부분집합을 순회하거나 비트를 직접 조작해야 하는 경우에는 `Int`를 상태로 사용하는 편이 더 간단하다.

```swift
let mask = 1 << 3
let isOn = (mask & (1 << 3)) != 0
```

반면 여러 상태가 동시에 켜질 수 있고, 각 상태에 이름을 붙여 관리해야 한다면 `OptionSet`이 적합하다. 

`1 << 0`이나 `1 << 1` 같은 비트 값을 사용하는 대신 `.search`, `.sort`처럼 의미가 드러나는 API를 만들 수 있다.

뭔가 '배타적이지 않은 상태들을 관리한다' 라는 부분에서 메소드 체이닝...SwiftUI Modifier와 관련이 있을 것 같아서 찾아보니 실제로 `Edge.Set`에서 `OptionSet`을 쓴다.

하지만 일반 앱 코드에서 배타적이지 않은 상태를 관리할 일이 많진 않은것 같다. `Edge.Set`도 SwiftUI가 `OptionSet`을 구현한 코드고, 우리는 `OptionSet`을 몰라도 쓸 수 있다.

다만, SniffMEET할 때 Supabase API 설계에서 쓸 수도 있었을 것 같다. 쿼리 빌더에서 쿼리의 종류에 따라서 'Table 필요', 'Query 가능', 'Body 필요' 이런 상태들이 있는데, 이런 상태들은 배타적이지 않으니까.

결국 `OptionSet`은 새로운 비트마스킹 알고리즘을 제공하는 타입이라기보다, 비트마스크를 Swift에서 추상화한 프로토콜이다. PS에서 써먹긴 좀 힘들다...

하지만 지금 당장 `OptionSet`을 써야 할 곳이 많이 떠오르지는 않아도 이런 타입을 하나씩 알아갈수록 코드를 설계할 때 선택할 수 있는 표현 방법이 늘어난다. 

SniffMEET 쿼리 빌더도 그 당시에 알았으면 `OptionSet` 썼을 것 같은데? 싶다.
