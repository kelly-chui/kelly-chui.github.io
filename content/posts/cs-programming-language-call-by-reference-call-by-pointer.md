---
title: "Call by reference와 Call by pointer의 차이"
date: 2025-06-07

categories:
    - Computer Science
series:
    - Programming Language
tags:
    - Call by reference
    - Call by pointer

draft: true
original: "notion-export/블로그 이관/Article/Call by reference와 Call by pointer의 차이 20aade8f376580c5bd84f1b5278cae83.md"
---

Call by reference와 Call by pointer는 자주 혼동되는 개념이다. 두 방식은 용도와 결과가 거의 같기 때문에, 구분하지 않고 사용하는 경우가 많다.

## 모든 데이터는 메모리 주소를 통해 접근된다.

함수가 값을 전달받는 방식이 call by value, call by reference, call by pointer 중 어떤 것이든, 컴파일 이후 어셈블리 수준에서는 결국 메모리 주소(또는 레지스터)를 통해 값에 접근하게 된다.

call by reference와 call by pointer는 원본의 주소를 그대로 넘기며, 함수 내부에서 직접 전달된 원본 변수의 값을 변경할 수 있다. 반면 call by value는 원래 변수나 상수, 리터럴의 주소가 전달되는 것이 아니라, 해당 값이 복사되어 새로운 메모리 공간에 저장된다. 함수 내부에서는 이 복사본의 주소를 통해 값에 접근하게 된다.

아래 예시는 call by pointer와 call by reference 방식을 사용하는 두 함수이다:

```cpp
void callByPointer(int * a) {
    *a = 10;
}
void callByReference(int &a) {
    a = 10;
}
```

두 함수 모두 정수 값 하나를 받아서 그 값을 변화시키는 똑같은 동작을 한다. 둘 다 복사가 아닌 원본 변수를 변화시킨다. 즉 ‘원본 값’의 복사가 일어나지 않는다.

## 사실 모든 호출은 call by value

조금 러프하게 말하자면, 함수에 전달되는 모든 파라미터는 결국 ‘값’으로 전달된다.

call by pointer와 call by reference 역시 call by value 방식으로 구현된다. 포인터는 메모리 주소를 담고 있는 하나의 값일 뿐이며, 이 값이 복사되어 함수로 전달된다. 즉, call by pointer는 ‘주소값’이라는 값을 call by value 방식으로 넘기는 것이다. 마찬가지로 call by reference도 ‘참조값’이라는 특별한 형태의 값을 call by value 방식으로 전달한다.

call by value, call by reference, call by pointer라는 용어는 전달 방식의 차이를 구분하기 위한 것이지만, 함수 입장에서 보면 언제나 어떤 형태의 ‘값’을 넘겨받는다는 점에서는 동일하다. 결국 차이는 ‘무엇을 값으로 넘기느냐’, 즉 전달되는 값의 종류에 따라 달라질 뿐이다.

그러면 ‘주소값’과 ‘참조값’의 차이는 뭘까? 이건 아래에서 살펴보겠다.

### Call by reference는 Call by pointer의 Syntax sugar

아래 캡처는 위 예제에 있는 두 함수를 Clang을 통해 컴파일한 결과를 어셈블리로 나타낸 것이다:

![image.png](/images/cs-programming-language-call-by-reference-call-by-pointer/image-001.png)

두 함수가 이름을 제외하곤 완벽하게 동일하게 컴파일 된 것을 확인할 수 있다. 이 사실이 의미하는 것은 참조값이란 결국 추상적인 ‘언어의 기능’일 뿐 실체적인 구조를 가지지 않는다.

{{< callout type="note" title="참고" >}}
조금 더 쉽게 표현하면, 사람이 봤을 땐 다르지만 컴파일러가 봤을 땐 같다.
{{< /callout >}}

즉 참조는 프로그래머가 더 안전하고 직관적으로 파라미터의 원본을 다룰 수 있도록 하는 syntax sugar에 가깝다. 

아래 예시는 call by pointer의 위험성을 보여주는 코드이다:

```cpp
void unsafePointerAccess(int * a) {
    (*a + 1) = 1;
}
```

`a`의 주소를 받아서 `(*a + 1)`을 통해 다음 메모리 공간에 접근하여 값을 바꾸려는 시도를 하고 있다. 이렇게 정해진 범위를 넘어선 메모리를 조작은, 예측할 수 없는 위험한 동작을 초래할 수 있다.

따라서 이런 위험을 예방하기 위해 언어에서 직접적인 포인터보다 추상적인 ‘참조’를 제공하는 것이다.
