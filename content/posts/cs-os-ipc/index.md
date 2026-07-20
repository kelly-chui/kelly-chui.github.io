---
title: "OS. IPC(Inter-Process Communication)"
date: 2025-01-19

categories:
  - Computer Science
series:
  - Operating System
tags:
  - IPC
  - Message Passing
  - Process

draft: false
original: "notion-export/블로그 이관/ComputerScience/OS/IPC 17fade8f37658084999beca46a934262.md"
---

Date: January 19, 2025
Multi-select: Process

## IPC

여러 개의 독립적인 프로세스들이 서로 데이터를 주고받을 때 사용하는 메커니즘을 IPC(Inter Process Communication)라고 한다.

각각의 프로세스는 별개의 메모리 공간을 가지기 때문에, 서로 직접 메모리에 접근할 수 없기 때문에 IPC는 프로세스 간에 데이터를 교환하는 방법을 제공한다.

## 메세지 패싱

직접 메모리를 공유하지 않고 메세지를 통해 데이터를 주고받는 방식, 격리성을 보장할 수 있는 장점이 있지만 속도가 느리고 메모리 소비가 증가한다는 단점이 있음

### 주요방식

#### Simple

간단히 메세지를 보내고 받는 방식

#### Message Queue

메세지들을 임시로 저장하는 큐를 만들고 수신 프로세스가 큐에서 메세지를 꺼내서 처리하는 방식, 여러 프로세스가 큐에 동시에 접근 가능하기 때문에 동기화 필요

#### Pipe

데이터를 한 프로세스에서 다른 프로세스로 흐르게 하는 통로, 단방향 데이터 전달을 함, 한 프로세스가 데이터를 파이프에 쓰면, 다른 프로세스가 이를 읽는 용도 부모-자식 프로세스간에 주요 사용된다.

터미널에서 쓰는 `|`도 파이프던데. 직관적으로 이해할 수 있었다.

#### Socket

네트워크를 통해 메세지를 주고받는 방법, 네트워크 상의 다른 시스템 간에 메세지를 전달할 수 있음. 양방향 통신 지원

## 공유 메모리

여러 프로세스가 동일한 메모리 공간을 공유하여 데이터를 주고받는 방법, 속도가 빠르다는 장점이 있지만 격리성이 보장되지 않기 때문에 동기화가 필요하다.

- iOS에서는 잘 사용되지 않음
