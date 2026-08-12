---
title: "TIL. Jun 8, 2026"
date: 2026-06-08T21:04:28+09:00

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
  - /posts/til-2026-06-08/
---

## 오늘 한 내용

- [`dev-data-server-light`의 계층형 구조를 모듈형 구조로 바꾸는 작업 검토]({{< relref "posts/devbox-light-server-00-concept" >}})
- `AGENTS.md`가 새 디렉토리 구조와 충돌하지 않도록 정리
- Database, Route, Service의 책임 재검토

## 배운 내용

기존 구조는 `routes`, `services`, `db`처럼 계층별로 나뉘어 있었다. 새 구조에서는 모듈이 자신의 계약, 구현체, 서비스, 라우트를 함께 소유하도록 바꾸려 했다.

계층형 구조에서는 `AGENTS.md`에 각 계층의 역할을 적기 쉬웠지만, 모듈형 구조에서는 모듈의 책임과 공개 API를 기준으로 규칙을 작성해야 한다. 구조가 바뀌면 문서도 함께 바뀌어야 하며, 기존 규칙을 억지로 유지하면 오히려 AI가 잘못된 경계를 학습하게 된다.

## 해결 내용

공통 아키텍처와 테스트 원칙은 루트 `AGENTS.md`에 두고, 모듈별 규칙만 각 모듈에 남기는 방향으로 정리했다.
