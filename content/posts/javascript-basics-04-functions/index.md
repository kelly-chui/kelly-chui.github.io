---
title: "JavaScript Basics. 04. 자바스크립트 함수"
date: 2025-06-02

categories:
  - JavaScript
series:
  - JavaScript Basics
weight: 4
tags:
  - Callback
  - Closure
  - Function

draft: false
original: "notion-export/블로그 이관/javascript-basics/4 자바스크립트 함수 3c8ade8f376583b1b34b8158fb5f02e6.md"
---

## 함수 생성 방법

### 익명 함수

이름을 붙이지 않고 함수 생성

- 함수를 호출하면 함수 내부의 코드 덩어리가 모두 실행

```jsx
let helloWorld = function() {
    console.log("Hello, World!");
;

helloWorld(); // 함수 호출
console.log(helloWorld); // 함수 자체를 호출

// Hello, World!
// f () {
//    console.log("Hello, World!");
// }
```

### 선언적 함수

이름을 붙여 함수를 생성

```jsx
function helloWorld() {
    console.log("Hello, World!");
}

helloWorld(); // 함수 호출
console.log(helloWorld); // 함수 자체를 호출

// Hello, World!
// f () {
//    console.log("Hello, World!");
// }
```

### 화살표 함수

하나의 표현식을 리턴하는 함수를 만들 때는 중괄호 생략 가능

```jsx
let helloWorld = () => {
    console.log("Hello, World!");
};

helloWorld();
console.log(helloWorld);

// Hello, World!
// () => {
//     console.log("Hello, World!");
// }
```

### 리턴 없는 함수

```jsx
function print(message) {
    console.log(`${message} 라고 말했습니다`);
}

print("안녕하세요");
```

## 함수 활용

### 함수 매개 변수 초기화

- 매개 변수를 입력하지 않고 함수 호출
- 실행하면 undefined 출력

```jsx
function print(name, count) {
    console.log(`${name}이/가 ${count}개 있습니다`)
}

print("사과", 10);
print("사과");
```

- 조건문을 활용한 매개 변수 초기화

```jsx
function print(name, count) {
    if(!count) {
        count = 1;
    }
    console.log(`${name}이/가 ${count}개 있습니다`)
}

print("사과", 10);
print("사과");
```

### 콜백 함수

- 함수의 매개 변수로 전달되는 함수

```jsx
function callTenTimes(callback) {
    for (let i = 0; i < 10; i++) {
        callback();
    }
}

callTenTimes(function() {
    console.log("함수 호출");
});
```

### 표준 내장 함수

- 타이머 함수:

```jsx
let id = setInterval(function() {
    console.log("1초마다 호출됩니다.");
}, 1000);
setTimeout(function() {
    clearInterval(id);
}, 3000);
```

## 노트

```jsx
function foo() {
    // 함수 선언 → 세미콜론 X
}
const bar = function() {
    // 함수 표현식 → 세미콜론 O
};
const baz = () => {
    // 화살표 함수 → 세미콜론 O
};
```