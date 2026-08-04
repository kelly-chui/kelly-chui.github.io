#!/usr/bin/env tsx

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

type Options = { fix: boolean; dryRun: boolean; rootDir: string };

function parseArgs(argv: string[]): Options {
  const options: Options = { fix: false, dryRun: false, rootDir: "content" };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case "--fix": options.fix = true; break;
      case "--dry-run": options.dryRun = true; break;
      case "--root-dir": options.rootDir = argv[++index]; break;
      case "--help":
      case "-h":
        console.log(`Normalize tabs inside Markdown fenced code blocks to four spaces.

Usage:
  npm run format:code-indentation
  npm run format:code-indentation -- --fix
  npm run format:code-indentation -- --root-dir content/posts --fix

Options:
  --fix               Write converted files.
  --dry-run           Report files without changing them (overrides --fix).
  --root-dir <path>   Markdown root directory. Default: content
`);
        process.exit(0);
      default: throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

async function collectMarkdown(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(currentDir, entry.name);
    if (entry.isDirectory()) return collectMarkdown(rootDir, file);
    return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
  }));
  return files.flat().sort();
}

function formatCodeBlocks(source: string) {
  const lines = source.split("\n");
  let inside = false;
  let indentWidth = 4;
  let changed = false;
  const formatted = lines.map((line) => {
    const fence = line.match(/^\s*```\s*([\w#+-]*)/);
    if (fence) {
      if (!inside) {
        const language = fence[1].toLowerCase();
        indentWidth = ["js", "jsx", "javascript", "ts", "tsx", "typescript"].includes(language) ? 2 : 4;
      }
      inside = !inside;
      return line;
    }
    if (!inside || !line.includes("\t")) return line;
    changed = true;
    return line.replace(/\t/g, " ".repeat(indentWidth));
  });
  return { source: formatted.join("\n"), changed };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!(await stat(options.rootDir)).isDirectory()) throw new Error(`Root directory not found: ${options.rootDir}`);
  const files = await collectMarkdown(options.rootDir);
  const changed: string[] = [];
  for (const file of files) {
    const original = await readFile(file, "utf8");
    const result = formatCodeBlocks(original);
    if (!result.changed) continue;
    changed.push(file);
    if (options.fix && !options.dryRun) await writeFile(file, result.source);
  }
  const mode = options.dryRun ? "would be formatted" : options.fix ? "formatted" : "contain tabs in code blocks";
  console.log(`${changed.length} file(s) ${mode}.`);
  changed.forEach((file) => console.log(`- ${file}`));
  if (!options.fix && changed.length) process.exitCode = 1;
}

main().catch((error) => { console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
