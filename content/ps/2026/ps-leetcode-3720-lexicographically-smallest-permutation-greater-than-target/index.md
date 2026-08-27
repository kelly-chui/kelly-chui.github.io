---
title: "LeetCode 3720. Lexicographically Smallest Permutation Greater Than Target"
date: 2026-08-27T10:18:44+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Backtracking
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/lexicographically-smallest-permutation-greater-than-target>

## 풀이

스트링 `s`와 `target`이 주어진다. `s`의 원소들을 재배열 해서, `target`보다 사전순으로 큰 스트링 중, 가장 작은 스트링을 리턴하면 된다.

`s`를 `target`보다 사전순으로 크게 만드려면, 각 원소를 배치할 때 마다 `target`의 해당 인덱스의 원소랑 비교하면 된다. 이를 위해서 `s`의 원소 개수의 상태를 관리할 `freqeuncies` 배열이 필요하다.

그리고 각 인덱스마다 `target`과 비교해가면서 채워넣으면 되는데, 어느 순간에 모든 경로가 막힐 수도 있다. 이 경우엔 실패한 것이기 때문에 뒤로 돌아가서 다시 채워넣어야한다.

따라서 백트래킹을 이용해서 인덱스를 채워넣어야 한다.

처음에는 `frequencies`를 딕셔너리로 만들었는데, 딕셔너리로 만드니 사전순으로 원소를 채우기가 너무 힘들어서... 그냥 `charToInt`, `intToChar` 메소드를 만들고 정수랑 매핑하는 형태로 바꿨다.

## 코드

```python
class Solution:
    def lexGreaterPermutation(self, s: str, target: str) -> str:
        def charToInt(c: str) -> int: return ord(c) - ord('a')
        def intToChar(i: int) -> str: return chr(ord('a') + i)
        def dfs(isGreater: bool) -> bool:
            if len(seq) == n: return isGreater
            currentTarget = charToInt(target[len(seq)])
            for idx in range(0 if isGreater else currentTarget, 26):
                if frequencies[idx] == 0: continue
                seq.append(intToChar(idx)); frequencies[idx] -= 1
                if dfs(isGreater or idx > currentTarget): return True
                frequencies[idx] += 1; seq.pop()
            return False
        n = len(s); frequencies = [0] * 26
        for char in s: frequencies[charToInt(char)] += 1
        seq = []
        return "".join(seq) if dfs(False) else ""
```
