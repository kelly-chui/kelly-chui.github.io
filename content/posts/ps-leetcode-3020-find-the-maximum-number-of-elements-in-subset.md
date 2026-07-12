---
title: "Leetcode 3020. Find the Maximum Number of Elements in Subset"
date: 2026-07-09T08:23:02+09:00

categories: 
    - Online Judge
series: 
    - Problem Solving
tags: 
    - LeetCode", "Python", "Hash Map

draft: true
original: ""
---

## 문제

<https://leetcode.com/problems/find-the-maximum-number-of-elements-in-subset/>

## 풀이

주어진 배열의 원소들로 만들 수 있는 가장 큰 `[x, x2, x4, ..., xk/2, xk, xk/2, ..., x4, x2, x]` 꼴(이하 피라미드 꼴)의 배열의 크기를 리턴하는 문제이다.

어떤 문제든 제약 조건이 중요하지만, 이 문제는 특히 제약 조건이 중요하다. 주어진 꼴에서 원소들은 급격히 증가하는데, `1 <= nums[i] <= 10^9` 라는 제약 조건이 있기에, 배열의 최대 크기를 예상할 수 있다.

`x`가 1일 때는 몇 번을 제곱해도 1이므로, `nums` 배열 내부에 있는 1의 개수에 따라 달려있다. 피라미드 꼴은 항상 홀수이므로, 1의 개수가 홀수일때는 그대로, 짝수일때는 1을 뺀 값을 문제에서 요구하는 최대값의 초기 값으로 정한다.

`x`가 2 이상이라면, 2^32 = 약 43억이기 때문에, 5회 증가만 해도 제약 조건을 벗어난다. 주어진 꼴이 대칭이므로 `x`가 1이 아닐때, 정답일 수 있는 최대 크기는 `[2, 4, 16, 256, 65536, 256, 16, 4, 2]` 인 경우 즉 9다. 즉, `nums` 배열 안에 어떤 값이 몇개가 있는지 알기만 하면 사실상 O(1) 시간 안에 `x`가 만들어내는 피라미드 꼴의 길이를 구할 수 있다.

따라서 충분히 모든 경우의 수를 둘러볼 수 있다. `nums` 배열의 크기가 최대 10만이지만, 우리가 확인하고 싶은 배열의 크기는 기껏해야 9밖에 되지 않으므로, 각 원소마다 모두 확인할 수 있다.

이를 위해서 처음에 `nums` 원소들의 값의 개수를 미리 셀 필요가 있다. `nums[i]`에 대해서 `nums[i]` 의 제곱, 4제곱, 8제곱...이 10억 이하면 2개 이상 존재하는지 확인해야하는데, 피라미드 꼴에서 꼭대기 원소를 제외하곤 모두 2번씩 나와야 하기 때문이다. 개수를 셀 수 없는 Hash Set은 이 문제에 적합하지 않고, Hash Map을 쓰는게 더 편하다.

1. `nums` 배열 원소의 값들이 몇번 나오는지 센다.
2. 1의 개수가 홀수면 그대로, 짝수면 -1 한 값을 최대값의 초기값으로 정한다.
3. `nums` 배열을 전체 순회하면서 각 원소들이 `x`라고 가정했을 때, 만들 수 있는 최대 길이의 `[x, x2, x4, ..., xk/2, xk, xk/2, ..., x4, x2, x]` 꼴의 길이를 구한 다음 이전의 최대값과 비교한다.
4. 구한 최대값을 리턴한다.

## 코드

```py
class Solution:
    def maximumLength(self, nums: List[int]) -> int:
        numsCount = {}
        for num in nums:
            numsCount[num] = numsCount.get(num, 0) + 1
        answer = (numsCount[1] - 1 if numsCount[1] % 2 == 0 else numsCount[1]) if 1 in numsCount else 0
        for x in numsCount:
            if x == 1:
                continue
            length = 0
            cur = x
            while cur in numsCount:
                next_cur = cur * cur
                if numsCount[cur] >= 2 and next_cur in numsCount:
                    length += 2
                    cur = next_cur
                else:
                    length += 1
                    break
            answer = max(answer, length)
        return answer
```
