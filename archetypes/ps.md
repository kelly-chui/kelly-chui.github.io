---
{{- $name := .File.ContentBaseName }}
{{- $number := replaceRE `^ps-(boj|codeforces|leetcode)-([^-]+)-.*$` `$2` $name | upper }}
{{- $problem := $name
    | replaceRE `^ps-(boj|codeforces|leetcode)-[^-]+-` ``
    | replaceRE `^ps-programmers-` ``
    | replaceRE `-` ` `
    | title }}
{{- $title := $problem }}
{{- if (findRE `^ps-boj-` $name) }}{{ $title = printf `BOJ %s. %s` $number $problem }}{{ end }}
{{- if (findRE `^ps-codeforces-` $name) }}{{ $title = printf `Codeforces %s. %s` $number $problem }}{{ end }}
{{- if (findRE `^ps-leetcode-` $name) }}{{ $title = printf `LeetCode %s. %s` $number $problem }}{{ end }}
{{- if (findRE `^ps-programmers-` $name) }}{{ $title = printf `Programmers. %s` $problem }}{{ end }}
title: "{{ $title }}"
date: {{ .Date }}

categories:
  - Problem Solving
series:
tags:
algorithmTags:
features:
  - katex

draft: true
original: ""
---

## 문제

## 풀이

## 코드
