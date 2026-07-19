---
title: "Docker. Docker Desktop 실습해보기"
date: 2025-10-08

categories:
  - DevOps
series:
  - Docker
tags:
  - Container
  - Docker Desktop

draft: false
original: "notion-export/블로그 이관/DevOps/Docker Desktop 실습해보기 286ade8f3765805c9754ce45f07de322.md"
---

## 설치하기

공식 문서에 설치 가이드 설명 잘 되어있으니 알아서...

## 첫 번째 컨테이너 실행하기

```bash
docker run -d -p 8080:80 docker/welcome-to-docker
```

[http://localhost:8080](http://localhost:8080) 에서 이 컨테이너의 프론트엔드 방문 가능.

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-001.png)

## Docker Desktop 사용해보기

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-002.png)

### 컨테이너 탭

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-006.png)

- Logs — `docker logs <container-name>`
    - 컨테이너 내부에서 실행 중인 프로세스의 표준 출력을 그대로 보여줌.
    - 디버깅할 때 많이 사용하는 부분
- Inspect — `docker inspect <container-name>`
    - 컨테이너의 환경 변수, 포트 바인딩, 실행 명령, 마운트 경로, 네트워크, 상태 등 메타데이터를 JSON으로 보여줌
- Bind mounts
    - 로컬 호스트와 컨테이너 사이의 폴더 연결 정보를 보여줌
        - ex) `-v ~/project:/app` → 내 컴퓨터의 `~/project` 폴더가 컨테이너 내부 `/app`에 연결됨.
    - 로컬 파일 수정 시 컨테이너에 즉시 반영되기 때문에 개발할 때 자주 사용
- Exec — `docker exec -it <container-name>`
    - 실행 중인 컨테이너 내부에 직접 명령어를 입력할 수 있는 쉘 세션을 엶.
    - 컨테이너 내부 구조 탐색, 빠른 테스트, 수동 디버깅에 사용
- Files — `docker cp`, `docker exec ls`
    - 컨테이너 내부의 파일 시스템 탐색
    - 호스트 ↔ 컨테이너 간 파일을 복사할 수 있음
- Stats: `docker stats <container-name>`
    - 컨테이너의 실시간 리소스 사용량(CPU, 메모리, 네트워크, I/O) 등을 모니터링
    - 성능 문제나 리소스 병목을 추적할 때 사용
    - 여러 컨테이너 동시 모니터링 가능

## 직접 컨테이너를 사용해서 개발해보기

### 0. 프로젝트 클론

우선 Docker에서 제공하는 예제 앱 가져오기

```bash
git clone https://github.com/docker/getting-started-todo-app
cd getting-started-todo-app
```

### 1. Docker compose로 개발 환경 시작하기

예제 프로젝트는 백엔드, 프론트엔드, DB로 구성되어있고, 이게 `docker-compose.yml`로 정의되어 있음. 각각을 하나씩 띄우기 보다는 다음 명령어로 한번에 띄울 수 있다.

```zsh
docker compose watch
```

아직 이해할 필요는 없지만, 이 명령어를 사용하면 다음과 같은 작업이 진행된다

1. Docker에서 필요한 이미지들을 Docker Hub에서 자동으로 Pull
2. 각 서비스(웹, DB 등)의 컨테이너 생성 및 실행
3. 네트워크, 볼륨 등 환경 자동 구성

### 2. 로컬호스트에서 실행해보기

HTTP에서 포트 번호를 생략하면 기본적으로 80번 포트를 사용하는 것과 같다.

[http://localhost](http://localhost/)

이 예제는 다음과 같은 컨테이너로 구성되어 있다.

- 리액트 프론트엔드
    - React + Vite 개발 서버가 node 안에서 돌아감
- 노드 백엔드
    - 프론트엔드에서 보낸 요청을 받아서 작업 처리
- MySQL 데이터베이스
    - 실제 할 일 목록을 저장하는 DB, 백엔드와 연결되어있음
- phpMyAdmin DB 관리 도구
    - 브라우저로 DB를 확인하고 쿼리를 날릴 수 있는 GUI 도구
- Traefik proxy 트래픽 라우터
    - 요청을 각 컨테이너로 분배하는 리버스 프록시
        - [`localhost/api/*`](http://localhost/api/*) → 백엔드
        - [`localhost/*`](http://localhost/*) → 프론트엔드
        - `db.localhost` → phpMyAdmin

중요한 것은 위 컨테이너 각각이 아니라 Docker가 개발 환경 전체를 한 번에 띄운다는 것.

## 직접 파일 수정해보기

현재 프론트엔드 화면

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-003.png)

`backend/src/routes/getGreetings.js` 파일을 수정해서, 앱 UI를 변화시켜본다.

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-004.png)

도커를 재시작 하지 않고 새로고침만으로 프론트엔드에 반영된 것을 확인할 수 있다.

![image.png](/images/devops-docker-03-docker-desktop-실습해보기/image-005.png)

## 레퍼런스

- [Docker Desktop 공식 문서](https://docs.docker.com/get-started/introduction/get-docker-desktop/)
