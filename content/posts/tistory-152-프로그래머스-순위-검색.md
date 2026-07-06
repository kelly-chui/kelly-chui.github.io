---
title: "[프로그래머스] 순위 검색"
date: 2025-01-07
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "Binary Serach"]
draft: false
original: "https://junmusu.tistory.com/152"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/72412>

## 풀이

많이 해맨 문제다. 처음에는 다음과 같이 알고리즘을 생각했다.

1. 일단 쿼리의 개수와 `info` 배열의 크기를 생각해보면 `filter`를 사용하는 문제는 아님  
2. 바이너리 서치, Upper bound와 Lower bound의 차이가 해당하는 원소의 개수가 같음
3. `info` 배열을 잘 정렬해서 바이너리 서치만 하면 쉽게 해결될 문제  

하지만 조금만 생각해보면 이러한 방식의 알고리즘은 문제를 절대로 해결할 수 없다.

- 우선 쿼리의 조건들이 독립적이다. 정렬 기준에 따라서 포함되어야 할 값이 포함되지 않게 된다.
- 그렇다고 바이너리 서치 -> 다시 정렬을 반복하기엔 차라리 `filter`를 쓰는게 더 시간 복잡도가 더 좋다.

다음에 생각한 방식은 트리를 이용하는 방식이었다.

1. 각 조건을 노드로 트리를 만든다.
2. 마지막 리프 노드에는 점수들을 추가한다.
3. 따라서 마지막 조건의 자식 노드들을 모아서 정렬한 다음 바이너리 서치 하면 끝

이 방식은 실제로 구현을 하지는 않았지만, 구현 전에 다음과 같이 생각이 흘러갔다:

트리를 구현한다 -> 5차원 배열로 하는게 더 나을까 -> 인덱스가 Integer가 아니니까 5차원 딕셔너리를 사용할까

5차원 딕셔너리를 구현하면서, 굳이 5차원으로 하기 보다는 차라리 1차원으로 펴서 저장해도 되는 것을 금방 알 수 있었다.

따라서 최종 알고리즘은 다음과 같다.

1. 각 정보들을 하나의 스트링으로 만든다.  
2. 하지만 "-"는 해당 조건을 판단하지 않겠다는 뜻이므로, (현재 조건, "-") 라는 두 가지 경우의 수가 생긴다.  
3. 따라서 점수를 제외한 총 조건이 4개가 있으므로, 하나의 정보가 검색 될 수 있는 쿼리는 2^4 = 16개가 된다.  
4. 해시 테이블에 16개의 키 전부에 해당 정보의 점수를 저장한다. 이를 모든 정보에서 실행하여 해시 테이블을 완성한다.  
5. 쿼리마다 정렬을 하면 매우 비효율적이므로 완성된 해시 테이블을 정렬한다.  
6. 각 쿼리도 마찬가지로 스트링으로 만든 다음에 해시 테이블에 접근한다.  
7. 바이너리 서치 하면 끝

### 코드

```swift
import Foundation

func solution(_ info:[String], _ query:[String]) -> [Int] {    
    func lowerBound(_ target: Int, _ scores: [Int]) -> Int {
        var low = 0
        var high = scores.count
        
        while low < high {
            let mid = low + (high - low) / 2
            if target <= scores[mid] {
                high = mid
            } else {
                low = mid + 1
            }
        }
        return high
    }
    
    let infoArray = info.map { $0.split(separator: " ").map { String($0) } }
    let queryArray = query.map { $0.split(separator: " ").map { String($0) }.filter { $0 != "and" } }
    var tree = [String: [Int]]()
    var answer = [Int]()
    
    for person in infoArray {
        let score = Int(person.last!)!
        for lang in ["-", person[0]] {
            for group in ["-", person[1]] {
                for career in ["-", person[2]] {
                    for food in ["-", person[3]] {
                        tree[lang + group + career + food, default: []].append(score)
                    }
                }
            }
        }
    }
    
    for (key, value) in tree {
        tree[key] = value.sorted { $0 < $1 }
    }
    
    for q in queryArray {
        let key = q[0] + q[1] + q[2] + q[3]
        let target = Int(q.last!)!
        answer.append(tree[key, default: []].count - lowerBound(target, tree[key, default: []]))
    }

    return answer
}
```
