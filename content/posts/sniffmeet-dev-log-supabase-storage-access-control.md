---
title: "SniffMEET. Storage 버킷과 접근 제어"
date: 2024-11-24

categories: ["SniffMEET"]
series: []
tags: []

draft: false
original: "notion-export/블로그 이관/SniffMEET/작업일지 11 24 2024 5c8ade8f3765838a91dc0106132e8efa.md"
---

SniffMEET의 프로필 이미지는 사용자 정보와 성격이 다르다. 사용자 이름이나 소개처럼 구조화된 데이터는 Database에 저장하고, 이미지 파일은 Storage에 저장하는 편이 적합하다. 

Storage의 Postgres 테이블에는 파일 자체가 아니라 버킷과 객체의 메타데이터가 기록된다.

## 버킷과 객체 경로

버킷은 파일을 묶는 최상위 컨테이너다. 사용자마다 버킷을 만드는 것보다 용도별 버킷을 만들고 객체 경로로 사용자를 구분하는 편이 관리하기 쉽다.

```text
profile-images/
├── {user-id}/profile.jpg
└── {user-id}/thumbnail.jpg
```

이 구조에서는 `profile-images` 버킷이 공통된 공개 범위와 파일 제한을 담당하고, 사용자 ID가 포함된 경로를 RLS 정책에서 검사할 수 있다.

## Public과 Private

Private 버킷의 파일은 다운로드를 포함한 모든 작업에 RLS가 적용된다. 반면 Public 버킷은 URL을 아는 누구나 파일을 조회할 수 있어 프로필 이미지처럼 공개할 데이터에 적합하다.

다만 Public 버킷에서도 업로드, 수정, 삭제 권한은 공개되지 않는다. 이러한 작업은 여전히 `storage.objects`에 설정한 RLS 정책으로 제한해야 한다.

## 소유권과 접근 권한

인증된 사용자가 객체를 만들면 JWT의 사용자 ID가 `owner_id`에 기록된다. 

{{< callout type="warning" title="주의" >}}
서비스 키나 대시보드로 생성한 객체에는 소유자가 설정되지 않을 수 있다.
{{< /callout >}}

`owner_id`는 객체의 소유자를 나타낼 뿐 접근을 자동으로 제한하지 않는다. 자신의 경로에만 업로드하거나 자신의 객체만 수정하게 만들려면 별도의 RLS 정책이 필요하다.

SniffMEET에서는 프로필 이미지를 하나의 Public 버킷에 저장하되, 사용자 ID로 경로를 나누고 변경 작업은 RLS로 제한하는 구조를 사용했다.

## 참고

- [Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Ownership](https://supabase.com/docs/guides/storage/security/ownership)
