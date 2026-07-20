---
title: "Docker. Docker 시작하기"
date: 2025-10-08

categories:
  - DevOps
series:
  - Docker
tags:
  - Container
  - Virtualization

draft: false
aliases:
  - "/posts/devops-docker-01-시작하기/"

original: "notion-export/블로그 이관/DevOps/Docker 개요 286ade8f376580799bd1c96bfd738422.md"
---

## Docker

애플리케이션 개발, 배포 및 실행을 위한 개방형 플랫폼

## 특징

> Note.
>
> 컨테이너는 개발 환경 자체가 아니라 애플리케이션를 실행하는 격리된 프로세스다. 일반적으로 개발은 호스트 환경에서 이루어지고, 컨테이너는 실행 및 테스트 환경으로 사용된다.
> 
> -> 그런데 vscode에서 쓰는 dev container는...?

### 컨테이너를 사용한 앱 개발

- Docker 컨테이너 안에서 앱을 띄우기 때문에 “환경이 달라서 동작하지 않는다”와 같은 문제 해결
- ex. Node, Python, MySQL같은 것을 도커로 묶어서 개발

### 컨테이너는 완전한 실행 단위

- 컨테이너 하나는 완전한 실행 단위이기 때문에 QA, 테스트, CI/CD 환경에서 그대로 사용
- 같은 이미지 → 같은 코드, 같은 환경 → 어디서든 일관된 실행이 가능하다.

### 애플리케이션을 컨테이너 형태로 배포

- 클라우드나 로컬 서버로 그대로 옮겨서 실행하면 된다.
- 수명 주기 관리
    - `build`, `run`, `stop`, `rm`, `push` 모든 것을 Docker가 명령어 단위로 관리해준다.

### 반응형 배포 및 확장

Docker는 어디서나 똑같이 돌고, 원하면 즉시 늘리거나 줄일 수 있다.

- 이식성
    - Docker 이미지는 OS위의 커널만 공유하고, 나머지는 전부 독립된 환경으로 묶여있는 형태이기 때문에 같은 결과 보장.
    - ex) 맥북, 서버, 클라우드 등 어디서 돌리든 같은 결과가 나옴
- 경량성
    - VM처럼 OS 전체를 에뮬레이팅 하지 않고 프로세스 단위로 돌아가기 때문에 가볍고 빠름.
    - 필요할때 띄우고, 안 쓰면 바로 없애는 운영 가능
- 확장성
    - 트래픽이 몰릴 때 컨테이너를 여러개 띄우기 가능
    - 같은 이미지에서 여러 컨테이너를 생성 가능하므로, 부하 분산 가능

## Docker 구성 요소

### Docker 데몬 (dockerd)

Docker API 요청을 수신하고 이미지, 컨테이너, 네트워크, 볼륨 등의 Docker 객체를 관리하는 데몬이다.
필요하면 다른 데몬과 통신하여 Docker 서비스를 관리할 수도 있다.

> Note.
>
> `dockerd`는 기본적으로 HTTP 기반 REST API를 사용한다. 로컬 환경에서는 터미널의 `docker` 명령이 Unix 소켓을 통해 `dockerd`와 통신하며, 이때도 HTTP 프로토콜을 사용한다.

### Docker 클라이언트

Docker와 유저가 상호 작용하는 수단, docker 명령어를 Docker API로 만들어서 dockerd에게 명령을 전송하는 역할을 한다

### Docker 오브젝트

#### 이미지 

프로그램을 실행하기 위한 설치본. 개발 환경, 코드, 의존성, 환경 설정 등이 전부 들어있는 불변 스냅샷.
- 이미지는 여러 레이어로 구성되어 있어서, 일부만 바뀐 경우 전체를 다시 만들지 않아도 된다.

#### 컨테이너

이미지를 실제로 실행한 인스턴스. 커널을 공유하면서, 유저 공간만 분리된 가상 환경.
- 각 컨테이너는 서로 완전히 격리되어 있다.
- VM처럼 무겁게 OS를 복제하지 않고, 호스트의 커널을 그대로 사용한다, 즉 프로세스 수준의 가벼운 가상화 기술
- 필요할 때는 언제는 멈추거나 삭제하고 다시 만들 수 있다.

> Note.
>
> macOS는 Linux 커널을 사용하지 않기 때문에 Docker Desktop 내부에서 Linux VM을 실행한 뒤 그 위에서 컨테이너를 실행한다.

### Dockerfile

이미지를 만드는 설명서, Docker는 Dockerfile을 읽고 이미지를 빌드한다.

```docker
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 동작

1. Dockerfile을 기반으로 `docker build` → 이미지 생성
2. 이미지 → `docker run` → 컨테이너 실행
3. 컨테이너는 실제 코드가 동작하는 독립된 환경
