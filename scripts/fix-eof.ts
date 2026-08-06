#!/usr/bin/env tsx

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDirectory, listFiles } from "./lib/fs";

type Options = {
  rootDir: string;
};

const CONFIG = {
  rootDir: "content",
  textExtensions: [".css", ".html", ".js", ".json", ".md", ".mjs", ".scss", ".sh", ".svg", ".toml", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml"],
  textFileNames: [".gitignore", ".gitmodules", "CNAME", "LICENSE", "README", "README.md"],
} as const;

const textExtensions = new Set<string>(CONFIG.textExtensions);
const textFileNames = new Set<string>(CONFIG.textFileNames);

function parseArgs(argv: string[]): Options {
  let rootDir: string = CONFIG.rootDir;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--root-dir":
        rootDir = argv[++index];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { rootDir };
}

function printHelp() {
  console.log(`Add missing final newlines for content files.

Usage:
  npm run fix:eof

Options:
  --root-dir <path>   Root directory to fix. Default: content
`);
}

function isTextFile(filePath: string) {
  const fileName = path.basename(filePath);
  return textFileNames.has(fileName) || textExtensions.has(path.extname(filePath).toLowerCase());
}

async function fixFile(file: string) {
  const bytes = await readFile(file);

  if (bytes.length === 0 || bytes.at(-1) === 0x0a) {
    return false;
  }

  await writeFile(file, Buffer.concat([bytes, Buffer.from("\n")]));
  return true;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.rootDir))) {
    throw new Error(`Root directory not found: ${options.rootDir}`);
  }

  const files = await listFiles(options.rootDir, {
    include: (filePath) => isTextFile(filePath),
  });

  let fixed = 0;
  for (const file of files) {
    if (await fixFile(file)) {
      fixed += 1;
      console.log(`- ${file}`);
    }
  }

  console.log(`Summary: ${fixed} file(s) fixed`);
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
