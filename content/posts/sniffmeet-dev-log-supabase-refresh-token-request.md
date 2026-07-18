---
title: "SniffMEET. Supabase 세션 갱신 요청이 실패한 이유"
date: 2024-11-21

categories: ["SniffMEET"]
series: []
tags: ["Supabase"]

draft: true
original: "notion-export/블로그 이관/SniffMEET/10 21 개발일지 145ade8f37658060812fe0ca739ebfb0.md"
---

## 문제

Supabase 세션 갱신 요청이 제대로 동작하지 않았다. 세션 로직이나 네트워크 레이어 문제처럼 보였지만, 실제 원인은 요청 형식이었다. 당시 메모는 이랬다.

## 수정

```swift
"grant_type": "refreshToken"
```

`grant_type` 값을 Swift식 camelCase로 보내고 있었다. Supabase가 기대하는 값은 `refresh_token`이었다.

```swift
"grant_type": "refresh_token"
```

body도 마찬가지였다. Supabase가 기대하는 key는 `refreshToken`이 아니라 `refresh_token`이었다. refresh 요청에서는 기존 access token의 `Authorization` 헤더도 제거했다. (토큰을 갱신받기 위한 요청인데, 만료된 토큰을 보내는거니까 아무 의미 없다!)

```swift
body: Data("{ \"refresh_token\": \"\(refreshToken)\" }".utf8)
header["Authorization"] = nil
```

refresh 요청은 기존 access token으로 리소스에 접근하는 요청이 아니라, refresh token으로 새 세션을 발급받는 요청이기 때문이다.

## 정리

- `grant_type`은 `refresh_token`
- body key도 `refresh_token`
- refresh 요청에는 기존 `Authorization` 헤더를 붙이지 않음

앱 내부에서는 `refreshToken`이라는 이름이 자연스럽지만, 외부 API와 통신할 때는 API가 정한 이름을 그대로 따라야 한다.
