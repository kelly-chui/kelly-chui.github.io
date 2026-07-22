#!/usr/bin/env tsx

import { readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type Options = {
  dryRun: boolean;
  deleteOriginals: boolean;
  force: boolean;
  post?: string;
  quality: number;
  maxWidth: number;
};

const CONFIG = {
  postsDir: "content/posts",
  maxWidth: 1260,
  webpQuality: 85,
  sourceExtensions: [".png", ".jpg", ".jpeg", ".webp"],
  backupSuffix: "-original-image",
  optimizedSuffix: "-optimized-image",
} as const;

const sourceExtensions = new Set<string>(CONFIG.sourceExtensions);
const backupSuffix = CONFIG.backupSuffix;
const optimizedSuffix = CONFIG.optimizedSuffix;

function parseArgs(argv: string[]): Options {
  const options: Options = { dryRun: false, deleteOriginals: false, force: false, quality: CONFIG.webpQuality, maxWidth: CONFIG.maxWidth };
  for (let i = 0; i < argv.length; i += 1) {
    switch (argv[i]) {
      case "--dry-run": case "-n": options.dryRun = true; break;
      case "--delete-originals": options.deleteOriginals = true; break;
      case "--force": options.force = true; break;
      case "--post": options.post = argv[++i]; break;
      case "--quality": options.quality = Number(argv[++i]); break;
      case "--max-width": options.maxWidth = Number(argv[++i]); break;
      case "--help": case "-h": printHelp(); process.exit(0);
      default: throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) throw new Error("--quality must be an integer from 1 to 100.");
  if (!Number.isInteger(options.maxWidth) || options.maxWidth < 1) throw new Error("--max-width must be a positive integer.");
  return options;
}

function printHelp() {
  console.log(`Optimize post images as WebP.\n\nUsage:\n  npm run images:optimize -- --dry-run\n  npm run images:optimize -- --post <slug>\n\nOptions:\n  --dry-run, -n          Show planned changes without writing files.\n  --post <slug>         Process one post bundle.\n  --delete-originals    Delete originals instead of renaming them.\n  --force               Re-encode existing WebP files.\n  --quality <number>    WebP quality. Default: 85.\n  --max-width <number>  Maximum width. Default: 1260.`);
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(file);
    return entry.isFile() ? [file] : [];
  }));
  return files.flat().sort();
}

async function exists(file: string) {
  try { await stat(file); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unit = -1;
  do {
    value /= 1024;
    unit += 1;
  } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unit]}`;
}

function backupPath(file: string) {
  const extension = path.extname(file);
  return path.join(path.dirname(file), `${path.basename(file, extension)}${backupSuffix}${extension}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const postsRoot = path.resolve(CONFIG.postsDir);
  const files = await listFiles(postsRoot);
  const selected = options.post ? path.join(postsRoot, options.post) : undefined;
  const targets = files.filter((file) => {
    if (selected && !file.startsWith(`${selected}${path.sep}`)) return false;
    const name = path.basename(file);
    return (
      sourceExtensions.has(path.extname(file).toLowerCase()) &&
      !name.includes(backupSuffix) &&
      !name.includes(optimizedSuffix)
    );
  });
  let converted = 0;
  let totalOriginalBytes = 0;
  let totalOutputBytes = 0;
  for (const source of targets) {
    const metadata = await sharp(source).metadata();
    const width = metadata.width ?? 0;
    if (path.basename(source).includes(optimizedSuffix)) {
      console.log(`[skip] ${source}`);
      continue;
    }
    const output = `${source.slice(0, -path.extname(source).length)}${optimizedSuffix}.webp`;
    const backup = backupPath(source);
    if (!options.dryRun && !options.deleteOriginals && await exists(backup)) throw new Error(`Backup already exists: ${backup}`);
    console.log(`[convert] ${source} (${width || "?"}px) -> ${output}`);
    if (options.dryRun) { converted += 1; continue; }
    const originalBytes = (await stat(source)).size;
    const pipeline = sharp(source).rotate().resize({ width: options.maxWidth, withoutEnlargement: true }).webp({ quality: options.quality });
    await pipeline.toFile(output);
    if (options.deleteOriginals) {
      await unlink(source);
    } else {
      await rename(source, backup);
    }
    if (!options.deleteOriginals && !(await exists(backup))) {
      throw new Error(`Original image backup was not created: ${backup}`);
    }
    if (!(await exists(output))) {
      throw new Error(`Optimized image was not created: ${output}`);
    }
    const index = path.join(path.dirname(source), "index.md");
    if (await exists(index)) {
      const text = await readFile(index, "utf8");
      const updated = text.replaceAll(path.basename(source), path.basename(output));
      if (updated !== text) await writeFile(index, updated);
    }
    const outputBytes = (await stat(output)).size;
    const savedBytes = originalBytes - outputBytes;
    const savedPercent = originalBytes === 0 ? 0 : (savedBytes / originalBytes) * 100;
    totalOriginalBytes += originalBytes;
    totalOutputBytes += outputBytes;
    console.log(`  ${formatBytes(originalBytes)} -> ${formatBytes(outputBytes)} (${savedBytes >= 0 ? "saved" : "increased"} ${formatBytes(Math.abs(savedBytes))}, ${Math.abs(savedPercent).toFixed(1)}%)`);
    converted += 1;
  }
  console.log(`${options.dryRun ? "Would process" : "Processed"} ${converted} image(s).`);
  if (!options.dryRun && converted > 0) {
    const totalSaved = totalOriginalBytes - totalOutputBytes;
    const totalPercent = totalOriginalBytes === 0 ? 0 : (totalSaved / totalOriginalBytes) * 100;
    console.log(`Total: ${formatBytes(totalOriginalBytes)} -> ${formatBytes(totalOutputBytes)} (${totalSaved >= 0 ? "saved" : "increased"} ${formatBytes(Math.abs(totalSaved))}, ${Math.abs(totalPercent).toFixed(1)}%)`);
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
