---
title: "TIL. Jun 16, 2026"
date: 2026-06-16T20:29:07+09:00

categories:
  - TIL
series:
tags:
  - AI-assisted Development
  - Antigravity
  - Backend

draft: false
original: ""
aliases:
  - /posts/til-2026-06-16/
---

## 오늘 한 내용

- Antigravity IDE의 에이전트, 에디터, 터미널, 브라우저 구조 살펴보기
- [File Storage 구현 순서와 `StorageService` 설계]({{< relref "posts/dev-data-server-light-04-file-storage" >}})

## 배운 내용

Antigravity는 에디터 안에서 에이전트가 작업을 수행하고, 브라우저와 터미널을 사용해 결과를 검증하는 개발 환경이다. Agent는 기능 개발이나 버그 수정처럼 실제 작업을 담당하고, Tab은 자동완성에 가깝다.

File Storage는 먼저 계약을 만들고, 그 다음 `fs/promises` 기반 구현체와 테스트를 추가한 뒤, Express와 분리된 Service를 얹는 순서로 진행하기로 했다. 처음부터 multipart 업로드까지 확장하지 않고, JSON과 단순한 파일 콘텐츠로 흐름을 검증하는 것도 중요한 범위 조절이었다.

## 해결 내용

File Storage를 계약, 로컬 구현체, Service, Route 순서로 나누어 구현하기로 했다. multipart 업로드는 뒤로 미루고 단순한 파일 콘텐츠 저장부터 검증한다.
