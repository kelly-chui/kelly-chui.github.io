---
title: "TIL. May 19, 2026"
date: 2026-05-19

categories:
  - TIL
tags:
  - Express
  - Middleware
  - Routing

draft: false
original: "https://junmusu.tistory.com/192"
---

# 요약

Express의 핵심 구성 요소와 요청 처리 흐름을 정리했다. 특히 Middleware가 특정 객체가 아니라 요청 처리 과정에서 동작하는 함수들의 역할이라는 점과, Express가 함수형 체인이 아닌 공유 객체(`req`, `res`)를 사용하는 파이프라인 구조라는 점을 이해하게 되었다.

## 배운 것

### 오늘 공부한 내용

- Express의 App, Router, Middleware
- Express의 동작
- Express의 간단한 내부 구조

## Express의 핵심 구성 요소

처음에는 Express를 iOS의 MVC에서 View를 제거한 형태 정도로 생각했다. Route Handler가 Controller 역할을 하는 것이라고 생각했다.
Express를 구성하는 핵심 요소는 크게 다음과 같다.

- Application (`app`)
- Router
- Middleware
- Request (`req`)
- Response (`res`)

### App
Express 애플리케이션 전체를 나타내는 객체이다.

```ts
const app = express();
```

App은 Middleware, Router를 등록하고 서버를 실행하는 역할을 담당한다.

```ts
app.use(...)
app.get(...)
app.listen(...)
```

### Router

Router는 URL 규칙을 관리하는 객체이다.

```ts
const router = Router();
```

Router 내부에는 Route와 Middleware를 등록할 수 있으며, 다른 Router를 포함할 수도 있다.

```less
router.get("/", getUsers);
router.post("/", createUser);
```
 
그리고 App에 연결하여 사용할 수 있다.

```ts
app.use("/users", userRouter);
```

## Middleware

설명을 읽어도 Middleware가 잘 와닿지 않았다. Router처럼 구체적인 객체가 있을 것이라 생각했는데, Express에는 Middleware라는 클래스나 인터페이스가 존재하지 않았다.

그래서 먼저 Middleware를 '처리 과정에서 중간 역할을 수행하는 소프트웨어'라는 개념으로 이해한 뒤 다시 살펴봤다. Express에서 Middleware는 특정 객체가 아니라 역할을 의미하며, 요청과 Route Handler 사이에서 실행되는 함수들을 가리킨다.

```ts
(req, res, next) => {
    ...
}
```

대표적인 Middleware로는 다음과 같은 것들이 있다.

- Logging
- Authentication
- Body Parsing
- File Upload
- Error Handling

### use()

`use()`는 라우터나 앱에 미들웨어나 다른 라우터를 등록하는 함수이다.

```ts
app.use(logger);
```

위 코드는 모든 요청에 대해 `logger` Middleware를 실행하도록 등록한다. 또한 Router도 등록할 수 있다.

```ts
app.use("/users", userRouter);
```
 
이는 `/users` 경로에 대한 요청을 `userRouter`에게 위임한다는 의미이다.

## HTTP Method와 Route

Express는 HTTP Method에 따라 Route를 등록할 수 있다.

```ts
app.get("/users", getUsers);
app.post("/users", createUser);
app.put("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);
```

각각 다음 요청에 대응한다.

```
GET /users
POST /users
PUT /users/:id
DELETE /users/:id
```

반면 `use()`는 HTTP Method와 상관없이 동작한다.
즉, `use(logger);` 는 GET, POST, PUT, DELETE 등 모든 요청에 대해 실행된다.

## 기타

### express.json()은 무엇인가?

```css
app.use(express.json());
```

하지만 실제로는 Router가 아니라 Middleware를 생성하는 함수이다.  
이 Middleware는 HTTP Body에 포함된 JSON 문자열을 JavaScript 객체로 변환하여 `req.body`에 저장한다.

```css
Request
 ↓
express.json()
 ↓
req.body 생성
 ↓
다음 Middleware
```

### Express는 함수형 체인이 아니다

가장 인상 깊었던 부분은 Middleware 체인의 동작 방식이었다. 처음에는 다음과 같은 함수형 체인을 상상했다. 종종 builder 패턴에서 썼던 방식 혹은 SwiftUI의 Modifier와 유사하다고 생각했다:

```
input
  .parsing()
  .route()
  .response()
```

즉, 이전 단계의 결과가 다음 단계로 전달되는 구조라고 생각했다. 하지만 Express는 하나의 `req` 객체를 모든 Middleware가 공유한다.

```
Request
 ↓
Middleware A
 ↓
Middleware B
 ↓
Middleware C
```

각 Middleware는 같은 `req` 객체를 수정하며 정보를 전달한다. (Swift식으로 생각하면 `req` 객체는 Mutable하다)

예를 들어 인증 Middleware는 다음과 같이 동작할 수 있다.

```ts
req.user = user;
```

그러면 이후 Middleware나 Route Handler는 `req.user`를 사용할 수 있다.

즉, Express의 Middleware 체인은 결과를 반환하는 함수 체인이 아니라 공유 객체 `(req, res)`를 가공하는 파이프라인에 가깝다.

### next()의 역할

함수형 체인이 아니므로, 미들웨어의 순서를 제어하는 방법이 필요한데 이게 바로 `next()`다.

```ts
function logger(req, res, next) {
    console.log("로그");
    next();
}
```

`next()`는 Express에게 다음 Middleware를 실행하라고 알려준다.

```
Request
 ↓
logger
 ↓
next()
 ↓
다음 Middleware
```
 
만약 `next()`를 호출하지 않으면 요청 처리는 해당 위치에서 종료된다. 예를 들어 인증 실패 시에는 다음과 같이 동작할 수 있다:

```ts
function auth(req, res, next) {
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    next();
}
```

### App은 Router인가?

`App`과 `Router`는 `use()`, `get()` 등 비슷한 API를 제공하기 때문에 처음에는 같은 객체처럼 보였다.

- App: Express 애플리케이션 전체 관리
- Router: 특정 경로에 대한 요청 처리 관리

실제로 `App`은 내부적으로 `Router`를 사용하여 요청을 처리한다. 따라서 `App`은 최상위 Router를 포함하고 있지만, `listen()`과 같이 서버 전체를 관리하는 기능을 제공한다는 점에서 `Router`와는 역할이 다르다.

## 남은 의문

- Express 내부에서 Middleware 체인이 어떤 순서로 관리되는지 더 살펴보고 싶다.

오늘 공부하면서 처음에는 억지로 Express를 iOS 개념에 넣어서 MVC 관점으로 이해하려고 했지만, 실제로는 요청 처리 파이프라인으로 이해하는 것이 훨씬 자연스럽다는 것을 알게 되었다.

내가 이해한 Express의 핵심 흐름은 다음과 같다.

```
Request
 ↓
express.json()
 ↓
logger
 ↓
auth
 ↓
Router
 ↓
Route Handler
 ↓
Response
```

결국 Express의 본질은 요청(Request)이 여러 Middleware와 Router를 순차적으로 통과하면서 처리되는 파이프라인 구조라고 생각한다.

## 다음에 해볼 것

- Express의 내부 구현 코드를 직접 읽어보기
- `express.Router()`가 어떻게 동작하는지 분석하기
- Middleware 실행 순서와 에러 처리 흐름을 실험으로 확인하기
