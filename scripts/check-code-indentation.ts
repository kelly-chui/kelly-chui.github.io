#!/usr/bin/env tsx

import { readFile } from "node:fs/promises";
import { isDirectory, listFiles } from "./lib/fs";

type Options = {
  rootDir: string;
};

const CONFIG = {
  rootDir: "content",
  markdownExtension: ".md",
} as const;

function isMarkdownFile(filePath: string) {
  return filePath.toLowerCase().endsWith(CONFIG.markdownExtension);
}

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
  console.log(`Check tab indentation inside Markdown fenced code blocks.

Usage:
  npm run check:codeblock

Options:
  --root-dir <path>   Markdown root directory. Default: ${CONFIG.rootDir}
`);
}

async function checkFile(file: string) {
  const text = await readFile(file, "utf8");
  const offenders: string[] = [];
  let insideCodeBlock = false;

  text.split("\n").forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      insideCodeBlock = !insideCodeBlock;
    } else if (insideCodeBlock && line.includes("\t")) {
      offenders.push(`${file}:${index + 1}`);
    }
  });

  return offenders;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.rootDir))) {
    throw new Error(`Root directory not found: ${options.rootDir}`);
  }

  const files = await listFiles(options.rootDir, {
    include: (filePath) => isMarkdownFile(filePath),
  });

  const offenders = (await Promise.all(files.map((file) => checkFile(file)))).flat();

  if (offenders.length > 0) {
    console.error("Tab indentation found in Markdown code blocks:");
    for (const file of offenders) {
      console.error(`- ${file}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Code indentation check passed.");
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
