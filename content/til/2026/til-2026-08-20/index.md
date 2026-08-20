---
title: "TIL. Aug 20, 2026"
date: 2026-08-20T23:30:00+09:00

categories:
  - TIL
series:
tags:
  - Express
  - Error Handling
  - File Storage

draft: false
original: ""
---

## 오늘의 기록

- PS
  - [Codeforces 600B. Queries About Less or Equal Elements]({{< relref "ps/2026/ps-codeforces-600b-queries-about-less-or-equal-elements" >}})

- devbox-light-server
  - 잘못된 요청, 없는 라우트, 내부 오류를 `{ "error": "..." }` 형식으로 통합했다.
  - CORS 설정.
  - multipart/form-data 파일 업로드 추가

### HTTP 에러 응답 통합

API 클라이언트가 오류 응답을 일관되게 처리할 수 있도록 공통 에러 핸들러를 추가했다. 잘못된 요청은 `400`, 업로드 용량 초과는 `413`, 처리되지 않은 오류는 `500`과 함께 안정적인 JSON 응답을 반환한다.

### Origin, SOP, CORS

에이전트에서 MVP 이후에 제시한 첫 번째 기능 추가였는데, 막상 CORS가 뭔지 몰라서 공부했다.

Origin은 프로토콜·호스트·포트의 조합으로, 예를 들어 `http://localhost:5173`과 `http://localhost:3000`은 포트가 달라 서로 다른 Origin이다. 

SOP(Same-Origin Policy)는 브라우저가 다른 Origin의 리소스에 임의로 접근하지 못하게 막는 보안 규칙이다. 

CORS(Cross-Origin Resource Sharing)는 서버가 특정 다른 Origin의 접근을 허용한다고 HTTP 응답 헤더로 알려주는 방식이다.

브라우저에서 다른 Origin의 API를 호출할 때는 SOP(Same-Origin Policy)에 의해 요청이 제한된다. 서버가 다른 Origin의 요청을 허용한다는 것을 명시해야 하므로 CORS가 필요하다.

CORS 요청 중에는 실제 요청을 보내기 전에 `OPTIONS` preflight 요청으로 허용된 Origin, 메서드, 헤더를 확인하는 경우가 있다. 이번에는 `CORS_ORIGIN` 환경 변수로 허용할 Origin을 설정하고, preflight 요청에도 응답하도록 CORS를 지원했다. 기본값은 모든 Origin 허용이다.

구현은 별도 라이브러리 없이 미들웨어로 작성했다.

```ts
app.use(createCorsMiddleware(readCorsOrigin(process.env.CORS_ORIGIN)));
```

미들웨어에서는 CORS 응답 헤더를 설정하고, `OPTIONS` 요청이면 `204` 응답을 반환한다.

```ts
res.setHeader("Access-Control-Allow-Origin", origin);
res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");

if (req.method === "OPTIONS") {
  res.status(204).end();
  return;
}
```

이렇게 해두면 브라우저의 실제 요청과 preflight 요청을 같은 정책 안에서 처리할 수 있고, 허용 Origin만 환경별로 바꿀 수 있다.

### Multer 추가

파일 저장소에는 `POST /files/:key` multipart 업로드를 추가했다. `file` 필드 하나를 받고 최대 50MB까지 메모리에 버퍼링한 뒤 저장한다. 기존 `PUT` 원시 바이너리 업로드와 함께 사용할 수 있다. 

파일이 빠졌거나 필드명이 잘못된 경우에는 공통 `invalid_file` 오류를 반환하도록 해서, 클라이언트가 업로드 실패를 일관되게 처리할 수 있도록 했다.

## 다음에 할 것

- devbox-light-server 아키텍처 수정하기(service를 명확하게 usecase로 변경?)
