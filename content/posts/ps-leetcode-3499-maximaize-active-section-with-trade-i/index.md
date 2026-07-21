---
title: "Leetcode 3499. Maximaize Active Section With Trade I"
date: 2026-07-21T10:29:30+09:00

categories:
    - Problem Solving
series:
tags:
    - Greedy
    - Swift

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximize-active-section-with-trade-i>

## 풀이

`'0'`와 `'1'`로만 이루어진 문자열 `s`가 존재하고, 문제에서 주어진 연산을 최대 1번 적용하여 문자열에 있는 `'1'`의 개수를 최대로 만든 뒤 그 개수를 리턴하면 된다.

주어진 연산은 다음과 같다. (순서대로 둘 다 적용해야 한다.)

1. 양 옆이 `'0'`로 둘러싸인 연속된 `'1'` 블록 하나를 선택해서 모두 `'0'`로 바꾼다.
2. 양 옆이 `'1'`으로 둘러싸인 연속된 `'0'` 블록 하나를 선택해서 모두 `'1'`으로 바꾼다.

문제에서 `s`의 양 옆에 `'1'`을 붙이라 했는데, 이때 추가된 `'1'`은 최종 반환값에 포함되지 않는다.

먼저 양 옆에 `'1'`을 붙인 뒤, 연속된 같은 문자를 하나의 블록으로 묶는다.

```text
"0100" -> "101001" -> ["1", "0", "1", "00", "1"]
```

이렇게 만들면 블록은 항상 `'1', '0', '1', '0', ...` 순서로 번갈아 나오므로, 짝수 인덱스는 항상 `'1'` 블록, 홀수 인덱스는 항상 `'0'` 블록이 된다.

연산 1번으로 어떤 `'1'` 블록 하나를 `'0'`으로 바꾸면, 그 블록은 원래 양 옆의 `'0'` 블록과 합쳐져서 하나의 큰 `'0'` 블록이 된다. 이제 이 큰 블록은 (더 바깥쪽에 있는) `'1'` 블록들로 둘러싸여 있으므로, 연산 2번으로 이 블록 전체를 다시 `'1'`로 되돌릴 수 있다.

결과적으로 두 연산을 합치면 선택한 `'1'` 블록의 양 옆에 있던 `'0'` 블록들이 전부 `'1'`으로 바뀌는 효과만 남는다.

따라서 `'1'` 블록마다 "양 옆 `'0'` 블록의 개수 합"을 계산해서 그 최댓값(`delta`)을 구하고, 원래 `s`에 있던 `'1'`의 개수에 더한 것을 리턴하면 된다.

## 코드

```swift
class Solution {
    func maxActiveSectionsAfterTrade(_ s: String) -> Int {
        var blocks: [(char: Character, count: Int)] = []
        var delta = 0
        let t = "1" + s + "1"
        for c in t {
            if let last = blocks.last, last.char == c {
                blocks[blocks.count - 1].count += 1
            } else {
                blocks.append((char: c, count: 1))
            }
        }
        for i in stride(from: 2, to: blocks.count - 1, by: 2) {
            if i == 0 || i == blocks.count - 1 {
                continue
            }
            delta = max(delta, blocks[i - 1].count + blocks[i + 1].count)
        }
        return s.filter { $0 == "1" }.count + delta
    }
}
```