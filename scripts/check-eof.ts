#!/usr/bin/env tsx

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

type Options = {
  fix: boolean;
  rootDir: string;
};

type EofIssue = {
  file: string;
  reason: "missing-final-newline" | "empty-file";
};

const CONFIG = {
  rootDir: ".",
  excludedDirectoryNames: [".git", ".hugo_build.lock", "node_modules", "public", "resources", "themes"],
  excludedPathPrefixes: [path.join("static", "css", "vendor"), path.join("static", "js", "vendor")],
  textExtensions: [".css", ".html", ".js", ".json", ".md", ".mjs", ".scss", ".sh", ".svg", ".toml", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml"],
  textFileNames: [".gitignore", ".gitmodules", "CNAME", "LICENSE", "README", "README.md"],
} as const;

const excludedDirectoryNames = new Set<string>(CONFIG.excludedDirectoryNames);

const excludedPathPrefixes = CONFIG.excludedPathPrefixes;

const textExtensions = new Set<string>(CONFIG.textExtensions);

const textFileNames = new Set<string>(CONFIG.textFileNames);

function parseArgs(argv: string[]): Options {
  const options: Options = {
    fix: false,
    rootDir: CONFIG.rootDir,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--fix":
        options.fix = true;
        break;
      case "--root-dir":
        options.rootDir = argv[++index];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Check and optionally fix final newlines for repository-owned text files.

Usage:
  npm run check:eof
  npm run check:eof -- --fix

Options:
  --fix               Add missing final newlines.
  --root-dir <path>   Root directory to check. Default: .
`);
}

async function isDirectory(targetPath: string) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function shouldSkip(relativePath: string) {
  const parts = relativePath.split(path.sep);

  if (parts.some((part) => excludedDirectoryNames.has(part))) {
    return true;
  }

  return excludedPathPrefixes.some(
    (prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}${path.sep}`),
  );
}

function isTextFile(filePath: string) {
  const fileName = path.basename(filePath);
  return textFileNames.has(fileName) || textExtensions.has(path.extname(filePath).toLowerCase());
}

async function collectFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, entryPath);

      if (shouldSkip(relativePath)) {
        return [];
      }

      if (entry.isDirectory()) {
        return collectFiles(rootDir, entryPath);
      }

      if (entry.isFile() && isTextFile(entryPath)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nested.flat().sort();
}

async function checkFile(file: string, fix: boolean): Promise<EofIssue | undefined> {
  const bytes = await readFile(file);

  if (bytes.length === 0) {
    return { file, reason: "empty-file" };
  }

  if (bytes.at(-1) === 0x0a) {
    return undefined;
  }

  if (fix) {
    await writeFile(file, Buffer.concat([bytes, Buffer.from("\n")]));
  }

  return { file, reason: "missing-final-newline" };
}

function printReport(issues: EofIssue[], fixed: boolean) {
  if (issues.length > 0) {
    console.log(fixed ? "[Fixed]" : "[Missing Final Newline]");
    for (const issue of issues) {
      console.log(`- ${issue.file}${issue.reason === "empty-file" ? " (empty file)" : ""}`);
    }
    console.log();
  }

  console.log(`Summary: ${issues.length} issue(s)${fixed ? " fixed" : ""}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.rootDir))) {
    throw new Error(`Root directory not found: ${options.rootDir}`);
  }

  const files = await collectFiles(options.rootDir);
  const issues = (await Promise.all(files.map((file) => checkFile(file, options.fix)))).filter(
    (issue): issue is EofIssue => Boolean(issue),
  );

  printReport(issues, options.fix);

  const failingIssues = issues.filter((issue) => issue.reason !== "empty-file");
  if (!options.fix && failingIssues.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
