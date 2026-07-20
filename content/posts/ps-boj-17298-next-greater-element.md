---
title: "BOJ 17298. 오큰수"
date: 2023-07-10

categories:
  - Online Judge
series:
  - Problem Solving
tags:
  - BOJ
  - C++
  - Stack
  - Swift

draft: false
original: "https://junmusu.tistory.com/123"
---

## 문제

<https://www.acmicpc.net/problem/17298>

## 풀이

스택을 이용하는 문제이다. [2493번 문제](<https://junmusu.tistory.com/122>)와 사실상 같은 문제인데, 배열이 뒤집혀 있다는 것과 인덱스가 아닌 해당 인덱스에 대응하는 값을 사용하는 것이 다르다.

### 코드

#### Swift

```swift
import Foundation

let n = Int(readLine()!)!
let a = Array(readLine()!.split(separator: " ").map { Int(String($0))! }.reversed())
var stack: [Int] = []
var answer: [Int] = []

for element in a {
    while !stack.isEmpty && stack.last! <= element {
        stack.removeLast()
    }
    if let last = stack.last {
        answer.append(last)
    } else {
        answer.append(-1)
    }
    stack.append(element)
}

print(answer.map { String($0) }.reversed().joined(separator: " "))
```

#### C++

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a;
    for(int i = 0; i < n; i++) {
        int temp;
        cin >> temp;
        a.push_back(temp);
    }
    vector<int> stack;
    vector<int> answer;
    reverse(a.begin(), a.end());
    for(int element: a) {
        while(!stack.empty() && stack.back() <= element) {
            stack.pop_back();
        }
        if(stack.empty()) {
            answer.push_back(-1);
        } else {
            answer.push_back(stack.back());
        }
        stack.push_back(element);
    }
    for(int answerIndex = (int)answer.size() - 1; answerIndex >= 0; answerIndex--) {
        cout << answer[answerIndex] << " ";
    }
}
```
