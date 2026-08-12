---
title: "TIL. Jun 4, 2026"
date: 2026-06-04T20:17:42+09:00

categories:
  - TIL
series:
tags:
  - Backend
  - TypeScript
  - Software Architecture

draft: false
original: ""
aliases:
  - /posts/til-2026-06-04/
---

## 오늘 한 내용

- [`dev-data-server-light`의 DB 모듈 설계 정리]({{< relref "posts/devbox-light-server-02-db-crud" >}})
- System 모듈과 DB 인터페이스 구현 방향 검토
- 저장소와 애플리케이션 로직의 경계 정리

## 배운 내용

### 이름도 설계의 일부

처음에는 `DocumentStore`, `StoredDocument`, `DocumentBody`라는 이름을 사용했다. 하지만 [DB CRUD 인터페이스를 설계하는 과정]({{< relref "posts/devbox-light-server-02-db-crud" >}})에서 이 이름들이 프로젝트가 특정 Document Database를 전제로 한다는 인상을 준다는 것을 발견했다.

In-Memory, SQL, JSON File 등 여러 구현을 염두에 둔다면 인터페이스도 구현 방식에서 자유로워야 한다. 그래서 `RecordStore`, `StoredRecord`, `RecordData`처럼 더 중립적인 이름으로 바꿨다.

### ID 생성 책임

ID를 클라이언트가 만들면 UUID나 증가값 같은 저장소 정책을 클라이언트가 알아야 한다. 결국 서버와 클라이언트가 저장 방식에 함께 묶인다.

`create(collection, data)`만 제공하고 서버가 ID를 생성한 뒤 `StoredRecord`를 반환하도록 하는 편이 경계를 더 명확하게 만든다.

### REST API와 저장소 인터페이스는 다르다

`PATCH`는 HTTP의 부분 수정 개념이고, 저장소는 `replace`처럼 데이터를 어떻게 저장할지만 알면 된다. HTTP API의 모양을 내부 저장소 인터페이스에 그대로 투영하지 않는 것이 중요했다.

## 해결 내용

`Document` 계열 이름을 `Record` 계열로 바꾸고, ID 생성 책임을 서버에 두는 방향으로 정리했다. 저장소에는 HTTP의 `PATCH` 개념을 직접 넣지 않고 `replace`처럼 저장 능력만 표현하기로 했다.
