---
title: "Algorithm. Binary Search off-by-one 에러 없이 구현하기"
date: 2024-12-31

categories:
    - Computer Science
series:
    - Algorithm
tags:
    - Algorithm
    - Binary Search

draft: true
original: "notion-export/블로그 이관/ComputerScience/Algorithm/Binary Search 166ade8f3765800f8e57caa793a0a6bf.md"
---

## off by one error

바이너리 서치를 할 때, 경계나 중간 값을 처리하면서 인덱스가 하나 어긋나는 에러

- 주요 원인은 바이너리 서치에 대한 이해 부족
- 인덱스 레인지, high / low 갱신 방식, 중간값 계산 방식, 값 리턴 방식을 다양하게 생각해야 함

## Binary Search 테크닉

- `else`보다는 `else if`를 사용하여 조건을 명확하게 표현하기
- 오버플로우 방지를 위해서는 `mid`를 갱신 할 때, `low + high / 2`보다 `low + (high - low) / 2`를 사용하기

바이너리 서치는 단순히 정렬된 배열에서 값을 찾는 알고리즘이 아니다. 바이너리 서치를 이용하여, 정확한 값을 찾는 경우보다 조건을 만족하는 첫 번째 또는 마지막 위치를 찾는 경우가 더 많다.

따라서 바이너리 서치를 두 가지로 분류하면 다음과 같다:

- 정확한 값을 찾기
- 특정 조건을 만족하는 경계를 찾기

## 하나의 정확한 값을 찾기

### low ≤ high인 경우

- low와 high가 같을 때까지 계속해서 서치를 진행한다.
- low와 high가 같을 경우도 고려를 해야 하기 때문에 종료 조건을 low ≤ high로 한다.
    - low와 high가 같고, 그 값이 목표값이면 mid를 리턴한다.
    - low와 high가 같은데도, 그 값이 목표값이 아니라면 목표값을 찾을 수 없는 것이다.
- low, high의 초기 값은 실제 인덱스 값들의 범위를 사용한다.
    - 원소의 개수가 10개인 배열이라면 0-9 범위의 인덱스를 가지므로 low = 0, high = 9가 된다.

### 코드

```c
int binarySearch(int nums[], int low, int high, int target) {
    while (low <= high) {
        int mid = low + (high - low) / 2;

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}
```

정확한 값을 찾는 바이너리 서치에서는 탐색 범위를 줄여 나가면서도 마지막 후보까지 반드시 검사해야 함, 따라서 `while (low <= high)`를 사용하며, 이미 확인한 `mid`는 다시 검사할 필요가 없으므로 `high = mid - 1` 또는 `low = mid + 1`로 범위를 줄인다.

## 경계 찾기

정확한 값을 찾는 것이 아니라 조건을 만족하는 첫 번째 위치 또는 마지막 위치를 찾는 경우에도 바이너리 서치를 이용한다.

두 가지 종류가 있는데, 조건을 만족하는 첫 번째 원소를 찾는 Lower Bound와 마지막 원소를 찾는 Upper Bound가 있다.

### Lower Bound

```c
int lower_bound(int arr[], int low, int high, int k) {
    while(low < high) {
        int mid = (low + high) / 2;
        if(arr[mid] < k) {
            low = mid + 1;
        } else if(arr[mid] >= k) {
            high = mid;  // 'high'를 'mid'로 설정하여 왼쪽 경계를 찾음
        }
    }
    return high;  // 'high'는 'k'가 들어갈 위치
}
```

Lower Bound는 타겟 이상인 값이 처음 등장하는 위치를 리턴한다. 해당 값이 배열에 존재하지 않더라도 해당 값을 만약 배열에 삽입한다면, 삽입될 위치를 리턴한다.

### Upper Bound

```c
int upper_bound(int arr[], int low, int high, int k) {
    while (low < high) {
        int mid = (low + high) / 2;  // 중간값 계산
        if (arr[mid] <= k) {
            low = mid + 1;  // arr[mid]가 k 이하일 경우, low를 mid + 1로 조정
        } else {
            high = mid;  // arr[mid]가 k보다 클 경우, high를 mid로 조정
        }
    }
    return high;  // 'high'는 k보다 큰 값이 처음 등장하는 위치
}
```

Upper Bound는 타겟보다 큰 값이 처음 등장하는 위치를 리턴한다. Lower Bound와 함께 사용하면 특정 값의 등장 횟수도 쉽게 구할 수 있다.

```c
count = upper_bound(target) - lower_bound(target);
```

## low, high, mid 어떤 값을 리턴해야 할까?

반복문이 종료되었을 때 어떤 값을 리턴해야 하는지는 구현 방식에 따라 달라진다.

### 정확한 값을 찾는 Binary Search

정확한 값을 찾는 경우에는 반복문 내부에서 이미 목표값을 찾았을 때 `mid`를 바로 리턴한다.

```c
if (nums[mid] == target) {
    return mid;
}
```

### Lower Bound & Upper Bound

Lower Bound, Upper Bound 둘 다 반복문이 종료되면 항상 `low == high`가 성립한다.

따라서 `low`, `high` 어떤걸 반환해도 같다.

### 왜 mid를 리턴하지 않을까?

`mid`는 반복 과정에서 탐색 범위를 반으로 나누기 위해 계산되는 중간 위치일 뿐이고, 반복문이 끝났을 때 마지막 `mid`가 정답이라는 보장이 없다.

예를 들어 다음 배열에서

```text
1 3 5 7 9
```

`lower_bound(4)`를 수행하면 최종 결과는 `5`의 위치인 `2`인데, 하지만 마지막으로 계산된 `mid`는 `1`일 수도 있다.

## 정리

Binary Search를 구현할 때 가장 많이 발생하는 실수는 종료 조건(`low < high`, `low <= high`)과 `low`, `high` 갱신 방식을 섞어 써서 그렇다. 그래서 off by one 에러도 많이 나고...

구현을 외우기보다는 현재 찾고 싶은 것이 정확한 값인지, 아니면 경계인지를 먼저 판단하면 종료 조건과 리턴 값도 자연스럽게 결정된다.

## 레퍼런스

[이분 탐색(Binary Search) 헷갈리지 않게 구현하기](https://www.acmicpc.net/blog/view/109)
[Binary Search in Detail](https://labuladong.gitbook.io/algo-en/iii.-algorithmic-thinking/detailedbinarysearch)
