---
title: "Programmers. 단속 카메라"
date: 2025-07-21

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - Greedy
  - Programmers
  - Python

draft: false
original: "https://junmusu.tistory.com/169"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/42884>

## 풀이

그리디 문제다. 그리디는 따로 정석 구현이 있는 알고리즘이 아니라 일종의 컨셉이지만, 배열 + 그리디면 잘 알다시피 정렬이 중요한 경우가 많다.

단순하게 생각해보자, 문제에서 주어지는 것은 시작 위치와 종료 위치다. 그냥 종료하는 위치를 기준으로 오름차순 정렬한 후에 앞에서부터 탐색을 한다.

현재 자동차의 종료 위치에 카메라를 설치하고, 다음 자동차를 살펴본다. 다음 자동차의 시작 위치가 이전 자동차의 종료 위치(즉 카메라가 설치된 위치)보다 앞에 있으면 다음 자동차도 설치된 카메라를 만나게 된다. 그렇지 않다면 또 그 자동차의 종료 위치에 카메라를 설치하면 된다.

그러면 알고리즘은 다음과 같이 세울수 있다.

1. 카메라 설치 위치를 -30001 로 초기화한다.
2. routes를 차량 진출 위치 기준으로 오름차순 정렬한다.
3. 순서대로 차량을 탐색한다. 
    1. 시작 위치가 현재 카메라 설치 위치보다 크다면 이 차량은 카메라를 만나지 못하므로 종료 위치에 카메라를 설치한다.
    2. 시작 위치가 현재 카메라 설치 위치보다 작다면 1번에서 한 정렬 때문에 카메라를 무조건 만나게 된다. 그러므로 패스한다.
4. 카메라 설치 개수를 리턴한다.

### 코드

```py
def solution(routes):
    answer = 0
    routes.sort(key = lambda x: x[1])
    currentCamera = -30001
    for route in routes:
        if route[0] > currentCamera:
            answer += 1
            currentCamera = route[1]
    
    return answer
```
