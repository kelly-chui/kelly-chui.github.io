#!/usr/bin/env tsx

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  CONTENT_ROOT,
  DEFAULT_MEDIA_POLICY,
  isBackupMediaName,
  isMediaSourceFile,
  isOptimizedMediaName,
} from "./lib/media";

type Options = {
  post?: string;
  strict: boolean;
  contentDir: string;
  staticImagesDir: string;
};

type ReferenceKind = "markdown" | `image:${string}` | `theme-image:${string}` | `video:${string}`;

type MediaReference = {
  file: string;
  line: number;
  raw: string;
  kind: ReferenceKind;
};

type Report = {
  missing: MediaReference[];
  unused: string[];
  legacy: MediaReference[];
  crossPost: MediaReference[];
  external: MediaReference[];
  unsupportedAbsolute: MediaReference[];
  unoptimized: string[];
};

const CONFIG = {
  contentDir: CONTENT_ROOT,
  staticImagesDir: "static/images",
  videoExtensions: [".mov", ".mp4", ".m4v", ".webm"],
  staticAssetPrefix: "/images/assets/",
} as const;

const imageExtensions = new Set(DEFAULT_MEDIA_POLICY.sourceExtensions);
const videoExtensions = new Set(CONFIG.videoExtensions);
const bundleMediaExtensions = new Set<string>([...imageExtensions, ...videoExtensions]);

const markdownImagePattern = /!\[[^\]]*]\(\s*([^\s)]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
const imagePattern = /{{<\s*image\b([^>]*)>}}/g;
const themeImagePattern = /{{<\s*theme-image\b([^>]*)>}}/g;
const videoPattern = /{{<\s*video\b([^>]*)>}}/g;
const shortcodeArgPattern = /(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*'([^']*)'/g;

function normalize(value: string) {
  return value.normalize("NFC");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    strict: false,
    contentDir: CONFIG.contentDir,
    staticImagesDir: CONFIG.staticImagesDir,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--post":
        options.post = normalize(argv[++index]);
        break;
      case "--strict":
        options.strict = true;
        break;
      case "--content-dir":
        options.contentDir = argv[++index];
        break;
      case "--static-images-dir":
        options.staticImagesDir = argv[++index];
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

async function exists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function isDirectory(targetPath: string) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) return listFiles(entryPath);
      return entry.isFile() && entry.name !== ".DS_Store" ? [entryPath] : [];
    }),
  );
  return nested.flat().sort();
}

function printHelp() {
  console.log(`Check media references and optimization state for content bundles.

Usage:
  npm run check:media
  npm run check:media -- --strict
  npm run check:media -- --post <slug>

Options:
  --post <slug>            Check one content bundle.
  --strict                 Fail on unused bundle media too.
  --content-dir <path>     Content directory. Default: content
  --static-images-dir <path> Static images directory. Default: static/images
`);
}

async function collectPostIndexes(contentDir: string, selectedSlug?: string) {
  const files = await listFiles(contentDir);
  const indexes: string[] = [];

  for (const file of files) {
    if (path.basename(file) !== "index.md") {
      continue;
    }

    if (selectedSlug && !file.includes(`${path.sep}${selectedSlug}${path.sep}`)) {
      continue;
    }

    indexes.push(file);
  }

  return indexes.sort();
}

function isExternal(raw: string) {
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("data:");
}

function splitResourceSuffix(raw: string): [string, string] {
  const hashIndex = raw.indexOf("#");
  const queryIndex = raw.indexOf("?");
  const suffixIndexes = [hashIndex, queryIndex].filter((index) => index !== -1);

  if (suffixIndexes.length === 0) return [raw, ""];

  const suffixIndex = Math.min(...suffixIndexes);
  return [raw.slice(0, suffixIndex), raw.slice(suffixIndex)];
}

function extractReferences(file: string, text: string): MediaReference[] {
  const references: MediaReference[] = [];

  for (const [lineIndex, line] of text.split("\n").entries()) {
    const lineNumber = lineIndex + 1;

    for (const match of line.matchAll(markdownImagePattern)) {
      references.push({ file, line: lineNumber, raw: match[1].trim(), kind: "markdown" });
    }

    for (const match of line.matchAll(imagePattern)) {
      for (const argMatch of match[1].matchAll(shortcodeArgPattern)) {
        const key = argMatch[1] ?? argMatch[3];
        const raw = argMatch[2] ?? argMatch[4];
        if (["src", "image"].includes(key)) {
          references.push({ file, line: lineNumber, raw: raw.trim(), kind: `image:${key}` });
        }
      }
    }

    for (const match of line.matchAll(themeImagePattern)) {
      for (const argMatch of match[1].matchAll(shortcodeArgPattern)) {
        const key = argMatch[1] ?? argMatch[3];
        const raw = argMatch[2] ?? argMatch[4];
        if (["light", "dark", "src", "image"].includes(key)) {
          references.push({ file, line: lineNumber, raw: raw.trim(), kind: `theme-image:${key}` });
        }
      }
    }

    for (const match of line.matchAll(videoPattern)) {
      for (const argMatch of match[1].matchAll(shortcodeArgPattern)) {
        const key = argMatch[1] ?? argMatch[3];
        const raw = argMatch[2] ?? argMatch[4];
        if (key === "src") {
          references.push({ file, line: lineNumber, raw: raw.trim(), kind: "video:src" });
        }
      }
    }
  }

  return references;
}

function localBundleTarget(reference: MediaReference, bundleDir: string) {
  const [resourcePath] = splitResourceSuffix(normalize(reference.raw));

  if (resourcePath.startsWith("/") || resourcePath.startsWith("../")) {
    return undefined;
  }

  return path.normalize(path.join(bundleDir, resourcePath));
}

function staticAssetTarget(reference: MediaReference, staticImagesDir: string) {
  const [resourcePath] = splitResourceSuffix(normalize(reference.raw));
  const prefix = CONFIG.staticAssetPrefix;

  if (!resourcePath.startsWith(prefix)) {
    return undefined;
  }

  return path.join(staticImagesDir, "assets", resourcePath.slice(prefix.length));
}

async function checkPost(indexPath: string, options: Options, report: Report) {
  const bundleDir = path.dirname(indexPath);
  const text = await readFile(indexPath, "utf8");
  const references = extractReferences(indexPath, text);
  const referencedBundleFiles = new Set<string>();

  for (const reference of references) {
    const raw = normalize(reference.raw);
    const [resourcePath] = splitResourceSuffix(raw);

    if (isExternal(resourcePath)) {
      report.external.push(reference);
      continue;
    }

    if (resourcePath.startsWith("/images/assets/")) {
      const target = staticAssetTarget(reference, options.staticImagesDir);
      if (!target || !(await exists(target))) report.missing.push(reference);
      continue;
    }

    if (resourcePath.startsWith("/images/")) {
      report.legacy.push(reference);
      continue;
    }

    if (resourcePath.startsWith("../")) {
      report.crossPost.push(reference);
      continue;
    }

    if (resourcePath.startsWith("/")) {
      report.unsupportedAbsolute.push(reference);
      continue;
    }

    const target = localBundleTarget(reference, bundleDir);
    if (!target || !target.startsWith(bundleDir) || !(await exists(target))) {
      report.missing.push(reference);
      continue;
    }

    referencedBundleFiles.add(path.resolve(target));
  }

  for (const file of await listFiles(bundleDir)) {
    if (path.basename(file) === "index.md" || !bundleMediaExtensions.has(path.extname(file).toLowerCase())) {
      continue;
    }

    const fileName = path.basename(file);
    if (isBackupMediaName(fileName) || isOptimizedMediaName(fileName)) {
      continue;
    }

    if (!referencedBundleFiles.has(path.resolve(file))) {
      report.unused.push(file);
    }

    if (isMediaSourceFile(file)) {
      report.unoptimized.push(file);
    }
  }
}

function printReferences(title: string, references: MediaReference[]) {
  if (references.length === 0) return;

  console.log(`[${title}]`);
  for (const reference of references) {
    console.log(`- ${reference.file}:${reference.line} [${reference.kind}] ${reference.raw}`);
  }
  console.log();
}

function printReport(report: Report, strict: boolean) {
  printReferences("Missing", report.missing);
  printReferences("Legacy Static Post Images", report.legacy);
  printReferences("Cross-Post References", report.crossPost);
  printReferences("Unsupported Absolute References", report.unsupportedAbsolute);
  printReferences("External", report.external);

  if (report.unused.length > 0) {
    console.log("[Unused]");
    for (const file of report.unused) console.log(`- ${file}`);
    console.log();
  }

  if (report.unoptimized.length > 0) {
    console.log("[Unoptimized]");
    for (const file of report.unoptimized) console.log(`- ${file}`);
    console.log();
  }

  console.log(
    `Summary: ${report.missing.length} missing, ${report.legacy.length} legacy, ` +
      `${report.crossPost.length} cross-post, ${report.unsupportedAbsolute.length} unsupported, ` +
      `${report.unused.length} unused, ${report.unoptimized.length} unoptimized, ${report.external.length} external`,
  );

  if (strict && report.unused.length > 0) {
    console.log("Strict mode: unused media are treated as failures.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.contentDir))) {
    throw new Error(`Content directory not found: ${options.contentDir}`);
  }

  if (!(await isDirectory(options.staticImagesDir))) {
    throw new Error(`Static images directory not found: ${options.staticImagesDir}`);
  }

  const indexes = await collectPostIndexes(options.contentDir, options.post);

  if (options.post && indexes.length === 0) {
    throw new Error(`Post bundle not found: ${options.post}`);
  }

  const report: Report = {
    missing: [],
    unused: [],
    legacy: [],
    crossPost: [],
    external: [],
    unsupportedAbsolute: [],
    unoptimized: [],
  };

  for (const indexPath of indexes) {
    await checkPost(indexPath, options, report);
  }

  printReport(report, options.strict);

  const hasFailure =
    report.missing.length > 0 ||
    report.legacy.length > 0 ||
    report.crossPost.length > 0 ||
    report.unsupportedAbsolute.length > 0 ||
    report.unoptimized.length > 0 ||
    (options.strict && report.unused.length > 0);

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
