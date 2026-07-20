---
title: "BOJ 4195. 친구 네트워크"
date: 2023-02-23

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Swift
  - Union Find

draft: false
original: "https://junmusu.tistory.com/48"
---

## 문제

<https://www.acmicpc.net/problem/4195>

## 풀이

전형적인 Union-Find 문제이지만, 각 원소들이 정수가 아닌 문자열로 구성되어 있는 특징이 있다. 정수를 문자열로 대응시키는 것은 Dictionary를 쓰면 쉽게 할 수 있으므로 다음과 같은 방식으로 알고리즘이 진행된다

1. 입력값(문자열 2개)에 대해 각 문자열이 Dictionary에 대응되는 Value가 있는지 판단한다.  
2. 1에서 없다면 Dictionary에 `[String:Integer]` 꼴로 매핑한다. 있다면 그냥 넘어간다.  
3. 매핑이 끝났다면, 들어온 두 문자열로 `union(a, b)` 연산을 하고 그 집합 내부의 원소의 개수를 카운트한다.

여기서 문제는 3번이다. 어떻게 해야 효율적으로 집합 내부의 원소를 카운트 할 수 있을까?

![](/images/ps-boj-4195-friend-network/image-002.png)

평상시라면 크게 해맸을 부분이지만, 과거에 학교에서 Union-Find Set에서 원소의 개수를 나타내는 방법을 배웠던 것이 기억이 나서 가져왔다.

가장 루트에 있는 노드는 parents 배열에 자기 자신이 아닌 노드의 개수를 음수꼴로 저장한다. (양수로 저장한다면, 부모를 뜻하는 것인지 개수를 뜻하는 것인지 구분이 불가능 하다.) 따라서 큰 연산 필요 없이 계속해서 노드의 개수를 추적할 수 있게 된다. 물론 자료구조의 구현 방식이 달라지기 때문에 find 연산과 union 연산을 이에 맞게 수정할 필요는 있지만, 큰 수정이 필요하진 않다.

### 코드

```swift 
import Foundation
 
func union(_ a: Int, _ b: Int) -> Int {
    let pa = find(a)
    let pb = find(b)
    if pa == pb {
        return pa
    }
    if pa < pb {
        parents[pa] += parents[pb]
        parents[pb] = pa
        return pa
    } else {
        parents[pb] += parents[pa]
        parents[pa] = pb
        return pb
    }
}
 
func find(_ a: Int) -> Int {
    if parents[a] > -1 {
        parents[a] = find(parents[a])
    } else {
        return a
    }
    return parents[a]
}
 
let t: Int = Int(readLine()!)!
var dict: Dictionary<String, Int> = [:]
var parents: Array<Int> = []
 
for _ in 0..<t {
    let f: Int = Int(readLine()!)!
    var count = 0
    for _ in 0..<f {
        let names = readLine()!.components(separatedBy: " ")
        for name in names {
            if dict[name] == nil {
                dict[name] = count
                parents.append(-1)
                count += 1
            }
        }
        print(parents[union(dict[names[0]]!, dict[names[1]]!)] * -1)
    }
    dict = [:]
    parents = []
}
```

2023년 3월 1일 수정: rank 연산 삭제

![](/images/ps-boj-4195-friend-network/image-003.png)
