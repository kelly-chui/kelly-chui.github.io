---
title: "JavaScript Basics. 06. 브라우저 및 문서 객체"
date: 2025-06-06

categories: ["JavaScript"]
series: ["JavaScript Basics"]
weight: 6
tags: ["JavaScript"]

draft: true
original: "notion-export/블로그 이관/javascript-basics/6 브라우저 및 문서 객체 28aade8f376583e4a3ad812410ab21b6.md"
---

## 브라우저 객체 모델

- 웹 브라우저와 관련된 객체의 집합
- 대표적인 브라우저 객체 모델
    - window, location, navigator, history, screen, document…

![Screenshot 2025-06-06 at 12.30.02 PM.png](/images/javascript-basics-06-browser-and-document-object/Screenshot_2025-06-06_at_12.30.02_PM.png)

### `window` 객체

브라우저 기반 자바스크립트의 최상위 객체

- `alert()`, `prompt()`함수 모두 window 객체의 메소드
- `open(URL, name, features, replace)`메소드를 통해서 window 객체 생성 가능
    - `URL`: 열고자 하는 HTML 페이지의 URL
    - `name`: 윈도우 간 통신하는 데 사용하는 윈도우 이름
    - `features`: 윈도우 출력 모양을 지정하는 옵션
        - `height`: 새 윈도우의 높이
        - `width`: 새 윈도우의 너비
    - `replace`: URL이 새로운 것인가, 기존의 문서를 대체할 것인가를 나타내는 부울리언 값
- window 객체는 자신의 형태와 위치를 변경할 수 있도록 메소드 제공
    - `moveBy(x, y)`: 윈도우의 위치를 상대적으로 이동합니다.
    - `moveTo(x, y)`: 윈도우의 위치를 절대적으로 이동합니다.
    - `resizeBy(x, y)`: 윈도우의 크기를 상대적으로 지정합니다.
    - `resizeTo(x, y)`: 윈도우의 크기를 절대적으로 지정합니다.
    - `close()`: 윈도우를 닫습니다.

### `screen` 객체

웹 브라우저의 화면이 아닌 운영체제 화면의 속성을 가치는 객체

### `location` 객체

브라우저의 주소 표시줄과 관련된 객체, 프로토콜의 종류, 호스트 이름, 문서 위치 등의 정보가 있다.

- `replace()`메소드는 뒤로 가기 버튼을 사용할 수 없음
- `navigator`속성
    - appCodeName: 브라우저의 코드명
    - appName: 브라우저 이름
    - appVersion: 브라우저 버전

### `onload` 이벤트 속성

문서 객체 속성 중 `on`으로 시작하는 속성을 이벤트 속성이라 부르고 함수를 할당해야 함

```jsx
window.onload = function () {
		...
};
```

### `window` 객체의 로드 완료

`window` 객체는 HTML 페이지에 존재하는 모든 태그가 화면에 올라가는 순간이 로드가 완료되는 순간이다.

- HTML 페이지 생성 순서 → 위에서부터 차례대로

```html
<!DOCTYPE html>
<html>
<head>
		<title>Document Object Model</title>
		<script>alert('Process - 0')</script>
</head>
<body>
		<h1>Process - 1</h1>
		<script>alert('Process - 2')</script>
		<h2>Process - 2</h2>
		<script>alert('Process - 3')</script>
</body>
</html>
```

## 문서 객체 모델

넓은 의미 → 웹 브라우저가 HTML 페이지를 인식하는 방식

좁은 의미 → `document` 객체와 관련된 객체의 집합

### 문서 객체 모델

- 문서 객체 모델을 사용하면 HTML 페이지에 태그를 추가, 수정, 제거할 수 있음
- 태그: HTML 페이지에 존재하는 `html`이나 `body`태그를 ‘태그’라고 부름
- 문서 객체: `html`이나 `body`태그를 자바스크립트에서 이용할 수 있는 객체로 만들면 문서 객체임

![Screenshot 2025-06-06 at 1.42.24 PM.png](/images/javascript-basics-06-browser-and-document-object/Screenshot_2025-06-06_at_1.42.24_PM.png)

### 노드

- 요소 노드: HTML 태그를 의미
- 텍스트 노드: 요소 노드 안에 들어있는 글자를 의미

### 문서 객체 만들기

텍스트 노드를 갖는 문서 객체: 요소 노드와 텍스트 노드 생성 후 텍스트 노드를 요소 노드에 붙여 줌

- document 객체의 노드 생성 메소드
    - `createElement(tagName)`: 요소 노드를 생성합니다.
    - `createTextNode(text)`: 텍스트 노드를 생성합니다.
- 화면에 문서를 출력하려면 생성한 문서 객체를 body 문서 객체에 연결
    - `appendChild(node)`: 객체에 노드를 연결합니다.

```html
<script>
    window.onload = function() {
        // 변수를 선언합니다.
        var img = document.createElement('img');
        // 노드를 연결합니다.
        document.body.appendChild(img);
    );
</script>
```

- 텍스트 노드를 갖지 않는 대표적인 HTML 태그는 `img`
- 텍스트 노드를 갖지 않는 문서 객체
- `img` 태그에 이미지를 넣으려면 src 속성 지정

```html
<script>
    window.onload = function() {
        // 변수를 선언합니다.
        var img = document.createElement('img');
        img.src = 'Penguins.jpg'
        img.width = 500;
        img.height = 350;
        // 노드를 연결합니다.
        document.body.appendChild(img)
    );
</script>
```

### innerHTML

문서 객체 내부의 글자를 나타낸다.

- 문서 객체의 innerHTML 속성

```html
<h1> Hello DOM..! </h1>
// Hello DOM..!이 innerHTML 속성
```

```html
<script>
    window.onload = function() {
        // 변수를 선언합니다.
        var output = '';
        // innerHTML 속성에 문자열을 할당합니다.
        document.body.innerHTML = output;
    );
</script>
```

### HTML 태그를 자바스크립트로 가져오는 방법

- document 객체가 가지는 아래표 메소드를 사용
- document 객체의 `getElementById()`메소드는 `id` 속성을 갖는 태그만 가져올 수 있으므로 id 속성을 입력
    - `getElementById(id)`: 태그의 id 속성이 id와 일치하는 문서 객체를 가져옵니다.

```html
window.onload = function() {
    // 문서 객체를 가져옵니다.
    var header1 = document.getElementById('header-1');
    var header2 = document.getElementById('header-2');
    // 문서 객체의 속성을 변경합니다.
    header1.innerHTML = 'with getElementById()';
    header2.innerHTML = 'with getElementByID()';
};
</script>
```

### 여러 개의 문서 객체 가져오는 방법

- document 객체의 `getElementById()`메소드는 한번에 한 가지 문서 객체만 가져올 수 있다.
- `getElementsByName(name)`: 태그의 name 속성이 name과 일치하는 문서 객체를 배열로 가져옵니다.
- `getElementsByTagName(tagName)`: tagName과 일치하는 문서 객체를 배열로 가져옵니다.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Index</title>
    <script>
        window.onload = function() {
            // 문서 객체를 가져옵니다.
            var headers = document.getElementsByTagName('h1');
        };
    </script>
</head>
<body>
    <h1>Header</h1>
    <h1>Header</h1>
</body>
</html>
```

### 문서 객체의 스타일 조작

- `style`속성에 있는 `border`, `color`, `fontFamily` 속성을 지정
- CSS에 입력하는 것과 같은 형식으로 입력
- `removeChild(child)`: 문서 객체의 자식 노드를 제거합니다.

```html
<body>
    <h1 id = "will-remove">Header</h1>
</body>
```

```html
<script>
    window.onload = function() {
        // 문서 객체를 가져옵니다.
        var willRemove = document.getElementById('will-remove');
        // 문서 객체를 제거합니다.
        document.body.removeChild(willRemove);
    };
</script>
```