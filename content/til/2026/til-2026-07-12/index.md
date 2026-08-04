---
title: "TIL. Jul 12, 2026"
date: 2026-07-12T21:21:18+09:00

categories:
  - TIL
series:
tags:
  - Hugo
  - Mermaid
  - JavaScript

draft: false
original: ""
aliases:
  - /posts/til-2026-07-12/
---

## 오늘 한 내용

- Hugo 블로그에서 Mermaid를 외부 CDN 없이 렌더링하도록 변경
- Mermaid가 필요한 페이지에서만 스크립트를 로드하도록 최적화
- `hugo --minify`로 빌드 검증

## 배운 내용

Mermaid 코드 블록은 `layouts/_markup/render-codeblock-mermaid.html`에서 `<pre class="mermaid">`로 변환하고, `layouts/_partials/extend_footer.html`에서 Mermaid가 포함된 페이지에만 스크립트를 삽입하도록 구성했다.

처음에는 ESM 파일 하나만 `static/`에 복사했지만, 해당 파일이 내부 chunk를 추가로 참조하는 구조라 렌더링이 깨졌다. 브라우저가 다이어그램을 SVG로 바꾸지 못하고 원문 텍스트처럼 보여서, 의존성이 단순한 `mermaid.min.js`로 교체했다.

외부 CDN을 제거하는 작업도 단순히 파일을 내려받는 것으로 끝나지 않았다. 번들 파일의 의존성과 실행 방식까지 확인해야 실제 정적 사이트에서 안정적으로 동작한다는 것을 배웠다.

## 해결 내용

ESM chunk 의존성 때문에 깨지던 Mermaid를 의존성이 단순한 `mermaid.min.js`로 교체하고, 필요한 페이지에서만 로컬 스크립트를 로드하도록 수정했다. `hugo --minify` 빌드도 통과했다.
