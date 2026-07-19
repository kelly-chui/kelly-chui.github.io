---
title: "DevOps. Git 기초"
date: 2024-08-20

categories:
  - DevOps
series:
  - Git
tags:
  - Version Control

draft: false
original: "notion-export/블로그 이관/DevOps/Git 048ade8f3765836aa04001c09ba21748.md"
---

## 깃 파일 라이프 사이클

![image.png](/images/devops-git-overview/image-001.png)

1. Tracked: 관리 대상 파일, 이미 스냅샷에 포함되어 있는 파일 - 깃이 이미 알고 있는 파일들…
    1. Unmodified: 수정하지 않은 파일
    2. Modified: 수정한 파일
    3. Staged: 커밋으로 저장소에 기록할 파일
2. Untracked: 관리 대상이 아닌 파일, 스냅샷 Staging Area에도 포함되지 않은 파일

![Screenshot 2024-08-20 at 2.17.11 PM.png](/images/devops-git-overview/image-002.png)

위 캡처에서

- `test2`: (Staged) 현재 Staging Area에 포함된 파일, 커밋하면 저장소에 기록된다.
- `test`: (Untracked) 트래킹 되지 않은 파일, 스냅샷에도 Staging Area에도 존재하지 않고 워킹 디렉토리에만 존재한다.
- `README`: (Modified) 수정된 파일, 커밋을 하기 위해서는 Staged 상태로 만들어야 함.

### 파일 새로 추적하기 (git add)

![Screenshot 2024-08-20 at 2.20.42 PM.png](/images/devops-git-overview/image-003.png)

`git add` 명령은 파일을 새로 추적할 때도 사용하고, 수정한 파일을 Staged 상태로 만들 때도 사용한다.

`git add`를 실행했을 때의 파일 버전이 Staging Area에 추가되므로, `git add`명령을 실행한 후에 파일을 수정하면 또 `git add` 명령을 실행해야 파일의 최신 버전을 Staged 상태로 만들 수 있다.

### 상태 변경 확인하기 (git diff)

![Screenshot 2024-08-20 at 2.24.54 PM.png](/images/devops-git-overview/image-004.png)

`git diff` 명령어를 사용하여 어떤 라인이 추가되었고 어떤 라인이 삭제되었는지 확인 할 수 있다. `git diff`는 Unstaged 상태인 것들만 보여주기 때문에, `git add` 이후에 `git diff` 명령은 아무것도 출력하지 않는다.

![Screenshot 2024-08-20 at 2.27.00 PM.png](/images/devops-git-overview/image-005.png)

따라서 Staged 상태의 파일은 `git diff --cached`옵션으로 확인해야 한다.

### 변경사항 커밋하기(git commit)

![Screenshot 2024-08-20 at 2.31.36 PM.png](/images/devops-git-overview/image-006.png)

`git commit` 명령어를 실행하면 위 캡처와 같이 vi 창이 열리게 된다. 여기에서 커밋 메세지를 작성후 저장한다음 vi를 종료하면 커밋이 완료된다.

혹은 `-m` 옵션으로 인라인으로 작성할 수도 있다.

### 완료한 커밋 수정하기(amend)

![Screenshot 2024-08-20 at 2.37.38 PM.png](/images/devops-git-overview/image-007.png)

`git commit --amend` 명령어를 사용하여 이미 완료된 커밋을 수정할 수 있다. 위 캡처에서는 `forgotten.md`파일을 추가하여 커밋을 수정했으며, 새로운 커밋이 생성되는 것이 아니라 기존 커밋이 수정된다.

### 파일 상태를 Unstage로 변경하기(git reset)

![Screenshot 2024-08-20 at 3.59.57 PM.png](/images/devops-git-overview/image-008.png)

위 캡처에서 `forgotten.md`파일이 수정되고 `git add`명령어의 실행 결과로 Staged 된 상태가 되었다. 이 때 `forgotten.md` 파일을 다시 Unstaged 상태로 되돌리기 위해 `git reset HEAD <file>`  명령어를 사용한다:

![Screenshot 2024-08-20 at 4.01.55 PM.png](/images/devops-git-overview/image-009.png)

`forgotten.md`파일이 다시 Unstaged 상태로 돌아온 것을 확인할 수 있다.

### Modified 파일 되돌리기(`git checkout -- <file>`)

이미 수정된 `forgotten.md` 파일을 다시 최근 커밋된 버전으로 되돌리기 위해서는 `git checkout -- <file>` 명령어를 사용한다:

![Screenshot 2024-08-20 at 4.04.50 PM.png](/images/devops-git-overview/image-010.png)

수정된 내용이 다 사라졌음을 알 수 있다.

---

## 리모트 저장소 (git remote)

현재 프로젝트에 등록된 리모트 저장소를 확인하기 위해서는 `git remote` 명령어를 사용한다. `-v` 옵션을 사용하면 URL을 함께 볼 수 있다:

![Screenshot 2024-08-20 at 4.07.40 PM.png](/images/devops-git-overview/image-011.png)

리모트 저장소를 Clone 하면 `origin`이라는 리모트 저장소가 자동으로 등록된다.

### 리모트 저장소 추가하기(`git remote add <단축이름> <url>`)

기존 워킹 디렉토리에 새 리모트 저장소를 추가하기 위해서는 `git remote add <단축이름> <url>`을 사용한다

![Screenshot 2024-08-20 at 4.13.08 PM.png](/images/devops-git-overview/image-012.png)

위 캡처에서 기존 `origin` 뿐만 아니라 다른 리모트 저장소도 추가했음을 확인할 수 있다. 새로 추가한 리모트 저장소는 url이 아닌 지정한 단축이름 `gfpfork`로 접근할 수 있다.

### 리모트 저장소를 Pull 하거나 Fetch 하기

`git fetch origin`명령을 실행하면 Clone 한 이후에 수정된 것을 모두 가져온다. `git fetch`명령어는 리모트 저장소의 모든 데이터를 로컬로 가져오지만 Merge 하지는 않는다. 따라서 수동으로 Merge 해야한다.

쉽게 `git pull` 명령으로 리모트 저장소 브랜치에서 데이터를 가져올 뿐만 아니라 자동으로 로컬 브랜치와 Merge 시킬수 있다: 

### 리모트 저장소에 Push 하기 (git push)

Upstream 저장소에 Push 할 수 있다. 이 명령어는 `git push <리모트 저장소 이름> <브랜치 이름>` 으로 수행한다:

![Screenshot 2024-08-20 at 4.21.32 PM.png](/images/devops-git-overview/image-013.png)

리모트 저장소 `origin`의 `main`브랜치에 push를 한 것을 확인 할 수 있다.

### 리모트 저장소 이름 바꾸거나 삭제하기

`git remote rename` 명령으로 리모트 저장소 이름을 변경할 수 있다:

![Screenshot 2024-08-20 at 4.23.20 PM.png](/images/devops-git-overview/image-014.png)

`gfpfork` 리모트 저장소의 이름이 `gfpf` 로 변한것을 확인할 수 있다.

`git remote remove`를 사용하면 리모트 저장소를 삭제할 수 있다:

![Screenshot 2024-08-20 at 4.24.25 PM.png](/images/devops-git-overview/image-015.png)

---

## 깃 브랜치

깃은 데이터를 일련의 스냅샷으로 기록한다. 커밋을 하면 현 Staging Area에 있는 데이터의 스냅샷에 대한 포인터, 저자나 커밋 메시지 같은 메타데이터, 이전 커밋에 대한 포인터 등을 포함하는 커밋 개체를 저장한다.  이전 커밋 포인터가 있어서 현재 커밋이 무엇을 기준으로 바뀌었는지 알 수 있다.

깃의 브랜치는 커밋 사이를 가볍게 이동할 수 있는 포인터 같은 것이다. 기본적으로 Git은 master 브랜치를 만들고, 처음 커밋하면 이 master 브랜치가 생성된 커밋을 가리킨다. (깃 허브 기준 master = main 브랜치)

### 브랜치 생성하기 (git branch)

`git branch` 명령으로 새 브랜치를 만들 수 있다.

![Screenshot 2024-08-20 at 4.34.31 PM.png](/images/devops-git-overview/image-016.png)

새로 만든 `test` 브랜치도 지금 작업하고 있는 마지막 커밋을 가리키게 된다.

지금 작업중인 브랜치가 무엇인지 Git이 파악하는 방법은 `HEAD`라는 특수한 포인터를 이용한다. 이 포인터는 지금 작업하는 로컬 브랜치를 가리킨다.

`git branch` 명령은 브랜치를 만들기만 하고 브랜치를 옮기지 않기 때문에, Git은 아직 `main` 브랜치를 가리키고 있다:

![Screenshot 2024-08-20 at 4.43.41 PM.png](/images/devops-git-overview/image-017.png)

![Screenshot 2024-08-20 at 4.43.27 PM.png](/images/devops-git-overview/image-018.png)

### 브랜치 이동하기 (`git checkout`)

`git checkout` 명령으로 다른 브랜치로 이동할 수 있다:

![Screenshot 2024-08-20 at 4.45.24 PM.png](/images/devops-git-overview/image-019.png)

![Screenshot 2024-08-20 at 4.45.50 PM.png](/images/devops-git-overview/image-020.png)

이 때 커밋을 하면 다음과 같은 상태가 된다:

![Screenshot 2024-08-20 at 4.48.59 PM.png](/images/devops-git-overview/image-021.png)

다시 main 브랜치로 이동 한 후에 커밋을 하면 다음과 같은 상태가 된다:

![Screenshot 2024-08-20 at 4.50.56 PM.png](/images/devops-git-overview/image-022.png)

![Screenshot 2024-08-20 at 4.52.41 PM.png](/images/devops-git-overview/image-023.png)

브랜치를 하나 만들어, 그 브랜치에서 작업을 하고, 다시 원래 브랜치로 돌아와서 다른 작업을 했다. 이 두 작업 내용은 서로 독립적으로 각 브랜치에 존재하게 된다. 

### 브랜치와 Merge

현재 브랜치 상황이 다음과 같다고 가정한다:

![Screenshot 2024-08-20 at 5.01.38 PM.png](/images/devops-git-overview/image-024.png)

이 때 `branch1`에서 변경된 작업사항을 `main`에 합치려면 `git merge` 명령을 실행한다:

![Screenshot 2024-08-20 at 5.13.02 PM.png](/images/devops-git-overview/image-025.png)

`branch1`의 c3 커밋이 c2 커밋에 기반하기 때문에 Merge 과정 없이 최신 커밋으로 이동한다. 이런 과정을 ‘fast-forward’ 과정이라고 한다.

이 과정 이후에 저장소는 다음과 같은 상태가 된다:

![Screenshot 2024-08-20 at 5.15.08 PM.png](/images/devops-git-overview/image-026.png)

더 이상 필요없는 `branch1`을 삭제하고 `branch2`로 되돌아가서 작업을 한다:

![Screenshot 2024-08-20 at 5.17.26 PM.png](/images/devops-git-overview/image-027.png)

![Screenshot 2024-08-20 at 5.18.51 PM.png](/images/devops-git-overview/image-028.png)

### Merge, 충돌의 기초

`branch2`에서 작업을 완료하고 `main` 브랜치에 Merge 해보자. 이전 과정과 유사하게 `git merge` 명령으로 합칠 브랜치에서 합쳐질 브랜치를 merge 하면 된다.

![Screenshot 2024-08-20 at 5.21.37 PM.png](/images/devops-git-overview/image-029.png)

Merge 하는 두 브랜치에서 같은 파일(여기서는 `test.md`)의 한 부분을 동시에 수정했으므로 충돌이 발생하게 된다. 변경사항의 충돌을 개발자가 해결해야 Merge 과정을 진행할 수 있다. 어떤 파일을 Merge할 수 없었는지 살펴보려면 `git status` 명령어를 사용한다:

![Screenshot 2024-08-20 at 5.22.52 PM.png](/images/devops-git-overview/image-030.png)

충돌이 일어난 파일은 위와 같이 Unmerged 상태로 표시된다. 개발자가 해당 부분을 수동으로 해결하면 된다:

![Screenshot 2024-08-20 at 5.23.53 PM.png](/images/devops-git-overview/image-031.png)

`=======`위쪽의 내용은 HEAD(현재 `main`)의 내용이고, 아래는 `branch2`의 내용이다. 충돌을 해결하려면 이 부분을 수정하여 Merge 한다.

![Screenshot 2024-08-20 at 5.27.07 PM.png](/images/devops-git-overview/image-032.png)

수정 이후에는 `git add`, `git commit`을 이용하여 수정사항을 커밋한다.

### 브랜치 관리

`git branch` 명령은 아무 옵션 없이 실행하면 브랜치의 목록을 보여준다:

![Screenshot 2024-08-20 at 5.29.05 PM.png](/images/devops-git-overview/image-033.png)

`git branch -v` 명령은 브랜치마다 마지막 커밋 메시지도 함께 보여준다.

![Screenshot 2024-08-20 at 5.29.28 PM.png](/images/devops-git-overview/image-034.png)

`git branch --merged` 명령으로 이미 Merge 한 브랜치 목록을 확인할 수 있다. 이미 Merge된 브랜치이기 때문에 삭제해도 상관없다:

![Screenshot 2024-08-20 at 5.30.44 PM.png](/images/devops-git-overview/image-035.png)

마찬가지로 `git branch --no-merged`는 Merge 되지 않은 브랜치 목록을 보여준다.

### 리모트 브랜치 (리모트 트래킹 브랜치)

리모트 Ref는 리모트 저장소에 있는 브랜치, 태그 등등을 의미한다. `git ls-remote [remote]` 명령으로 모든 리모트 Refs를 조회할 수 있다. `git remote show [remote]` 명령은 모든 리모트 브랜치와 그 정보를 보여준다.

**리모트 트래킹 브랜치**는 리모트 브랜치를 추적하는 레퍼런스이며 브랜치다. 로컬에 있지만 임의로 움직일 수 없으며, 서버에 연결할 때마다 리모트의 브랜치 업데이트 내용에 따라서 자동으로 갱신되기만 한다.

리모트 트래킹 브랜치의 이름은 `<remote>/<branch>` 형식으로 되어있으며, 리모트 저장소 `origin`의 `main` 브랜치를 보고 싶다면 `origin/main` 으로 브랜치를 확인하면 된다.

![Screenshot 2024-08-20 at 5.42.27 PM.png](/images/devops-git-overview/image-036.png)

![Screenshot 2024-08-20 at 5.43.56 PM.png](/images/devops-git-overview/image-037.png)

다른 팀원이 서버에 Push 하고 `main` 브랜치를 업데이트 하면 팀원 간의 히스토리가 달라지게 된다. 하지만 서버 저장소로부터 어떤 데이터도 주고받지 않았으므로 `origin/master` 포인터는 그대로 유지된다.

![Screenshot 2024-08-20 at 5.48.31 PM.png](/images/devops-git-overview/image-038.png)

리모트 서버로부터 저장소 정보를 동기화 하려면 `git fetch origin` 명령을 사용한다:

![Screenshot 2024-08-20 at 5.50.16 PM.png](/images/devops-git-overview/image-039.png)

리모트 저장소를 여러 개 운영한다고 했을 때를 가정하고 Git 저장소를 하나 추가해보자. `git remote add` 명령으로 현재 작업 중인 프로젝트에 저장소를 추가할 수 있다:

![Screenshot 2024-08-20 at 5.53.28 PM.png](/images/devops-git-overview/image-040.png)

`git fetch gfpfork` 명령으로 `gfpfork` 서버의 데이터를 내려받는다. 이미 `gfpfork` 서버의 데이터들을 가지고 있어서 아무런 데이터도 내려받지 않지만, 리모트 트래킹 브랜치 `gfpfork/main`이 `gfpfork`  서버의 `main` 브랜치가 가리키는 커밋을 가리키게 만든다.

![Screenshot 2024-08-20 at 6.00.44 PM.png](/images/devops-git-overview/image-041.png)

### 리모트 저장소 브랜치 Push 하기

로컬의 브랜치를 서버로 전송하려면 쓰기 권한이 있는 리모트 저장소에 Push 해야 한다. 로컬 저장소의 브랜치는 자동으로 리모트 저장소로 전송되지 않고 명시적으로 브랜치를 Push 해야한다. 

![Screenshot 2024-08-20 at 6.11.25 PM.png](/images/devops-git-overview/image-042.png)

여기서 fetch 명령으로 리모트 트래킹 브랜치를 내려받는다고 해서 로컬 저장소에 수정할 수 있는 브랜치가 새로 생기는 것이 아니다.

### 브랜치 추적

리모트 트래킹 브랜치를 로컬 브랜치로 Checkout 하면 자동으로 트래킹 브랜치가 만들어진다. (트래킹 하는 대상 브랜치를 Upstream 브랜치 라고 부른다) 트래킹 브랜치는 리모트 브랜치와 직접적인 연결고리가 있는 로컬 브랜치이다. 트래킹 브랜치에서 `git pull` 명령을 내리면 리모트 저장소로부터 데이터를 내려받아 연결된 리모트 브랜치와 자동으로 Merge 한다.

`git checkout -b <branch> <remote>/<branch>` 명령어로 간단히 트래킹 브랜치를 만들 수 있다:

![Screenshot 2024-08-20 at 6.18.05 PM.png](/images/devops-git-overview/image-043.png)

이미 로컬에 존재하는 브랜치가 리모트의 특정 브랜치를 추적하게 하려면 `git branch` 명령에 `-u`나 `--set-upstream-to` 옵션을 붙인다:

![Screenshot 2024-08-20 at 6.19.52 PM.png](/images/devops-git-overview/image-044.png)

### 리모트 브랜치 삭제

`git push` 명령에 `--delete` 옵션을 사용하여 리모트 브랜치를 삭제할 수 있다.

![Screenshot 2024-08-20 at 6.21.14 PM.png](/images/devops-git-overview/image-045.png)

### Rebase 하기

Git에서 한 브랜치에서 다른 브랜치로 합치는 방법으로는 두 가지가 있다. 하나는 Merge이고, 다른 하나는 Rebase 이다.

현재 저장소가 다음과 같은 상태라고 가정한다:

![Screenshot 2024-08-20 at 6.25.17 PM.png](/images/devops-git-overview/image-046.png)

3-way Merge를 통해 새로운 커밋을 만들어 내면서 Merge 할 수 있지만, c4에서 변경된 사항을 Patch로 만들고 이를 다시 c4에 적용시키는 방법이 있다. 이를 Rebase라고 한다:

![Screenshot 2024-08-20 at 6.27.15 PM.png](/images/devops-git-overview/image-047.png)

두 브랜치가 나뉘기 전인 공통 커밋으로 이동하고 나서, 그 커밋부터 지금 Checkout 한 브랜치가 가리키는 커밋까지 diff를 차례로 만들어 임시로 저장한 다음에, Rebase 할 브랜치가 합칠 브랜치가 가리키는 커밋을 가리키게 하고, 아까 저장해 놓았던 변경사항을 차례대로 적용하는 방식이다.

이러고 나서 `main` 브랜치를 Fast-forward 하면 된다.

![Screenshot 2024-08-20 at 6.28.47 PM.png](/images/devops-git-overview/image-048.png)

### Rebase의 위험성

> 이미 공개 저장소에 Push한 커밋을 Rebase 하지 마라

Rebase는 기존의 커밋을 그대로 사용하는 것이 아니라 내용은 같지만 다른 커밋을 새로 만든다. 따라서 이전의 커밋 내용이 달라지기 때문에 다른 동료가 나중에 Push할 때 난장판이 되기 때문…

## 레퍼런스

- [Pro Git 2판](https://git-scm.com/book/ko/v2)
