---
title: "TIL. Jul 29, 2026"
date: 2026-07-29T20:53:29+09:00

categories:
  - TIL
series:
tags:
  - SRP
  - Hugo
  - Git

draft: false
original: ""
---

## 오늘 한 내용

- [LeetCode 3518: Smallest Palindromic Rearrangement II]({{< relref "posts/ps-leetcode-3518-smallest-palindromic-rearrangement-ii" >}})
- [Codeforces 189A: Cut Ribbon]({{< relref "posts/ps-codeforces-189a-cut-ribbon" >}})
- 블로그 깃 훅 제거
- 블로그 스크립트 구조화
- 블로그 커밋 목록 정리

## 해결 내용

PS 두 문제를 푼 이후에, 블로그에서 스크립트와 깃 훅을 교체하고, 하루종일 깃과 씨름했다. Hugo 프로젝트의 커밋 로그가 너무 더러웠고, Squash, Rebase로 한 번 정리하려는데, 중간에 워킹 트리가 한번 꼬여버렸다.

### 블로그 깃 훅 일시 제거.

블로그 깃 훅에는 두 가지 문제가 있다. 첫 번째는 타이밍 문제다. pre-commit에 뭔가 내용을 수정하는 훅을 넣으면, 커밋이 멈추지 않고. 변경사항을 유지한채로 커밋되어버린다.

물론 pre-commit 훅에 `git add .`를 추가하면 해결 되는 문제겠지만. 내가 확인하지 못하는 변경사항이 바로 Commit 되어버리는 거니 (로컬이라도) 그렇게 좋은 방법은 아닌 것으로 생각한다.

두 번째는 Sharp 라이브러리에 보안 이슈가 있다, 어쩐지 커밋을 할 때마다 맥이 엄청나게 물어보더라. 이건 수정 버전으로 업그레이드 해서 해결했다.

일단 지금 깃 훅은 일시적으로 연결을 끊어놓은 상태이다. 아직 블로그의 검증 스크립트들이 완전하지 않고, 조금 더 구조화 되었을 때 로컬 CI느낌으로 넣어보려 한다.

### 블로그 스크립트 구조화

지금 블로그에 스크립트가 이미지, 비디오 체크, 이미지 최적화, 비디오 최적화, EOF 뉴라인 검사 이렇게 있는데 코드를 보면 공통으로 뽑아낼 부분들이 많다. 무작정 재사용을 하기보다는 얘네들이 '진짜 닮은' 애들인지 '가짜로 닮은' 애들인지 확인을 해 봐야 하는데 만약 후자의 경우엔 코드를 끔찍하게 유지보수하기 힘들어진다.

따라서 코덱스에게 '가짜 추상화'를 최대한 피해서 코드를 구조화 해달라 했다. 파일의 존재를 확인하는 함수 파일을 불러오는 함수 정도는 괜찮은데, 생각해볼만한 것은 `updateMarkdownReference()` 라는 함수였다.

```ts
async function updateMarkdownReference(source: string, output: string) {
  const index = path.join(path.dirname(source), "index.md");
  if (!(await exists(index))) {
    return;
  }
  const sourceName = path.basename(source);
  const outputName = path.basename(output);
  const text = await readFile(index, "utf8");
  const updated = text.replaceAll(sourceName, outputName);
  if (updated !== text) {
    await writeFile(index, updated);
  }
}
```

이미지, 비디오 최적화 -> 최적화된 파일명을 사용하도록 참조 수정을 수행하는 함수인데, 이미지, 비디오, 그리고 다른 미디어 각각이 미래에 어떻게 분화할지 모른다. 아직은 블로그가 단순하지만, 만약에 이미지나 비디오 삽입 외에 파일명을 적어야 하는 경우가 생긴다면? 숏 코드의 동작이 바뀐다면? `if` 문들이 붙기 시작하고, 함수가 둘로 쪼개지게 된다. 

SRP를 잘 생각해서 이 코드가 같은 이유로 변경되는 코드인지 잘 생각해 봐야 한다.

### 블로그 커밋 목록 정리

커밋을 123개에서 50개 이하로 줄였다. 오늘 가장 많은 시간을 할애한 작업 같다. diff와 파일 변경사항을 보며 처음부터 커밋을 한땀한땀 합쳤다...

## 내일 할 것

- async/await 관련 스위프트 영상 보기
- 미방문록 POC 정리 및 메인 MVP 만들기
- 미방문록용 로컬 서버 간단하게만 세팅하기
