---
title: "SniffMEET. anon-key와 익명 사용자의 접근 권한 구분"
date: 2024-11-28

categories:
  - SniffMEET
series: []
tags:
  - Authentication
  - Authorization
  - RLS
  - Supabase

draft: false
original: "notion-export/블로그 이관/SniffMEET/트러블 슈팅/Supabase 트러블 슈팅 7e7ade8f3765820cabb58165d114eee9.md"
---

## anon-role과 anon-user의 접근 권한 차이

Public Scheme에 있는 테이블을 `anon-key`로는 접근할 수 있었지만, `anon-user`의 JWT 토큰으로는 접근하지 못하는 문제가 있었다.  
처음에는 둘이 비슷한 범주라고 생각했지만, 실제로는 권한 체계와 접근 방식이 달라서 같은 문제로 볼 수 없었다.

### 문제를 확인하기 전 생각한 내용

`anon-key`, `anon-role`, `anon-user`의 차이부터 다시 정리했다.  
`anon-key`를 이용한 접근은 `anon-role`로 보고, `anon-user`는 이메일 주소나 전화번호를 등록하지 않은 유저를 의미한다. 이 경우 role 자체는 `authenticated-role`이었다.

익명 유저가 접근했을 때 `200 OK`가 뜨지만 실제 값을 가져오지 못하는 경우도 있었다.  
그래서 접근 자체는 허용되지만 `RLS`에서 막히고 있다고 추정할 수 있었다.

또한 `anon-role`과 `authenticated-role`은 상하 관계가 아니라 서로 독립된 롤이라는 점도 다시 확인했다.

### 실제 문제 해결 과정

RLS를 설정해서 `authenticated-role`인 유저만 접근할 수 있는 테이블로 바꿨다.

```sql
CREATE policy "Authenticated users can read"
ON "public"."hgdtest"
TO public
USING (
  (auth.role() = 'authenticated'::text)
);
```

![Screenshot 2024-11-20 at 3.42.08 PM.png](/images/sniffmeet-dev-log-supabase-anon-access-control/image-002.png)

RLS를 설정한 이후에는 테이블 데이터를 정상적으로 받아올 수 있었다.  
이 과정을 통해 `authenticated-role`이 `anon-role`을 포함하지 않는다는 점도 다시 확인했다.

또한 RLS에 걸린 요청은 실패가 명확하게 보이지 않는다는 점도 알게 됐다.  
응답은 `200 OK`처럼 보여도 실제로는 값이 비어 있을 수 있어서, 권한 문제를 바로 알아채기 어려웠다.

### 추가로 알게 된 부분

테이블 자체의 접근 권한을 설정하는 것은 RLS보다 DCL을 쓰는 편이 더 적절하다고 느꼈다.

role 단위로 권한을 지정할 수 있고, DCL로 막히면 `401 Unauthorized`가 떠서 권한 문제를 더 명확하게 파악할 수 있기 때문이다.

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mate_list TO "Authenticated-role";
```

## 정리

`anon-key`와 `anon-user`의 차이, 그리고 RLS와 DCL의 역할 차이를 정리했다.  

Public 테이블이라고 해서 무조건 모두 접근 가능한 것은 아니었고, RLS 정책이 없으면 사실상 Private처럼 동작한다는 점도 확인했다.
