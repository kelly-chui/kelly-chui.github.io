---
title: "BOJ 14499. 주사위 굴리기"
date: 2024-04-15

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - Implementation
  - Python
  - Simulation

draft: false
aliases:
  - "/posts/ps-boj-14499-주사위-굴리기/"

original: "https://junmusu.tistory.com/143"
---

## 문제

<https://www.acmicpc.net/problem/14499>

## 풀이

특별한 알고리즘이나 문제 해결 기법을 사용할 필요 없이, 순수하게 딕셔너리 자료구조만을 사용해서 풀 수 있는 문제이다. 

주어진 주사위의 전개도를 이용하여 각 면에 숫자를 붙이고(면에 써져있는 숫자가 아닌 각 면을 인식하게 해주는 숫자, 이하 ID숫자라고 하겠다.) 이를 방향: ID 숫자의 꼴로 딕셔너리를 생성한다.

또 ID숫자: 면에 적힌 숫자 꼴로 딕셔너리를 하나 더 생성하여 두개의 딕셔너리로 주사위의 방향과 각 면에 적혀있는 숫자를 추적할 수 있다. 

### 코드

```py
import copy

def north():
    global dice_drct
    original_drct = copy.deepcopy(dice_drct)
    for new, ori in zip(["u", "l", "n", "e", "w", "s"], ["s", "n", "u", "e", "w", "l"]):
        dice_drct[new] = original_drct[ori]

def south():
    global dice_drct
    original_drct = copy.deepcopy(dice_drct)
    for new, ori in zip(["u", "l", "n", "e", "w", "s"], ["n", "s", "l", "e", "w", "u"]):
        dice_drct[new] = original_drct[ori]

def east():
    global dice_drct
    original_drct = copy.deepcopy(dice_drct)
    for new, ori in zip(["u", "l", "n", "e", "w", "s"], ["w", "e", "n", "u", "l", "s"]):
        dice_drct[new] = original_drct[ori]

def west():
    global dice_drct
    original_drct = copy.deepcopy(dice_drct)
    for new, ori in zip(["u", "l", "n", "e", "w", "s"], ["e", "w", "n", "l", "u", "s"]):
        dice_drct[new] = original_drct[ori]

def change():
    if graph[x][y] == 0:
        graph[x][y] = dice_num[dice_drct["l"]]
    else:
        dice_num[dice_drct["l"]] = graph[x][y]
        graph[x][y] = 0

def check(x, y):
    if x < 0 or x >= n or y < 0 or y >=m:
        return False
    return True

n, m, x, y, k = map(int, input().split())
graph = []
for _ in range(n):
    graph.append(list(map(int, input().split())))
orders = list(input().split())

dice_num = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
dice_drct = {"u": 1, "l": 6, "n": 2, "e": 3, "w": 4, "s": 5}

for order in orders:
    isTrue = False
    if order == "1":
        if check(x, y + 1):
            y += 1
            east()
            change()
            isTrue = True
    if order == "2":
        if check(x, y - 1):
            y -= 1
            west()
            change()
            isTrue = True
    if order == "3":
        if check(x - 1, y):
            x -= 1
            north()
            change()
            isTrue = True
    if order == "4":
        if check(x + 1, y):
            x += 1
            south()
            change()
            isTrue = True
    if isTrue:
        print(dice_num[dice_drct["u"]])
```
