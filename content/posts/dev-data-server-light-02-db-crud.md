---
title: "dev-data-server-light. 2. Database CRUD"
date: 2026-06-30
categories: ["개발일지"]
series: ["dev-data-server-light"]
weight: 3
tags: ["Backend", "dev-data-server-light", "Express", "TypeScript", "DB", "DIP"]
draft: false
original: "https://junmusu.tistory.com/197"
---

시스템 모듈을 만든 이후에, 아마도 가장 많이 쓰게 될 DB 모듈을 만들었다.

![](/images/dev-data-server-light-02-db-crud/image-001.png)

당시에는 구조도 시스템 모듈과 동일하다고 생각했다. Router가 DB 인터페이스에 의존하고, 이를 구현한 구현체를 주입받는 방식으로 DIP와 DI를 동시에 적용했다.

이 과정 중에서
- naming bias 해결하기
- id 생성 책임 위치
- 기존 아키텍처의 문제점 -> 서비스 레이어 도입해서 해결하기  

에 대한 고민을 했다. 아래는 고민과 해결 과정이다.

## CRUD부터 만들기

Mock Server라도 최소한 CRUD는 제공해야 한다. 처음부터 구현체를 만들 필요는 없으므로, 라우터와 인터페이스까지만 만들도록 프롬프트를 작성했다.

```
Create lightweight database interfaces and CRUD route placeholders.

Requirements:
- Define database interfaces in src/services/db.
- Do not implement database storage yet.
- Concrete implementations will be added later in src/db.

- Add lightweight CRUD routes only.
- Keep routes focused on HTTP request and response handling.

- Record IDs should be provided by the caller.
```

결과는 다음과 같다:

```ts
import type { DocumentBody, StoredDocument } from "./types.js";

export interface DocumentStore {
  list(collection: string): Promise<StoredDocument[]>;
  get(collection: string, id: string): Promise<DocumentBody | undefined>;
  create(collection: string, id: string, document: DocumentBody): Promise<void>;
  replace(collection: string, id: string, document: DocumentBody): Promise<void>;
  delete(collection: string, id: string): Promise<boolean>;
}
```

우선, 첫 번째로 눈에 보인 문제는 에이전트가 붙인 이름이 마음에 들지 않았다. `Document`, `Collection` 같은 이름들이 너무 FireStore같은 Document Database 같았다. 지금 만든 것은 인터페이스이므로, 특정 구현 방식에 종속되지 않은 네이밍을 해야 하는데 위와 같은 상태로는 쓰기 힘들다.

### 네이밍 변경하기

함수명, 인터페이스명을 제외하고 구조 자체는 크게 문제가 없으므로 직접 손으로 변수명을 변경했다.

```ts
import type { RecordData, StoredRecord } from "./types.js";

export interface RecordStore {
  list(collection: string): Promise<StoredRecord[]>;
  get(collection: string, id: string): Promise<StoredRecord | undefined>;
  create(collection: string, data: RecordData): Promise<StoredRecord>;
  replace(collection: string, id: string, data: RecordData): Promise<void>;
  delete(collection: string, id: string): Promise<boolean>;
}
```

우선 collection은 유지했다. 완전히 중립적인 용어는 아니지만 SQL 느낌이 물씬 풍기는 'table' 보다는 중립적이다. collection 자체가 문제가 아닌 'Document'라는 이름과 같이 있어서 FireStore스러운 느낌이 든다고 생각했다.

Document는 Record로 바꿨다. 'row'는 너무 SQL 느낌이고, 'item'은 너무 추상적이다. 가장 중립적으로 생각할수 있는 이름인 Record로 선택했다.

### id의 생성 책임은 누가?

에이전트가 짠 코드에서 id 생성 책임은 클라이언트가 아닌 서버가 가진다. `create` 함수에서 `id`가 파라미터로 전달되지 않는다.

```ts
create(collection: string, data: RecordData): Promise<StoredRecord>;
```

처음에는 클라이언트가 id를 만드는게 맞지 않나라는 생각을 했다. 우선, 클라이언트가 id를 직접 생성하면 나중에 조회하기 편할 것이라는 생각을 했다. 두 번째로는 클라이언트가 보낸 데이터가 서버 안에서 다시 정제되어서 저장된다는 것이 약간 어색하게 느껴졌다.

그래서 첫 번째 이유부터 생각해보니, 클라이언트가 id를 직접 생성 하든 안하든 조회와는 별 상관이 없었다. 클라이언트는 어떻게 사용을 할까? 라는 고민을 할 때 개인적으로 'To-do 대입법'을 사용하는데, 여기서도 사용해보면 태스크들의 리스트를 한번 서버에서 불러와야하고, 그 리스트에 id가 이미 포함된다. 여러 케이스를 생각해봐도, id를 몰라서 데이터를 못불러오는 경우는 없을 것이라고 생각했다.

따라서 id의 생성 책임을 그대로 서버에 두기로 했다. 클라이언트에서 서버를 사용하는 것을 서버가 통제하기 시작하는건, 그때 부터 다시 클라이언트와 서버가 결합되게 되는 것이다. SOLID 관점에서 별로 좋지 않다.

## 아키텍처 바꾸기

system 모듈도 그렇고, 처음에 만든 구조는 다음 그림과 같다:

![](/images/dev-data-server-light-02-db-crud/image-002.png)

처음에 서버는 정말 기본적인 기능만 제공하고, 복잡한 동작은 클라이언트에서 조립해서 쓰는 방식을 생각했다. 하지만 이 생각으로 인해, HTTP API와 DB 내부 인터페이스를 동일시 하는 착각을 하고 있었다.

HTTP API는 서버와 클라이언트가 통신하기 위한 규칙이고, 인터페이스는 서버 내부에서 사용하는 구현 요구사항이다. 목적부터가 크게 다른데 이를 동일하게 생각해서 Router가 직접 DB 인터페이스를 참조하는 구조가 되었다. 이 뿐만 아니라, DB는 기초적인 기능이라서 둘이 크게 모양이 다르지 않을 수 있는데 mock임에도 불구하고, file storage, auth로 가면 기능이 복잡해져서 차이가 벌어지게 된다.

이를 해결하기 위해 유즈케이스와 유사한 역할을 하는 서비스 레이어를 도입했다. 유즈케이스는 너무 구체적인 행동을 지시하기 때문에, 클라이언트에서 범용적으로 쓸 수 있는 메소드 정도를 담고 있도록 서비스라고 했다.

![](/images/dev-data-server-light-02-db-crud/image-003.png)

최종 구조에서는 서버가 제공하는 기능을 서비스 레이어에 정의한다. 클라이언트는 HTTP 요청을 통해 Router를 거쳐 서비스 레이어를 호출하고, 서비스 레이어는 `RecordStore` 인터페이스에 의존하여 필요한 작업을 수행한다. `RecordStore`는 인터페이스이기 때문에 실제 구현체는 자유롭게 교체할 수 있으며, 이를 통해 저장소 구현과 서비스 로직 사이에 DIP를 적용할 수 있었다.

## 전체 모듈 구조

![](/images/dev-data-server-light-02-db-crud/image-004.png)
