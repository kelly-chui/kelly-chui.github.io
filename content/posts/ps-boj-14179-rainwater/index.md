---
title: "BOJ 14179. 빗물"
date: 2024-05-28

categories:
  - PS
series:
  - Problem Solving
tags:
  - BOJ
  - C++
  - Stack

draft: false
aliases:
  - "/posts/ps-boj-14179-빗물/"

original: "https://junmusu.tistory.com/147"
---

## 문제

<https://www.acmicpc.net/problem/14719>

## 풀이

스택 문제이다. 빗물은 양 옆이 블록으로 막혀있을 때, 낮은 블록의 높이를 기준으로 그 사이에 빗물이 고이게 된다. 따라서 스택을 하나 만들고 인덱스 순서대로 입력받은 다음에, "현재까지" 가장 높게 쌓여있던 블록의 높이(`currentMax`)와 같거나 더 높게 쌓여있는 블록이 스택에 들어오려 할 때, 스택에 쌓여있는 모든 블록들을 빼내면서 고여있는 물의 양을 더하면 된다(`currentMax - 중간 블록의 높이`).

하지만 이러한 방법을 쓰면 문제점이 하나 있는데, 블록이 계속 커진다는 보장이 없기 때문에, 마지막에 있는 블록들이 붕 뜨게 된다. 이 때는 스택을 뒤집어서 해결하면 된다. 현재 `currentMax`보다 더 큰 수가 앞에 존재하지 않는다면 뒤집힌 스택은 무조건 `currentMax`가 마지막에 존재하게 된다. (만약 `currentMax`보다 낮은 블록은 이미 pop된 상태일 것이기 때문에) 따라서 스택을 뒤집은 다음(혹은 다른 스택에 차례대로 옮긴 후에) 이 전의 과정을 한번 반복하면 문제가 해결된다.

### 코드

```cpp
#include <iostream>
#include <stack>
using namespace std;

int main() {
    int h, w;
    cin >> h >> w;
    int * blocks = new int[w];
    for (int idx = 0; idx < w; idx++) {
        cin >> blocks[idx];
    }
    stack<int> blockStack;
    int answer = 0;

    int currentMax = 0;
    for (int idx = 0; idx < w; idx++) {
        if (currentMax <= blocks[idx]) {
            while (!blockStack.empty()) {
                answer += (currentMax - blockStack.top());
                blockStack.pop();
            }
            currentMax = blocks[idx];
        }
        blockStack.push(blocks[idx]);
    }

    stack<int> secondStack;
    currentMax = 0;
    while (!blockStack.empty()) {
        if (currentMax <= blockStack.top()) {
            while (!secondStack.empty()) {
                answer += (currentMax - secondStack.top());
                secondStack.pop();
            }
            currentMax = blockStack.top();
        }
        secondStack.push(blockStack.top());
        blockStack.pop();
    }

    cout << answer << endl;
    return 0;
}
```

