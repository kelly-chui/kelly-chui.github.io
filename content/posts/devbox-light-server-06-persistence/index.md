---
title: "devbox-light-server (6). Json 영속성"
date: 2026-08-10T14:14:08+09:00

categories:
  - Project
series:
  - devbox-light-server
weight: 7
tags:
  - Persistence
  - File Storage
  - DIP
  - TypeScript
features:
  - mermaid

draft: false
aliases:
  - /posts/devbox-light-server-06-persistence/
original: ""
---

MVP의 마지막 기능으로 서버를 재시작해도 데이터가 사라지지 않도록 영속성을 추가했다.

이번 포스트에서는 devbox-light-server에 DB, Storage, Token Storage에서 영속성을 가진 저장 방식을 구현해서 in-memory 대신 사용할 수 있도록 만든다.

프로토타입이었던 dev-data-server에서는 시작부터 SQL 의존성을 가지고 시작했지만, devbox-light-server는 아주 얇은 in-memory 구현만 가지고 있다.

MVP 마지막에 영속성을 넣는 이유는 서버를 구현할 때, 특정 구현에 휘둘리지 않기 위해서다. dev-data-server에서 SQL을 빠르게 들여와서, 결국 프로젝트가 SQL 래퍼가 된 느낌이 있다.

당연히 Service 레이어는 Repository의 인터페이스에만 의존하므로 어떤 방법을 쓰든 단순히 구현체만 갈아 끼우고, 의존성 생성, 연결 부분을 제외하고는 어떠한 코드에도 변화가 없어야 한다.

## Database 영속화

DB를 영속화 하는 첫 번째 방식으로는 JSON 파일 방식을 채택했다. SQL과 다르게 별도의 의존성 없이 바로 CRUD가 가능하다는 장점이 있고, 개발 중에 직접 파일을 확인하기도 쉽다.

전체 컬렉션을 하나의 JSON 파일에 저장하는 것 보다는, 컬렉션 하나당 JSON 파일을 하나씩 만들기로 결정했다. 

처음에는 하나의 JSON 파일로 할까 고민했다가. 컬렉션 하나를 수정하기 위해서 JSON 파일 내부에 있는 관련 없는 데이터도 함께 읽고, 다시 써야하는 문제점이 있다는 것을 생각하고, 컬렉션 별 JSON 파일로 결정했다.

컬렉션별로 JSON 파일을 사용하면 저장 단위가 나뉘고, 특정 컬렉션의 데이터만 초기화하거나 공유하기도 쉽다. 큰 트레이드 오프 없이 단순함과 편의성 관점에서 둘 다 괜찮은 선택인 것 같다.

```text
.data/
├── users.json
├── posts.json
└── auth/
    └── tokens.json
```

### JSON에서도 ID 생성 로직이 in-memory와 같아야 하는가?

```ts
async create(collection: string, data: RecordData): Promise<StoredRecord> {
  const store = await this.loadCollection(collection);
  const id = String(store.nextId);
  store.nextId += 1;
  store.records.set(id, structuredClone(data));
  await this.persist(collection, store);
  return { id, data: structuredClone(data) };
}
```

에이전트가 구현한 부분에서 가장 큰 문제는, 컬렉션 파일에 `nextId`를 저장해서, 이 값을 기반으로 유저 ID를 생성하고 있었다. in-memory 구현체에서 1부터 순차적으로 id를 부여하는 방식을 단순히 JSON으로 옮겨온 것 같다.

```json
{
  "nextId": 3,
  "records": {
    "1": { "name": "Ada" },
    "2": { "name": "Linus" }
  }
}
```

RecordStore 레포지토리의 인터페이스 요구사항을 보면 `id` 생성 규칙에 대한 요구사항은 단 하나도 없다. 

```ts
export interface RecordStore {
  list(collection: string): Promise<StoredRecord[]>;
  get(collection: string, id: string): Promise<StoredRecord | undefined>;
  create(collection: string, data: RecordData): Promise<StoredRecord>;
  replace(collection: string, id: string, data: RecordData): Promise<void>;
  delete(collection: string, id: string): Promise<boolean>;
}
```

즉, `id`를 생성하는 책임은 구현체에 존재하고 어떻게 구현하든 구현체의 자유다. 즉, `nextId`를 유지할 필요가 없다.

정말 굳이 `nextId`를 통한 순차 id 부여 방식을 유지하고 싶다 해도, 이런 방식이 아닌 `nextId` 컬렉션을 따로 만들어서 관리하는 것이 맞다고 생각한다. `nextId`는 이 컬렉션에서 공개되지 않는 것이 좋은 내부 로직에 관련된 값이기 때문이다.

그래서 UUID를 사용하는 방식으로 수정해서 더 이상 JSON 내부에 id 생성 로직의 일부가 노출되지 않도록 했다.

```ts
async create(collection: string, data: RecordData): Promise<StoredRecord> {
  const store = await this.readCollection(collection);
  const id = randomUUID();
  const next = {
    records: { ...store.records, [id]: structuredClone(data) },
  };
  await writeJsonFile(this.collectionFilePath(collection), next);
  return { id, data: structuredClone(data) };
}
```

### JSON 파일 유틸리티 분리하기

DB와 Auth 토큰 저장소는 모두 JSON 파일을 사용하기 때문에, 파일을 읽고 쓰는 로직을 각 구현체에 따로 작성하지 않고 `jsonFile.ts`로 분리했다.

`readJsonFile`은 파일이 아직 없으면 `undefined`를 반환한다. 반면 파일을 읽을 수 없거나 JSON 형식이 잘못된 경우에는 `JsonFileReadError`를 던진다. 

```ts
export async function readJsonFile(
  filePath: string,
): Promise<unknown | undefined> {
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }
    throw new JsonFileReadError(filePath);
  }
  try {
    return JSON.parse(content);
  } catch {
    throw new JsonFileReadError(filePath);
  }
}
```

`writeJsonFile`은 부모 디렉터리를 만든 뒤 `.tmp` 파일에 내용을 쓰고 원래 경로로 교체한다. DB와 Auth가 같은 쓰기 규칙을 공유하므로, atomic한 쓰기를 빠뜨리는 실수를 방지한다.

```ts
export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2));
  await fs.rename(tempPath, filePath);
}
```

이 유틸리티는 저장소의 정책을 결정하지 않는다. 어떤 파일을 사용할지, 데이터를 어떤 구조로 저장할지, 언제 읽고 쓸지는 각 구현체가 결정하고 `jsonFile.ts`는 JSON 파일 입출력의 공통 세부사항만 담당한다.

이 프로젝트는 단일 프로세스로 실행되는 개발 서버이므로 데이터베이스 수준의 동시성 제어까지 넣지는 않았다. 여러 프로세스가 같은 `.data` 디렉터리를 쓰는 경우에는 마지막 쓰기가 앞선 쓰기를 덮어쓸 수 있다.

## Auth 토큰도 같은 방식으로 영속화하기

DB의 유저 레코드를 영속화하더라도 토큰을 메모리에만 저장하면 서버를 재시작하는 순간 로그인 상태가 사라진다. 따라서 기존 `TokenStore` 인터페이스를 구현하는 `JsonFileTokenStore`를 추가했다.

토큰은 `.data/auth/tokens.json`에 하나의 JSON 객체로 저장한다.

```json
{ "access-token": "1" }
```

토큰 저장소는 `save`, `getUserId`, `remove`가 호출될 때마다 `tokens.json`을 읽는다. 파일이 없으면 빈 토큰 맵으로 시작하고, 파일이 존재하면 JSON 구조를 검증한 뒤 사용한다.

```ts
private async readTokens(): Promise<TokenMap> {
  const persisted = await readJsonFile(this.filePath);
  if (persisted !== undefined) {
    if (!isTokenMap(persisted)) {
      throw new InvalidTokenFileError(this.filePath);
    }
    return persisted;
  }
  return {};
}
```

`save`와 `remove`는 파일에서 최신 데이터를 읽은 뒤 메모리 객체를 수정하고 다시 파일에 기록한다.

```ts
async save(token: string, userId: string): Promise<void> {
  const tokens = await this.readTokens();
  tokens[token] = userId;
  await writeJsonFile(this.filePath, tokens);
}
```

따라서 파일이 데이터의 Source of Truth임을 유지한다.

## Storage 영속화

File Storage는 DB처럼 JSON 구조로 감싸지 않는다. `FileStorage`의 key를 저장소 루트 기준 상대 경로로 보고, 파일의 바이트를 그대로 저장한다.

```text
PUT /files/notes/hello.txt -> .data/files/notes/hello.txt
```

저장할 때 부모 디렉터리를 자동으로 만들기 때문에 중첩된 key도 사용할 수 있다.

```ts
const filePath = resolve(rootDirectory, key);
await mkdir(dirname(filePath), { recursive: true });
await writeFile(filePath, content);
```

key를 그대로 경로에 붙이지 않게 해서 `../`를 포함한 key가 저장소 루트 밖으로 나가면 임의의 파일을 덮어쓸 수 없도록 했다.

따라서 경로를 해석한 뒤 결과가 저장소 루트 안에 있는지 확인하고, 벗어나면 `PathTraversalError`를 던진다. 존재하지 않는 파일은 기존 `FileStorage` 계약에 맞춰 조회 시 `undefined`, 삭제 시 `false`로 처리한다.

## 옵션으로 구현체 선택하도록 하기

`InMemoryRecordStore`, `InMemoryTokenStore`, `InMemoryFileStorage`는 테스트와 임시 실행을 위해 남겼다.

실제 실행에서는 기본적으로 JSON 기반 영속 저장소를 사용하고, 필요할 때만 `PERSISTENCE=memory`로 전체 저장소를 in-memory 방식으로 바꿀 수 있게 했다.

```ts
export type PersistenceMode = "json" | "memory";

export function createRuntimeStores(
  mode: PersistenceMode,
  dataDirectory: string,
): RuntimeStores {
  switch (mode) {
    case "memory":
      return {
        recordStore: new InMemoryRecordStore(),
        tokenStore: new InMemoryTokenStore(),
        fileStorage: new InMemoryFileStorage(),
      };
    case "json":
      return {
        recordStore: new JsonFileRecordStore(dataDirectory),
        tokenStore: new JsonFileTokenStore(dataDirectory),
        fileStorage: new LocalFileStorage(path.join(dataDirectory, "files")),
      };
  }
}
```

세 저장소를 서로 다른 모드로 사용하지 못하게 하기 위해서, `runtime.ts`에서 하나의 `PersistenceMode`로 묶어 DB, Auth, Storage가 같은 모드를 사용하도록 했다.

의도적으로 이상하게 쓰지 않는 이상 DB는 JSON, Storage는 in-memory로 혹은 그 역으로 쓸 이유가 없다.

저장 위치는 `DB_DATA_DIR` 환경 변수로 바꾸고 기본값은 `.data`로 두었다. `app.ts`는 런타임에서 선택된 저장소를 서비스와 라우터에 연결하는 역할만 맡는다.

```ts
const dataDirectory = process.env.DB_DATA_DIR ?? ".data";
const mode = readPersistenceMode(process.env.PERSISTENCE);
const stores = createRuntimeStores(mode, dataDirectory);
```

실행 커맨드 몇 글자로 전체 구현체를 갈아 끼울 수 있다. DIP의 힘이 이렇게 강력하다!

## 정리

이번 글에서는 DB와 Auth에 JSON 기반 영속성을, Storage에는 서버의 파일 시스템 기반 영속성을 추가했다. 이제 서버를 껐다 켜도 유저, 토큰, 파일 데이터가 유지된다.

또한 실행 환경에 따라 저장소 구현체를 선택할 수 있도록 만들었다. 기본적으로는 JSON 기반 영속 저장소를 사용하지만, `PERSISTENCE=memory`를 지정하면 모든 저장소를 in-memory 구현으로 바꿀 수 있다. 저장소 구현체를 선택하고 애플리케이션에 연결하는 코드는 조립부에 모여 있고, 서비스와 라우터는 어떤 구현체가 선택됐는지 알 필요가 없다.

영속성을 추가하면서 기존에 세웠던 원칙들을 그대로 지킬 수 있었다.

- 외부 DB 없이 실행할 수 있다.
- 애플리케이션 조립부에서 의존성을 한눈에 확인할 수 있다.
- 구현체를 앱 코드의 변화 없이 갈아끼울 수 있다.

특히 이번 변경에서 DIP의 효과를 분명하게 확인할 수 있었다. 영속성 구현을 추가했지만 의존성 조립부를 제외하면 라우터, 서비스, 저장소 인터페이스의 코드를 수정할 필요가 없었다.

이제는 저장소 구현을 교체할 수 있고 서버를 재시작해도 데이터를 유지하는 형태가 되었다. 앞으로 필요해진다면 이 인터페이스를 유지한 채 SQL 저장소를 추가하거나, JSON 저장소에 동시성 제어와 마이그레이션을 보강할 수 있다.
