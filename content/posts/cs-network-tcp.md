---
title: "Network. TCP(Transmission Control Protocol)"
date: 2025-01-31

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - TCP

draft: true
original: "notion-export/블로그 이관/ComputerScience/Network/TCP 18cade8f3765802c8153f3531fc98dc1.md"
---

## 소개

TCP(Transmission Control Protocol)는 전송 계층(L4)에서 동작하는 연결 지향(Connection-oriented) 프로토콜이다.

신뢰성 있는 데이터 전송을 위해 연결 설정, 순서 제어, 오류 제어, 흐름 제어, 혼잡 제어 등의 기능을 제공한다.

## 프로토콜

> TCP: Transmission Control Protocol

OSI 7계층에서 전송 계층(L4)에 해당

## 특징

### 특징

- 신뢰성 있는 연결형 서비스 제공
- 패킷의 다중화, 순서 제어, 오류 제어, 흐름 제어, 혼잡 제어 기능 제공
- 스트림 위주의 전달(패킷 단위)을 함

### TCP 헤더

TCP 세그먼트 앞부분에 위치한 데이터 전송을 위한 제어 정보를 포함하는 구조, 20바이트로 구성되며 최대 60바이트로 확장 가능

- Source Port: 송신 측 포트 번호
- Destination Port: 수신 측 포트 번호
- Sequence Number: 데이터 순서를 나타내는 번호
- Acknowledgement Number: 수신 측이 다음에 받을 예상 데이터 번호
- Checksum: 데이터 오류 검사
- 이외에 Data Offset, Reserved, Flags, Window Size, Urgent Pointer, Option등이 있음

## 동작 방식

TCP는 데이터를 전송하기 전에 논리적인 연결을 설정하고, 데이터 전송이 끝나면 연결을 정상적으로 종료한다.

### 가상 회선 연결(Virtual Circuit Connection)

네트워크 상에서 두 지점 간의 통신 경로, 실제 물리적인 경로가 아니라 논리적인 경로를 뜻한다.

TCP 프로토콜은 애플리케이션 간의 신뢰성 있는 데이터 전송을 보장하기 위해, 포트 번호와 시퀀스 번호로 ‘논리적인 연결’을 설정한다. 따라서 모든 패킷이 동일한 경로를 사용하는 것을 보장하지 않는다.

### 3-way handshake

![3way.png](/images/cs-network-tcp/image-001.png)

신뢰성 있는 연결을 위해 통신에 앞서 거치는 3단계의 확인 작업, 

1. 클라이언트에서 서버로 ‘SYN’ 패킷 전송
2. 서버에서 클라이언트로 ‘SYN + ACK’ 패킷 전송
3. 클라이언트에서 서버로 ‘ACK’ 패킷 전송

연결이 완료되면 양쪽은 서로 데이터를 송수신할 수 있는 ESTABLISHED 상태가 된다.

### 4-way handshake

![4way.png](/images/cs-network-tcp/image-002.png)

TCP 연결을 해제하는 과정, 

1. 클라이언트에서 서버로 FIN으로 설정된 세그먼트 전송
2. 서버에서 클라이언트로 ACK 승인 세그먼트 전송
3. 서버에서 클라이언트로 FIN 세그먼트 전송
4. 클라이언트에서 서버로 ACK 전송

연결이 종료된 이후에는 사용하던 자원을 정리하고 연결을 해제한다.

#### TIME_WAIT를 거치는 이유

클라이언트가 서버로부터 FIN 세그먼트를 받으면 바로 연결을 닫지 않고 일정 시간동안 연결을 유지한다

1. 지연된 패킷 제거
    1. TCP 연결을 즉시 종료하면, 지연된 패킷이 다음 연결에 잘못 전달될 수 있기 때문에 기존 연결의 패킷이 모두 사라질 때 까지 대기
2. FIN 손실 방지
    1. 서버가 전송한 FIN이 손실될 수 있는데, 이때 재전송된 FIN을 다시 받기 위함
