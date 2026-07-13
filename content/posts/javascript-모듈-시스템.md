---
title: "JavaScript. 모듈 시스템"
date: 2025-10-07

categories: 
    - JavaScript
series:
tags:
    - JavaScript
    - CommonJS
    - ECM

draft: true
original: "notion-export/블로그 이관/JavaScript/JS 모듈 시스템 285ade8f376580ff8c11cd32d6ae43ab.md"
---

프로젝트가 커질수록 모든 코드를 하나의 파일에 작성하기는 어렵다. 그래서 JavaScript는 기능별로 코드를 여러 파일로 나누어 관리하며, 각각의 파일을 모듈(Module)이라고 한다. 

모듈 시스템은 이러한 모듈을 다른 파일에서 가져오고 내보내는 방법을 정의한다.

## 주요 모듈 시스템

### CommonJS (CJS)

CommonJS는 Node.js 초창기부터 사용된 모듈 시스템이다. `require`로 다른 모듈을 가져오고, `module.exports`로 외부에 공개할 값을 내보낸다.

```jsx
// math.js
function add(a, b) {
    return a + b;
}
module.exports = { add };
```

```jsx
// main.js
const math = require('./math');
console.log(math.add(2, 3));
```

위 예시에서 `module.exports`는 `add` 함수를 다른 파일에서도 사용할 수 있도록 내보낸다. `main.js`에서는 `require`를 통해 해당 모듈을 가져와 `math.add()`를 호출한다.

### ECMAScriptModule (ESM)

ECMAScript Module(ESM)은 JavaScript의 공식 표준 모듈 시스템이다. 현재는 브라우저뿐만 아니라 Node.js에서도 널리 사용되며, `import`와 `export` 문법을 사용한다.

```jsx
// math.js
export function add(a, b) {
    return a + b;
}
```

```jsx
// main.js
import { add } from './math.js';
console.log(add(2, 3));
```

CommonJS와 달리 `export`로 필요한 값만 선택적으로 내보낼 수 있으며, `import`를 통해 필요한 값만 가져올 수 있다.

## 어떤 방식을 사용해야 할까?

현재는 새로운 프로젝트라면 ESM을 사용하는 것이 일반적이다. 브라우저의 표준 모듈 시스템이며, Node.js도 ESM을 공식적으로 지원하기 때문이다.
