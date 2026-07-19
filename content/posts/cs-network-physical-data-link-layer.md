---
title: "Network. Physical & Data Link Layer"
date: 2024-04-30

categories:
  - Computer Science
series:
  - Network
tags:
  - Data Link Layer
  - Ethernet
  - Physical Layer

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/Physical & Data Link Layer 1e5ade8f3765809882a8d350cdfe224f.md"
---

## Physical & Data Link Layer

- Physical Layer: 전기, 광, 무선 등의 신호를 통해 데이터를 전송하는 계층
- Data Link Layer: 같은 LAN에서 데이터를 올바르게 전달하기 위한 계층

## 주요 기술

### Ethernet

같은 LAN 안에서 데이터를 주고받는 대표적인 기술이다.

#### Ethernet Frame

이더넷 기반의 네트워크에서 주고받는 프레임, 프리앰블, 송 · 수신 MAC 주소, 타입/길이, 데이터, FCS로 구성

- 프리앰블(preamble)
    - 8 Bytes
    - 이더넷 프레임을 수신하고 있다는 것을 알려주는 부분
- MAC 주소(MAC address)
    - 12(6 + 6) Bytes
    - 이더넷 프레임을 송 · 수신할 장치의 MAC 주소를 가지고 있음
- 타입/길이(type/length)
    - 2 Bytes
    - 1500 이상의 값일 경우에는 프로토콜의 타입을 뜻함
    - 1500 이하의 경우엔 LLC라는 값으로 타입 판별한다. 하지만 요즘은 거의 대부분 Ethernet II를 사용하기 때문에 명확하게 타입으로 사용함.
- 데이터(data)
    - 최대 1500Bytes
    - 실제로 송수신할 데이터
- FCS
    - 프레임의 오류가 있는지 여부를 확인하기 위한 트레일러
    - CRC(Cyclic redundancy check)라는 오류 검출용 값이 명시됨.

### Wireless

유선이 아닌 전파로 통신하는 방법이다. 대표적으로 와이파이가 있다. 주파수 간섭 문제를 최소화 하기 위해 채널이라는 하위 주파수 대역으로 세분화한다.

- AP(Access Point): 여러 무선 통신 기기를 연결해 무선 네트워크를 구성하는 장비
- Service Set: AP를 중심으로 구성된 무선 네트워크
- SSID: Service Set의 식별자

## 관련 장비

### NIC(Network Interface Controller)

노드와 네트워크 사이의 통로, 각 NIC마다 MAC 주소가 부여된다. 통신 매체의 신호를 호스트가 이해할 수 있는 프레임으로 변환하고, 프레임을 신호로 변환하는 역할을 한다.

### 허브(Hub)

여러 대의 호스트를 연결하는 물리 계층의 장치, 전달 받은 신호를 모든 포트로 반이중화 통신을 통해 브로드캐스트 한다. 신호에 대한 어떠한 조작과 판단도 하지 않는 특징이 있다.

### L2 스위치

허브의 한계를 보안하는 데이터 링크 계층의 장치, 전달 받은 신호를 목적지 포트에만 보낸다. 전이중화 통신이 가능하다.

- MAC 주소 테이블: 포트와 호스트의 MAC 주소를 대응하는 테이블을 생성하여 원하는 포트에만 전달받은 신호를 내보낼 수 있다.
- VLAN: 같은 스위치에 연결된 모든 호스트를 하나의 네트워크가 아닌 서로 다른 논리적인 네트워크로 구분하는 기술

> Note.
>
> 반이중화(Half Duplex): 송신과 수신을 번갈아 수행한다.
> 
> 전이중화(Full Duplex): 송신과 수신을 동시에 수행할 수 있다.
