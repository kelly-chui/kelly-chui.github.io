---
title: "Programmers. Expression of Number"
date: 2026-09-11T20:11:38+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Two Pointers
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/12924>

## 풀이

정수 `n`이 주어지고, 연속한 자연수의 합으로 `n`을 표현하는 방법의 개수를 리턴하면 된다.

연속된 자연수의 합이고, 구간을 구해야 하므로 투 포인터를 사용하면 된다. 사실 인덱스 포인터도 필요 없다. 연속된 자연수라서...

진짜 아무런 특이사항 없이 투 포인터만 사용하는 문제인데 아주 약간의 특이사항을 굳이 말하자면, 투 포인터 풀이에서 닫힌 구간을 선호하는 편이라, `start = 0; end = -1;`으로 두고 쓰는데, 여기선 `n`이 자연수 이므로 처음부터 원소 하나를 추가하고 시작해도 된다.

딱 이정도...

## 코드

```python
def solution(n):
    answer = 0
    start = 1
    end = 1
    current = 1
    while start <= n:
        if current == n:
            answer += 1
            current -= start
            start += 1
        elif current > n:
            current -= start
            start += 1
        else:
            end += 1
            current += end
    return answer
```
