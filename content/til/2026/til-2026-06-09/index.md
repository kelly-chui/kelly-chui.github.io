---
title: "TIL. Jun 9, 2026"
date: 2026-06-09T20:48:13+09:00

categories:
  - TIL
series:
tags:
  - C++
  - Python
  - AI-assisted Development

draft: false
original: ""
aliases:
  - /posts/til-2026-06-09/
---

## 오늘 한 내용

- LeetCode 3689, 2574 풀이
- `dev-data-server-light`의 `AGENTS.md` 구조 정리
- 루트와 모듈별 개발 규칙의 중복 검토

## 배운 내용

새 디렉토리 구조에서는 공통 원칙을 루트 `AGENTS.md`에 모으고, 모듈에만 해당하는 규칙은 해당 모듈의 문서에 두는 방향이 적절하다.

루트에는 TypeScript, Express, Vitest 같은 기술과 전체 아키텍처, 테스트 원칙을 둔다. 반면 DB 모듈의 레코드 모델이나 저장소 구현 규칙처럼 다른 모듈이 알 필요 없는 내용은 DB 문서에 남긴다.

중복된 규칙은 단순히 길이의 문제가 아니다. 같은 내용이 여러 파일에 있으면 나중에 한쪽만 수정될 수 있고, AI가 서로 다른 지침으로 해석할 가능성도 생긴다.

## 해결 내용

루트 문서에는 프로젝트 전체에 적용되는 원칙만 두고, DB처럼 특정 모듈에만 해당하는 규칙은 하위 문서로 내리기로 했다. 중복된 문장은 한 곳에서만 관리한다.
