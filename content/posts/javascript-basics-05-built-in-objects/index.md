---
title: "JavaScript Basics. 05. 자바스크립트 내장 객체"
date: 2025-06-03

categories:
  - JavaScript
series:
  - JavaScript Basics
weight: 5
tags:
  - Built-in Object
  - Object
  - Prototype

draft: false
original: "notion-export/블로그 이관/javascript-basics/5 자바스크립트 내장 객체 e13ade8f3765825ebc26810cee5e81e0.md"
---

## 객체

### 배열

- 기본 형태

```jsx
let array = ['사과', '바나나', '망고', '딸기'];
array[0] // '사과'
array[1] // '바나나'
```

- 배열은 요소에 접근할 때 인덱스를 사용한다.

### 객체 기본

배열과 다르게 키를 통해서 접근하게 된다.

- 객체 선언

```jsx
let product = {
    제품명: '7D 건조 망고',
    유형: '당절임',
    원산지: '필리핀'
};

console.log(product); // {제품명: '7D 건조 망고', 유형: '당절임', 원산지: '필리핀'}
```

- 객체 접근

```jsx
product['제품명'] // '7D 건조 망고'
product['유형'] // 당절임
product['원산지'] // 필리핀
product.제품명 // '7D 건조 망고'
product.유형 // '당절임'
product.원산지 // '필리핀'
```

### 객체와 반복문

`for in` 반복문을 사용해 객체에 반복문을 적용

```jsx
let object = {
    name: '바나나',
    price: 1200
};

for (let key in object) {
    console.log(`${key}: ${object[key]}`);
}
```

### 메소드

객체의 속성 중 자료형이 함수인 속성

```jsx
let object = {
    name: '바나나',
    price: 1200,
    print: function () {
        console.log(`${this.name}의 가격은 ${this.price}원입니다.`);
    }
};

object.print();
```

### 객체 지향 프로그래밍

현실의 객체를 모방해서 프로그래밍, 배열과 객체를 사용하면 여러 개의 데이터를 쉽게 다룰 수 있다.

### 생성자 함수

객체를 만드는 함수, 대문자로 시작하는 이름 사용

```jsx
function Product(name, price) {
    this.name = name;
    this.pice = price;
}

let product = new Product("바나나", 1200);
console.log(product); // Product {name: '바나나', pice: 1200}
```

### 프로토타입

생성자 함수로 만든 객체는 프로토타입 공간에 메소드를 지정해서 모든 객체가 공유 하도록 한다.

- 해당 함수를 생성자 함수로 사용했을 때만 의미가 있음.

```jsx
function Product(name, price) {
    this.name = name;
    this.price = price;
}

Product.prototype.print = function() {
    console.log(`${Product, name}의 가격은 ${Product.price}원입니다.`);
};

let product = new product("바나나", 1200);
Product.print();
```

## 표준 내장 객체

자바스크립트는 다양한 객체를 제공한다.

### 기본 자료형과 객체 자료형

- 기본 자료형의 속성 또는 메소드를 사용할 때 기본 자료형이 자동으로 객체로 변환이 됨 → 기본 자료형과 객체 자료형 모두 속성과 메소드를 사용함.
- 차이점 → 기본 자료형은 객체가 아니므로 속성과 메소드를 추가할 수 없음

```jsx
let primitiveNumber = 123;
primitiveNumber.method = function () {
    return 'Primitive Method';
};
console.log(primitiveNumber.method());
// 기본 자료형에 메소드를 추가할 수 없으므로 에러

// 프로토타입을 사용하면 가능
let primitiveNumber = 123;
Number.prototype.method = function () {
    return 'Primitive Method';
};
console.log(primitiveNumber.method());
```

### `Number`객체

- 자바스크립트에서 숫자를 표현할 때 사용
- `toExponential()`: 지수 표시로 나타낸 문자열을 리턴
- `toFixed()`: 고정 고수점 표시로 나타낸 문자열 리턴
- `toPrecision()`: 숫자를 길이에 따라 지수 표시 또는 고정소수점 표시로 나타낸 문자열 리턴
