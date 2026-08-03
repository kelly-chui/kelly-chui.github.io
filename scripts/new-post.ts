#!/usr/bin/env tsx

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Options = {
  kind: "default" | "ps" | "til";
  title?: string;
  slug?: string;
};

function printHelp() {
  console.log(`Create a draft Hugo post page bundle.

Usage:
  npm run new -- "Post title"
  npm run new -- -ps "Problem title"
  npm run new -- -til "Today I learned"
  npm run new -- -ps "Problem title" --slug custom-slug
`);
}

function parseArgs(argv: string[]): Options {
  const options: Options = { kind: "default" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--slug") {
      options.slug = argv[++index];
      continue;
    }

    if (arg === "-ps" || arg === "-til") {
      options.kind = arg.slice(1) as Options["kind"];
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    if (options.title) {
      throw new Error("Provide one post title.");
    }

    options.title = arg;
  }

  return options;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function bodyFor(kind: Options["kind"]) {
  if (kind === "ps") {
    return "## 문제\n\n## 풀이\n\n## 코드\n";
  }

  if (kind === "til") {
    return "## 오늘 한 내용\n\n## 배운 내용\n\n## 해결 내용\n\n## 내일 할 것\n";
  }

  return "";
}

function categoriesFor(kind: Options["kind"]) {
  if (kind === "ps") {
    return "categories:\n  - Problem Solving";
  }

  if (kind === "til") {
    return "categories:\n  - TIL";
  }

  return "categories:";
}

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const { kind, title, slug: requestedSlug } = parseArgs(process.argv.slice(2));

  if (!title?.trim()) {
    printHelp();
    throw new Error("Post title is required.");
  }

  const slug = slugify(requestedSlug ?? title);
  if (!slug) {
    throw new Error("Could not create a slug. Pass one with --slug.");
  }

  const bundleDir = path.join("content", "posts", slug);
  const indexPath = path.join(bundleDir, "index.md");
  if (await exists(indexPath)) {
    throw new Error(`Post already exists: ${indexPath}`);
  }

  const content = `---
title: ${yamlString(title.trim())}
date: ${new Date().toISOString()}

${categoriesFor(kind)}
series:
tags:

draft: true
original: ""
---

${bodyFor(kind)}`;

  await mkdir(bundleDir, { recursive: true });
  await writeFile(indexPath, content, "utf8");

  console.log(`Created ${indexPath} (${kind} archetype)`);
  console.log(`Preview with: npm run dev`);
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
