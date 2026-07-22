#!/usr/bin/env tsx

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

type Options = {
  post?: string;
  strict: boolean;
  postsDir: string;
  staticImagesDir: string;
};

type ReferenceKind = "markdown" | `theme-image:${string}`;

type ImageReference = {
  file: string;
  line: number;
  raw: string;
  kind: ReferenceKind;
};

type Report = {
  missing: ImageReference[];
  unused: string[];
  legacy: ImageReference[];
  crossPost: ImageReference[];
  external: ImageReference[];
  unsupportedAbsolute: ImageReference[];
};

const CONFIG = {
  postsDir: "content/posts",
  staticImagesDir: "static/images",
  imageExtensions: [".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"],
  staticAssetPrefix: "/images/assets/",
} as const;

const markdownImagePattern = /!\[[^\]]*]\(([^)]+)\)/g;
const themeImagePattern = /{{<\s*theme-image\b([^>]*)>}}/g;
const shortcodeArgPattern = /(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*'([^']*)'/g;
const imageExtensions = new Set<string>(CONFIG.imageExtensions);

function normalize(value: string) {
  return value.normalize("NFC");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    strict: false,
    postsDir: CONFIG.postsDir,
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
      case "--posts-dir":
        options.postsDir = argv[++index];
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

function printHelp() {
  console.log(`Check image references for Hugo post page bundles.

Usage:
  npm run posts:check-images
  npm run posts:check-images -- --strict
  npm run posts:check-images -- --post <slug>

Options:
  --post <slug>                Check one post bundle.
  --strict                     Fail on unused bundle images too.
  --posts-dir <path>           Posts directory. Default: content/posts
  --static-images-dir <path>   Static images directory. Default: static/images
`);
}

async function exists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
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

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);

      if (entry.isDirectory()) {
        return listFiles(entryPath);
      }

      if (entry.isFile() && entry.name !== ".DS_Store") {
        return [entryPath];
      }

      return [];
    }),
  );

  return nested.flat().sort();
}

async function collectPostIndexes(postsDir: string, selectedSlug?: string) {
  if (selectedSlug) {
    const indexPath = path.join(postsDir, selectedSlug, "index.md");
    return (await exists(indexPath)) ? [indexPath] : [];
  }

  const entries = await readdir(postsDir, { withFileTypes: true });
  const indexes = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const indexPath = path.join(postsDir, entry.name, "index.md");
        return (await exists(indexPath)) ? [indexPath] : [];
      }),
  );

  return indexes.flat().sort();
}

function splitResourceSuffix(raw: string): [string, string] {
  const hashIndex = raw.indexOf("#");
  const queryIndex = raw.indexOf("?");
  const suffixIndexes = [hashIndex, queryIndex].filter((index) => index !== -1);

  if (suffixIndexes.length === 0) {
    return [raw, ""];
  }

  const suffixIndex = Math.min(...suffixIndexes);
  return [raw.slice(0, suffixIndex), raw.slice(suffixIndex)];
}

function isExternal(raw: string) {
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("data:");
}

function isImageFile(filePath: string) {
  return imageExtensions.has(path.extname(filePath).toLowerCase());
}

function extractReferences(file: string, text: string): ImageReference[] {
  const references: ImageReference[] = [];

  for (const [lineIndex, line] of text.split("\n").entries()) {
    const lineNumber = lineIndex + 1;

    for (const match of line.matchAll(markdownImagePattern)) {
      references.push({
        file,
        line: lineNumber,
        raw: match[1].trim(),
        kind: "markdown",
      });
    }

    for (const match of line.matchAll(themeImagePattern)) {
      for (const argMatch of match[1].matchAll(shortcodeArgPattern)) {
        const key = argMatch[1] ?? argMatch[3];
        const raw = argMatch[2] ?? argMatch[4];

        if (["light", "dark", "src", "image"].includes(key)) {
          references.push({
            file,
            line: lineNumber,
            raw: raw.trim(),
            kind: `theme-image:${key}`,
          });
        }
      }
    }
  }

  return references;
}

function localBundleTarget(reference: ImageReference, bundleDir: string) {
  const [resourcePath] = splitResourceSuffix(normalize(reference.raw));

  if (resourcePath.startsWith("/") || resourcePath.startsWith("../")) {
    return undefined;
  }

  return path.normalize(path.join(bundleDir, resourcePath));
}

function staticAssetTarget(reference: ImageReference, staticImagesDir: string) {
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

      if (!target || !(await exists(target))) {
        report.missing.push(reference);
      }

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
    if (path.basename(file) === "index.md" || !isImageFile(file)) {
      continue;
    }

    if (!referencedBundleFiles.has(path.resolve(file))) {
      report.unused.push(file);
    }
  }
}

function printReferences(title: string, references: ImageReference[]) {
  if (references.length === 0) {
    return;
  }

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
    for (const file of report.unused) {
      console.log(`- ${file}`);
    }
    console.log();
  }

  console.log(
    `Summary: ${report.missing.length} missing, ${report.legacy.length} legacy, ` +
      `${report.crossPost.length} cross-post, ${report.unsupportedAbsolute.length} unsupported, ` +
      `${report.unused.length} unused, ${report.external.length} external`,
  );

  if (strict && report.unused.length > 0) {
    console.log("Strict mode: unused images are treated as failures.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.postsDir))) {
    throw new Error(`Posts directory not found: ${options.postsDir}`);
  }

  if (!(await isDirectory(options.staticImagesDir))) {
    throw new Error(`Static images directory not found: ${options.staticImagesDir}`);
  }

  const indexes = await collectPostIndexes(options.postsDir, options.post);

  if (options.post && indexes.length === 0) {
    throw new Error(`Post bundle not found: ${path.join(options.postsDir, options.post, "index.md")}`);
  }

  const report: Report = {
    missing: [],
    unused: [],
    legacy: [],
    crossPost: [],
    external: [],
    unsupportedAbsolute: [],
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
    (options.strict && report.unused.length > 0);

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
