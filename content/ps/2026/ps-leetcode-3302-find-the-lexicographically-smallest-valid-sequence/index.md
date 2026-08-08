---
title: "LeetCode 3302. Find the Lexicographically Smallest Valid Sequence"
date: 2026-08-08T21:06:44+09:00

categories:
  - Problem Solving
series:
tags:
  - Greedy
  - DP
algorithmTags:
  - Greedy
  - DP
features:
  - katex

draft: true
original: ""
---

## 문제

<https://leetcode.com/problems/find-the-lexicographically-smallest-valid-sequence>

## 풀이

`word1`에서 인덱스를 고르고, 그 문자들로 `word2`를 만들면 된다. 선택한 문자는 순서를 유지해야 하고, `word1`의 문자 중 최대 하나는 다른 문자로 바꿔서 사용할 수 있다. 가능한 수열 중 인덱스가 사전순으로 가장 작은 것을 구하면 된다.

앞에서부터 무조건 현재 문자가 같은지 확인하면서 고르면 되지만, 문자가 다른 위치에서 변경 기회를 바로 사용해도 뒤쪽에 남은 문자를 모두 맞출 수 있는지 확인해야 한다. 즉, 현재 위치를 선택했을 때 남은 문자의 개수가 충분해야 한다.

먼저 `dp[i]`를 `word1[i...]`에서 `word2`의 뒤쪽 문자를 최대 몇 개까지 맞출 수 있는지로 계산한다. `word1`을 뒤에서부터 순회하면서 현재 문자가 `word2`의 필요한 마지막 문자와 같으면 매칭 개수를 하나 늘리고, 아니면 뒤에서 계산한 값을 그대로 사용한다.

현재 위치를 변경에 사용해도 되는 조건은 다음과 같다.

$$
dp[i + 1] \geq |word2| - ptr2 - 1
$$

그 다음 `word1`을 앞에서부터 순회한다. 현재 문자가 `word2`의 다음 문자와 같으면 바로 선택한다. 문자가 다를 때는 아직 변경 기회를 사용하지 않았고, 현재 인덱스를 선택한 뒤 남은 문자만으로 `word2`의 나머지를 모두 만들 수 있다면 현재 위치를 선택하고 변경 기회를 사용한다.

항상 가능한 위치 중 가장 앞의 인덱스를 선택하므로 결과가 사전순으로 가장 작다. 뒤쪽 매칭 가능 여부를 미리 계산하는 데 $O(n)$, 앞에서 정답을 만드는 데 $O(n)$이 걸리므로 시간 복잡도는 $O(n)$이다.

## 코드

```python
class Solution:
    def validSequence(self, word1: str, word2: str) -> List[int]:
        dp = [0] * (len(word1) + 1)
        for ptr1 in range(len(word1) - 1, -1, -1):
            dp[ptr1] = dp[ptr1 + 1]
            ptr2 = len(word2) - dp[ptr1 + 1] - 1
            if ptr2 >= 0 and word1[ptr1] == word2[ptr2]:
                dp[ptr1] = dp[ptr1 + 1] + 1
        ptr2 = 0
        hasChance = True
        answer = []
        for ptr1 in range(len(word1)):
            if ptr2 == len(word2):
                break
            if word1[ptr1] == word2[ptr2]:
                answer.append(ptr1)
                ptr2 += 1
            elif hasChance and dp[ptr1 + 1] >= len(word2) - ptr2 - 1:
                answer.append(ptr1)
                ptr2 += 1
                hasChance = False
        return answer if len(answer) == len(word2) else []
```
