---
title: "Network. HTTP(HyperText Transfer Protocol)"
date: 2024-03-14

categories:
  - Computer Science
series:
  - Network
tags:
  - Application Layer
  - HTTP
  - HTTPS
  - TLS

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/HTTP 1c8e9d7f8fa740818ce984429b3e90eb.md"
---


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

기본적으로 요청마다 연결을 새로 만드는 방식이 널리 사용됐다. 서버에서 여러 파일을 가져올 때 TCP 연결을 반복해서 설정하면 지연이 커질 수 있다. 다만 HTTP/1.0에서도 `Connection: keep-alive`를 확장 기능으로 사용할 수 있었다.

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

여러 요청과 응답을 각각의 스트림으로 나누고, 하나의 TCP 연결에서 프레임 단위로 섞어 전송한다. 애플리케이션 계층에서는 한 응답이 늦어져도 다른 스트림의 프레임을 처리할 수 있어 HTTP/1.1의 요청 단위 HOL blocking을 줄인다.

다만 HTTP/2는 TCP 위에서 동작한다. TCP 패킷이 손실되면 재전송된 바이트가 도착할 때까지 같은 연결의 모든 HTTP/2 스트림이 영향을 받는 전송 계층 HOL blocking은 남아 있다.

애플리케이션에서 받아온 메시지를 독립된 프레임으로 조각내어 송수신한 이후 다시 조립함

단일 연결에서 여러 요청과 응답을 병렬로 처리할 수 있다.

#### 헤더 압축

HPACK을 사용해 반복되는 헤더를 테이블로 관리하고, 필요하면 문자열을 허프만 코딩으로 압축한다.

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

HTTPS는 HTTP 메시지를 TLS로 보호해 전송하는 방식이다. TLS는 통신 내용을 암호화하고, 메시지가 변조되지 않았는지 확인하며, 인증서를 통해 서버의 신원을 검증한다.

HTTP/1.1과 HTTP/2는 일반적으로 TLS가 보호하는 TCP 연결 위에서 동작한다. HTTP/3는 TLS 1.3을 통합한 QUIC 위에서 동작한다.

### SSL/TLS(Secure Socket Layer/Transport Layer Security Protocol)

애플리케이션 데이터에 기밀성, 무결성, 인증을 제공하는 보안 프로토콜이다. TLS 핸드셰이크에서는 사용할 암호 스위트를 협상하고, 인증서를 검증하고, 이후 데이터를 보호할 세션 키를 만든다.

#### 보안 세션

TLS 핸드셰이크로 합의한 키와 암호화 매개변수를 이용해 애플리케이션 데이터를 보호한다. 과거의 SSL은 현재 사용하지 않으며, 일반적으로 TLS라는 이름을 사용한다.
