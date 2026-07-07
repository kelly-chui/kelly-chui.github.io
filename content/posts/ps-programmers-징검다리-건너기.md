---
title: "Programmers. 징검다리 건너기"
date: 2025-07-22
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Swift", "Binary Search", "Sliding Window", "Deque"]
draft: false
original: "https://junmusu.tistory.com/172"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/64062>

## 풀이

처음 문제를 읽어보고 바이너리 서치를 이용해야겠다고 생각했다. 결정해야 할 값을 건널 수 있는 최대 인원수로 맞춰놓고 바이너리 서치를 이용하여 찾으면 되기 때문이다.

바이너리 서치를 이용한 알고리즘은 다음과 같다.

  1. 바이너리 서치를 통해 찾고 싶은 값은 징검다리를 건널 수 있는 최대 인원 수이다.
  2. 징검다리 하나의 내구도가 최대 2억이므로 1에서 2억까지의 범위 내에서 인원 수의 최대값을 찾는다 
     1. 값이 유효한지 체크하는 방법은 징검다리에서 현재 인원 수가 밟은 수를 뺀 다음 0 이하의 징검다리 돌들이 연속되는 경우가 `k`개 이하면 통과, 초과면 통과시키지 않는다.
  3. 바이너리 서치 결과를 리턴한다.

이 코드의 시간 복잡도는 $N$이 `stones` 배열의 크기, $M$이 돌 내구도의 최대값이라 했을 때 $O(N \log M)$이다. 돌 내구도의 최대값은 2억이고, 2의 30제곱이 약 10억이므로 30번 이내에 찾을 수 있다. 최대 20만 크기의 배열을 30번 정도 반복한다고 생각하면 충분히 시간 복잡도가 나온다.

하지만 Swift로 해당 방식을 사용했을때, 시간 초과가 발생했다. Copy on write 기능이 잘 동작하지 않아 배열이 복사되는 방식으로 전달되나? 라고 생각했는데, `inout`을 사용해도 결과는 같았다. 따라서 다른 방법을 찾아야 했다.

다음으로 생각한 방법은 슬라이딩 윈도우를 사용하는 방법이다, 윈도우의 크기를 `k`로 잡아놓고 배열을 쓸고 지나가면서, 윈도우 내부 값들의 최대값이 가장 작아졌을때, 바로 그 최대값이 건널 수 있는 인원의 최대값이 된다는 사실을 알았다.

그런데 슬라이딩 윈도우의 최대값을 관리하는 방법이 중요하다. 단순히 최대값 계산을 계속 한다면 결국 $O(N^2)$ 알고리즘이 된다. 따라서 덱을 사용해서 최대값을 관리해야 한다. 최대값이 항상 head에 있도록 하고, 만약 새로운 최대값이 tail에 들어오면 앞서 들어온 최대값을 모두 초기화 시켜버리면된다. 그리고 인덱스로 관리해서, 현재 윈도우에 없는 값을 deque에서 쉽게 꺼낼수도 있다.

알고리즘은 다음과 같다.

  1. 덱을 구현한 다음, k 크기만큼 초기화 한다.
  2. 만약 덱에 새로 들어온 원소가 앞에 있는 원소들보다 크다면 (덱에 먼저 들어와 있는 값들보다 크다면) 새로 들어온 값보다 작은 모든 앞선 원소들을 제거한다.
  3. 일반적인 슬라이딩 윈도우처럼 진행한다. 가장 작은 최대값을 가지는 순간을 저장하고 리턴하면 된다.

### 코드

#### 바이너리 서치 C++ (Swift는 통과 못함)

```C++
#include <string>
#include <vector>

using namespace std;

bool check(vector<int> &stones, int k, int step) {
    int emptyCount = 0;
    for (int stone : stones) {
        if (stone > step) {
            emptyCount = 0;
        } else {
            emptyCount += 1;
            if (emptyCount >= k) {
                return false;
            }
        }
    }
    return true;
}

int solution(vector<int> stones, int k) {
    int answer = 0;
    int low = 1, high = 200000000;
    while (low < high) {
        int mid = (low + high) / 2;
        if (check(stones, k, mid)) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return high;
}
```

#### 슬라이딩 윈도우 + 덱

```swift
import Foundation

struct Deque {
    var container = [Int]()
    var pointer = 0
    var isEmpty: Bool { pointer >= container.count }
    var first: Int { container[pointer] }
    var last: Int { container.last! }
    mutating func push(_ value: Int) {
        container.append(value)
    }
    mutating func popFirst() -> Int {
        let headValue = container[pointer]
        pointer += 1
        return headValue
    }
    mutating func popLast() -> Int {
        return container.removeLast()
    }
}

func solution(_ stones:[Int], _ k:Int) -> Int {
    var deque = Deque()
    var result = Int.max
    for i in 0..<stones.count {
        while !deque.isEmpty && stones[deque.last] <= stones[i] {
            deque.popLast()
        }
        deque.push(i)
        if deque.first <= i - k {
            deque.popFirst()
        }
        if i >= k - 1 {
            result = min(result, stones[deque.first])
        }
    }
    return result
}
```

