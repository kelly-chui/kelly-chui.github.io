---
title: "BOJ 13144. list of unique numbers"
date: 2024-06-12
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "Swift", "Two Pointers"]
draft: false
original: "https://junmusu.tistory.com/151"
---

## 문제

<https://www.acmicpc.net/problem/13144>

## 풀이

매우 특이한 유형의 투 포인터 문제다. `start`, `end`가 증가만 해서는 모든 경우의 수를 나타낼 수 없으며, 모든 경우의 수를 탐색하려면 O(n^2)이 된다.

`1 2 3 1 2` 라는 수열이 있을 때를 생각해보자

겹치는 원소가 나오지 않도록 작성한 일반적인 투 포인터는 1, 12, 123, 231, 312 이렇게 5번 탐색을 하고 종료한다. 하지만 1 2 3 1 2의 정답은 5가 아니라 15이다. 하지만 이 5번의 탐색만으로도 15라는 결과를 얻을 수 있는데, 우리는 정확한 부분 수열의 형태보다 경우의 수만 알면 되기 때문이다.

다음은 15라는 정답을 유도하는 과정을 시각적으로 나타낸 것이다:

#### "1"
```
1
```
#### "12"
```
1, 2
12
```
#### "123"
```
1, 2, 3
12, 23
123
```
#### "231"
```
2, 3, 1
23, 31
231
```
#### "312"
```
3, 1, 2
31, 12
312
```
우리는 경우의 수만 알면 되기 때문에 투 포인터가 현재 가리키는 부분 수열의 모든 부분 수열의 개수를 새면 된다. 예를 들어 투 포인터가 가리키는 부분 수열이 "123"이라고 하면 "123"의 부분 수열인 "1", "2", "3", "12", "23", "123"이 있다.

이러한 방식으로 경우의 수를 셀 때, 겹치는 수열은 제거해야 한다(위에서 빨간 글씨로 나타낸 부분). 따라서 하나의 부분 수열에서 계산되는 경우의 수를 구하는 식을 단순화하면 다음과 같다:

![](/images/ps-boj-13144-list-of-unique-numbers/image-002.png)

결론적으로, 투 포인터로 탐색을 진행 하면서 나오는 부분 수열마다 해당 식을 계산한 후 정답에 더해주면, 모든 경우의 수를 계산할 수 있다.

### 코드

```swift
let n = Int(readLine()!)!
let seq = readLine()!.split(separator: " ").map { Int($0)! }
var (start, end) = (0, 0)
var isContained = Set<Int>()
var answer = 0

while end < n {
    while isContained.contains(seq[end]) {
        isContained.remove(seq[start])
        start += 1
    }
    isContained.insert(seq[end])
    answer += end - start + 1
    end += 1
}

print(answer)
```

