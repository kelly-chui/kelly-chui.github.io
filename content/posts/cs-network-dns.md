---
title: "Network. DNS(Domain Name System)"
date: 2025-02-01

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - DNS

draft: true
original: "notion-export/블로그 이관/ComputerScience/Network/DNS 18dade8f376580a8ae29e2107c500e4d.md"
---

## DNS

> DNS: Domain Name System

도메인 이름을 IP 주소로 변환하는 시스템, 웹 사이트 주소를 IP주소로 변환해주는 역할

## 동작 방식

DNS는 계층 구조를 가지며, 요청을 처리하는 과정에서 필요한 DNS 서버를 순차적으로 탐색한다. 한 번 조회한 결과는 캐시에 저장되어 이후에는 같은 과정을 반복하지 않을 수 있다.

사용자가 google.com을 입력했다고 하면, 맥이 자동으로 로컬 DNS 서버에 요청을 보냄 → 만약 로컬 DNS 서버가 정보를 가지고 있지 않다면, 상위 DNS 서버로 요청을 보냄

```text
1.	맥 → 로컬 캐시 확인
2.	로컬 DNS 서버(ISP DNS 서버) → 로컬 캐시 확인
3.	로컬 DNS 서버 → 재귀 DNS 서버에 요청
4.	재귀 DNS 서버 → 루트 DNS 서버 → TLD DNS 서버 → 권한 있는 네임서버
5.	권한 있는 네임서버 → IP 주소 반환
6.	재귀 DNS 서버 → 로컬 DNS 서버 → IP 주소 전달
7.	로컬 DNS 서버 → 맥에 최종 IP 주소 전달
8.	맥 → 구글 접속

```

재귀 DNS 서버(Recursive DNS Server)는 클라이언트를 대신하여 필요한 DNS 서버를 차례대로 조회하고 최종 결과를 반환하는 역할을 한다.

## 특징

- 도메인 이름을 IP 주소로 변환한다.
- DNS Cache를 이용하여 조회 속도를 높인다.
- 계층 구조를 이용해 도메인 정보를 관리한다.

### Local DNS Server (Cache DNS Server)

ISP나 네트워크 내부에서 사용하는 DNS 서버, 사용자 요청을 처리하고 결과를 캐싱해서 응답 속도를 높여줌.

### Root DNS Server

DNS 계층 구조에서 가장 높은 위치에 있는 DNS 서버, TLD로의 요청을 처리함 모든 도메인의 출발점, 요청받은 도메인에 대해 어떤 TLD 서버를 찾아야 할지 알려주고, 요청을 TLD로 전달함

### TLD DNS Server

도메인 이름의 끝부분인 TLD를 관리하는 서버, .com, .org, .net 등 최상위 도메인에 해당하는 DNS 서버이다. 루트 DNS 서버로부터 전달받은 요청을 처리하고, 해당 도메인이 등록된 권한 있는 네임서버로 요청을 넘김

### Authoritative Name Server

특정 도메인에 대한 모든 정보를 가지고 있는 서버, 그 도메인에 대한 최종적인 DNS 응답을 제공한다. 도메인 이름에 해당하는 IP 주소를 정확하게 제공하며, 해당 도메인에 대한 진짜 정보를 가지고 있음

### Recursive DNS Server

클라이언트로부터 DNS 요청을 받고, 그 요청에 대한 답을 찾을 때 까지 다른 DNS 서버들에게 요청을 보내는 서버, 요청을 받은 후 해당 도메인에 대한 정보를 루트 DNS 서버부터 TLD, Authoritative Name Server를 차례로 검색 결과를 최종적으로 사용자에게 반환하는 역할을 함

### Domain → IP변환

DNS 레코드를 참조하여 도메인 네임을 IP 주소로 변경

- A 레코드: 도메인 이름을 IPv4 주소로 변환
- AAAA 레코드: 도메인 이름을 IPv6 주소로 변환
- CNAME 레코드: 도메인 이름을 다른 도메인 이름으로 리다이렉트
- NS 레코드: 특정 도메인이 어떤 DNS 서버에서 관리되는지 지정
- PTR 레코드: IP 주소에서 도메인 이름을 찾아주는 역방한 DNS 레코드

### 캐싱

DNS 레코드를 일정 시간 저장해 두는 과정, DNS 서버를 타고가며 찾을 필요가 없이 바로 IP 주소 반환

## 레퍼런스

[DNS란 무엇인가요? | IBM](https://www.ibm.com/kr-ko/think/topics/dns)
