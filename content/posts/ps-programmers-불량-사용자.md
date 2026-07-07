---
title: "Programmers. 불량 사용자"
date: 2025-07-21
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Python", "Backtracking"]
draft: false
original: "https://junmusu.tistory.com/170"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/64064>

## 풀이

일정 크기의 배열(혹은 컬렉션)을 만들어서 매칭되는지 확인해야 하는 문제다.

DFS를 사용해서 모든 경우의 수를 만들기는 쉽지만, 그 경우의 수가 문제에서 제시하는 조건에 맞는지 확인하는 것은 어렵다. 따라서 알고리즘을 약간 수정해서 좀 더 효율적이고 만들기 쉬운 알고리즘을 만들어야 한다.

알고리즘은 다음과 같다:

  1. 주어진 `banned_id` 배열 원소 하나하나에 대응가능한 id를 `user_id`에서 뽑아서 후보 `set`에 넣는다.
  2. 1번을 재귀적으로 진행한다. `set`에 담는 이유는 id가 중복되면 안되기 때문이다.
  3. 후보 set이 완성되면, 정답 `set`에 저장한다. `set`은 `set`에 담을 수 없으므로 `frozenset`을 이용한다.
  4. 정답 `set`의 개수를 리턴한다.

### 코드

```py
def compare(strA, strB):
    if len(strA) != len(strB):
        return False
    for char in zip(strA, strB):
        if char[0] != char[1] and char[1] != '*':
            return False
    return True
    
def dfs(user_id, banned_id, index, candidateSet, idSet):
    if index == len(banned_id):
        idSet.add(frozenset(candidateSet))
        return
    for id in user_id:
        if id in candidateSet:
            continue
        if compare(id, banned_id[index]):
            dfs(user_id, banned_id, index + 1, candidateSet + [id], idSet)

def solution(user_id, banned_id):
    idSet = set()
    dfs(user_id, banned_id, 0, [], idSet)
    return len(idSet)
```
