---
title: "Programmers. Lifeboat"
date: 2026-09-14T21:03:56+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Greedy
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/42885>

## 풀이

사람들의 몸무게가 담긴 배열 `people`과 보트의 무게 제한 `limit`이 주어질 때, 모든 사람을 태우는 데 필요한 최소 보트 수를 리턴하면 된다. 보트에는 최대 두 명까지 탈 수 있다.

그리디하게 생각하자. 우선 모두 건너가야 하므로 가장 무거운 사람부터 태운다고 가정하면, 이제 문제는 '가장 무거운 사람이 탔을 때, 가장 가벼운 사람도 같이 탈 수 있는가?'이다.

결국 투 포인터다. `people` 배열을 정렬하고, 양 끝에서 시작하는 투 포인터를 한다. 

`start`는 가장 가벼운 사람, `end`는 가장 무거운 사람부터 가리킨다고 할 때, `end`를 기준으로 하나씩 줄여가면서, `start`가 가리키는 사람을 추가할 수 있는지 판단하면 된다.

문제에 함정이 하나 있다. 한 명만 남은 경우에는 가장 무거운 사람 = 가장 가벼운 사람이 된다. 이 때는 그냥 `answer`에 1을 더하고 종료시켜야지, 이 한 명을 두 사람으로 판정하면, 포인터들이 흔들리게 된다.

## 코드

```python
def solution(people, limit):
    answer = 0
    people.sort()
    start = 0
    end = len(people) - 1
    while start <= end:
        if start == end:
            answer += 1
            break
        if people[end] + people[start] <= limit:
            start += 1
        end -= 1
        answer += 1
    return answer
```
