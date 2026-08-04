---
title: "Codeforces 520B. Two Buttons"
date: 2026-08-03T13:30:19+09:00

categories:
  - Problem Solving
series:
tags:
  - BFS

algorithmTags:
  - BFS
features:
  - katex

draft: false
original: ""
aliases:
  - /posts/ps-codeforces-520b-two-buttons/
---

## 문제

<https://codeforces.com/problemset/problem/520/B>

## 풀이

정수 `n`, `m`이 주어지고, 연산 2개 (* 2, - 1)을 이용해서 `n`을 `m`으로 만드는데 필요한 연산의 최소 개수를 출력하면 된다.

$1 <= n, m <= 10^4$ 제약조건과 2배로 만드는 연산을 생각해보면 만들 수 있는 숫자의 개수는 최대 2만개 정도이다. 이 숫자들을 각각을 노드라 생각하면, 연산으로 정의되는 노드간 연결도 명확한 그래프로 생각할 수 있다.

그러면 이 문제는 최단 거리 문제가 되므로 BFS를 사용해서 쉽게 풀 수 있다. 2배 연산이 있으므로 방문 확인 배열의 크기를 m * 2로 잡고 BFS를 하면된다. (방문 확인 배열도 할 겸 거리를 세는 기능도 넣으면 좋다.)

다만, 증가는 2배로 빠르게 하지만 감소는 1씩 감소된다. 만약 `m` 이 `n`보다 작다면 BFS도 굉장히 비효율적으로 변한다. 이 경우엔 단순히 `n - m`을 리턴하면 된다.

## 코드

```cpp
#include <iostream>
#include <vector>
#include <queue>

int bfs(int n, int m) {
    std::queue<int> q;
    std::vector<int> clickCount(m * 2, -1);
    q.push(n);
    clickCount[n] = 0;

    while (!q.empty()) {
        int current = q.front();
        q.pop();
        for (int next: {current * 2, current - 1}) {
            if (next < 0 || next >= (int)clickCount.size()) { continue; }
            if (clickCount[next] >= 0) { continue; }
            clickCount[next] = clickCount[current] + 1;
            if (next == m) { return clickCount[m]; }
            q.push(next);
        }
    }
    return clickCount[m];
}

int main() {
    int n, m;
    std::cin >> n >> m;
    std::cout << (n >= m ? n - m : bfs(n, m)) << std::endl;
    return 0;
}
```
