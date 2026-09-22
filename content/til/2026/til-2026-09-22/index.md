---
title: "TIL. Sep 22, 2026"
date: 2026-09-22T22:06:18+09:00
categories:
  - TIL
series:
tags:
  - Problem Solving
draft: false
original: ""
---

## 오늘의 기록

- Python 변수 스코프
- PS
  - [LeetCode 1401. Circle and Rectangle Overlapping]({{< relref "ps/2026/ps-leetcode-1401-circle-and-rectangle-overlapping" >}})
  - [LeetCode 3498. Reverse Degree of a String]({{< relref "ps/2026/ps-leetcode-3498-reverse-degree-of-a-string" >}})

## Python과 스코프

학부연구원 이후에는 Python으로 자동화 스크립트 정도만 짜지만 (그마저도 블로그에선 TS로 스크립트를 짠다) 예전부터 스코프 다루는게 특히 이질적이었다.

이제는 PS만 파이썬으로 푸는데 `global`, `nonlocal` 같은 키워드를 그냥 내 감대로 쓰고 있어서, 한번 정리해야겠다는 생각을 했다.

### 블록 스코프와 함수 스코프

Swift나 C++에서 `if`나 `for` 블록 안에 선언한 변수는 보통 그 블록 밖에서 사용할 수 없다.

그런데 Python에서는 저런 블록들이 별도의 스코프를 만들지 않는다. 블록 안에서 이름에 값을 대입해도 그 이름은 해당 블록을 포함하는 함수나 모듈의 스코프에 속한다.

```python
def example():
    if True:
        message = "hello"

    for i in range(3):
        last = i

    print(message) # hello
    print(i, last) # 2 2
```

함수는 별도의 지역 스코프를 만든다. 함수 안에서 값을 찾을 때는 지역 스코프부터 바깥 함수, 모듈, 내장 이름 순서로 살펴본다:

```python
value = "module"

def outer():
    value = "outer"

    def inner():
        print(value)  # outer

    inner()
```

`inner` 처럼 `value`를 읽기만 하는 것은 괜찮은데, 이제 `value`의 값을 수정하는건 문제가 생긴다.

Python은 변수 선언이 존재하지 않으므로, 새로운 로컬 변수를 선언하는건지, 아니면 전역 변수를 가져와서 쓰는건지 구분할 수가 없다.

따라서 Swift의 중첩 함수에서 바깥 변수를 수정하던 것 처럼 작성하면 Python에서는 지역 변수로 취급되기 때문에, `global`과 `nonlocal`이 필요하다.

### global

함수에서 모듈에 정의된 값을 읽기만 한다면 `global`을 선언하지 않아도 된다. 하지만 함수 안에서 같은 이름에 값을 대입하면 Python은 그 이름을 지역 변수로 취급한다.

```python
count = 0

def increment():
    global count
    count += 1

increment()
print(count)  # 1
```

`global count`는 함수 안의 `count`가 모듈 스코프에 있는 `count`를 가리키도록 한다.

### nonlocal

중첩 함수에서 바깥 함수의 변수에 새 값을 대입하려면 `nonlocal`을 사용한다.

```python
def make_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

`nonlocal count`는 모듈의 전역 변수가 아니라, 가장 가까운 바깥 함수 스코프에 이미 정의된 `count`를 가리킨다.

### 클래스의 스코프

클래스 바디도 스코프을 만들지만, 일반 메소드가 바깥 함수의 변수처럼 클래스 본문의 이름을 바로 찾지는 않는다. 

클래스 본문에서 정의한 값은 클래스의 프로퍼티가 되므로 `self`나 클래스 이름을 통해 접근한다.

```python
class Counter:
    initial_count = 0

    def initial_value(self):
        return self.initial_count
```

따라서 메소드에서 클래스 프로퍼티를 `nonlocal`로 지정할 수는 없다. `nonlocal`이 찾는 대상은 바깥 함수의 스코프다. 

클래스 안에 중첩되어 있더라도 그 바깥에 함수 스코프가 있으면, 그 함수의 변수를 `nonlocal`로 가리킬 수 있다.

## PS

### LeetCode 1401

축에 평행한 직사각형과 원이 겹치거나 맞닿는지 판단해야 한다. 원의 중심에서 직사각형에 가장 가까운 점을 찾고, 그 거리와 반지름을 비교했다.

중심 좌표가 각 축의 직사각형 범위 안에 있는지에 따라 가장 가까운 점을 구할 수 있다.

### LeetCode 3498

소문자 스트링의 각 캐릭터에 역순 알파벳 값과 1부터 시작하는 위치를 곱해 합해야 한다. 알파벳과 역순 값을 대응시킨 뒤 스트링을 한 번 순회하며 계산했다.
