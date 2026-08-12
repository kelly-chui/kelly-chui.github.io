---
title: "TIL. Aug 10, 2026"
date: 2026-08-10T23:42:07+09:00

categories:
  - TIL
series:
tags:

draft: false
original: ""
---

## 오늘 한 내용

- devbox-light-server
  - Docker 이미지 작성 및 컨테이너 실행
  - `.data` 볼륨 연결과 healthcheck 추가
  - GitHub Actions에서 테스트 이후 이미지를 빌드하도록 구성
  - `main` 브랜치에 push하면 GHCR에 Docker 이미지를 자동으로 배포하도록 연결
- PS
  - [LeetCode 1510]({{< relref "ps/2026/ps-leetcode-1510-stone-game-iv" >}})
  - [LeetCode 1140]({{< relref "ps/2026/ps-leetcode-1140-stone-game-ii" >}})

## 배운 내용

### Stone Game의 승패 DP

#### LeetCode 1510

Stone Game 시리즈는 현재 플레이어가 이길 수 있는지를 상태로 두고 풀면 된다. Alice가 먼저 시작하는 것은 고정되어 있으므로, Alice와 Bob을 따로 나누기보다 현재 차례의 플레이어 기준으로 생각하는 편이 자연스럽다.

현재 상태에서 제곱수 하나를 골랐을 때 상대 차례의 상태가 패배라면, 현재 플레이어는 이긴다. 즉 내가 이길 수 있는 선택이 하나라도 있는지를 확인하는 방식이다. 

Stone Game에서 역방향 DP를 자주 봤는데, 이 문제는 `dp[0]`을 패배로 두고 `dp[1]`부터 정방향으로 계산해야해서 조금 해맸다...

#### LeetCode 1140

1510보다 훨씬 어렵게 느껴졌다. 문제의 난이도는 Medium이지만, Hard인 1510보다 어려웠다. `M`이 들어오면서 한 상태를 단순히 현재 위치만으로 표현할 수 없었다. 현재 위치가 같아도 `M`에 따라 다음에 가져갈 수 있는 돌의 범위가 달라진다.

그래서 `dp[i][M]`을 `i`번째 돌부터 시작하고 현재 선택 범위가 `M`일 때, 현재 플레이어가 얻을 수 있는 최대 돌의 수로 정의했다. `x`개를 가져가면 다음 상태의 `M`은 `max(M, x)`가 된다.

처음에는 현재 플레이어가 가져가는 점수를 직접 계산하려고 했는데, 상대가 어떤 선택을 할지까지 같이 추적해야 해서 복잡했다. 대신 `i`부터 남은 돌의 전체 합에서 다음 상태의 상대가 얻을 수 있는 최댓값을 빼면 현재 플레이어의 결과가 된다.

### GitHub Actions에서 GHCR로 배포하기

Docker 이미지를 만드는 것과 레지스트리에 배포하는 것은 별도의 단계다. Dockerfile만 작성한다고 배포가 끝나는 것이 아니라, CI에서 이미지를 빌드하고 레지스트리에 인증한 뒤 push해야 한다.

GHCR에 이미지를 올리려면 workflow에 패키지 쓰기 권한이 필요하다.

```yaml
permissions:
  contents: read
  packages: write
```

PR에서는 테스트와 빌드까지만 확인하고, 실제 publish는 `main` 브랜치에 push됐을 때만 실행하도록 했다. 이미지 태그는 `main`과 짧은 커밋 SHA를 함께 사용했다. `main`은 최신 이미지를 실행하기 편하고, 커밋 SHA는 특정 시점의 이미지를 다시 실행하거나 문제를 추적할 때 유용하다.

## 해결한 것

Dockerfile과 `.dockerignore`를 추가하고, 컨테이너에서 서버가 살아 있는지 확인할 수 있도록 healthcheck를 연결했다. JSON 영속성에서 사용하던 `.data`는 컨테이너 내부에만 두면 컨테이너 삭제와 함께 사라지므로 호스트 디렉터리를 볼륨으로 연결했다.

마지막으로 테스트가 성공한 뒤에만 이미지를 만들고, `main`에 push된 경우에만 GHCR에 publish하도록 GitHub Actions를 구성했다. 이 작업으로 devbox-light-server의 MVP를 실제 실행 가능한 이미지 단위로 묶었다.
