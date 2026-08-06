#!/usr/bin/env tsx

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDirectory, listFiles } from "./lib/fs";

type Options = { fix: boolean; dryRun: boolean; rootDir: string };

const CONFIG: {
  rootDir: string;
  markdownExtension: string;
  defaultIndentWidth: number;
  languageIndentWidths: Record<string, number>;
} = {
  rootDir: "content",
  markdownExtension: ".md",
  defaultIndentWidth: 4,
  languageIndentWidths: {
    js: 2,
    jsx: 2,
    javascript: 2,
    json: 2,
    ts: 2,
    tsx: 2,
    typescript: 2,
  },
};

function isMarkdownFile(filePath: string) {
  return path.extname(filePath).toLowerCase() === CONFIG.markdownExtension;
}

function indentWidthForLanguage(language: string) {
  return CONFIG.languageIndentWidths[language.toLowerCase()] ?? CONFIG.defaultIndentWidth;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { fix: false, dryRun: false, rootDir: CONFIG.rootDir };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case "--fix":
        options.fix = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--root-dir":
        options.rootDir = argv[++index];
        break;
      case "--help":
      case "-h":
        console.log(`Normalize tabs inside Markdown fenced code blocks.

Usage:
  npm run fix:codeblock
  npm run fix:codeblock -- --dry-run
  npm run fix:codeblock -- --root-dir content --fix

Options:
  --fix               Write converted files.
  --dry-run           Report files without changing them (overrides --fix).
  --root-dir <path>   Markdown root directory. Default: ${CONFIG.rootDir}
`);
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

function formatCodeBlocks(source: string) {
  const lines = source.split("\n");
  let inside = false;
  let indentWidth = CONFIG.defaultIndentWidth;
  let changed = false;
  const formatted = lines.map((line) => {
    const fence = line.match(/^\s*```\s*([\w#+-]*)/);
    if (fence) {
      if (!inside) {
        indentWidth = indentWidthForLanguage(fence[1]);
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
  if (!(await isDirectory(options.rootDir))) throw new Error(`Root directory not found: ${options.rootDir}`);
  const files = await listFiles(options.rootDir, {
    include: (filePath) => isMarkdownFile(filePath),
  });
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

main().catch((error) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
