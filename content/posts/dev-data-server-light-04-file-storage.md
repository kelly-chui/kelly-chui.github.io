---
title: "dev-data-server-light. 4. File Storage"
date: 2026-07-02
categories: ["개발일지"]
series: ["dev-data-server-light"]
weight: 5
tags: ["Backend", "dev-data-server-light", "Express", "TypeScript", "File Storage", "DIP"]
draft: false
original: "https://junmusu.tistory.com/199"
---

DB 모듈을 마무리하고, 다음으로 구현한 것은 File Storage 모듈이다. DB 모듈과 크게 다르지 않을 것이라고 생각했다. 우선 CRUD 비슷한 메소드를 처리하고, 구조는 DB 모듈에서 충분히 다듬었기 때문이다. 하지만 실제로는 DB보다 인터페이스를 어떻게 정의할 것인지에 대한 고민이 더 많았다.

## 인터페이스 만들기

처음 작성한 프롬프트는 다음과 같다.

```
Create the initial FileStorage contract in src/storage.

Requirements:

- Define a FileStorage interface.
- The interface is responsible only for storing and retrieving binary file contents.
- It should not manage file metadata, ids, ownership, permissions, or database records.
- Use Buffer for file contents.
- Include only the minimal operations required for file storage:
  - save(path: string, content: Buffer): Promise<void>
  - read(path: string): Promise<Buffer>
  - delete(path: string): Promise<void>
  - exists(path: string): Promise<boolean>
- Add minimal domain errors if necessary.

For this step, create only the contract and related types.
Do not implement any storage implementation yet.
```

로컬 파일 시스템을 의식하고 있어서 의심 없이 `path`라는 이름을 사용했는데, 이 때문에 인터페이스가 구현체를 닮아버리게 되었다. `path`는 과연 인터페이스를 대표할 수 있는 네이밍인가?

```ts
export interface FileStorage {
  save(path: string, content: Buffer): Promise<void>;
  read(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
```

### 가볍게 덜어내기

따라서 첫 번째 프롬프트의 결과로 나온 코드를 폐기하고, 다시 프롬프트를 구현이 끝난 이후에 에이전트에게 설계에 대한 설명을 하도록 작성했다:

```
Implement the initial storage contract.

Create only:
- the storage interface
- supporting types if needed
- storage-specific errors if needed
- module exports

Do not create:
- concrete storage implementations
- HTTP routes
- Express middleware
- multipart upload handling
- external dependencies

After implementing, explain the design decisions and tradeoffs, especially:
- storage identifier naming
- which operations belong in the interface
- whether bucket/list support should be included now or deferred
```

결과는 아래 코드와 같다:

```ts
import type { FileContent } from "./types.js";
export interface Storage {
  get(bucket: string, key: string): Promise<FileContent | undefined>;
  put(bucket: string, key: string, content: FileContent): Promise<void>;
  delete(bucket: string, key: string): Promise<boolean>;
}
```

에이전트가 이러한 코드를 짠 근거를 요약했다. AI가 쓴 글을 인간이 요약하는 행위가 굉장히 어색하다.

```md
- `bucket`: 관련된 파일을 그룹화한다. path를 암시하지 않기에 설계
- `key`: 파일을 식별하기 위한 식별자, id를 사용하지 않는건 DB와 안 햇갈리도록
- 트레이드오프: 하나의 문자열을 사용하는 것 보다 조금 더 복잡해진다.
- `put`: 파일 생성 (덮어쓰기 가능)
- `get`: 파일 읽기
- `delete`: 파일 삭제
- 리스트 조회는 아직 페이지네이션, prefix 검색과 같은 결정사항이 존재하지 않고, 핵심 기능과는 거리가 있으므로 제외했다.
- 파일 존재 여부 확인과 메타데이터 조회도 필수 기능이 아니라서 제외했다.
```

`exist`를 제거한 것은 마음에 들었지만, Supabase나 S3를 연상시키기 때문에 `bucket`은 약간 좀 찝찝했다.

### 버켓 제거하기

지금 짜고 있는 서버는 아주 가벼운게 목표기 때문에 버켓을 제거했다. 일단 버켓은 추상화된 Storage에서 필수 요구사항이 아니라 특정 구현체가 사용하는 개념으로 판단했다. bucket이 요구사항이 된 순간, 다시 인터페이스가 구현체의 영향을 받게 된다.

또한 단일 문자열을 사용하는 것도 충분히 bucket을 흉내낼수 있다. `get`, `put`, `delete`는 서비스 레이어가 사용할 함수들이지 클라이언트에서 직접 사용할 함수가 아니다.

클라이언트 코드에서 `bucket`과 `key`를 따로 적어서 서버에 제출한다 해도, `bucket`을 `key`에 합쳐버리면 된다. 클라이언트에서는 서버의 내부 구조를 몰라도 동작하게 만들어야 하므로, 전혀 문제 없다.

### 최종 인터페이스

```ts
export interface FileStorage {
  get(key: string): Promise<FileContent | undefined>;
  put(key: string, content: FileContent): Promise<void>;
  delete(key: string): Promise<boolean>;
}
```

처음 인터페이스와 비교하면 `exist` 기능이 하나 빠졌지만, 필요할 때 추가하면된다. 현재 서버의 컨셉을 계속 기억하면, 최소 기능을 제공하는 Mock 서버이다. 지금 당장 필요하지 않은 기능을 넣을 필요가 없다.

## 서비스 레이어 만들기

인터페이스를 정리한 뒤에는 서비스 레이어를 만들었다. DB 모듈과 마찬가지로 인터페이스와 (구현체는) 파일의 입출력만 담당하고 '파일이 없으면 예외를 발생시킨다' 같은 정책은 서비스 레이어가 담당한다.

프롬프트는 다음과 같이 작성했다.

```
Implement StorageService.

Create:
- src/storage/storageService.ts
- storage service unit tests
- src/storage/errors.ts if needed

Suggested service behavior:
- getFile(key): returns FileContent
- getFile(key): throws FileNotFoundError when missing
- putFile(key, content): stores content
- deleteFile(key): deletes content
- deleteFile(key): throws FileNotFoundError when missing

Only modify files required for this task.

After implementing:
- run tests
- explain the design decisions
```

하지만 이 프롬프트는 cursor에서 사용하지 못했다.(유료로 사용하는 Codex는 iOS 개발 작업에서만 쓴다.)

![](/images/tistory/dev-data-server-light-04-file-storage/image-001.png)

사용량을 모두 소진했기기 때문에 결국 프로젝트를 Gemini Antigravity 환경으로 옮기기로 했다. 마이그레이션 과정과 Local File Storage 구현은 다음 글(3-2)에서 이어서 정리한다.
