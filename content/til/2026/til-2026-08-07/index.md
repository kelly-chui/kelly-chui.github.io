---
title: "TIL. Aug 7, 2026"
date: 2026-08-07T22:07:31+09:00

categories:
  - TIL
series:
tags:
  - AI Agent

draft: false
original: ""
---

## 오늘 한 내용

- PS
  - [Codeforces 459B]({{< relref "ps/2026/ps-codeforces-459b-pashmak-and-flowers" >}})
- dev-data-server-light
  - Auth 기능 추가
  - 에이전트 설정 정리
- 블로그 클론 이후 Mermaid 재설치와 `npm audit` 확인

## 배운 내용

### AI 에이전트 설정 문서의 역할

`AGENTS.md`, Rule, Workflow, Skill의 역할을 다시 정리했다.

- `AGENTS.md`: 프로젝트 구조, 아키텍처, 사용 기술처럼 항상 필요한 정보
- Rule: 프로젝트 전반에서 지켜야 하는 규칙
- Workflow: 반복 작업의 절차
- Skill: 특정 분야의 지식과 작업 방법

모든 내용을 하나의 `AGENTS.md`에 넣기보다, 에이전트가 현재 작업에 필요한 컨텍스트만 읽을 수 있도록 성격과 범위에 따라 나누는 편이 낫다.

### 개발용 서버의 Auth

실제 서비스 수준의 인증을 구현하기보다, 클라이언트에서 로그인과 인증 상태를 테스트할 수 있는 최소한의 구조를 만들었다. `AuthService`가 인증 규칙을 담당하고, 유저 조회는 `DatabaseService`, 토큰 저장은 `TokenStore`가 맡도록 역할을 나눴다.

## 해결 내용

개발용 서버에 로그인, 토큰 검증, 로그아웃 흐름을 추가했다. 블로그를 새로 클론한 뒤 발생한 Mermaid 관련 보안 경고는 `npm audit`으로 원인을 확인하고 패키지를 갱신했다.

### npm 보안 이슈 audit

노트북에 블로그를 새로 클론받고 `npm install`을 실행하니 보안 관련 경고가 나왔다.

{{< image src="image-001-optimized-image.webp" >}}

어떤 패키지가 문제인지 `npm audit`으로 확인해보니 Mermaid였다. 블로그에서 Mermaid 렌더링이 불안정해서 GitHub 방식을 참고해 새로 설치했는데, 그때 설치한 버전에서 문제가 생긴 것 같다.

```zsh
kellydev@Kellys-MacBook-Air kelly-chui.github.io % npm audit fix

changed 1 package, and audited 144 packages in 4s
```

`npm audit fix`를 사용하면 문제가 없는 버전으로 패키지를 교체해준다.

{{< video src="video-001-optimized-video.mp4" >}}

수정 후에도 여전히 새로고침 연타나 테마를 변경해도 Mermaid가 문제없이 렌더링되는 것을 확인했다.

## 내일 할 것

- Stack Day 컨셉과 MVP 범위 다시 정리하기
