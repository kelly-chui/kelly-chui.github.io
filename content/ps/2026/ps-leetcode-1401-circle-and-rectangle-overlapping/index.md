---
title: "LeetCode 1401. Circle and Rectangle Overlapping"
date: 2026-09-22T19:38:27+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Geometry
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/circle-and-rectangle-overlapping>

## 풀이

원의 반지름과 중심, 그리고 사각형의 각 꼭지점의 좌표가 주어질 때, 두 도형이 겹쳐있거나 맞닿아 있다면 `true` 아니라면 `false`를 리턴하면 된다.

원에서 가장 가까운 사각형의 한 점과, 원의 중심까지의 거리와 원의 반지름을 비교하면 된다.

정말 다행히도 사각형의 변들이 x축, y축에 평행하거나 수직이므로 축을 기준으로 가장 가까운 점을 구할 수 있다.

두 개의 Boolean 상태를 만들어보자.

1. `isXIn`: 원의 중심의 x좌표가 사각형의 상, 하변의 x좌표 구간과 겹치는가?
2. `isYIn`: 원의 중심의 y좌표가 사각형의 좌, 우변의 y좌표 구간과 겹치는가?

이 두 상태가 가질수 있는 쌍의 개수는 총 4개다. 각 케이스를 시각적으로 확인해보자.

만약 둘 다 `true`라면 원이 사각형의 내부에 있는 것이다.

{{< image src="image-001.svg" >}}

하나만 `true`라면 축이랑 평행한 선분을 그어서 원과 사각형 사이의 거리를 구할 수 있다.

{{< image src="image-002.svg" >}}

모두 `false`인 경우에는 원에서 가장 가까운 사각형의 한 점이 4개의 사각형의 꼭짓점 중 하나가 된다.

{{< image src="image-003.svg" >}}

## 코드

```python
class Solution:
    def checkOverlap(self, radius: int, xCenter: int, yCenter: int, x1: int, y1: int, x2: int, y2: int) -> bool:
        def distanceToCenter(x: int, y: int) -> int:
            return math.sqrt((x - xCenter) ** 2 + (y - yCenter) ** 2)

        isXIn = x1 <= xCenter and xCenter <= x2
        isYIn = y1 <= yCenter and yCenter <= y2
        answer = False
        if isXIn and isYIn:
            answer = True
        elif isXIn and (not isYIn):
            answer = distanceToCenter(xCenter, y1) <= radius or distanceToCenter(xCenter, y2) <= radius
        elif (not isXIn) and isYIn:
            answer = distanceToCenter(x1, yCenter) <= radius or distanceToCenter(x2, yCenter) <= radius
        elif not (isXIn and isYIn):
            for x, y in [(x1, y1), (x2, y2), (x1, y2), (x2, y1)]:
                if distanceToCenter(x, y) <= radius:
                    answer = True
        return answer
```
