---
title: "Codeforces 580C. Kefa and Park"
date: 2026-08-04T11:34:01+09:00

categories:
  - Problem Solving
series:
tags:
algorithmTags:
  - DFS
features:
  - katex

draft: true
original: ""
---

## 문제

<https://codeforces.com/problemset/problem/580/C>

## 풀이

노드의 값이 `1` 혹은 `0`인 트리 그래프와 그 크기인 정수 `n`이 주어진다. 루트 노드인 1번 노드에서 시작했을 때, 중간에 값이 1인 노드를 연속으로 `m`번을 초과해서 만날 수 없다. 이 때, 도달할 수 있는 리프 노드의 개수를 출력하면 된다.

트리 전체를 탐색하면서 연속으로 조우한 값이 1인 노드 개수를 관리하면 된다. 그리고 현재 방문한 노드가 리프 노드인지 판정하고, 만약 리프 노드면 1을 더하면 된다. 트리도 그래프이기 때문에, BFS, DFS 어느 쪽이든 가능하지만, 풀이를 할 때 DFS를 사용했다.

트리를 순회할 때는, 일반 그래프와 특성이 약간 다르다. 우선, 형제 노드가 없고 무조건 자식 혹은 부모 노드다. 이 특성으로 리프 노드를 아주 쉽게 판별할 수 있는데, 만약 연결된 유일한 노드가 부모 노드인 노드가 리프 노드다. 또한 형제라는 개념이 없기 때문에 연결된 노드가 하나면 루트를 제외하곤 리프 노드라고 볼 수 있다.

개인적으로 전역 변수를 쓰는 것을 선호하지 않고, C++에선 nested function이 불가능 하니, 함수 파라미터로 레퍼런스들을 우르르 보내는 코드가 되었다. 벡터를 사용하기 시작한 것 처럼, 이제 전역변수도 써볼까 생각한다...

## 코드

```cpp
#include <iostream>
#include <vector>

int dfs(
    int currentNode,
    int catCount,
    std::vector<std::vector<int>>& tree,
    std::vector<int>& a,
    int m,
    int parent
) {
    bool isLeaf = true;
    int answer = 0;
    for (int nextNode : tree[currentNode]) {
        if (nextNode == parent) continue;
        isLeaf = false;
        int nextCatCount = catCount;
        if (a[nextNode] == 1) {
            nextCatCount++;
        } else {
            nextCatCount = 0;
        }
        if (nextCatCount > m) continue;
        answer += dfs(nextNode, nextCatCount, tree, a, m, currentNode);
    }
    if (isLeaf) return 1;
    return answer;
}

int main() {
    int n, m;
    std::cin >> n >> m;
    std::vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) {
        std::cin >> a[i];
    }
    std::vector<std::vector<int>> tree(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int xi, yi;
        std::cin >> xi >> yi;
        tree[xi].push_back(yi);
        tree[yi].push_back(xi);
    }
    std::cout << dfs(1, a[1], tree, a, m, -1) << std::endl;
    return 0;
}
```
