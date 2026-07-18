---
title: "SniffMEET. RLS와 테이블 권한"
date: 2024-11-20

categories: ["SniffMEET"]
series: []
tags: ["Supabase"]

draft: true
original: "notion-export/블로그 이관/SniffMEET/트러블 슈팅/Supabase Database 673ade8f3765839db95d0108429d9d3a.md"
---

## 문제

Supabase에서 anon key로 Public 테이블에 접근하면 데이터가 보이는데, 익명 로그인 후 받은 JWT access token으로 접근하면 `200 OK`만 오고 데이터가 비어 있었다.

처음에는 authenticated role이 anon role보다 상위 권한이라고 생각해서 더 헷갈렸다. 하지만 Supabase에서는 role의 상하관계보다 RLS 정책을 어떻게 작성했는지가 더 중요했다.

## 확인

JWT가 만료된 경우에는 `401 Unauthorized`가 발생했다. 반면 RLS 조건에 맞지 않는 경우에는 요청 자체는 성공해서 `200 OK`가 오지만, row가 필터링되어 데이터가 내려오지 않았다.

authenticated 유저가 읽을 수 있도록 다음 policy를 추가하자 데이터를 읽을 수 있었다.

```sql
CREATE policy "Authenticated users can read"
ON "public"."hgdtest"
TO public
USING (
  auth.role() = 'authenticated'
);
```

## 정리

`200 OK`는 row를 읽었다는 뜻이 아니라, 요청이 정상 처리됐다는 뜻일 수 있다.

Supabase에서 데이터가 비어 있다면 토큰 만료뿐 아니라 RLS 조건에 의해 row가 필터링된 것은 아닌지 확인해야 한다. `GRANT`로 테이블 권한을 주는 것과 RLS로 row 접근 정책을 여는 것도 구분해서 봐야 한다.
