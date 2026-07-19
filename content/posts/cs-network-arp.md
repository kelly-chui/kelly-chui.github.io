---
title: "Network. ARP(Address Resolution Protocol)"
date: 2025-02-01

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - Network Protocol
    - ARP

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/ARP 18dade8f3765804497a8fc9bb5a2a739.md"
---

## ARP

> ARP: Address Resolution Protocol
> 

네트워크에서 IP 주소와 MAC 주소를 변환하는 프로토콜

## 동작 방식

데이터 전송 시, 송신자는 목적지의 MAC 주소를 알아야 한다.

- 송신 장치가 ARP Request를 브로드캐스트한다.
    - 여기서 네트워크의 범위는 LAN, 즉 서브넷 내부
    - 서브넷 마스크를 이용해서 공유기를 거쳐야 하는지 판단함.
    - 이때 기본 게이트웨이는 이미 알고 있음
- 해당 IP 주소를 가진 장치가 ARP Reply를 유니캐스트로 응답한다.
- 이 정보를 ARP 캐시에 저장하여 다음 통신에서 요청하지 않는다

> Note.
> 
> ARP 캐시: IP 주소와 MAC 주소의 대응 관계를 임시로 저장한 캐시 메모리

## 종류

- ARP: ARP Request와 ARP Reply를 이용하여 IP 주소에 대응하는 MAC 주소를 조회하는 일반적인 프로토콜
- RARP: MAC 주소를 이용해 IP 주소를 조회하는 프로토콜.
- Gratuitous ARP: 자신의 IP 주소에 대한 ARP Request를 브로드캐스트하여 다른 장치의 ARP 캐시를 갱신하거나 IP 주소 충돌을 확인할 때 사용한다.

### RARP가 대체된 이유

RARP는 IP 주소만 알려줄 뿐, 서브넷 마스크, 기본 게이트웨이, DNS 서버 등의 네트워크 설정은 함께 제공하지 못하고. 동일한 네트워크에서만 동작하므로 범위 제약도 있다.

DHCP는 IP 주소뿐만 아니라 다양한 네트워크 설정을 함께 제공할 수 있으며, 현재는 RARP를 거의 완전히 대체하였다.
