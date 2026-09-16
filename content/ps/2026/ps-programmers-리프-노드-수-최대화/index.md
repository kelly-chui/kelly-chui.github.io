---
title: "Programmers. 리프 노드 수 최대화"
date: 2026-09-16T17:39:46+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/468372>

## 풀이

주어진 조건에 따라서 트리를 구성했을 때, 만들 수 있는 리프 노드의 최대 개수를 리턴하면 된다.

제약 조건은 두 가지다:

1. 분배 노드의 수는 `distLimit` 이하
2. 모든 리프 노드의 분배도는 `splitLimit` 이하.
3. 루트는 자식이 1개이고, 이후 각 깊이에서 분배 노드는 자식을 2개 또는 3개 가진다. 

조건 3에 의해 같은 깊이의 분배 노드는 모두 같은 수의 자식을 가져야 하므로, 트리의 구조는 각 깊이에서 2 또는 3 중 하나를 선택하는 것으로 결정된다. 

즉, 트리의 형태는 2를 $a$번, 3을 $b$번 사용하는 것이 된다.

이때 리프 노드의 수와 분배도의 관계는 다음과 같다:

$$\text{리프 수} = \text{분배도} =  2^a \times 3^b \leq \text{splitLimit}$$

또한, 분배 노드의 수를 세야 한다. 깊이 $d$에서 분배 노드의 수는, 그 위의 층들이 결정하는 리프 수와 같다. 

2를 사용하는 층이 $a$개, 3을 사용하는 층이 $b$개 있을 때, 분배 노드의 총 수는 다음과 같다:

$$(2^a - 1) + 2^a \times \frac{3^b - 1}{2} \leq \text{distLimit}$$

또한 (`distLimit`의 여유가 있다면) 일부 리프 노드를 추가로 분기시켜서 리프 노드의 수를 더 늘릴 수 있다. 이 때, 각 분기에 따른 리프 노드의 증가 공식은 다음과 같다:

- $3 \times 2^a \times 3^b \leq \text{splitLimit}$, 즉 $2^a \times 3^b \leq \text{splitLimit} / 3$이면 3분기 가능: 분배 노드 1개로 리프 +2 증가
- $2 \times 2^a \times 3^b \leq \text{splitLimit}$, 즉 $2^a \times 3^b \leq \text{splitLimit} / 2$이면 2분기 가능: 분배 노드 1개로 리프 +1 증가

남은 `distLimit` 여유를 $r = \text{distLimit} - \text{distCount}$라 하자. 이 때, 추가할 수 있는 분기 횟수는 $\min(\text{리프 수},\ r)$번이다. (당연히 리프 노드 수보다 많이 분기할 수는 없다...)

조건이 많이 좁혀졌다. 위 조건을 만족하는 모든 $(a, b)$ 조합에 대해 위를 계산하고 최댓값을 리턴하면 된다.

## 코드

```swift
func solution(_ distLimit: Int, _ splitLimit: Int) -> Int {
    var cases: [(pow2: Int, pow3: Int)] = []
    var p2 = 1
    
    while p2 <= splitLimit {
        var p3 = 1
        while p2 * p3 <= splitLimit {
            cases.append((p2, p3))
            p3 *= 3
        }
        p2 *= 2
    }
    
    var answer = 1
    for (p2, p3) in cases {
        let leafCount = p2 * p3
        let distCount = (p2 - 1) + (p2 * (p3 - 1) / 2)
        guard distCount <= distLimit else { continue }
        let remainingDistCount = distLimit - distCount
        var candidate = leafCount
        let count = min(leafCount, remainingDistCount)
        if leafCount <= splitLimit / 3 {
            candidate += count * 2
        } else if leafCount <= splitLimit / 2 {
            candidate += count
        }
        answer = max(answer, candidate)
    }
    
    return answer
}
```
