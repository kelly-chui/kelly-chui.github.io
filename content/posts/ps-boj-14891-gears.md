---
title: "BOJ 14891. 톱니바퀴"
date: 2024-04-19

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
  - "/posts/ps-boj-14891-톱니바퀴/"

original: "https://junmusu.tistory.com/145"
---

## 문제

<https://www.acmicpc.net/problem/14891>

## 풀이

상황 설명이 굉장히 난해하고 비직관적이므로 글을 잘 읽어야 한다. 문제를 겨우 이해하고 나면 알고리즘이나 구현 능력 자체는 크게 요구하지 않는다. 글을 이해하는것 자체가 이 문제의 가장 큰 난관이다.

이 문제에서 톱니바퀴는 현실의 톱니바퀴처럼 움직이지 않는다. 이전 톱니바퀴가 회전하면 다음 톱니바퀴도 회전해야할지 말아야 할지를 이미 돌아간 상태의 이전 톱니바퀴가 아닌 돌기 전의 이전 톱니바퀴의 상태로 판단해야 한다.

### 코드

```py
class Gear():
    def __init__(self, stat):
        self.__stat = stat
        self.__top = 0
        self.__left = 6
        self.__right = 2

    def rotate(self, drct):
        self.__top = (self.__top - drct) % 8
        self.__left = (self.__left - drct) % 8
        self.__right = (self.__right - drct) % 8

    @property
    def top(self):
        return self.__stat[self.__top]
    @property
    def left(self):
        return self.__stat[self.__left]
    @property
    def right(self):
        return self.__stat[self.__right]

def left_shift(gear_num, drct):
    new_drct = drct * -1
    cur_gear = gear_num
    for next_gear in range(gear_num - 1, 0, -1):
        if gears[next_gear].right != gears[cur_gear].left:
            rotate_queue.append((next_gear, new_drct))
            cur_gear = next_gear
            new_drct *= -1
        else:
            break

def right_shift(gear_num, drct):
    new_drct = drct * -1
    cur_gear = gear_num
    for next_gear in range(gear_num + 1, 5):
        if gears[next_gear].left != gears[cur_gear].right:
            rotate_queue.append((next_gear, new_drct))
            cur_gear = next_gear
            new_drct *= -1
        else: 
            break

gear1 = Gear(list(map(int, input())))
gear2 = Gear(list(map(int, input())))
gear3 = Gear(list(map(int, input())))
gear4 = Gear(list(map(int, input())))
gears = [None, gear1, gear2, gear3, gear4]

k = int(input())
answer = 0

rotate_queue = []

for _ in range(k):
    num, drct = map(int, input().split())
    rotate_queue.append((num, drct))
    left_shift(num, drct)
    right_shift(num, drct)
    for g, d in rotate_queue:
        gears[g].rotate(d)
    rotate_queue = []

rank = 1
for idx in range(1, 5):
    answer += gears[idx].top * rank
    rank *= 2

print(answer)
```
