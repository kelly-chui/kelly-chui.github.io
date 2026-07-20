---
title: "Programmers. 표 편집"
date: 2025-08-14

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - Data Structure
  - Linked List
  - Programmers
  - Stack
  - Swift

draft: false
original: "https://junmusu.tistory.com/182"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/81303>

## 풀이

이 문제에서 핵심은 삭제된 칸을 건너 뛰면서 칸을 옮기는 것이다. 칸을 옮기는 횟수가 최대 1,000,000 번이라고 제한되어 있지만, 명령의 개수도 200,000 개 이므로 칸을 단순히 부울리언 값으로 켜고 끄면서 이동하는 것은 최악의 경우에 굉장히 많은 시간이 걸릴 것이다.

여기서 생각해야할 점은 이 문제에서는 '랜덤 액세스'를 요구하지 않는다는 것이다. 문제에서 삭제된 칸을 복구할때 커서를 옮기지 않는다고 했으므로, 랜덤 액세스가 들어갈 부분은 처음 커서 위치를 지정하는 부분밖에 없다. 또한 중간에 있는 칸을 삭제하고 복구하는 작업들이 있으므로, 컨테이너 중간에서 삭제/삽입 연산이 쉬운 자료구조를 생각해야 하고, 바로 링크드 리스트가 떠올랐다.

* * *

이 문제를 해결하는 알고리즘은 다음과 같다.

> 1\. 링크드 리스트를 초기화 한다. 위, 아래로 가는 작업 모두 해야하므로 양방향으로 구현한다.  
> 2\. 커서를 올바른 링스트 리스트 노드에 위치시킨다. 링크드 리스트를 초기화 하면서 하면 for 루프를 한번 덜 쓸 수 있다. (시간 복잡도는 같다)  
> 3\. 들어온 커맨드를 분석해서 커서를 옮기고, 링크드 리스트를 조작한다.  
> 4\. 모든 커맨드 작업을 완료한 후, 링크드 리스트 상태를 보고 문제에서 주어진 리턴 값에 맞게 문자열을 만들어서 리턴한다.

* * *

처음에 링크드 리스트를 간단하게 딕셔너리로 구현하려 했다. 키는 현재 번호, 값은 이전 노드 번호, 다음 노드 번호를 저장한 스트럭처 이런 식의 구조다. 하지만 딕셔너리로 구현하다 보니 오히려 정석적으로 구현하는 것보다 더 복잡해지고, 효율성이 떨어졌다. 우선 값이 스트럭처에서 값을 갱신하려면 새로운 스트럭처를 생성해서 넣어줘야 했다. 또한 옵셔널 바인딩이 쓸데없이 많아지고, 문제에서 랜덤 엑세스를 요구하지 않으므로, 키 값이 아무런 의미를 가지지 못했다.

정석이 가장 빠른 방법이다. 항상

### 코드


```swift
import Foundation

class ListNode {
    var num: Int
    var pre: ListNode?
    var post: ListNode?
    
    init(num: Int, pre: ListNode?, post: ListNode?) {
        self.num = num
        self.pre = pre
        self.post = post
    }
}

struct LinkedList {
    var first: ListNode?
    var last: ListNode?
}

func solution(_ n:Int, _ k:Int, _ cmd:[String]) -> String {
    var linkedList = LinkedList()
    var current: ListNode? = nil
    for i in 0..<n {
        let node = ListNode(num: i, pre: linkedList.last, post: nil)
        if linkedList.first == nil { linkedList.first = node }
        linkedList.last?.post = node
        linkedList.last = node
        if i == k {
            current = node
        }
    }
    var deleteStack = [ListNode]()
    for command in cmd {
        if command == "C" {
            if let currentNode = current {
                deleteStack.append(currentNode)
            }
            let pre = current?.pre
            let post = current?.post
            pre?.post = post
            post?.pre = pre
            if pre == nil { linkedList.first = post }
            if post == nil { linkedList.last = pre  }
            current = post ?? pre
        } else if command == "Z" {
            guard let last = deleteStack.popLast() else { continue }
            let pre = last.pre
            let post = last.post
            pre?.post = last
            post?.pre = last
            if pre == nil { linkedList.first = last }
            if post == nil { linkedList.last = last }
        } else {
            let token = command.split(separator: " ").map { String($0) }
            if token[0] == "U", let x = Int(token[1]) {
                for _ in 0..<x {
                    current = current?.pre
                }
            }
            if token[0] == "D", let x = Int(token[1]) {
                for _ in 0..<x {
                    current = current?.post
                }
            }
        }
    }
    var alive = Array(repeating: "X", count: n)
    var node = linkedList.first
    while let currentNode = node {
        alive[currentNode.num] = "O"
        node = currentNode.post
    }
    return alive.joined()
}
```

