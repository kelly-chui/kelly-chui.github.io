---
title: "dev-data-server-light. 1. System"
date: 2026-06-25

categories:
  - Project
series:
  - dev-data-server-light
weight: 2
tags:
  - Backend
  - Express
  - TDD
  - TypeScript

draft: false
original: "https://junmusu.tistory.com/196"
---

프로젝트에서 제일 간단한 기능과 구조를 가지기 때문에 가장 먼저 System 모듈을 만들었다.

## System 모듈의 기능

System 모듈이 제공하는 기능은 단 두 가지뿐이다.

```pgsql
GET /system/status
GET /system/uptime
```

`status`는 서버가 정상적으로 동작하는지 알려주고, `uptime`은 서버가 실행된 이후 얼마나 시간이 지났는지를 반환한다.

비즈니스 로직도 없고, 데이터베이스도 필요하지 않으며, 파일 시스템도 다루지 않기 때문에 구조를 검증하는데 가장 좋다고 판단했다.

## 구조 검증

System 모듈을 만들면서 확인하고 싶었던 것은 기능이 아니라 구조였다. 당시에 생각했던 구조는 다음과 같았다.

Route는 HTTP 요청과 응답만 담당하고, Service는 실제 애플리케이션 로직을 담당한다 Express를 사용하는 것은 Route뿐이고, Service는 Express를 알지 않아야 한다.

이 구조를 모든 모듈에서 공통적으로 사용할 수 있다면 이후 Database, Storage, Auth도 같은 패턴으로 확장할 수 있을 것이라고 기대했다.

### 첫 번째 프롬프트

```text
Create the initial system module.

Requirements:
- Add a lightweight system service for server status and uptime.
- Add routes for:
  - GET /system/status
  - GET /system/uptime
- Routes should remain thin.
- Services must not depend on Express.
- Add lightweight Vitest tests.
- Keep the implementation simple and explicit.
- Avoid unnecessary abstractions.
```

### 결과

#### Service

```ts
export type SystemStatus = {
  status: "ok";
  timestamp: string;
};

export type SystemUptime = {
  uptimeSeconds: number;
};

export type SystemServiceOptions = {
  startedAt?: number;
};

export class SystemService {
  private readonly startedAt: number;

  constructor(options: SystemServiceOptions = {}) {
    this.startedAt = options.startedAt ?? Date.now();
  }

  getStatus(): SystemStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  getUptime(): SystemUptime {
    const uptimeMs = Date.now() - this.startedAt;
    return {
      uptimeSeconds: Math.floor(uptimeMs / 1000),
    };
  }
}
```

#### Route

```ts
import { Router } from "express";
import type { SystemService } from "./system.js";

export function createSystemRouter(systemService: SystemService): Router {
  const router = Router();

  router.get("/status", (_req, res) => {
    res.json(systemService.getStatus());
  });

  router.get("/uptime", (_req, res) => {
    res.json(systemService.getUptime());
  });

  return router;
}
```
나중에 구조가 바뀌게 되지만(시스템 모듈을 만들 때 착각을 하나 하고 있었다) 괜찮은 결과라고 생각해서 confirm을 눌렀다. 우선 Route가 얕게 나온것에 만족했다.

## TDD하기

이번 프로젝트에서는 기능을 모두 만든 뒤 테스트를 추가하는 방식보다, 기능을 만들 때 함께 테스트를 작성하는 방식을 선택했다.

프로젝트 루트에 작성한 AGENTS에 기능 구현 이후에 테스트를 하도록 작성했기 때문에, 항상 테스트 코드도 동시에 생성된다.

System 모듈 역시 상태가 정상적으로 반환되는지, 가동 시간이 증가하는지, 응답 형식이 일정한지 등을 확인하는 간단한 테스트를 함께 작성했다.

가장 간단한 테스트 프레임워크가 Vitest라 생각해서 도입했고, 아래는 AI가 생성한 테스트 코드이다.

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SystemService } from "../../../src/system/system.js";

describe("SystemService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getStatus", () => {
    it("returns ok status with an ISO timestamp", () => {
      const service = new SystemService();
      const status = service.getStatus();

      expect(status.status).toBe("ok");
      expect(status.timestamp).toBe("2026-01-15T12:00:00.000Z");
    });
  });

  describe("getUptime", () => {
    it("returns elapsed whole seconds since service start", () => {
      const startedAt = new Date("2026-01-15T11:59:30.000Z").getTime();
      const service = new SystemService({ startedAt });

      expect(service.getUptime()).toEqual({ uptimeSeconds: 30 });
    });

    it("floors partial seconds", () => {
      const startedAt = new Date("2026-01-15T11:59:59.750Z").getTime();
      const service = new SystemService({ startedAt });

      expect(service.getUptime()).toEqual({ uptimeSeconds: 0 });
    });
  });
});
```

## 마무리

System 모듈은 가장 단순한 기능이었지만, 이후 DB, FileStorage 등의 기능을 만들 때 구조의 기준점이 되기 때문에 중요하다. 다음 개발일지에서는 Database 모듈을 설계하면서 처음 마주했던 고민, 특히 CRUD 인터페이스와 Naming Bias에 대해 정리해보려고 한다.
