---
title: "Network. URI(Uniform Resource Identifier)"
date: 2025-01-12

categories:
    - Computer Science
series:
    - Network
tags:
    - Network
    - URI

draft: true
original: "notion-export/블로그 이관/ComputerScience/Network/URI, URN, URL 179ade8f37658095ac9de06472b05af8.md"
---

## URI (Uniform Resource Identifier)

> 자원(파일, 웹 페이지, 이메일 주소)등을 식별하는 문자열
> 
URI는 URL과 URN을 포함하는 상위 개념이다.

## URL (Uniform Resource Locator)

> 자원의 위치(Location)와 접근 방법을 나타내는 URI
>
- HTTP, HTTPS, FTP 등의 프로토콜을 포함할 수 있다.
- 프로토콜, 호스트, 경로, 쿼리 등을 통해 자원에 접근하는 방법을 나타낸다.

## URN (Uniform Resource Name)

> 자원의 이름(Name)으로 식별하는 URI
>
- 자원의 위치와 관계없이 고유한 이름으로 식별한다.
- 대표적으로 ISBN, ISSN 등이 사용된다.

## 관계

```text
URI
├── URL
└── URN
```