---
title: "BOJ 2668. 숫자고르기"
date: 2024-06-04
categories: ["Online Judge"]
series: ["Problem Solving"]
tags: ["BOJ", "C++", "DFS"]
draft: false
original: "https://junmusu.tistory.com/148"
---

## 문제

<https://www.acmicpc.net/problem/2668>

## 풀이

문제를 간단하게 표현하면 그래프 내의 사이클을 모두 찾은 다음에, 사이클에 포함되는 노드을 모두 출력하면 된다. 사이클을 찾으려면 그래프내의 모든 노드에서 dfs를 쓰면 되는데 다음과 같은 케이스들로 나눌 수 있겠다.

### 1. 사이클에 도달하긴 하나 시작 노드는 사이클에 포함되지 않는 케이스

![](/images/tistory/tistory-148-백준BOJ-2668-숫자고르기/image-002.png)

주어진 예제에서 2번, 4번, 6번, 7번 노드가 해당한다.

탐색을 시작한 노드에서 사이클에 도달하긴 하나, 시작한 노드는 사이클에 포함되지 않는다. 최적화를 위해 이러한 케이스에도 사이클만 따로 분리해 중복되는 연산을 줄일 수 있겠지만, 이 문제의 n이 큰 수가 아니므로, 그냥 아무런 행동도 하지 않는다.

### 2. 탐색을 시작한 노드가 사이클에 포함되는 케이스**

![](/images/tistory/tistory-148-백준BOJ-2668-숫자고르기/image-003.png)

예제에서 1번, 3번 노드가 해당한다.

dfs탐색을 시작한 노드가 사이클에 포함되는 케이스이다. 사이클을 찾았고, 시작한 노드가 사이클에 포함되므로 사이클 내부의 모든 원소를 따로 배열이나 벡터에 저장해 둔다.

### 3. 혼자서 사이클을 형성하는 케이스**

![](/images/tistory/tistory-148-백준BOJ-2668-숫자고르기/image-004.png)

2번 케이스의 특수한 형태라고 볼 수 있지만, 굳이 dfs 탐색을 하지 않아도 찾을 수 있는 케이스다.

같은 사이클 내부에 존재하는 모든 노드들의 탐색 결과는 무조건 같다는 것을 알 수 있다. 따라서 메모이제이션을 통해 연산의 횟수를 줄일 수 있다.

### 코드

```cpp
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

void dfs(int start, int &cycleSize, vector<int> &table, vector<int> &tempCycle, vector<int> &memoTable, vector<int> &answerVec) {
    auto cycleChecker = find(tempCycle.begin(), tempCycle.end(), start);
    if (cycleChecker == tempCycle.end()) {
        cycleSize++;
        tempCycle.push_back(start);
        dfs(table[start], cycleSize, table, tempCycle, memoTable, answerVec);
    } else {
        if (tempCycle[0] == start) {
            for (int element: tempCycle) {
                memoTable[element] = cycleSize;
                answerVec.push_back(element);
            }
        } else {
            return;
        }
    }
}

int main() {
    int n;
    cin >> n;
    vector<int> table(n + 1, 0);
    vector<int> memoTable(n + 1, 0);
    vector<int> answerVec;

    for (int idx = 1; idx <= n; idx++) {
        cin >> table[idx];
        if (table[idx] == idx) {
            memoTable[idx] = 1;
            answerVec.push_back(idx);
        }
    }

    for (int start = 1; start <= n; start++) {
        if (memoTable[start] != 0) {
            continue;
        }
        int cycleSize = 0;
        vector<int> tempCycle;
        dfs(start, cycleSize, table, tempCycle, memoTable, answerVec);
    }

    cout << answerVec.size() << endl;
    sort(answerVec.begin(), answerVec.end());
    for(int element: answerVec) {
        cout << element << endl;
    }
    return 0;
}
```

