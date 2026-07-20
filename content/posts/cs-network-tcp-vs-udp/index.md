---
title: "Network. TCP vs. UDP"
date: 2025-01-31

categories:
  - Computer Science
series:
  - Network
tags:
  - TCP
  - Transport Layer
  - UDP

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/UDP 18cade8f3765806ab6c2e12fbe5302f2.md"
---

## TCP vs. UDP

TCP와 UDP는 모두 전송 계층에서 동작하는 프로토콜이지만, 연결 방식과 데이터 전송 방식이 다르다.

TCP는 신뢰성을 우선으로 하고, UDP는 속도와 실시간성을 우선으로 설계되었다.

## 비교

| 구분 | TCP | UDP |
| --- | --- | --- |
| 연결 방식 | 연결 지향 (Connection-oriented) | 비연결형 (Connectionless) |
| 신뢰성 | O | X |
| 순서 보장 | O | X |
| 데이터 전송 방식 | 스트림(Stream) | 데이터그램(Datagram) |
| 흐름 제어 | O | X |
| 혼잡 제어 | O | X |
| 헤더 크기 | 20~60 Byte | 8 Byte |
| 속도 | 상대적으로 느림 | 상대적으로 빠름 |

## 언제 사용할까?

### TCP

- 웹 서비스 (HTTP, HTTPS)
- 이메일 (SMTP)
- 파일 전송 (FTP)
- 데이터의 정확성이 중요한 서비스

### UDP

- DNS
- DHCP
- 실시간 스트리밍
- VoIP
- 온라인 게임
- 빠른 응답이 중요한 서비스

## 선택 기준

- 데이터의 정확성과 순서가 중요하다면 TCP를 사용한다.
- 일부 패킷 손실이 발생하더라도 실시간성이 더 중요하다면 UDP를 사용한다.
