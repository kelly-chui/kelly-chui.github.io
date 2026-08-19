---
title: "DevOps. GitHub Actions 워크플로우"
date: 2024-11-05

categories:
  - DevOps
series:
tags:
  - CI/CD
  - GitHub Actions

draft: false
original: "notion-export/블로그 이관/SniffMEET/Private & Shared 11/GitHub Actions 간단소개! f2860e12d4ff4eba849bb26cdf8682a5.md"
---

## 들어가며

GitHub Actions는 저장소에서 발생한 이벤트를 기준으로 빌드, 테스트, 배포 같은 작업을 자동화한다. 자동화 과정은 `.github/workflows` 디렉토리의 YAML 파일로 정의한다.

처음 workflow를 작성할 때는 `name`, `on`, `jobs`, `steps`가 각각 무엇을 나타내는지부터 이해할 필요가 있다.

## 전체 구조

GitHub Actions의 실행 흐름은 다음과 같다.

```text
Event -> Workflow -> Job -> Runner -> Step
```

이 흐름을 YAML로 표현하면 다음과 같다.

```yaml
name: Build and Test
run-name: Build triggered by @${{ github.actor }}

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: echo "Build"

  test:
    needs: build
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test
        run: echo "Test"
```

## `name`과 `run-name`

`name`은 workflow 자체의 이름이다. GitHub 저장소의 Actions 탭에서 workflow를 구분할 때 사용한다.

```yaml
name: Build and Test
```

`name`을 생략하면 저장소 루트를 기준으로 한 workflow 파일 경로가 표시된다.

`run-name`은 workflow가 실행될 때마다 생성되는 개별 실행의 이름이다. GitHub Actions expression을 사용할 수 있어서 실행한 사용자나 입력값을 이름에 포함할 수 있다.

```yaml
run-name: Build triggered by @${{ github.actor }}
```

`run-name`을 생략하면 push의 커밋 메시지나 pull request의 제목처럼 이벤트에 맞는 정보가 사용된다.

## `on`: 실행 조건

`on`은 workflow를 실행할 이벤트를 정의한다.

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
```

자주 사용하는 이벤트는 다음과 같다.

- `push`: 브랜치나 태그에 commit이 push됐을 때
- `pull_request`: pull request가 열리거나 새로운 commit으로 갱신됐을 때
- `workflow_dispatch`: Actions 탭에서 수동으로 실행할 때
- `schedule`: cron 표현식에 지정한 시각에 실행할 때
- `release`: release가 생성되거나 게시되는 등의 동작이 발생했을 때

이슈에 댓글이 작성된 상황은 `issues`가 아니라 `issue_comment` 이벤트로 처리해야 한다. 이벤트에 따라 `types`, `branches`, `paths` 같은 조건을 추가하여 실행 범위를 좁힐 수 있다.

## `jobs`와 `runs-on`

Workflow는 하나 이상의 job으로 구성된다. `build`와 `test`처럼 `jobs` 바로 아래에 작성한 key가 job ID가 된다.

```yaml
jobs:
  build:
    runs-on: macos-latest
```

`runs-on`은 job을 실행할 runner 환경을 지정한다. iOS 프로젝트처럼 Xcode가 필요한 작업에서는 macOS runner를 사용한다.

각 job은 기본적으로 병렬 실행되며, 서로 독립된 runner에서 실행된다.

## `steps`: job 안의 작업 순서

`steps`에는 job에서 순서대로 실행할 작업을 배열로 작성한다.

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Build
    run: echo "Build"
```

각 step에서는 주로 다음 속성을 사용한다.

- `name`: Actions 화면에 표시할 step 이름
- `uses`: 저장소의 코드나 외부 Action을 실행
- `run`: runner의 shell에서 명령어 실행
- `continue-on-error`: 해당 step이 실패해도 job을 계속 실행할지 결정

Runner에는 저장소 코드가 자동으로 내려받아지지 않으므로, 코드가 필요한 job에서는 일반적으로 `actions/checkout`을 먼저 실행한다.

## `needs`: job 실행 순서 정하기

Job은 기본적으로 병렬로 실행된다. 특정 job이 성공한 뒤 다음 job을 실행하려면 `needs`로 의존성을 지정한다.

```yaml
jobs:
  build:
    runs-on: macos-latest
    steps:
      - run: echo "Build"

  test:
    needs: build
    runs-on: macos-latest
    steps:
      - run: echo "Test"
```

이 예제에서 `test`는 `build`가 성공한 뒤 실행된다. `build`가 실패하거나 건너뛰어지면 `test`도 기본적으로 실행되지 않는다.

## 정리

GitHub Actions workflow는 이벤트가 실행을 만들고, 하나 이상의 job이 runner에서 여러 step을 수행하는 구조다.

처음부터 모든 이벤트와 옵션을 외우기보다 `on`, `jobs`, `runs-on`, `steps`로 최소 workflow를 만든 뒤, job 사이에 순서가 필요할 때 `needs`를 추가하는 방식으로 접근하면 이해하기 쉽다.

## 레퍼런스

- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows)
