---
title: "Node. TypeScript 프로젝트 초기화하기"
date: 2025-10-08

categories:
  - Node.js
  - TypeScript
series: []
tags:
  - Compiler Configuration
  - npm
  - Project Setup

draft: false
original: "notion-export/블로그 이관/Node/Node 프로젝트 초기화하기 285ade8f376580c99016debbd8dc05ad.md"
---

## 새로운 노드 프로젝트 생성하기

### npm 초기화부터

```bash
npm init -y
```

 Node 프로젝트를 초기화한다. 이 명령을 실행하면 현재 디렉터리에 `package.json` 파일이 생성되고, Node와 npm은 이를 기준으로 프로젝트를 관리한다.

### npm install

```zsh
npm install -D typescript tsx @types/node @types/express
```

- `npm install`: 필요한 패키지를 설치하는 명령이다. 뒤에 패키지 이름을 지정하면 해당 패키지를 설치하고, `package.json`에도 자동으로 기록한다.
- `-D`: `--save-dev`의 약자이다. 개발 과정에서만 사용하는 패키지를 `devDependencies`에 추가한다. TypeScript처럼 빌드 과정에서만 필요한 도구들이 여기에 해당한다.
- 패키지
    - `typescript`: TS 컴파일러 (tsc 명령어 제공)
    - `tsx`: TS 파일을 빌드 없이 바로 실행하게 해주는 도구 (dev 서버용)
    - `@types/node`: Node.js의 타입 정의
    - `@types/express`: Express 라이브러리의 타입 정의

> Note.
> 
> JS 라이브러리에는 타입 정보가 없기 때문에, TS에서 사용하려면 타입 정의를 제공해야 한다. 라이브러리 내부에 타입 정의가 같이 들어있는 경우도 있고, 외부에서 따로 제공하는 경우도 있다.

## TypeScript 설정 파일

TypeScript 프로젝트의 컴파일 설정은 `tsconfig.json`에서 관리한다.

### tsconfig.json 설정

```bash
npx tsc --init
```

- `npx`: 프로젝트에 설치된 TypeScript 실행 파일을 실행한다.
- `tsc --init`: TypeScript 설정 파일인 `tsconfig.json`을 생성한다.

TypeScript 컴파일러의 동작 방식을 설정하는 파일이다. 어떤 JavaScript 버전으로 컴파일할지, 어떤 디렉터리를 입력과 출력으로 사용할지 등을 정의한다.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "strict": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- `"compilerOptions"`: 컴파일 옵션 지정
    - `"target"`: 컴파일 결과로 나온 JS코드의 버전
    - `"module"`: JS코드의 모듈 시스템
    - `"rootDIR"`: 원본 TS 코드가 있는 디렉토리
    - `"outDIR"`: 컴파일된 JS 코드가 저장될 디렉토리
    - `"esModuleInterop"`: CommonJS 라이브러리를 Import 문법으로 불러올수 있게 하는 옵션
- `"include"`: TS가 컴파일 대상으로 할 경로
- `"exclude"`: TS가 컴파일 하지 않을 경로

## 기존에 존재하는 노드 프로젝트 설정하기

### npm install

```zsh
npm install
```

기존 프로젝트에서는 새로운 패키지를 설치하기보다, `package.json`과 `package-lock.json`에 기록된 의존성을 그대로 설치하여 개발 환경을 복원하는 용도로 주로 사용한다.

### 환경 변수 확인

`.env` 파일은 Git으로 관리하지 않는 경우가 많다. 따라서 프로젝트를 처음 받았다면 필요한 환경 변수를 직접 작성하거나 별도로 전달받아야 한다. iOS 프로젝트에서 늘 하던 것 처럼...
