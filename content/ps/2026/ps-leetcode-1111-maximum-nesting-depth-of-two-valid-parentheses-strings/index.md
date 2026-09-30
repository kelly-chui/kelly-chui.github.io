---
title: "LeetCode 1111. Maximum Nesting Depth of Two Valid Parentheses Strings"
date: 2026-09-30T17:01:18+09:00
categories:
  - Problem Solving
series:
tags:
psTags:
  - Stack
features:
  - katex
draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/maximum-nesting-depth-of-two-valid-parentheses-strings>

## 풀이

괄호로 이루어진 유효한 스트링(문제에선 VPS라고 한다) `seq`가 주어진다. `seq`의 각 원소를 두 그룹으로 나누어(서브 시퀀스), 각 그룹이 만드는 서브시퀀스도 모두 VPS가 되게 해야 한다. 이때 두 서브시퀀스의 최대 중첩 깊이 중 더 큰 값을 최소로 만드는 그룹 번호 배열을 리턴하면 된다.

우선, VPS가 되려면 다음과 같은 조건을 만족해야 한다. (문제에서 주어진다)

- 빈 스트링
- 두 VPS `A`, `B`를 이어 붙인 스트링 `AB`로 나타낼 수 있다.
- VPS `A`를 괄호로 감싼 스트링 `(A)`로 나타낼 수 있다.

VPS `S`의 중첩 깊이 `depth(S)`는 다음과 같이 정의한다.

- `depth("") = 0`
- `depth(A + B) = max(depth(A), depth(B))`, where A and B are VPS's
- `depth("(" + A + ")") = 1 + depth(A)`, where A is a VPS.

중첩 깊이가 $D$인 지점에는 서로 감싸고 있는 괄호 쌍이 정확히 $D$개 있다. 이 $D$개의 괄호 쌍을 두 그룹에 나누면, 당연히 한 그룹은 적어도 $\frac{D}{2}$ 개의 괄호 쌍을 가져야 한다. 

따라서 어떤 방식으로 나누더라도, 두 VPS 중 하나의 최대 중첩 깊이는 최소 $\left\lceil D / 2 \right\rceil$이다.

그러면 목표는 중첩된 괄호 쌍을 두 그룹에 가능한 한 번갈아 배정하는 것이다. 가장 쉬운 방법은? 홀짝을 이용하는 것이다. 즉, 한 그룹에는 원래 깊이 1, 3, 5, ...의 괄호 쌍만, 다른 그룹에는 깊이 2, 4, 6, ...의 괄호 쌍만 넣으면 된다.

이때 같은 그룹 안에서는 두 단계마다 한 번씩만 중첩되므로, 각 그룹의 최대 중첩 깊이는 정확히 $\left\lceil D / 2 \right\rceil$ 이하가 된다. 앞에서 구한 하한과 같으므로 최적의 해가 된다.

여는 괄호는 깊이를 먼저 증가시킨 뒤 그룹을 정하고, 닫는 괄호는 현재 깊이로 그룹을 정한 뒤 깊이를 감소시킨다. 그러면 하나의 괄호 쌍은 항상 같은 그룹에 들어가므로, 두 그룹 모두 VPS가 된다.

## 코드

```python
class Solution:
    def maxDepthAfterSplit(self, seq: str) -> list[int]:
        depth = 0
        answer = []
        for c in seq:
            if c == "(":
                depth += 1
                answer.append(depth % 2)
            else:
                answer.append(depth % 2)
                depth -= 1
        return answer
```
