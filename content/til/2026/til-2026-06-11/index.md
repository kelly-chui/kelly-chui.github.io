---
title: "TIL. Jun 11, 2026"
date: 2026-06-11T21:36:55+09:00

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
  - /posts/til-2026-06-11/
---

## 오늘 한 내용

- LeetCode 3558 풀이
- [DB 모듈에서 capability와 use case 분리]({{< relref "posts/devbox-light-server-02-db-crud" >}})
- [File Storage 모듈의 계약과 서비스 설계]({{< relref "posts/devbox-light-server-04-file-storage" >}})

## 배운 내용

기존에는 Route가 `Database` 인터페이스를 직접 사용했다. 리팩터링 후에는 `Route -> DatabaseService -> RecordStore -> InMemoryRecordStore` 흐름으로 바꾸었다.

`RecordStore`는 레코드를 저장하고 꺼내는 교체 가능한 capability이고, `DatabaseService`는 여러 저장소 동작을 조합하는 use case다. 예를 들어 `replace` 이후 갱신된 레코드를 반환하거나, 삭제 결과에 따라 오류를 판단하는 흐름은 Service가 맡는다.

File Storage도 같은 기준을 적용했다. 계약은 `key`와 `Uint8Array`만 사용해 작고 명시적으로 만들고, 로컬 파일 시스템이나 경로 검증은 구현체 안에 가둔다.

## 해결 내용

`RecordStore`를 교체 가능한 capability contract로 두고, 여러 저장소 동작을 조합하는 흐름은 `DatabaseService`로 옮겼다. File Storage도 같은 기준으로 계약, 구현체, Service를 분리했다.

## 아직 궁금한 것

Storage의 메타데이터와 파일 자체를 언제, 어느 모듈에서 연결해야 할까...
