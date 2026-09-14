---
title: "Codeforces 2172M. Maximum Distance To Port"
date: 2026-09-14T21:47:29+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - BFS
features:
  - katex

draft: false
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/2172/M>

## 풀이

항구가 있는 1번 노드에서 각 노드까지의 거리를 구하고, 종류별로 항구에서 가장 멀리 있는 노드의 거리를 출력하면 된다.

최단거리 + 모든 엣지의 웨이트가 같으므로, 다익스트라보단 BFS를 쓰면 된다. 1번 노드에서 BFS를 시작하면, 모든 노드까지의 최단 거리를 구할 수 있다. 

그 이후에 각 노드를 순회하면서. 그 노드의 물건 종류를 인덱스로 하는 배열에 최대값을 저장하면 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <queue>

std::vector<int> bfs(int n, int start, std::vector<std::vector<int>>& graph) {
    std::queue<int> queue;
    std::vector<int> isVisited(n + 1);
    std::vector<int> dist(n + 1, -1);
    queue.push(start);
    isVisited[start] = 1;
    dist[start] = 0;
    while (!queue.empty()) {
        int current = queue.front();
        queue.pop();
        for (int next : graph[current]) {
            if (!isVisited[next]) {
                isVisited[next] = 1;
                dist[next] = dist[current] + 1;
                queue.push(next);
            }
        }
    }
    return dist;
}

int main() {
    int n, m, k;
    std::cin >> n >> m >> k;
    std::vector<int> a(n + 1);
    for (int idx = 1; idx <= n; idx++) {
        std::cin >> a[idx];
    }
    std::vector<std::vector<int>> graph(n + 1);
    while (m--) {
        int u, v;
        std::cin >> u >> v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }
    std::vector<int> dist = bfs(n, 1, graph);
    std::vector<int> answer(k + 1, 0);
    for (int idx = 1; idx <= n; idx++) {
        answer[a[idx]] = std::max(answer[a[idx]], dist[idx]);
    }
    for (int idx = 1; idx <= k; idx++) {
        std::cout << answer[idx] << (idx != k ? " " : "\n");
    }
    return 0;
}
```
