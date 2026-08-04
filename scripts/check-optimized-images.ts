#!/usr/bin/env tsx

import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const postsDir = "content/posts";
const sourceExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ignoredMarkers = ["-optimized-image", "-original-image"];

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(root, entry.name);
      if (entry.isDirectory()) return listFiles(target);
      return entry.isFile() ? [target] : [];
    }),
  );
  return nested.flat();
}

async function main() {
  if (!(await stat(postsDir).catch(() => undefined))) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }

  const candidates = (await listFiles(postsDir)).filter((file) => {
    const name = path.basename(file);
    return sourceExtensions.has(path.extname(name).toLowerCase()) && !ignoredMarkers.some((marker) => name.includes(marker));
  });

  if (candidates.length === 0) {
    console.log("Optimized image check passed.");
    return;
  }

  console.error("Unoptimized image(s) found:");
  for (const file of candidates.sort()) console.error(`- ${file}`);
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
