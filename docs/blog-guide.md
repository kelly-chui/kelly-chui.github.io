# Blog Guide

## Overview

This repository contains the source code for my personal blog.

The blog is managed as a software project. All structural decisions should remain consistent unless there is a compelling reason to change them.

---

# Site

- Theme: PaperMod
- Site language: English
- Post language: Primarily Korean

---

# Content Structure

```
content/
├── about.md
└── posts/
```

All blog posts are stored under `content/posts`.

---

# Front Matter

Use **YAML** front matter.

Field order:

```yaml
---
title:
date:

categories:
series:
tags:

draft:
original:
---
```

Rules:

- `categories` contains exactly one value.
- `series` contains zero or one value.
- `tags` may contain any number of values.
- `draft` defaults to `true` for new posts.
- `original` stores the original Tistory URL.
- `weight` is used only for posts that belong to a series.

---

# URL Policy

URLs are determined by the filename.

Do not use `slug` unless there is a strong reason.

Example:

```
content/posts/swift-generics-5.md
```

↓

```
/posts/swift-generics-5/
```

Titles may change without affecting URLs.

---

# Series

Series are optional.

When a post belongs to a series, use `weight` to determine its order.

Example:

```yaml
series:
  - The Swift Programming Language

weight: 5
```

---

# Images

```
static/images/
├── assets/
├── posts/
├── profile/
└── tistory/
```

Rules:

- Imported Tistory images remain under `static/images/tistory/`.
- Newly created images are stored under `static/images/posts/`.
- Profile images are stored under `static/images/profile/`.
- Shared site assets (favicon, logo, OG images, etc.) are stored under `static/images/assets/`.

---

# Migration

- Preserve the original publication date.
- Preserve the original Tistory URL.
- Preserve imported images whenever possible.
- Avoid changing article meaning during migration.
