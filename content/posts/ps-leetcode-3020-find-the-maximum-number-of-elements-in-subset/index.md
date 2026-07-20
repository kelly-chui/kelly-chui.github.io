---
title: "Leetcode 3020. Find the Maximum Number of Elements in Subset"
date: 2026-07-09T08:23:02+09:00

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - Hash Map
  - LeetCode
  - Python

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/find-the-maximum-number-of-elements-in-subset/>

## 풀이

주어진 배열의 원소들로 만들 수 있는 가장 긴 `[x, x², x⁴, ..., x^(2^k), ..., x⁴, x², x]` 형태의 부분집합 길이를 반환하는 문제다. 이하에서는 이 형태를 피라미드라고 부른다.

어떤 문제든 제약 조건이 중요하지만, 이 문제는 특히 제약 조건이 중요하다. 주어진 꼴에서 원소들은 급격히 증가하는데, `1 <= nums[i] <= 10^9` 라는 제약 조건이 있기에, 배열의 최대 크기를 예상할 수 있다.

`x`가 1일 때는 몇 번을 제곱해도 1이므로, `nums` 배열 내부에 있는 1의 개수에 따라 달려있다. 피라미드 꼴은 항상 홀수이므로, 1의 개수가 홀수일때는 그대로, 짝수일때는 1을 뺀 값을 문제에서 요구하는 최대값의 초기 값으로 정한다.

`x`가 2 이상이라면 값을 반복해서 제곱할 때 매우 빠르게 커진다. 가장 작은 시작값인 2도 `2 → 4 → 16 → 256 → 65,536 → 4,294,967,296` 순으로 증가하므로 마지막 값은 제한인 `10⁹`을 넘는다. 따라서 가능한 가장 긴 형태는 `[2, 4, 16, 256, 65536, 256, 16, 4, 2]`이고 길이는 9다.

각 시작값에서 확인할 제곱 단계가 상수 수준으로 작으므로 모든 서로 다른 원소를 시작값으로 확인할 수 있다. 원소 빈도를 세는 데 O(n), 각 시작값을 확인하는 데 전체적으로 O(n) 이내가 필요하다.

이를 위해서 처음에 `nums` 원소들의 값의 개수를 미리 셀 필요가 있다. `nums[i]`에 대해서 `nums[i]` 의 제곱, 4제곱, 8제곱...이 10억 이하면 2개 이상 존재하는지 확인해야하는데, 피라미드 꼴에서 꼭대기 원소를 제외하곤 모두 2번씩 나와야 하기 때문이다. 개수를 셀 수 없는 Hash Set은 이 문제에 적합하지 않고, Hash Map을 쓰는게 더 편하다.

1. `nums` 배열 원소의 값들이 몇번 나오는지 센다.
2. 1의 개수가 홀수면 그대로, 짝수면 -1 한 값을 최대값의 초기값으로 정한다.
3. 서로 다른 각 원소를 `x`라고 가정하고 반복해서 제곱하며 만들 수 있는 피라미드의 길이를 구한다.
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
