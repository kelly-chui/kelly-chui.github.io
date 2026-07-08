---
title: "JavaScript Basics. 08. 자바스크립트 API 활용 및 그림판 프로그램 만들기"
date: 2025-06-09

categories: ["JavaScript"]
series: ["JavaScript Basics"]
weight: 8
tags: ["JavaScript"]

draft: false
original: "notion-export/블로그 이관/javascript-basics/8 자바스크립트 API 활용 및 그림판 프로그램 만들기 16cade8f37658251ae9a015f91d18f1b.md"
---

## API 활용

### 클라이언트 측 고유 기술 요소

웹브라우저에서 동작하는 자바스크립트를 클라이언트 측 자바스크립트라 함

- 클라이언트 측 자바스크립트 구성
    - ECMAScript가 규정한 코어 언어와 웹 브라우저의 API(Application Program Interface)
- 웹 브라우저의 주요 API
    - window 인터페이스
        - 자바스크립트로 브라우저 및 창을 제어하는 기능 제공
    - DOM
        - 자바스크립트 HTML 문서의 요소를 제어하는 기능 제공
    - XMLHttpRequest
        - 서버와 비동기로 통신하는 기능 제공

### 서버 측 자바스크립트의 고유 기술 요소

웹 서버에서 동작하는 자바스크립트

웹 서버를 구현하는데 Perl, PHP, Python, Ruby 등의 프로그래밍 언어를 이용

- 주요 API
    - Node.js
        - 구글이 개발한 자바스크립트 실행 환경
    - Rhino
        - 오픈소스로 개발되어 현재는 모질라가 관리하고 있는 자바스크립트 실행 환경
    - Aptana Jaxer
        - 압타나 사가 개발하고 현재는 오픈소스로 개발되고 있는 자바스크립트 실행 환경

### 주요 API

| API | 설명 |
| --- | --- |
| Drag and Drop | HTML 요소 혹은 파일을 끌어서(드래그) 다른 HTML 요소에 놓을 때(드롭할 때) 데이터를 전달하는 기능을 제공 |
| Blob | 이진 데이터를 다루는 기능을 제공 |
| File | 프로그램 여러 개를 멀티스레드로 병렬 처리하는 기능을 제공 |
| Web Workers | 대용량이며 저장 기간에 제한이 없는 데이터를 로컬에 저장하는 기능을 제공 |
| Indexed Database | 로컬에 키값 타입의 관계형 데이터베이스 기능을 제공 |
| WebSockets | 서버와의 양방향 통신 기능을 제공 |
| Geolocation | GPS 등의 위치 정보를 다루는 기능을 제공 |
| Canvas | 2차원 3차원 그래픽스 기능을 제공 |
