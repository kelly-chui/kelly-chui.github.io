---
title: "TIL. Aug 13, 2026"
date: 2026-08-13T21:30:00+09:00

categories:
  - TIL
series:
tags:
  - Swift
  - Segment Tree
features:
  - katex

draft: false
original: ""
aliases:
  - /posts/til-2026-08-13/
---

## 오늘 한 내용

- [Data Structure. Segment Tree]({{< relref "posts/cs-data-structure-segment-tree" >}})
- [LeetCode 2213. Longest Substring of One Repeating Character]({{< relref "ps/2026/ps-leetcode-2213-longest-substring-of-one-repeating-character" >}})
- [StackDay. 책임 분리와 타입 분리]({{< relref "posts/stackday-dev-log-separating-responsibility-and-types" >}})

## 배운 내용

### StackDay 통계 계산

`HabitStatistics`를 구현하면서 계산 결과를 표현하는 타입과 계산 로직을 분리했다. 다만 `HabitStatisticsCalculator`가 `HabitStreakCalculator`에 의존하게 되면서, 여러 Calculator가 같은 날짜 정규화와 완료 기록 필터링을 반복하는 문제가 보였다.

타입을 나누는 것만으로 항상 구조가 좋아지는 것은 아니고, 공유하는 계산 맥락까지 함께 살펴봐야 한다는 점을 배웠다. 자세한 고민은 [StackDay 개발일지]({{< relref "posts/stackday-dev-log-separating-responsibility-and-types" >}})에 정리했다.

### actor? class? enum? structure?

`HabitStatisticsCalculator`는 현재 상태를 가지지 않으므로, 인스턴스 생성을 막을 수 있는 `enum`으로 구현해도 된다.

`actor`는 보호할 상태가 없으므로 필요하지 않다. `class`도 마찬가지다.

`class`와 `struct`를 선택할 때는 상태의 유무보다 identity와 reference semantics가 필요한지가 더 본질적인 기준이다. `HabitStatisticsCalculator`에는 둘 다 필요하지 않으므로 `class`를 사용할 이유가 없다. 오히려 MVP 이후 `Habit`마다 적용되는 정책이 다를텐데 있으면 안된다!

현재만 보면 `enum`이 가장 자연스럽지만, 이후 `Calendar`나 계산 정책을 프로퍼티로 가지게 될 가능성이 거의 확정적이다. 이때는 서로 다른 설정을 가진 계산기 인스턴스가 의미를 가지므로 `struct`가 자연스럽다.

아직 모르는 미래를 위해 설계하는 것은 과설계지만, 이미 예정된 변화를 무시하기 위해 YAGNI를 기계적으로 적용할 필요도 없다. 따라서 `struct`로 구현했다.

### Segment Tree

LeetCode 2213을 풀기 위해 Segment Tree를 공부했다. Hint에서 명시적으로 어떤 Segment Tree를 쓰라고 했다.

부분합은 조회는 빠르지만 배열 중간의 원소가 변경되면 이후의 부분합을 다시 계산해야 한다. 반면 Segment Tree는 트리의 높이만큼만 갱신하면 되기 때문에 업데이트도 빠르게 처리할 수 있다.

Heap도 그렇고, 이진 트리 기반 자료구조를 보다 보면 한쪽 연산을 극단적으로 빠르게 만들기보다 탐색이나 갱신 비용을 적당히 평탄하게 만드는 느낌이 있다. 구현이 복잡해서 문제지...

Segment Tree 자체보다 두 노드를 병합하는 연산을 정의하는 게 더 어려웠다. 개념만 봤을 때는 꽤 단순해 보였는데, 막상 문제에 적용하니 노드가 관리해야 할 정보가 많아져 구현이 생각보다 지저분해졌다.

### Swift String의 count는 시간복잡도가 $O(n)$

마찬가지로 LeetCode 2213를 풀다가 계속 타임 리미트에 걸려서 코드 문제를 찾아보니까 스트링의 `count`를 반복문 내부에서 호출하는게 문제였다.

스트링의 `count` 계산 속도가 $O(n)$인 이유는 Swift의 String은 Unicode를 지원한다. `"a"`, `"가"`, `"🐥"`처럼 문자마다 UTF-8에서 차지하는 바이트 수가 다르고, 하나의 Character가 여러 Unicode Scalar로 구성될 수도 있다.

따라서 String.count는 단순히 저장된 바이트 수를 길이로 사용할 수 없고, 실제 Character의 경계를 따라가며 개수를 세어야 하므로 $O(n)$의 시간이 걸린다.

## 내일 할 것

- mibangmunrok AGENTS 최신화하기
- Stackday '습관 생성' 유즈케이스 및 뷰 완성하기.
