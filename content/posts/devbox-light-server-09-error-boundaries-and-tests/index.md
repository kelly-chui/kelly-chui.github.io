---
title: "devbox-light-server (9). 에러 처리 경계와 테스트 구조 정리"
date: 2026-08-21T16:51:24+09:00

categories:
  - Project
series:
  - devbox-light-server
weight: 10
tags:
  - Software Architecture
  - Error Handling
  - Testing
  - Express

features:
  - mermaid

draft: false
aliases:
  - /posts/devbox-light-server-11-error-boundaries-and-tests/
original: ""
---

[이전 포스팅]({{< relref "posts/devbox-light-server-08-layered-architecture" >}})에서 디렉토리와 의존 방향을 계층 기준으로 정리했다.

전반적으로 구조가 깨끗하다고 생각했는데, 에러들이 계층 구조를 뚫고 전달된다는 문제가 있었다.

예시로 DB를 JSON으로 구현한 구현체에서 발생한 에러가, 유즈케이스에서 그대로 라우트에 전파하는 문제가 있었다. 이러면 라우트가 DB가 어떻게 구현되었는지 알게 된다. 

그런 에러들은 라우트에서 알 필요도 없고 알아서도 안된다. 라우트에서 JSON 관련 에러를 처리할 것도 아니고, DB의 세부 구현은 숨기는게 맞다. 나중에 SQL로 바꾸면 라우트 코드도 바꿀 것인가?

## 현재 코드의 문제점

다음은 DB Repository인 `recordStore.ts`의 구현체 `jsonFileRecordStore.ts` 내부에 있는 메소드다.

```ts
async replace(
  collection: string,
  id: string,
  data: RecordData,
): Promise<void> {
  const store = await this.readCollection(collection);
  if (!(id in store.records)) {
    throw new RecordNotFoundError(collection, id);
  }
  await writeJsonFile(this.collectionFilePath(collection), {
    records: { ...store.records, [id]: structuredClone(data) },
  });
}
```

아래는 `databaseUseCases.ts`에 있는 메소드다.

```ts
async getRecord(collection: string, id: string): Promise<StoredRecord> {
  const record = await this.recordStore.get(collection, id);
  if (record === undefined) {
    throw new RecordNotFoundError(collection, id);
  }
  return record;
}
```

둘이 명백하게 계층이 다른데도, 같은 `RecordNotFoundError`를 던지고 있다. 즉, `RecordNotFoundError`가 라우트까지 전달된다.

이것이 문제인 이유는 에러 타입이 각 계층 경계를 무시하고 있기 때문이다. `RecordNotFoundError`가 레포지토리 계약에서 발생하는 에러라면 유즈케이스에 전달되어야 하고, 유즈케이스에서 발생하는 에러면 라우트에서 전달되어야 한다.

하지만 지금 상황은 모든 계층에서 `RecordNotFoundError`를 사용하고 있다. 이런 에러들은 DB뿐만 아니라, auth, storage에도 존재한다.

에러들이 계층을 마음대로 뚫고 활보하고 있는데, 이를 해결하기 위해서 순서를 정했다:

1. 디렉토리 구조화하기
2. 구현체 특화 에러 제거하기
3. 계층별로 에러를 구조화하기

1번은 지난 포스팅때 이미 했고, 이 포스트에서는 2번과 3번 과정을 다룬다.

## Repository 공통 에러 만들고, 구현체 특화 에러 제거하기

DB의 `RecordStore`에 in-memory든 JSON이든 구현체들이 공통으로 사용할 수 있는 에러를 정의했다. 

기존 코드에서는 각 구현체별로 에러들이 있었는데, 유즈케이스에선 JSON에 문제가 생겼는지, in-memory에 문제가 생겼는지와 같은 세부사항은 궁금하지 않다. 

그냥 명시된 Repository 계약의 어느 부분에서 문제가 생겼는지만 전달하면 된다.

```ts
export class RecordNotFoundError extends Error {
  // ...
}

export class RecordStoreReadError extends Error {
  // ...
}

export class RecordStoreWriteError extends Error {
  // ...
}
```

JSON 구현체든 in-memory 구현체든 내부 에러를 직접 내보내지 않는다. 파일을 읽을 수 없거나, 파일의 JSON 구조가 DB 형식과 다르면 모두 `RecordStoreReadError`를 던진다.

```ts
private async readCollection(collection: string): Promise<PersistedCollection> {
  this.validateCollection(collection);

  let persisted: unknown | undefined;
  try {
    persisted = await readJsonFile(this.collectionFilePath(collection));
  } catch (error) {
    throw new RecordStoreReadError({ cause: error });
  }

  if (persisted !== undefined && !isPersistedCollection(persisted)) {
    throw new RecordStoreReadError({
      cause: new Error(`Invalid database file: ${this.collectionFilePath(collection)}`),
    });
  }

  return persisted ?? { records: {} };
}
```

이제 JSON 파일 구현을 SQLite나 원격 DB로 교체하더라도, UseCase는 "저장소를 읽지 못했다"는 사실만 알게 된다.

## UseCase 계층 에러

Repository의 에러는 유즈케이스에 전달된다. 

라우트에서 직접 Repository 에러를 알지 못하게 하는게 목적이므로(라우트는 유즈케이스의 에러만 알아야 한다), 유즈케이스 에러도 정의하고, 라우트에는 유즈케이스 에러만 던지게 한다.

```ts
private mapError(error: unknown): Error {
  if (error instanceof InvalidCollectionNameError) {
    return new DatabaseInvalidCollectionError(error.collection);
  }
  if (error instanceof RecordNotFoundError) {
    return new DatabaseRecordNotFoundError(error.collection, error.id);
  }
  if (error instanceof RecordStoreWriteError) {
    return new DatabaseWriteError({ cause: error });
  }
  if (error instanceof RecordStoreReadError) {
    return new DatabaseReadError({ cause: error });
  }
  throw error;
}
```

라우트가 Repository 에러를 알 필요는 없다. 지금은 기능이 단순해서 1:1 매핑처럼 보이지만 다음과 같은 경우를 생각해볼 수 있다.

만약 페이지네이션 기능이 추가된다면? 이건 (아마도)유즈케이스에서 처리할 문제다. 그런데 구현체는 페이지네이션에 대해서 모른다.

이런 상황에서 구현체의 에러를 그대로 라우트에 전달하면? 라우트는 에러 핸들링을 제대로 하지 못하게 된다.

## Route는 Application 에러만 HTTP로 바꾸기

Route는 구현체가 JSON 파일인지, 메모리 저장소인지 알지 못한다. DB Route가 아는 에러는 `DatabaseUseCases`가 만든 Application 에러뿐이다.

```ts
function sendDatabaseError(res: Response, error: unknown): void {
  if (error instanceof DatabaseInvalidCollectionError) {
    res.status(400).json({
      error: "invalid_collection",
      collection: error.collection,
    });
    return;
  }
  if (error instanceof DatabaseRecordNotFoundError) {
    res.status(404).json({
      error: "not_found",
      collection: error.collection,
      id: error.id,
    });
    return;
  }
  if (error instanceof DatabaseReadError || error instanceof DatabaseWriteError) {
    res.status(500).json({ error: "internal_server_error" });
    return;
  }
  throw error;
}
```

## 업로드 에러는 Storage Route에서 처리하기

Multer는 전역 미들웨어가 아니다. `storageRoute.ts` 안에서 multipart 업로드에만 사용하는 Route 전용 미들웨어다. 원시 바이너리 업로드의 `express.raw()`도 같은 파일에서 등록한다.

따라서 Multer와 업로드 용량 초과 에러도 Storage API 경계에서 처리하도록 옮겼다.

```mermaid
flowchart LR
    Upload[Multer / express.raw] --> StorageHandler[Storage Route 에러 핸들러]
    StorageHandler --> Response[HTTP 응답]
```

```ts
const storageUploadErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  if (error instanceof MulterError) {
    res.status(400).json({ error: "invalid_file" });
    return;
  }

  next(error);
};

router.use(storageUploadErrorHandler);
```

반면 `express.json()`은 `app.ts`에서 등록하는 전역 JSON parser다. `httpErrorHandler`는 이 parser에서 발생한 잘못된 JSON, 전역 JSON body의 용량 초과, 그리고 처리되지 않은 예외만 담당한다.

```ts
export const httpErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (hasErrorType(error, "entity.parse.failed")) {
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  if (hasErrorType(error, "entity.too.large")) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  console.error("Unhandled request error", error);
  res.status(500).json({ error: "internal_server_error" });
};
```

클라이언트의 응답 형식은 일관되게 유지하면서도, 각 에러는 가장 가까운 API 경계에서 처리하게 됐다.

## 테스트도 계층을 따라가기

소스 구조가 계층 기준으로 바뀌었으므로 테스트도 같은 기준으로 재배치했다.

```text
tests/
├─ unit/
│  ├─ application/
│  ├─ api/
│  ├─ config/
│  └─ data/
└─ integration/
```

`data` 테스트는 실제 구현체가 Repository 계약을 지키는지 확인한다. 예를 들어 깨진 JSON 파일을 읽었을 때 구현체가 JSON parser 에러를 그대로 내보내지 않고 `RecordStoreReadError`를 던지는지 검증한다.

```ts
it("throws a clear error on a corrupted file", async () => {
  await store.create("users", { name: "Ada" });
  await writeFile(
    path.join(rootDirectory, "users.json"),
    "{ not valid json",
  );

  const reloaded = new JsonFileRecordStore(rootDirectory);

  await expect(reloaded.list("users")).rejects.toBeInstanceOf(
    RecordStoreReadError,
  );
});
```

`application` 테스트는 UseCase의 흐름과 에러 변환을, `api`는 CORS처럼 Express에 특화된 미들웨어를 확인한다. `integration`은 Supertest로 실제 포트를 열지 않고 앱에 요청해 HTTP 계약 전체를 검증한다.

## 정리

이번 작업에서는 계층을 뚫고 돌아다니던 에러를, 각 계층의 책임에 맞게 다시 나눴다.

처음에는 의존 방향만 보면 구조가 깔끔하다고 생각했다. 그런데 에러는 그 경계를 무시하고 있었다. JSON 구현체에서 발생한 에러와 Repository 계약 에러가 UseCase를 거치지 않고 Route까지 전달되면, 결국 Route가 저장소의 구현 세부사항을 알아야 한다.

그래서 Data 구현체는 파일 시스템이나 JSON 파싱처럼 구현체에 가까운 실패를 Repository 공통 에러로 변환하고, UseCase는 이를 Application 에러로 바꾸도록 했다. Route는 Application 에러만 받아 HTTP 응답으로 변환한다. 구현체를 JSON 파일에서 다른 저장소로 바꾸더라도 Route와 UseCase가 바뀌지 않게 하려는 목적이다.

지금 서버 규모에서는 Route가 Application 에러를 직접 HTTP 응답으로 매핑하는 정도가 가장 단순하고 충분하다고 생각한다. 나중에 기능이 커져 같은 에러 매핑이 여러 Route에서 반복되면, 그때 공통 어댑터를 분리하면 된다.

별개로 개발일지가 실제 개발보다 한 2배는 더 많이 걸렸다... 중간에 글을 한번 날려먹어서...
