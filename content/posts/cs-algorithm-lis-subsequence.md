---
title: "Algorithm. LIS(Subsequence)"
date: 2025-04-03

categories:
    - Computer Science
series:
    - Algorithm
tags:
    - Algorithm
    - LIS
    - Binary Search
    - DP

draft: true
original: "notion-export/블로그 이관/ComputerScience/Algorithm/LIS(Subsequence) 1caade8f37658030a7c6f0656bde7c84.md"
---

## 소개

수열의 원소를 골라내서 만든 부분 수열 중, 각 원소가 이전 원소보다 크면서, 가장 긴 길이를 가지는 부분 수열을 찾는 알고리즘

DP 방식과 Binary Search를 쓰는 Greedy 방식 두 가지가 있으며, 별개의 방식이 아닌 두 방식이 밀접하게 연관되어 있다.

## 아이디어

LIS는 현재까지 구한 부분 수열의 결과를 이용해 더 긴 부분 수열을 만들어 나가는 문제이다.

DP는 이전 계산 결과를 이용해 현재 상태를 구하며, Binary Search를 이용한 방식은 같은 아이디어를 유지하면서 탐색 과정을 최적화한 것이다.

## 알고리즘

### DP 구현

`dp[i]`는 `i`번째 원소를 '마지막 원소로 포함하는 증가하는 부분 수열 중 가장 긴 길이'로 정의한다.

전체 수열을 순회하면서 현재 원소의 이전(인덱스가 더 빠른) 원소들을 탐색한다. 현재 원소보다 값이 작으면서 dp 테이블 값이 가장 큰 원소를 찾아, 그 값에 1을 더한 값으로 dp 테이블을 갱신한다.

- 현재 원소보다 앞에 있는 원소들 중 더 작은 값을 가진 원소들만 고려한다.
- 해당 원소들 중 dp 테이블 값이 가장 큰 것에 1을 더해 현재 원소의 dp 테이블 값으로 설정한다.

증가하는 부분 수열의 특성상 이전 원소들의 값이 현재 원소의 값보다 작아야 하며, 1을 더하는 것은 현재 원소가 해당 부분 수열에 새롭게 추가되기 때문이다.

즉,

$dp[i] = \max(dp[j] + 1),\quad \text{for all } j < i \text{ where } A[j] < A[i]$

### Swift 코드

```swift
func lis(_ arr: [Int]) -> Int? {
    var dp = [Int](repeating: 1, count: arr.count)
    for i in arr.indices {
        for j in 0..<i {
            if arr[j] < arr[i] {
                dp[i] = max(dp[i], dp[j] + 1)
            }
        }
    }
    return dp.max()
}
```

### DP + Binary Search 구현

위 DP 알고리즘에서 바이너리 서치를 활용한 방식이다. DP만을 사용하는 알고리즘은 각 원소마다 이전 원소들을 모두 확인하여 DP 테이블을 갱신해야 하므로 효율성이 떨어졌지만, 이 방식은 바이너리 서치를 사용해서, 이전 원소들을 모두 탐색할 필요를 줄여준다.

- dp 테이블이 의미하는 것은 이전 DP 방식과 같지만 점화식이 변화한다.
- `tails`라는 새로운 이름의 배열을 하나 생성한다. 이 배열은 dp[i] = k 를 만족하는 i중 seq[i]의 값이 가장 작은 i이다.

### Swift 코드

```swift
func lowerBound(_ arr: [Int], _ target: Int) -> Int {
    var low = 0
    var high = arr.count
    while low < high {
        let mid = (low + high) / 2
        if arr[mid] < target {
            low = mid + 1
        } else if arr[mid] >= target {
            high = mid
        }
    }
    return low
}

func lisWithBinarySearch(_ arr: [Int]) -> Int {
    var tails = [Int]()
    for element in arr {
        if tails.isEmpty || element > tails.last! {
            tails.append(element)
        } else {
            let idx = lowerBound(tails, element)
            tails[idx] = element
        }
    }
    return tails.count
}
```

## 동작 원리

DP 방식은 각 원소를 마지막 원소로 하는 LIS의 길이를 저장하며, 이전 결과를 이용해 현재 값을 갱신한다.

바이너리 서치 방식은 `tails` 배열을 유지하여 길이가 같은 증가 부분 수열 중 마지막 원소가 가장 작은 경우만 유지한다. 이 덕분에 이후 원소가 이어질 가능성이 높아지고, Binary Search를 이용해 빠르게 위치를 찾을 수 있다.

## 특징

### 장점

- DP는 구현이 직관적이며 원리를 이해하기 쉽다.
- Binary Search를 이용하면 시간 복잡도를 크게 줄일 수 있다.

### 단점

- DP는 입력의 크기가 커질수록 성능이 급격히 저하된다.
- Binary Search 방식은 원리를 이해하기 어렵고 실제 LIS 수열을 바로 구하는 것은 아니다.

## 시간/공간 복잡도

### DP

- 시간 복잡도: O(n²)
- 공간 복잡도: O(n)

### DP + Binary Search

- 시간 복잡도: O(n log n)
- 공간 복잡도: O(n)
