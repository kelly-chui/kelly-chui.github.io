---
title: "Docker. 내 애플리케이션 Dockerizing 하기"
date: 2025-10-09

categories:
    - DevOps
series:
    - Docker
tags:
    - DevOps
    - Docker
    - Dockerizing

draft: true
original: "notion-export/블로그 이관/DevOps/Dockerizing 286ade8f376580e2a5f3ceaefc6e9091.md"
---

## 0. 기반 파일

[https://github.com/nice-card/express-example](https://github.com/nice-card/express-example)

## 1. 프로젝트 위치 확인

현재 경로를 프로젝트 경로로 설정하고 확인하기

![image.png](/images/devops-docker-06-dockerizing/image-001.png)

## 2.  Dockerfile, .dockerignore 추가

프로젝트 루트에 Dockerfile을 새로 만들기.

### Dockerfile

프로젝트 루트에 만들기.

```docker
# === build stage ===
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                   # dev 포함 (tsc 사용)
COPY . .
RUN npm run build            # dist/ 생성

# === runtime stage ===
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev        # 런타임에 필요한 것만

# 빌드 결과만 가져오기
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]         # package.json의 "start": "node dist/index.js"
```

### .dockerignore

불필요한 파일이 이미지에 안 들어가게 막는 용도

```docker
node_modules
dist
npm-debug.log
.DS_Store
```

![image.png](/images/devops-docker-06-dockerizing/image-002.png)

## 3. 이미지 빌드하기

```docker
docker build -t express-example .
docker run -d -p 3000:3000 --name express-example express-example
# 확인
curl http://localhost:3000
```

![image.png](/images/devops-docker-06-dockerizing/image-003.png)

## 4. 컨테이너 실행

```docker
docker run -d -p 3000:3000 --name express-example express-example 
```

## 5. 실행 확인