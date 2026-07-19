---
title: "Network. VPN(Virtual Private Network)"
date: 2025-03-04

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - VPN

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/VPN 18dade8f3765801fb27de7912baf4a84.md"
---

## 소개

VPN은 공용 네트워크를 이용하여 사설 네트워크처럼 안전하게 통신할 수 있도록 하는 기술이다.

공용 네트워크를 통해 사설 네트워크처럼 안전하게 데이터를 주고받는 기술, 데이터를 암호화하여 외부로부터의 도청, 해킹, 감시로부터 보호하고, 원격으로 사설 네트워크에 안전하게 접속할 수 있도록 한다.

## 동작 원리

### 암호화

사용자의 데이터를 암호화 하여 전송하므로, ISP나 외부에서 데이터를 읽을 수 없도록 한다.

### 터널링

VPN 터널이라는 보안 통로를 통해 전송됨, 데이터 패킷을 감싸 보호하는 역할을 한다

- 대표적인 VPN 프로토콜: OpenVPN, IPsec, WireGuard

### IP 주소 변경

VPN 서버를 통해 인터넷에 접속하면 목적지 서버에는 사용자의 공인 IP 대신 VPN 서버의 IP가 보인다. 하지만 VPN 사업자는 사용자의 원래 IP와 트래픽 정보를 볼 수 있고, 쿠키나 계정 같은 다른 식별 수단도 남으므로 VPN이 익명성을 보장하는 것은 아니다.

## 특징

### 장점

- 보안
- 프라이버시 보호

### 활용

- 원격 접속
- 지역 제한 우회
- 검열 회피

## 레퍼런스

- [What is a VPN | Cloudflare](https://www.cloudflare.com/ko-kr/learning/access-management/what-is-a-vpn/)
