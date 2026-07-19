---
title: "Network. REST(Representational State Transfer)"
date: 2025-02-01

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - REST API

draft: false
original: "notion-export/블로그 이관/ComputerScience/Network/RESTful API 18dade8f376580fca8a6f3bb821006a8.md"
---

## REST

- REST: Representational State Transfer
- RESTful API: REST를 기반으로 한 API
- REST 아키텍처 스타일의 설계 원칙을 준수하는 API

> Note.
>
> REST는 HTTP와 동일한 개념이 아니다. REST는 웹 API를 설계하기 위한 아키텍처 스타일이며, HTTP는 REST를 구현할 때 가장 많이 사용하는 프로토콜이다.

## 설계 원칙

### Uniform interface

동일한 리소스에 대한 모든 API 요청은 동일하게 표시되어야 한다(리소스는 단일 URL을 통해 식별할 수 있도록 고유해야 한다). 서버는 표준 형식으로 정보를 전송하고, 형식이 지정된 리소스를 REST에서는 표현(Represent)라고 한다.

### Client-server based

클라이언트와 서버를 분리하여 각각이 서로 독립적으로 개발될 수 있도록 한다.

### Statelessness

이전의 모든 요청과 독립적으로 클라이언트 요청이 완료되어야 한다. 즉, 각 요청에는 처리에 필요한 모든 정보가 포함되어야 한다. 서버는 클라이언트의 상태과 관련된 데이터를 저장하지 않는다.

### Cacheablility

가능하면 클라이언트나 서버 측에서 리소스를 캐시할 수 있어야 한다. 서버 응답에는 전달된 리소스에 대해 캐싱이 허용되는지 여부에 대한 정보도 포함되어야 한다.

### Layered system

클라이언트는 클라이언트와 서버 사이의 다른 승인된 중개자에 연결할 수 있으며, 여전히 서버로부터 응답을 수신한다. 서버도 다른 서버에게 요청을 전달 할 수 있다. 이 때 각 구성 요소는 상호 작용하는 레이어만 알 수 있어야 한다.

### Code on demand

서버는 필요할 때 클라이언트에게 실행 코드를 보낼 수 있다.
실제 웹 API에서는 거의 사용되지 않는다.

## 요청과 응답

### URI

일반적으로 URL을 사용하여 리소스를 식별한다. URL은 요청 엔드포인트라고도 하며, 클라이언트가 요구하는 사항을 서버에 명확하게 지정한다.

### HTTP Method

Get, PUT, POST, DELETE와 같은 HTTP 메소드를 이용해서 구성

### HTTP 헤더

클라이언트와 서버 간에 교환되는 메타데이터, 요청 헤더는 요청 및 응답의 형식을 나타내고 요청 상태 등에 대한 정보를 제공한다.

### 응답 상태

3자리 상태 코드로 요청 성공 혹은 실패를 알린다.

### 메시지 본문

요청 헤더에 포함된 내용을 기반으로 적절한 표현 형식을 선택한다.

### 헤더

응답에 대한 헤더 또는 메타데이터

## 특징

### 장점

- 확장성: REST가 클라이언트-서버 상호 작용을 최적화하여 효율적으로 크기를 조정할 수 있음
- 유연성: 클라이언트와 서버가 분리되어서 각 부분이 독립적으로 발전할 수 있음. 서버 애플리케이션의 기술 변경이 클라이언트에게 영향을 주지 않음.
- 독립성: 다양한 프로그래밍 언어로 클라이언트 및 서버 애플리케이션을 모두 작성할 수 있음
- 표준화된 방식: 일관된 API 설계가 가능하여 유지보수가 쉽다.

### 단점

- REST 제약 조건을 모두 만족하는 API를 설계하기 어렵다.
- 실무에서는 일부 제약 조건만 적용하는 경우도 많다.

## 레퍼런스

- [REST API란 무엇인가요? | IBM](https://www.ibm.com/kr-ko/topics/rest-apis)
- [What is a RESTful API? | AWS](https://aws.amazon.com/what-is/restful-api/)
- [What Is a REST API? Examples, Uses & Challenges | Postman Blog](https://blog.postman.com/rest-api-examples/)
