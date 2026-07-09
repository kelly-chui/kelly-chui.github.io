---
title: "Node. Node.js 소개"
date: 2025-10-05

categories:
    - Node.js
series:
tags:
    - Node.js
    - JavaScript
    - npm

draft: true
original: "notion-export/블로그 이관/Node/Node js 개요 285ade8f37658072bf75ce7b406c1432.md"
---

Node.js는 브라우저 밖에서도 JavaScript를 실행할 수 있게 해주는 런타임이다. 

## 구조

Node.js를 설치하면 JavaScript 런타임 하나만 설치되는 것이 아닌, 프로젝트 관리, 외부 라이브러리, 개발 도구를 실행하기 위한 여러 구성 요소가 함께 설치된다.

### Node

JavaScript 실행 환경이다. 브라우저 외부에서 JS를 실행할 수 있게 해준다. 

간단한 파일은 다음처럼 직접 실행할 수도 있다. (다른 언어들과 비슷하다.)

```zsh
node <FILE-NAME>.js
```

### npm(Node Package Manager)

 Node 프로젝트의 패키지 관리자이다. 외부 라이브러리를 설치하고, 제거하고, 프로젝트의 의존성을 관리한다.

외부 라이브러리를 설치할 때는 다음 명령을 사용한다.

```zsh
npm install <PACKAGE-NAME>
```

외부 라이브러리를 설치했으면, 설치한 라이브러리 목록을 `package.json`에 기록한다.

### npx(Node Package eXecute)

`npx`는 프로젝트에 설치된 실행 파일을 직접 찾아 실행해 주는 도구이다. 덕분에 CLI를 전역 설치하지 않아도 프로젝트에 설치된 버전을 그대로 사용할 수 있다. (전역에 CLI 프로그램이 안 쌓이게도 해준다.)

예를 들어서 TypeScript를 프로젝트에 설치했으면

```zsh
npm install --save-dev typescript
```

다음처럼 `npx`를 이용해 바로 실행할 수 있다.

```zsh
npx tsc
```

`npx`는 프로젝트의 `node_modules` 안에 설치된 `tsc` 실행 파일을 찾아 실행한다. 위 커맨드는 아래 커맨드와 동일하다:

```zsh
./node_modules/.bin/tsc
```

위의 예시처럼, `node_modules/.bin`에 있는 실행 파일을 대신 찾아 실행해 주는 역할을 한다.

## package.json

`package.json`은 Node 프로젝트의 설정 파일이다. 프로젝트의 이름, 의존성, 실행 스크립트, 모듈 방식 등을 기록하며, npm은 이 파일을 기준으로 프로젝트를 관리한다.

Node는 `package.json`이 없는 디렉터리를 일반 폴더로 취급한다. 따라서 대부분의 Node 프로젝트는 `package.json`을 기준으로 시작된다고 생각하면 된다.

### 프로젝트 정보

현재 프로젝트를 식별하기 위한 기본 정보이다. 이름, 버전, 설명을 기록하고, 배포할때 이 패키지의 정보가 기준이 된다.

```zsh
{
    "name": "express-study",
    "version": "1.0.0",
    "description": ""
}
```

`name`과 `version`은 패키지를 식별하는 정보이며, `description`은 프로젝트를 간단히 설명하는 용도로 사용된다.

### 엔트리 포인트

말 그대로 프로젝트를 실행하거나, 다른 코드에서 불러올 때 시작점이 되는 파일이다. Node가 이 값을 보고 어떤 파일을 먼저 실행할지 판단한다.

TypeScript를 사용할 때는 보통 `.ts` 파일이 아닌 `dist/` 안에 빌드된 JS 파일을 가리킨다.

```zsh
"main": "dist/server.js"
```

### 의존성

프로젝트에서 실행되거나 개발할 때 사용하는 외부 패키지 목록이다

npm이 패키지 설치/삭제 시 이 목록을 자동으로 갱신한다. 그래서 저장소를 새로 받은 뒤에도 `npm install`만 하면 이전과 같은 의존성을 복원할 수 있다.

```json
"dependencies": {
    "express": "^4.19.2"
},
"devDependencies": {
    "typescript": "^5.6.3"
}
```

- `dependencies`에는 실제 애플리케이션을 실행할 때 필요한 라이브러리가 기록된다.
- `devDependencies`에는 TypeScript, 테스트 프레임워크, 빌드 도구처럼 개발 과정에서만 사용하는 도구들이 기록된다.

### 스크립트

자주 사용하는 커맨드에 이름을 붙이는 기능이다. 주로 서버 실행, 빌드, 테스트 처럼 반복해서 입력하는 명령의 숏컷으로 이용한다.

```json
"scripts": {
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
}
```

이렇게 등록해두면 긴 커맨드를 직접 입력하지 않고 다음처럼 실행할 수 있다.

```zsh
npm run dev
```

위 명령은 `tsx watch src/server.ts`를 실행한다.

### 설정 옵션

Node 프로젝트의 동작 방식을 조정한다. 대표적으로 `type`은 Node가 어떤 모듈 시스템을 사용할지 결정한다.

```zsh
"type": "commonjs"
```

- `commonjs`를 사용하면 `require`와 `module.exports`를 사용하는 기존 Node 방식으로 동작한다.
- `module`을 사용하면 `import`와 `export`를 사용하는 ESM 방식으로 동작한다.

### package-lock.json

`package-lock.json`은 실제로 설치된 의존성의 정확한 버전을 기록한 스냅샷 파일이다. `package.json`에는 `^4.19.2`처럼 허용 가능한 버전 범위가 기록될 수 있지만, `package-lock.json`에는 현재 설치된 구체적인 버전이 기록된다.
