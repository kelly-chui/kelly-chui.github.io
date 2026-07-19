---
title: "Call by reference와 Call by pointer의 차이"
date: 2025-06-07

categories:
  - Computer Science
series:
  - Programming Language
tags:
  - C++
  - Pointer

draft: false
original: "notion-export/블로그 이관/Article/Call by reference와 Call by pointer의 차이 20aade8f376580c5bd84f1b5278cae83.md"
---

Call by reference와 call by pointer는 모두 호출자가 가진 객체를 함수 안에서 변경할 수 있어 비슷해 보인다. 하지만 C++ 언어에서 파라미터가 가지는 의미와 사용할 수 있는 연산은 다르다.

## Pointer를 값으로 전달하기

포인터 파라미터는 주소를 저장한 포인터 객체를 값으로 전달받는다. 함수는 복사된 포인터를 역참조해 호출자의 객체를 변경할 수 있다.

```cpp
void updateByPointer(int* value) {
    if (value != nullptr) {
        *value = 10;
    }
}

int number = 0;
updateByPointer(&number);
```

포인터 자체는 복사본이므로 함수 안에서 다른 주소를 대입해도 호출자가 가진 포인터 변수는 바뀌지 않는다.

```cpp
void resetPointer(int* value) {
    value = nullptr;
}
```

호출자의 포인터 변수까지 바꾸려면 `int**` 또는 `int*&`처럼 별도의 간접 참조가 필요하다.

## Reference로 전달하기

참조 파라미터는 호출자가 전달한 객체의 별칭으로 동작한다.

```cpp
void updateByReference(int& value) {
    value = 10;
}

int number = 0;
updateByReference(number);
```

함수 안에서 `value`를 수정하면 별도의 역참조 문법 없이 원본 객체가 변경된다. 참조는 선언할 때 유효한 객체에 바인딩해야 하고, 이후 다른 객체를 가리키도록 다시 바인딩할 수 없다.

## 차이점

| 구분 | Pointer 파라미터 | Reference 파라미터 |
| --- | --- | --- |
| 호출 문법 | `update(&value)` | `update(value)` |
| 접근 문법 | `*pointer` | 일반 변수와 동일 |
| null 표현 | `nullptr` 가능 | 정상적인 참조는 유효한 객체에 바인딩되어야 함 |
| 다른 대상 지정 | 포인터 복사본에 다른 주소를 대입할 수 있음 | 바인딩 후 다른 객체에 다시 바인딩할 수 없음 |
| 포인터 연산 | 가능 | 불가능 |

## 컴파일 결과가 같아도 의미는 다르다

아래 캡처에서는 단순한 reference 함수와 pointer 함수가 Clang에서 같은 어셈블리로 컴파일됐다.

![image.png](/images/cs-programming-language-call-by-reference-call-by-pointer/image-001.png)

특정 코드와 컴파일러에서 구현 결과가 같을 수는 있지만, 이것이 reference와 pointer의 언어 의미가 같다는 뜻은 아니다. 컴파일러는 서로 다른 언어 규칙을 같은 기계어로 최적화할 수 있다. 두 방식을 구분할 때는 어셈블리 모양보다 C++에서 허용되는 연산과 API 계약을 기준으로 봐야 한다.

{{< callout type="note" title="참고" >}}
구현 결과가 같을 수 있어도 소스 코드에서 표현하는 제약은 다르다.
{{< /callout >}}

포인터는 null 상태나 배열 순회처럼 주소 자체를 다뤄야 할 때 적합하다. 반면 반드시 존재하는 하나의 객체를 수정하고 주소 연산이 필요 없다면 참조가 의도를 더 분명하게 표현한다.

포인터 연산을 잘못 사용하면 할당된 범위를 벗어날 수 있다.

```cpp
void unsafePointerAccess(int* value) {
    value[1] = 1;
}
```

`value`가 정수 하나만 가리키고 있다면 `value[1]`은 유효한 범위를 벗어나므로 동작이 정의되지 않는다.

정리하면 call by pointer는 포인터 값을 전달하고 그 포인터가 가리키는 객체에 접근하는 방식이다. Call by reference는 파라미터를 원본 객체의 별칭으로 바인딩하는 C++의 별도 언어 기능이다. 결과가 비슷하더라도 둘을 같은 전달 방식으로 취급하면 안 된다.
