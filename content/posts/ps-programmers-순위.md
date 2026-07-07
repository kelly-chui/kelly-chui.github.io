---
title: "Programmers. 순위"
date: 2025-08-05
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["Programmers", "Python", "DFS"]
draft: false
original: "https://junmusu.tistory.com/178"
---

## 문제

https://school.programmers.co.kr/learn/courses/30/lessons/49191

## 풀이

처음에 문제를 막 읽었을 때는 조금 어려워 보이지만, 문장을 살짝 다르게 해석해보자. '정확하게 순위를 매길 수 있는 선수의 수'를 알아야 하는데 정확하게 순위를 매긴다는 것은 어떨 때 성립할까? 특정 선수 A가 존재할 때, A와 서로 승패를 알 수 없는 선수 B가 존재하면 정확하게 순위를 매길 수 없는 것이다. 반대로 A가 다른 모든 선수들과 확실하게 승패의 결과를 알 수 있다면, 정확하게 순위를 매길 수 있다.

문제에서는 경기 결과를 제공해주므로, 선수들의 실력을 간접적으로 알 수 있다. 실력을 수치화 해서 관리할 수 있으면 좋지만, 그럴게 할 수 없는 조건이고 그럴 필요도 없다. 단순하게 선수들간의 '승', '패' 결과를 그래프로 관리해주면 된다. 승리 그래프와 패배 그래프를 따로 만들어서, 경기 결과를 그래프로 표현하고, 각 선수마다 이 선수가 승리할 선수, 패배할 선수의 수를 세어주면 된다. 특정 선수가 다른 모든 선수들과 확실하게 승패의 결과를 알 수 있다는 것은, 결국 승리할 선수와 패배할 선수의 합이 현재 선수를 제외한 나머지 선수의 수와 같은 것이기 때문이다.

### 코드

```py
def dfs(player, graph, visited):
    for competitor in graph[player]:
        if competitor not in visited:
            visited.add(competitor)
            dfs(competitor, graph, visited)

def solution(n, results):
    answer = 0
    win = [[] for _ in range(n + 1)]
    lose = [[] for _ in range(n + 1)]
    for winner, loser in results:
        win[winner].append(loser)
        lose[loser].append(winner)
    for player in range(1, n + 1):
        winFrom = set()
        loseFrom = set()
        dfs(player, win, winFrom)
        dfs(player, lose, loseFrom)
        if len(winFrom) + len(loseFrom) == n - 1:
            answer += 1
    return answer
```
