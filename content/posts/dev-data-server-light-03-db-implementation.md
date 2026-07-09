---
title: "dev-data-server-light. 3. Database Implementation"
date: 2026-07-02
categories: ["Project"]
series: ["dev-data-server-light"]
weight: 4
tags: ["Backend", "dev-data-server-light", "Express", "TypeScript", "DB", "DIP"]
draft: false
original: "https://junmusu.tistory.com/198"
---

DB 모듈의 인터페이스와 서비스 레이어를 만들었으므로, 실제 구현체를 만들어야 한다. 우선 인 메모리(In-Memory)로 가볍게 구현체를 만들었다.

## 인 메모리 데이터 저장소

인 메모리 방식을 선택한 이유는 첫째로 처음부터 SQL이나 JSON 파일 기반 저장소를 이용해서 구현체를 만드는 것 보다는, 가장 단순한 구현체를 만들어서 DB 기능을 검증하고 빠르게 다음 기능을 만들기 위해서이다. 외부 의존성도 없고, 설정도 필요 없고, 테스트도 쉽다.

## 구현하기

`RecordStore` 인터페이스를 다시 보면 다음과 같다.

```ts
export interface RecordStore {
  list(collection: string): Promise<StoredRecord[]>;
  get(collection: string, id: string): Promise<StoredRecord | undefined>;
  create(collection: string, data: RecordData): Promise<StoredRecord>;
  replace(collection: string, id: string, data: RecordData): Promise<void>;
  delete(collection: string, id: string): Promise<boolean>;
}
```

구현체는 이 계약을 그대로 만족하면 된다. 중요한 것은 구현체는 Express를 몰라야하고 순수하게 TypeScript 코드로 짜여야 한다. HTTP 요청이나 라우팅 같은 것은 Router가 책임져야 한다.

### 프롬프트

```
Implement an in-memory Database implementation in src/db.

Requirements:
- Implement the existing Database interface.
- Use in-memory storage only.
- Persistence across server restarts is not required.
- Keep storage logic simple and explicit.

Architecture:
- Use explicit dependency injection when wiring the database into routes.
- Do not use global singleton state.
- Keep dependency composition explicit and easy to trace.

Testing:
- Add lightweight tests for the in-memory database implementation.
```

프롬프트를 작성할 때, 두 가지를 중점적으로 생각했다.

1. 전역 싱글톤으로 만드는 것을 방지한다.
2. 저장 로직을 최대한 단순하게 유지한다.  

iOS 코드를 작성할 때, 전역 싱글톤으로 로컬 스토리지를 구성한 적이 있는데 점점 전역 괴물이 되어가는 것을 보고 전역 싱글톤을 경계했고, 저장 로직은 가끔 에이전트가 시키지 않은 일을 하는 경우가 있는데, 그 때 영속성을 구현하거나 복잡한 쿼리 기능을 추가하는 것을 방지하기 위함이다.

## 구현 결과

약간의 오버엔지니어링과 테스트 부분의 의문점이 살짝 있었지만, 전반적으로 구현이 깔끔하게 크게 고칠 부분은 없었다.

### 내부 저장 구조

컬렉션별로 분리하는데 `Map` 그리고 컬렉션 내부의 레코드를 저장하는데도 `Map`을 사용했다. 첫 번째 `Map`은 컬렉션 이름을 `key`로 가지고 두 번째 `Map`은 `id`를 `key`로 가진다.

```ts
type CollectionStore = {
  nextId: number;
  records: Map<string, RecordData>;
};

private readonly collections = new Map<string, CollectionStore>();
```
 
`id`는 간단하게 초기값을 1으로 하고, 데이터가 저장될 때 마다 1씩 증가시키는 방식으로 것으로 구현했다.

```ts
store.nextId += 1;
```

`user`, `posts` 예시를 그림으로 나타내면 다음과 같다:

```md
collections
├── users
│   ├── nextId
│   └── records
│       ├── "1"
│       └── "2"
│
└── posts
    ├── nextId
    └── records
        └── "1"
```

### 구현체 내부 데이터 외부에 노출하지 않기

구현체 내부에 저장된 데이터를 구현체 외부에 노출하지 않고 메모리를 복사해서 리턴하도록 구현했다. 내부 저장소의 객체를 리턴하고, 만약 참조가 살아있다면 저장소의 데이터가 변경될 위험이 있기 때문이다.

deep copy를 사용할 때 AGENTS가 다음과 같은 코드를 작성했다:

```ts
function cloneRecordData(data: RecordData): RecordData {
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(data) as RecordData;
  }
  return JSON.parse(JSON.stringify(data)) as RecordData;
}
```

하지만 TypeScript 버전을 명확히 명시하고 시작한 프로젝트인 만큼, 모두 빌트인 함수인 `structuredClone()`으로 대체했다.

### PATCH는 아직 non-goal

`replace`는 기존 레코드를 통째로 교체한다.

```ts
async replace(
  collection: string,
  id: string,
  data: RecordData,
): Promise<void> {
  const store = this.collections.get(collection);

  if (store === undefined || !store.records.has(id)) {
    throw new RecordNotFoundError(collection, id);
  }

  store.records.set(id, structuredClone(data));
}
```

부분 수정이 아닌 전체 교체를 하기 때문에 `replace` 함수이다. 부분 수정이 필요하다면 나중에 `patch`를 별도로 추가하겠지만, HTTP Method는 DB CRUD가 아니기 때문에 아직은 non-goal로 생각했다.

## 테스트

`InMemoryRecordStore`는 의존성이 없기 때문에 테스트하기 정말 편하다. 테스트마다 새 인스턴스를 만들면 된다.  
에이전트가 작성한 테스트의 목록은 다음과 같다.

  - 레코드를 생성하고 조회할 수 있는가
  - 레코드를 생성 순서대로 목록 조회할 수 있는가
  - 기존 레코드를 교체할 수 있는가
  - 없는 레코드를 교체하면 에러가 발생하는가
  - 레코드를 삭제할 수 있는가
  - 없는 레코드를 삭제하면 false를 반환하는가
  - 컬렉션끼리 서로 격리되는가
  - 저장된 데이터 참조가 외부로 새지 않는가

테스트의 구성은 전반적으로 괜찮았지만, 테스트 구현을 봤을 때 짚고 넘어가야 할 부분이 두 개 있었다.

### 의문 1. id 생성도 테스트해야 하는가?

에이전트가 작성한 코드에서는 `id`생성도 테스트했다.

```ts
expect(created.id).toBe("1");
```

`id`를 생성하는건 따로 함수나 클래스가 있는 것이 아닌, 단순하게 레코드가 추가될 때 마다 +1씩 해서 `id`를 생성한다. `id` 생성 로직은 전반적인 서버 로직에서 크게 중요한 부분이 아닐 뿐더러, +1 하기는 테스트 하는 의미가 없다고 판단했다.

또한 아이디 생성이 잘 되었는가?는 결국 조회에서 드러나게된다. 따라서 단순히 `id`를 테스트 하는 코드는 제거했다.

### 의문 2. 왜 문자열 리터럴을 코드에 직접 넣는가?

에이전트가 작성한 테스트 코드에서는 문자열 리터럴이 코드 여기저기 직접 삽입되어 있었다:

```ts
await store.create("users", { name: "Ada" });
await store.create("users", { name: "Linus" });
```

iOS 코드에선 웬만한 문자열 리터럴은 따로 `enum`으로 관리해서 실수를 줄이고, 변경도 쉽게 관리한다. 그래서 정리하려 했는데, 테스트는 구조보다는 의도가 드러남이 더 중요하다고 생각했다. 만약 상수로 빼내게 되면 테스트를 읽을 때 정의를 계속 위아래로 움직이면서 확인해야한다. 눈으로 읽었을 때 바로 이해되는 테스트가 더 좋은 테스트라고 판단하여서 그대로 냅두었다.

## 마무리

이번 작업은 기능적으로 보면 단순한 인 메모리 CRUD 구현이었다. 하지만 이 구현체를 만들면서 몇 가지 기준을 더 분명하게 확인할 수 있었다. 구현체는 HTTP를 몰라야 한다. 전역 상태를 사용하지 않고, 명시적으로 생성하고 주입해야 한다.

저장소 내부 데이터는 외부에서 암묵적으로 변경될 수 없어야 한다. 테스트는 구현 세부사항보다 외부에서 관찰 가능한 동작을 검증해야 한다.`InMemoryRecordStore`는 단순한 구현체지만, `RecordStore` 인터페이스가 실제로 의미 있는 계약인지 검증하는 역할을 했다. 처음부터 복잡한 저장소를 붙이는 대신, 가장 작은 구현체로 구조를 검증하고 다음 기능으로 넘어갈 수 있었다.
