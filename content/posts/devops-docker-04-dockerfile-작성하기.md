---
title: "Docker. Dockerfile 작성하기"
date: 2025-10-09

categories:
  - DevOps
series:
  - Docker
tags:
  - Docker Image
  - Dockerfile

draft: false
original: "notion-export/블로그 이관/DevOps/Dockerfile 작성하기 286ade8f3765804aaeefc24cb212644b.md"
---

컨테이너를 실행하려면 먼저 이미지가 필요하고, 이미지는 `Dockerfile`이라는 파일을 통해 생성한다.

예제 Dockerfile을 기준으로 각 명령어가 어떤 역할을 하는지 살펴본다.

## Dockerfile 구조 살펴보기

먼저 예제 Dockerfile을 보자.

```docker
FROM python:3.13
WORKDIR /usr/local/app

# Install the application dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy in the source code
COPY src ./src
EXPOSE 8080

# Setup an app user so the container doesn't run as the root user
RUN useradd app
USER app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

이제 위 Dockerfile을 한 줄씩 살펴보자.

### `FROM <image>`

> 빌드가 확장할 기본 이미지를 지정한다.

위 예시에서는 Docker가 제공해주는 이미지인 `python:3.13`이 기본 이미지로 지정되어 있다. 이미지는 불변이므로, 가져온 기본 이미지 위에 레이어를 쌓는 식으로 `Dockerfile`을 작성해서 새로운 이미지를 만든다.

### `WORKDIR <path>`

> 파일이 복사되고 명령이 실행될 이미지의 작업 디렉토리를 지정한다.

위 예시에서는 `/usr/local/app`을 경로로 설정했다. `WORKDIR`에서 지정한 디렉토리는 이후 `RUN`, `COPY`, `CMD` 등의 상대 경로 기준이 된다.

> Note.
>
> `WORKDIR`에 쓰는 경로는 로컬 컴퓨터에 있는 경로가 아니라 Docker가 만드는 가상의 리눅스 파일 시스템의 경로이다. `WORKDIR`에 작성된 경로는 나중에 이 이미지를 기반으로 실행된 컨테이너에서 자동으로 생성된다.

### `COPY <host-path> <image-path>`

> 로컬 파일을 이미지 안으로 옮긴다.

`docker build`를 실행하면, 도커는 현재 디렉토리 전체를 빌드 컨텍스트에 보낸다. `COPY` 명령이 실행되면, 그 컨텍스트 내부의 파일을 찾아 이미지의 파일 시스템 안으로 복사한다.

> Note.
>
> 이미지가 커지는 것을 방지하기 위해 `node_modules`, `.git`, `.env` 등은 빌드 컨텍스트에서 제외하는 경우가 많다. 아래에서 설명할 `.dockerignore` 파일을 통해 쉽게 제외할 파일을 지정할 수 있다.

### `RUN <command>`

> 이미지를 빌드할 때 실행되는 명령, 이 결과가 이미지에 새 레이어로 저장된다.

`Dockerfile`을 읽고 이미지를 빌드하는 과정에서 위 명령이 실행되고, 그 결과가 이미지에 반영된다. 즉, 이미지에 새로운 레이어가 쌓이게 된다.

의존성 설치와 같은 변경 빈도가 낮은 단계는 위에, 소스 복사와 같이 자주 바뀌는 단계는 아래에 배치하면 캐시를 효율적으로 동작시킬 수 있다.

위 예시에서는 `pip install --no-cache-dir -r requirements.txt`를 지정했다. 이 명령어는 `requirements.txt`에 있는 의존성을 설치하라는 의미이다.

### `ENV <name> <value>`

> 컨테이너가 사용할 환경 변수를 설정한다.

현재 `Dockerfile`로 만든 이미지가 실행되어 컨테이너가 되었을 때, 그 컨테이너에서 사용할 환경 변수를 지정한다. 

위 예시에는 하드코딩되어 있지만, 예를 들어 `ENV PORT=8080`처럼 작성하면, `$PORT`를 통해 `8080`이라는 값에 접근할 수 있게 된다.

환경 변수를 사용하면 `Dockerfile`을 수정할 필요 없이 환경 변수만 바꿔서 이미지를 유연하게 재활용할 수 있다.

### `EXPOSE <port-number>`

> 컨테이너가 사용할 포트를 선언한다.

Docker에게 어떤 포트를 사용할지 알려주는 역할이다. `EXPOSE` 자체는 문서일 뿐, 실제 외부 노출은 `-p <host-port> <container-port>`로 한다.

> Note.
>
> 실제로 포트를 매핑할 때는 `docker run -p 8080:3000 my-app`처럼 쓰는데, `EXPOSE`가 정확한 포트 정보를 제공한다면 `docker run -P my-app`처럼 사용할 수 있다. (`EXPOSE`에서 지정한 컨테이너의 포트가 임의의 로컬 포트에 배정된다.)

### `USER <user-or-uid>`

> 컨테이너 안에서 커맨드를 실행할 사용자 계정을 지정하는 명령어

기본적으로 도커 컨테이너는 root 권한으로 실행되기 때문에 보안상 위험할 수 있다. 주로 `CMD` 위에서 새 유저를 생성하는 `RUN useradd <user>`와 같이 사용된다. 앱이 필요한 것만 접근하도록 제한하고, 여러 서비스가 각각 자기 유저로 동작하도록 한다.

### `CMD [”<command>”, “<arg1>”]`

> 컨테이너가 실행될 때 자동으로 실행되는 커맨드를 지정한다.

컨테이너에서 자동적으로 실행될 커맨드다. 즉, 컨테이너가 켜질 때 자동으로 돌릴 엔트리 포인트를 정의한다. 

기본 실행 커맨드는 단 하나만 가질 수 있다. 만약 시작 절차가 복잡하고 여러 커맨드가 필요하다면, [`start.sh`](http://start.sh)처럼 묶고, `CMD ["./start.sh"]`와 같이 작성할 수 있다.

위 예제에서는 `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]`을 사용했는데, `uvicorn`이라는 커맨드에 `app.main:app`, `--host`, `0.0.0.0`, `--port`, `8080`을 아규먼트로 전달한다.

즉, `uvicorn app.main:app --host 0.0.0.0 --port 8080`을 실행한 것과 같다.

> Note.
>
> `CMD`는 오버라이딩이 가능하다. `docker run my-app`처럼 기본적으로 이미지를 실행하면 `CMD`에 적힌 커맨드가 그대로 동작하지만, `docker run my-app bash`처럼 덮어쓰면, `CMD`는 무시되고 그냥 `bash`가 실행된다.

## `.dockerignore`

Docker가 `Dockerfile`을 읽고 이미지를 빌드할 때, 현재 디렉토리의 모든 파일을 `dockerd`에게 전송한다. 

이때 필요 없는 파일도 같이 가게 되면, 빌드 속도가 느려지고 이미지 용량이 커지는 문제가 있다. 그래서 `.dockerignore` 파일로 제외할 대상을 지정한다.

`.gitignore`랑 비슷한 역할을 한다. 걔는 레포지토리에 얘는 컨테이너에...

### 예시

```docker
# 로그, 캐시 파일
*.log
__pycache__/
*.pyc

# 의존성, 빌드 산출물
node_modules/
dist/
build/

# 환경 설정
.env
*.pem

# 버전 관리
.git
.gitignore
Dockerfile
docker-compose.yml
```

버전 관리에 필요한 파일이나 빌드 산출물, 의존성들은 빌드 컨텍스트에 필요가 없다.

- git 관련 코드는 git에서 관리하면 된다. docker 이미지에선 필요 없다.
- 의존성은 도커가 이미지를 빌드할 때 `RUN` 명령어로 새로 설치하기 때문에 필요 없다.
- `Dockerfile`도 이미지 빌드할 때만 필요하고, 컨테이너 실행에는 필요하지 않다. 
- `docker-compose.yml` 역시 이미지 실행을 관리하는 도구용 설정 파일일 뿐, 컨테이너 내부에선 쓰이지 않기 때문에 `.dockerignore`에 포함시켜도 된다.

> Note.
>
> `Dockerfile`은 이미지 내부로 자동 복사되지는 않지만, 만약 `COPY . .` 같은 명령을 실행시키면 전부 들어가 버릴 수 있다. 따라서 선택사항으로 작성한다.
