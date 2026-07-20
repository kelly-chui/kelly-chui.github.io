---
title: "Programmers. 디스크 컨트롤러"
date: 2025-08-02

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - Priority Queue
  - Programmers
  - Python

draft: false
aliases:
  - "/posts/ps-programmers-디스크-컨트롤러/"

original: "https://junmusu.tistory.com/175"
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/42627>

## 풀이

우선 순위대로 문제를 처리하므로 힙을 써야하는 것은 명확하다. 하지만, 이 힙을 어떻게 다루느냐가 더 중요한 문제이기 때문에 사실상 힙보다는 단순 구현 문제에 가깝다.

### 코드

```py
import heapq

def solution(jobs):
    jobs.sort(key = lambda x: x[0])
    waitQueue = []
    finished = 0
    currentTime = 0
    jobIdx = 0
    totalReturnTime = 0
    while finished < len(jobs):
        while jobIdx < len(jobs) and jobs[jobIdx][0] <= currentTime:
            requestTime, duration = jobs[jobIdx]
            heapq.heappush(waitQueue, (duration, requestTime))
            jobIdx += 1
        if waitQueue:
            duration, requestTime = heapq.heappop(waitQueue)
            currentTime += duration
            returnTime = currentTime - requestTime
            totalReturnTime += returnTime
            finished += 1
        else:
            currentTime = jobs[jobIdx][0]
    return totalReturnTime // len(jobs)
```
