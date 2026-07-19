---
title: "Network. UDP(User Datagram Protocol)"
date: 2025-01-31

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - UDP

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/UDP 18cade8f3765806ab6c2e12fbe5302f2.md"
---

## 소개

UDP(User Datagram Protocol)는 전송 계층(L4)에서 동작하는 비연결형(Connectionless) 프로토콜이다.

연결 설정 없이 데이터를 빠르게 전송하며, 신뢰성보다 실시간성이 중요한 환경에서 주로 사용된다.

> UDP: User Datagram Protocol
> 

OSI 7계층에서 전송 계층(L4)에 해당

## 특징

### 장점

- 데이터 전송 전에 연결을 설정하지 않는 비연결형 서비스
    - 지연 시간이 낮음
- 단순한 프로토콜 구조
    - 헤더 크기가 작고, 오버헤드가 적음
- IP 계층의 유니캐스트, 브로드캐스트, 멀티캐스트 전송에 사용할 수 있음

### 단점

- 신뢰성 부족
    - 패킷 손실, 순서 오류, 중복이 발생해도 복구할 수 없음
- 애플리케이션 수준의 보완 필요

### 데이터그램 패킷 통신

각 데이터그램은 다른 데이터그램과 독립적으로 전달된다. UDP 자체에는 순서 번호, 재전송, 중복 제거 기능이 없으므로 도착 순서나 전달 성공을 보장하지 않는다.

## 동작 방식

UDP는 사전 연결 설정 없이 각 데이터그램을 독립적으로 전송한다. 실제 전달 경로는 IP 라우팅이 결정하며, 데이터그램마다 경로가 달라질 수도 있다.

### UDP 헤더

고정된 8바이트 크기로 구성됨

- Source Port: 송신 측 포트 번호
- Destination Port: 수신 측 포트 번호
- Length: UDP 헤더 + 데이터의 총 길이
- Checksum: 데이터 오류 검사

### Checksum

UDP 헤더와 데이터가 전송 중 손상됐는지 검출한다. 체크섬이 일치하지 않는 데이터그램은 수신 측에서 폐기되며 UDP가 직접 재전송하지는 않는다. UDP 체크섬은 IPv4에서는 0으로 생략할 수 있지만 IPv6에서는 필수다.

## 활용

속도와 실시간성이 중요한 상황에서 많이 사용한다.

- DNS
- DHCP
- 실시간 스트리밍, 게임, 음성 통화 등등…

## 다음 내용

TCP와 UDP의 차이점과 사용 목적은 별도의 글에서 정리한다.
