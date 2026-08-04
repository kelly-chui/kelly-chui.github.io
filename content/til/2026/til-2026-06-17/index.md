---
title: "TIL. Jun 17, 2026"
date: 2026-06-17T21:52:31+09:00

categories:
  - TIL
series:
tags:
  - AI-assisted Development
  - Antigravity
  - Software Architecture

draft: false
original: ""
aliases:
  - /posts/til-2026-06-17/
---

## 오늘 한 내용

- Antigravity의 Rules, Skills, Workflows 구조 정리
- `dev-data-server-light`의 AGENTS 규칙을 새 구조에 맞춰 마이그레이션

## 배운 내용

Antigravity의 핵심 구조는 다음처럼 정리할 수 있다.

```text
Rules      = 행동 규칙
Skills     = 특정 분야의 지식과 노하우
Workflows  = 작업 절차
```

Rules는 항상 지켜야 할 원칙을 정의하고, Skills는 Storage 설계나 코드 리뷰처럼 특정 작업에 필요한 전문 지식을 담는다. Workflows는 계획, 구현, 테스트처럼 작업을 어떤 순서로 진행할지 정의한다.

기존 `AGENTS.md`를 그대로 옮기는 것이 아니라, 공통 원칙과 모듈별 규칙을 분리해야 했다. 규칙을 작게 나누면 모든 작업에 불필요한 문맥을 주입하지 않으면서도 필요한 순간에 더 구체적인 지침을 적용할 수 있다.

## 해결 내용

공통 행동 규칙은 Rules에, 특정 분야의 지식은 Skills에, 반복되는 작업 순서는 Workflows에 두기로 했다. 기존 `AGENTS.md`는 이 세 가지 역할을 구분하는 기준으로 다시 나눌 수 있다.

## 아직 궁금한 것

작업별 Skill을 언제 활성화할지 AI가 판단하는 방식과 수동 호출 방식 중 어떤 쪽이 프로젝트에 더 안정적인가?
