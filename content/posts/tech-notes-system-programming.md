---
title: "Notes. System Programming 정리 노트"
date: 2026-06-29T16:38:00+09:00

categories:
    - Tech Notes
series:
tags:
    - System Programming
    - Serial Communication

draft: false
original: "notion-export/블로그 이관/ETC/System Programming 38eade8f37658082b273c253f1a7530d.md"
---

학부연구원 시절 FPGA랑 임베디드 살짝 하면서 적어놨던 노트를 최근 클라우드 정리할 때 발견해서, 간단하게 블로그에 포스팅함.

## RTOS

RTOS(Real-Time Operating System)는 정해진 시간 안에 작업을 수행하는 것을 보장하도록 설계된 운영체제이다.

일반적인 운영체제와 다르게 RTOS는 작업이 정해진 시간 내에 반드시 수행되는 예측 가능성을 가장 중요하게 생각한다. 산업용 장비, 자동차, 드론, 의료기기와 같은 임베디드 시스템에서 주로 사용된다.

## UART

UART(Universal Asynchronous Receiver/Transmitter)는 가장 널리 사용되는 직렬 통신 방식 중 하나이다.

구조가 단순하고 구현이 쉬워 디버깅 콘솔, 센서, 마이크로컨트롤러 간 통신 등에 자주 사용된다. 다만 송신과 수신 장치가 동일한 통신 속도(Baud Rate)를 사용해야 한다.

## SPI

SPI(Serial Peripheral Interface)는 마스터-슬레이브 구조를 사용하는 고속 직렬 통신 방식이다.

UART보다 높은 속도로 데이터를 주고받을 수 있어 디스플레이, 플래시 메모리, 고속 센서와 같은 주변 장치와 통신할 때 많이 사용된다. 대신 장치 수가 늘어날수록 배선도 함께 증가하는 단점이 있다.

## I2C

I2C(Inter-Integrated Circuit)는 두 개의 신호선만으로 여러 장치를 연결할 수 있는 직렬 통신 방식이다.

SPI보다 속도는 느리지만 배선이 단순하여 온도 센서, EEPROM, RTC와 같은 저속 주변 장치와 통신할 때 널리 사용된다. 하나의 버스에 여러 장치를 연결할 수 있다는 점도 큰 장점이다.
