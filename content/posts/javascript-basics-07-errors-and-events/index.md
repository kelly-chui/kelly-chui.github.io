---
title: "JavaScript Basics. 07. 자바스크립트 예외처리 및 이벤트 처리"
date: 2025-06-09

categories:
  - JavaScript
series:
  - JavaScript Basics
weight: 7
tags:
  - DOM
  - Error Handling
  - Event

draft: false
original: "notion-export/블로그 이관/javascript-basics/7 자바스크립트 예외처리 및 이벤트 처리 27fade8f3765825295dc819696f69de4.md"
---

## 예외 처리

- 예외 → 실행에 문제가 발생하면 자동 중단됨
- 예외 처리 → 오류에 대처할 수 있게 하는 것

### 예외와 기본 예외 처리

- TypeError 기본 예외 처리
    - 사전에 해당 데이터가 `undefined`인지 조건문으로 확인

### 고급 예외 처리

- `try`, `catch`, `finally` 구문

```jsx
try {
    // 예외 발생
} catch (exception) {
    // 예외 처리
} finally {
    // 무조건 실행
}
```

`catch`구문, `finally`구문 생략 가능

### 예외 객체

예외가 발생하면 어떤 예외가 발생했는지 정보를 전달함, `catch` 구문의 괄호 안의 변수

- `name`속성과 `message`속성이 있음

### 예외 강제 발생

- 간단한 예외 강제 발생은 `throw`로 하면 된다.

```jsx
try {
    throw '예외가 발생했습니다';
} catch (exception) {
    console.log('예외가 발생했습니다.');
    console.log(exception);
}
// 예외가 발생했습니다.
// 예외가 발생했습니다
```

- 자세한 예외 출력은 Error 객체를 사용

```jsx
const error = new Error('메시지');
error.name = '에러 이름';
error.message = '에러 메세지';

throw error;
```

## 이벤트 처리

키보드를 이용해 버튼을 입력하거나 마우스 클릭처럼 다른 것에 영향을 미치는 것

- 애플리케이션 사용자가 발생시킬 수도 있고, 애플리케이션이 스스로 발생시킬 수도 있음
- 자바 스크립트 이벤트 종류

### 이벤트 연결

- `window` 객체의 `onload` 속성에 함수 자료형을 할당하는 것
- `load`를 이벤트 이름 또는 이벤트 타입이라 함
- `onload`를 이벤트 속성이라고 함
- 이벤트 속성에 할당한 함수를 이벤트 리스너 또는 이벤트 핸들러라 함

```html
<script>
    window.onload = function() {};
</script>
```

### 이벤트 모델

- 이벤트 모델 → 문서 객체에 이벤트를 연결하는 방법
- `load`를 이벤트 이름 또는 이벤트 타입이라 함
    - DOM Level 단계에 따라 두 가지로 분류
    - 분류된 두 가지가 각기 두 가지로 나뉘어 총 네 가지 방법으로 이벤트 연결

### DOM Level

- DOM Level 0
    - 인라인 이벤트 모델
    - 기본 이벤트 모델
- DOM Level 2
    - 마이크로소프트 인터넷 익스플로러 이벤트 모델
    - 표준 이벤트 모델

### 고전 이벤트 모델

자바스크립트에서 문서 객체의 이벤트 속성으로 이벤트를 연결하는 방법, 현대에서도 많이 사용

```html
<body>
    <h1 id="header">Click</h1>
</body>
```

- `getElementById()`메소드로 문서 객체를 가져오고 click 이벤트를 연결하여 클릭 시 계속 이벤트 실행

```html
<script>
    window.onload = function() {
        var header = document.getElementById('header');
        // 이벤트 연결
        header.onclick = function() {
            alert('클릭');
        );
    );
</script>
```

### 이벤트 발생 객체와 이벤트 객체

- `this` 키워드
    - 이벤트를 발생한 객체를 찾을 수 있음
- 이벤트 핸들러 안에서의 `this` 키워드

```html
<!DOCTYPE html>
<html>
<head>
    <script>
        window.onload = function() {
            document.getElementById('header').onclick = function() {
                this.style.color = 'orange';
                this.style.backgroundColor = 'red';
            };
        };
    </script>
</head>
<body>
    <h1 id="header">Click</h1>
</body>
</html>
```

### 이벤트 강제 실행

- 메서드를 호출하는 것 처럼 이벤트 속성을 호출하면 이벤트가 강제로 실행

```jsx
header.onclick()
```

- body 태그 구성

```html
<body>
    <button id = "button-a">ButtonA</button>
    <button id = "button-b">ButtonB</button>
    <h1>Button A - <span id="counter-a">0</span></h1>
    <h1>Button B - <span id="counter-b">0</span></h1>
</body>
```

- 이벤트 연결

```html
<script>
    window.onload = function() {
        var buttonA = document.getElementById('button-a');
        var buttonB = document.getElementById('button-b');
        var counterA = document.getElementById('counter-a');
        var counterB = document.getElementById('counter-b');
    buttonA.onclick = function(){
        counterA.innerHTML = Number(counterA.innerHTML) + 1;
    };
    buttonB.onclick = function() {
        counterB.innerHTML = Number(counterB.innerHTML) + 1;
    };
</script>
```

### 인라인 이벤트 모델

- HTML 페이지의 가장 기본적인 이벤트 연결 방법

```html
<body>
    <h1 onclick ="alert('클릭');">Click<h1>
</body>
```

### 디폴트 이벤트

- submit 이벤트 연결
- 이벤트 리스너에서 false를 리턴

### 이벤트 전달

- 네 개의 태그, 네 개의 이벤트
- 이벤트 버블링
    - 이벤트 버블링은 자식 노드에서 부모 노드 순으로 이벤트를 실행한다.
    - 이벤트 전달 순서는 이벤트 버블링을 따름
- 이벤트 캡쳐링
    - 부모노드에서 자식 노드 순으로 실행
