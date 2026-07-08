---
title: "JavaScript Basics. 03. 자바스크립트 사용자 정의 자료형 활용"
date: 2025-06-01

categories: ["JavaScript"]
series: ["JavaScript Basics"]
weight: 3
tags: ["JavaScript"]

draft: false
original: "notion-export/블로그 이관/javascript-basics/3 자바스크립트 사용자 정의 자료형 활용 2dcade8f3765824ebcea811c42e91fb6.md"
---

## 조건문

### if 조건문

bool 표현식이 `true`이면 문장을 실행, `false`이면 문장을 무시

```jsx
let input = 32;
if (input % 2 == 0) {
    console.log("짝수입니다!");
}
if (input % 2 == 1) {
    console.log("홀수입니다!");
}

let date = new Date();
if (date.getHours() < 12) {
    console.log("오전입니다.");
}
if (12 <= date.getHours()) {
    console.log("오후입니다.");
}
```

### if else 조건문

조건이 합당하지 않은 경우의 표현식도 포함하는 조건문

```jsx
let input = 32;
if (input % 2 == 0) {
    console.log("짝수입니다!");
} else {
    console.log("홀수입니다!");
}

let date = new Date();
if (date.getHours() < 12) {
    console.log("오전입니다.");
} else {
    console.log("오후입니다.");
}
```

### 중첩 조건문

조건문이 중첩된 형태

```jsx
let date = new Date();
let hours = date.getHours();
if (hours < 11) {
    console.log("아침 먹을 시간입니다.");
} else {
    if (hours < 15) {
        console.log("점심 먹을 시간입니다.");
    } else {
        console.log("저녁 먹을 시간입니다.");
    }
}
```

### if else if 조건문

중복되지 않는 세 가지 이상의 조건을 구분할 때 사용

```jsx
let date = new Date();
let hours = date.getHours();
if (hours < 11) {
    console.log("아침 먹을 시간입니다.");
} else if (hours < 15) {
    console.log("점심 먹을 시간입니다.");
} else {
    console.log("저녁 먹을 시간입니다.");
}
```

### Switch 조건문

```jsx
let input = 32;
switch (input % 2) {
    case 0:
        console.log("짝수입니다.");
        break;
    case 1:
        console.log("홀수입니다.");
        break;
}
```

`break`를 사용하지 않는다면 fallthrough가 됨

## 반복문

### 배열

- 여러 개의 자료를 한꺼번에 다룰 수 있는 자료형
- 대괄호 내부의 각 자료는 쉼표로 구분
- 배열에는 여러 자료형이 섞여 있을 수 있음
- 요소: 배열 안에 들어있는 각 자료

```jsx
let array = [13, "스트링", true];
array[0] = 0;
console.log(array[0]);
console.log(array[1]);
console.log(array[2]);
```

### while 반복문

조건이 참일 경우만 반복하는 반복문

```jsx
let i = 0;
let array = [1, 2, 3, 4, 5];
while (i < array.length) {
    console.log(i + "번짼 출력:" + array[i]);
    i++;
}
```

### for 반복문

초기식을 비교 → 조건식을 비교 → 문장 실행 → 종결식 실행

```jsx
let output = 0;
for (let i = 0; i <= 100; i++) {
    output += i;
}
console.log(output);
```

### for in 반복문과 for of 반복문

강의에서 이 부분 설명을 너무 빈약하게 함...

`for in`은 객체나 배열의 인덱스처럼 열거 가능한 키를 순회할 때 사용하고, `for of`는 배열이나 문자열처럼 반복 가능한 값 자체를 순회할 때 사용한다.

```jsx
let fruits = ["apple", "banana", "cherry"]
for (let index in fruits) {
    console.log(index); // 0, 1, 2
}
for (let fruit of fruits) {
    consol.log(fruit); // apple, banana, cherry
}
```

### break 키워드

반복문에서 벗어나게 해주는 키워드

```jsx
let i = 0;
let array = [1, 2, 3];
let output;

while (true) {
   if (array[i] % 2 == 0) {
       output = array[i];
       break;
   }
   i = i + 1;
}
console.log(`처음 발견한 짝수는 ${output} 입니다`); // `써야 하네
```

### continue 키워드

반복문 내부에서 현재 반복을 멈추고 다음 반복을 진행함

```jsx
for (let i = 1; i < 10; i++) {
    if (i % 2 == 0) {
        continue;
    }
    console.log;
}
```