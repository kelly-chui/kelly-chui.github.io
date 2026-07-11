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

draft: true
original: "notion-export/블로그 이관/ComputerScience/Network/UDP 18cade8f3765806ab6c2e12fbe5302f2.md"
---

Tag: Protocol
Date: January 31, 2025
Layer: Transport

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
- 브로드캐스트/유니캐스트 가능
    - 동시에 여러 사용자에게 데이터를 전달하거나, 정기적으로 반복해서 전송하는 경우에 사용

### 단점

- 신뢰성 부족
    - 패킷 손실, 순서 오류, 중복이 발생해도 복구할 수 없음
- 보안 취약성
    - 신뢰성 검증이 없어서 스푸핑이나 패킷 변조에 취약
- 애플리케이션 수준의 보완 필요

### 데이터그램 패킷 통신

각 패킷이 독립적으로 네트워크를 통해 최적의 경로를 선택하여 전송되므로 순서가 보장되지 않는다. 송신자와 수신자가 사전 연결을 설정하지 않고 데이터를 전송하고, 일부 패킷이 손실될 수도 있지만, 전송 속도가 빠르다.

## 동작 방식

UDP는 연결을 설정하지 않고 각 데이터그램을 독립적으로 전송한다. 따라서 각각의 패킷은 서로 다른 경로를 통해 전달될 수 있으며, 도착 순서도 보장되지 않는다.

### UDP 헤더

고정된 8바이트 크기로 구성됨

- Source Port: 송신 측 포트 번호
- Destination Port: 수신 측 포트 번호
- Length: UDP 헤더 + 데이터의 총 길이
- Checksum: 데이터 오류 검사

### Checksum

데이터 전송 중 발생한 오류를 검출하는 역할, 일부 패킷 손실이 발생한 경우 손실된 데이터를 처리한 것보다는 버리는 것이 더 나을 수 있기 때문에 오류가 발생한 패킷을 폐기함

## 활용

속도와 실시간성이 중요한 상황에서 많이 사용한다.

- DNS
- DHCP
- 실시간 스트리밍, 게임, 음성 통화 등등…

## 다음 내용

TCP와 UDP의 차이점과 사용 목적은 별도의 글에서 정리한다.
