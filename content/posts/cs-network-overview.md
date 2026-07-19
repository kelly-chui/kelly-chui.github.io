---
title: "Network. Network 오버뷰"
date: 2024-04-30

categories:
    - Computer Science
series:
    - Network
tags:
    - Computer Science
    - Network

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/Network basic 1e5ade8f3765813abc06eb4eb43b4142.md"
---

## 네트워크

노드와 링크(엣지)들이 서로 연결되어 리소스를 공유하는 구조이며, 그래프 형태로 표현할 수 있다.

- 노드: 서버, 라우터, 스위치
- 링크: 유선 or 무선

### 키워드

- 네트워크 토폴로지
- 클라이언트와 서버
- 패킷
- 주소와 전송 방식
- 프로토콜

## 네트워크 참조 모델

통신이 이루어지는 단계를 계층적으로 표현한 모델

### OSI Model

| 계층 | 대표 역할 |
| --- | --- |
| Application | HTTP, DNS 등 네트워크 서비스 |
| Presentation | 인코딩, 압축, 암호화 |
| Session | 세션 관리 |
| Transport | TCP, UDP |
| Network | 라우팅, IP |
| Data Link | 같은 LAN에서의 통신 |
| Physical | 비트 전송 |

### TCP/IP Model

- 응용 계층(Application Layer): OSI 모델에서 세션, 표현, 응용 계층
- 전송 계층(Transport Layer): OSI 모델에서 전송 계층
- 인터넷 계층(Internet Layer): OSI 모델에서 네트워크 계층
- 네트워크 액세스 계층(Network Access Layer): OSI 모델에서 데이터 링크 계층 (+ 물리 계층)

### 캡슐화와 역캡슐화(Encapsulation, Decapsulation)

- 캡슐화
    - 데이터가 계층를 거치면서 헤더가 추가되는 과정, 상위 계층로부터 내려받은 패킷을 페이로드로 하고, 각 계층에 포함된 프로토콜의 헤더나 트레일러를 덧붙이는 과정
- 역캡슐화
    - 캡슐화 과정에서 덧붙인 헤더들을 각 계층에서 확인한 뒤, 제거하는 과정

각 계층마다 패킷을 부르는 명칭이 다르다.

| 계층 | 패킷 명칭 |
| --- | --- |
| 세션, 표현, 응용 | 데이터, 메세지 |
| 전송 | TCP: 세그먼트, UDP: 데이터그램 |
| 네트워크 | 패킷 |
| 데이터 링크 | 프레임 |
| 물리 | 비트 |
