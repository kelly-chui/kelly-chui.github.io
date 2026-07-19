---
title: "Network. DHCP(Dynamic Host Configuration Protocol)"
date: 2025-02-01

categories:
  - Computer Science
series:
  - Network
tags:
  - Application Layer
  - DHCP
  - IP Address

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/DHCP 18dade8f3765805a89fec1656ec9056b.md"
---

## 개요

> DHCP: Dynamic Host Configuration Protocol

디바이스가 네트워크에 접속하려면 고유한 IP주소가 필요하지만, 수동으로 설정하면 불편하고 충돌이 발생할 가능성이 있음, DHCP 서버는 자동으로 IP 주소와 서브넷 마스크, 게이트웨이와 같은 파라미터를 배정한다.

## 동작 방식

### DORA

- Discovery
    - 클라이언트가 네트워크에 연결되면, IP 주소가 필요하다고 브로드 캐스트 요청을 보냄
- Offer
    - DHCP 서버가 사용 가능한 IP 주소를 찾아서 클라이언트에게 제안
- Request
    - 클라이언트가 서버에게 응답함
- Acknowledge
    - DHCP 서버가 설정을 최종적으로 승인

### 임대

DHCP는 IP 주소를 영구적으로 할당하지 않고 일정 시간 동안 임대(Lease)하는 방식으로 관리한다.

사용 가능한 IP 주소의 개수보다 디바이스가 더 많은 경우데도 더 이상 사용하지 않는 주소를 재사용 하여 IP 주소를 보존할 수 있음. 디바이스가 종료하거나 임대 시간이 만료되면 사용 주소를 사용 가능한 주소로 반환받고, 다른 장치에 다시 할당할 수 있도록 한다.

## 특징

- 자동화
    - IP 주소를 일일이 설정할 필요가 없음
- 충돌 방지
    - 동일한 IP가 중복되지 않게 관리
- 유동적 관리
    - 필요할 때마다 새로운 IP 할당
- 중앙 관리
    - DHCP 서버에서 네트워크 설정을 한 번에 관리할 수 있음

## RARP와 비교

### 기능

RARP는 IP 주소만 할당하지만, DHCP는 서브넷 마스크, 게이트 웨이, DNS 서버와 같은 추가 정보도 자동으로 제공한다.

### 계층

RARP는 데이터 링크 계층에서 동작하고, DHCP는 애플리케이션 계층에서 동작한다. RARP는 로컬 네트워크에서만 동작하고, 다른 네트워크에서 IP를 받을 수 없다.

DHCP는 라우터를 통해 다른 네트워크에 있는 DHCP서버와 통신이 가능하다.

### 유연성

RARP는 고정 방식으로 IP를 할당했기 때문에 IP 관리가 비효율적이었고, DHCP는 동적으로 IP를 임대한다.

## 레퍼런스

[동적 호스트 프로토콜(DHCP)의 뜻과 작동 원리 알아보기](https://nordvpn.com/ko/blog/what-is-dhcp/)
[DHCP란 무엇입니까? IP 주소 할당을 이해하기 위한 간단한 안내서](https://fiberroad.com/ko/resources/glossary/what-is-dhcp/)
