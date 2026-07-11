---
title: "Network. HTTP(HyperText Transfer Protocol)"
date: 2024-03-14

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - Network Protocol
    - HTTP
    - HTTPS

draft: true
original: "notion-export/블로그 이관/ComputerScience/Network/HTTP 1c8e9d7f8fa740818ce984429b3e90eb.md"
---


Tag: Protocol
Date: March 14, 2024
Layer: Application

## HTTP

> HTTP: HyperText Transfer Protocol

HTTP는 웹에서 클라이언트와 서버가 데이터를 주고받기 위한 애플리케이션 계층 프로토콜이다.

클라이언트가 요청(Request)을 보내면 서버가 응답(Response)을 반환하는 Request-Response 방식으로 동작한다.

## 동작 방식

```
Client
↓ HTTP Request
Server
↓ HTTP Response
Client
```

## 특징

- Request-Response 방식으로 동작한다.
- Stateless를 기본으로 한다.
- HTTP/1.x와 HTTP/2는 TCP를 기반으로 동작한다.

## 버전별 변화

### HTTP/1.0

한 연결당 하나의 요청을 처리하도록 설계  → 서버로부터 파일을 가져올 때 마다 TCP 3-웨이 핸드셰이크를 열어야 하기 때문에 RTT가 증가하는 단점이 있다.

- 이미지 스플린팅: 많은 이미지가 합쳐 있는 하나의 이미지를 다운로드 받고 이를 기반으로 이미지를 표기하는 방법
- 코드 압축: 코드에서 개행 문자, 띄어쓰기를 없애서 코드의 크기를 최소화 하는 방법
- 이미지 Base64인코딩: 이미지 파일을 64비트 문자열로 인코딩 하는 방법, 서버와 연결을 열고 HTTP 요청을 할 필요가 없는 장점이 있으나 크기가 더 커지는 단점이 있음

### HTTP/1.1

매번 TCP연결을 하지 않고, 한번 TCP 초기화를 하면 keep-alive 옵션으로 여러개의 파일을 송수신 할 수 있음

#### HOL(Head Of Line) Blocking

네트워크에서 같은 큐에 있는 패킷이 그 첫 번째 패킷에 의해 지연될 때 발생하는 성능 저하 현상

#### 무거운 헤더 구조

HTTP/1.1의 헤더는 쿠키 등의 많은 메타데이터들이 들어 있고 압축이 되지 않아 무겁다.

### HTTP/2

#### 멀티플렉싱

여러 개의 스트림을 사용하여 송수신, 특정 스트림의 패킷이 손실되어도 해당 스트림에만 영향을 미치고 나머지 스트림은 멀쩡하게 동작

애플리케이션에서 받아온 메시지를 독립된 프레임으로 조각내어 송수신한 이후 다시 조립함

단일 연결을 사용하여 병렬로 여러 요청을 받고 응답할 수 있음. HOL Blocking 해결 가능

#### 헤더 압축

허프만 코딩 압축 알고리즘을 사용함

> Note.
> 
> 허프만 코딩(huffman coding)
> 
> 문자열을 문자 단위로 쪼개 빈도수를 세어 빈도가 높은 정보는 적은 비트 수를 사용하여 표현하고, 빈도가 낮은 정보는 비트 수를 많이 사용하여 표현하여 전체 데이터의 표현에 필요한 비트량을 줄임

#### 서버 푸시

HTTP/2에서는 클라이언트의 요청 없이 서버가 리소스를 푸시할 수 있음.

### HTTP/3

TCP 대신 QUIC(UDP 기반)을 사용하여 연결 설정 시간을 줄이고 TCP의 HOL Blocking 문제를 해결하였다.

> Note.
> 
> QUIC
> 
> UDP를 기반으로 동작하는 전송 프로토콜. TLS를 프로토콜 내부에 포함하여 연결 설정 시간을 줄이고, 여러 스트림을 독립적으로 관리하여 TCP의 HOL Blocking 문제를 개선하였다.

## HTTPS

HTTPS는 애플리케이션 계층과 전송 계층 사이에 신뢰 계층 SSL/TLS 계층을 넣은 신뢰할 수 있는 HTTP 요청, 이를 통해 통신을 암호화 한다.

실제 웹 환경에서는 대부분 HTTPS(TLS) 위에서 HTTP/2를 사용한다.

### SSL/TLS(Secure Socket Layer/Transport Layer Security Protocol)

전송 계층에서 보안을 제공하는 프로토콜, 클라이언트와 서버가 통신할 때 SSL/TLS를 통해 제3자가 메시지를 도청하거나 변조하기 못하도록 함.

보안 세션을 기반으로 데이터를 암호화 하여 보안 세션이 만들어질 때 인증 메커니즘, 키 교환 암호환 알고리즘, 해싱 알고리즘이 사용됨

#### 보안 세션

보안이 시작되고 끝나는 동안 유지되는 세션, SSL/TLS는 핸드셰이크를 통해 보안 세션을 생성하고 이를 기반으로 상태 정보 등을 공유한다.
