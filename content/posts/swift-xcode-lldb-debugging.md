---
title: "Swift. Xcode 디버깅과 LLDB 기본 명령어"
date: 2024-11-20

categories:
    - iOS
series:
tags:
    - Xcode
    - Debugging
    - LLVM

draft: false
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 10/Debugging with Xcode + LLDB 8d692c230a0f4a848e9baa66afd87f9b.md"
---

## LLDB가 뭔가요

LLVM + Debugger

LLVM 위에서 동작하는 디버거

### LLVM(Low Level Virtual Machine)

![image.png](/images/swift-xcode-lldb-debugging/image-001.png)

프로그래밍 언어를 CPU 아키텍처가 이해할 수 있도록 컴파일 하는 과정을 생각해보면 (프로그래밍 언어의 종류 * CPU 아키텍처의 종류) 만큼의 경우의 수가 생긴다.

LLVM은 LLVM-IR이라는 중간 언어를 만들어서 프로그래밍 언어를 LLVM-IR로 변역하고 이 LLVM-IR을 CPU 아키텍처에 맞는 기계어로 번역하게 해주는 역할을 함 어려운건 여기까지!

## XCode Debugging

### BreakPoint

- 브레이크 포인트가 걸린 라인 직전 까지 실행 됨
- 활성화/비활성화 할 수 있음
- 다양한 옵션 지정 가능 (이름, LLDB 커맨드, 로그 작성 등등)…

### Debugging Bar

![image.png](/images/swift-xcode-lldb-debugging/image-002.png)

- Disable/enable breakpoints: 브레이크 포인트들을 활성화/비활성화
- Pause/continue execution: 다음 브레이크 포인트가 나올 때 까지 진행
- Step over: 다음 라인으로 넘어가기
- Step into: 현재 브레이크 포인트가 걸려있는 메소드로 들어가기
- Step out: 현재 메소드에서 벗어나기

## LLDB 직접 사용해보기

### Print: `p`

현재 메모리 상태에 있는 것을 출력한다.

![Screenshot 2024-11-20 at 3.19.58 AM.png](/images/swift-xcode-lldb-debugging/image-003.png)

### Print Object: `po`

객체나 변수의 값을 출력하는 명령어

- description을 이용해 객체의 상태를 출력한다.
    - `customStringConvertible`을 구현하고 있으면 해당 내용 호출
    - 아니라면 `p`와 똑같은 동작을 함

![Screenshot 2024-11-20 at 4.11.00 AM.png](/images/swift-xcode-lldb-debugging/image-004.png)

### Expression: `expr`

내부에서 표현식을 작성 가능

![Screenshot 2024-11-20 at 4.14.59 AM.png](/images/swift-xcode-lldb-debugging/image-005.png)

- 언제 쓰는게 좋을까
    - 오토레이아웃 확인할 때 좋다고 합니다.
