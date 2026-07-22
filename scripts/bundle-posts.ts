#!/usr/bin/env tsx

import { mkdir, readdir, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

type Move = {
  source: string;
  target: string;
};

type Rewrite = {
  file: string;
  before: string;
  after: string;
};

type Options = {
  all: boolean;
  post?: string;
  dryRun: boolean;
  force: boolean;
  postsDir: string;
  imagesDir: string;
};

type PlannedPost = {
  postPath: string;
  bundleIndexPath: string;
  imageDirPath?: string;
  slug: string;
};

const CONFIG = {
  postsDir: "content/posts",
  imagesDir: "static/images",
} as const;

class ChangeSet {
  moves: Move[] = [];
  rewrites: Rewrite[] = [];
  warnings: string[] = [];
  errors: string[] = [];
  private seenWarnings = new Set<string>();

  warn(message: string) {
    if (this.seenWarnings.has(message)) {
      return;
    }

    this.seenWarnings.add(message);
    this.warnings.push(message);
  }
}

const markdownImagePattern = /!\[[^\]]*]\(([^)]+)\)/g;
const themeImagePattern = /{{<\s*theme-image\b([^>]*)>}}/g;
const shortcodeArgPattern = /(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*'([^']*)'/g;

function normalize(value: string) {
  return value.normalize("NFC");
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    all: false,
    dryRun: false,
    force: false,
    postsDir: CONFIG.postsDir,
    imagesDir: CONFIG.imagesDir,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--all":
        options.all = true;
        break;
      case "--post":
        options.post = argv[++index];
        break;
      case "--dry-run":
      case "-n":
        options.dryRun = true;
        break;
      case "--force":
        options.force = true;
        break;
      case "--posts-dir":
        options.postsDir = argv[++index];
        break;
      case "--images-dir":
        options.imagesDir = argv[++index];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.all === Boolean(options.post)) {
    throw new Error("Pass exactly one target: --all or --post <slug>.");
  }

  if (options.post) {
    options.post = normalize(options.post);
  }

  return options;
}

function printHelp() {
  console.log(`Convert Hugo flat posts and static image folders into leaf bundles.

Usage:
  npm run posts:bundle -- --dry-run --post <slug>
  npm run posts:bundle -- --post <slug>
  npm run posts:bundle -- --dry-run --all
  npm run posts:bundle -- --all

Options:
  --all                 Bundle every flat post.
  --post <slug>         Bundle one post slug, without .md.
  --dry-run, -n         Show planned changes without writing files.
  --force               Overwrite existing targets.
  --posts-dir <path>    Posts directory. Default: content/posts
  --images-dir <path>   Static images directory. Default: static/images
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
  const files = await Promise.all(
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

  return files.flat().sort();
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

function relativeImagePath(raw: string, slug: string) {
  const [resourcePath, suffix] = splitResourceSuffix(normalize(raw.trim()));
  const prefix = `/images/${slug}/`;

  if (!resourcePath.startsWith(prefix)) {
    return undefined;
  }

  return resourcePath.slice(prefix.length) + suffix;
}

function warnCrossPostImage(raw: string, postPath: string, slug: string, changes: ChangeSet) {
  const [resourcePath] = splitResourceSuffix(normalize(raw.trim()));
  const ownPrefix = `/images/${slug}/`;

  if (!resourcePath.startsWith("/images/")) {
    return;
  }

  if (resourcePath.startsWith(ownPrefix) || resourcePath.startsWith("/images/assets/")) {
    return;
  }

  changes.warn(`Cross-post image reference left unchanged in ${postPath}: ${raw}`);
}

function rewritePostText(text: string, postPath: string, slug: string, changes: ChangeSet) {
  const withMarkdownImages = text.replace(markdownImagePattern, (match, raw: string) => {
    const replacement = relativeImagePath(raw, slug);

    if (!replacement) {
      warnCrossPostImage(raw, postPath, slug, changes);
      return match;
    }

    changes.rewrites.push({ file: postPath, before: raw, after: replacement });
    return match.replace(raw, replacement);
  });

  return withMarkdownImages.replace(themeImagePattern, (match, args: string) => {
    let rewritten = match;
    const argMatches = args.matchAll(shortcodeArgPattern);

    for (const argMatch of argMatches) {
      const raw = argMatch[2] ?? argMatch[4];
      const replacement = relativeImagePath(raw, slug);

      if (!replacement) {
        warnCrossPostImage(raw, postPath, slug, changes);
        continue;
      }

      changes.rewrites.push({ file: postPath, before: raw, after: replacement });
      rewritten = rewritten.replace(raw, replacement);
    }

    return rewritten;
  });
}

async function collectPostFiles(postsDir: string, selectedSlug?: string) {
  if (selectedSlug) {
    const postPath = path.join(postsDir, `${selectedSlug}.md`);
    return (await exists(postPath)) ? [postPath] : [];
  }

  const entries = await readdir(postsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "_index.md")
    .map((entry) => path.join(postsDir, entry.name))
    .sort();
}

async function validatePost(
  postPath: string,
  postsDir: string,
  imagesDir: string,
  force: boolean,
  changes: ChangeSet,
): Promise<PlannedPost | undefined> {
  const slug = normalize(path.basename(postPath, ".md"));
  const bundleDir = path.join(postsDir, slug);
  const bundleIndexPath = path.join(bundleDir, "index.md");
  const imageDirPath = path.join(imagesDir, slug);

  if ((await exists(bundleIndexPath)) && !force) {
    changes.errors.push(`Target already exists: ${bundleIndexPath}`);
    return undefined;
  }

  if ((await exists(bundleDir)) && !(await isDirectory(bundleDir))) {
    changes.errors.push(`Target path is not a directory: ${bundleDir}`);
    return undefined;
  }

  const hasImageDir = await isDirectory(imageDirPath);

  if (hasImageDir) {
    for (const source of await listFiles(imageDirPath)) {
      const relative = path.relative(imageDirPath, source);
      const target = path.join(bundleDir, relative);

      if ((await exists(target)) && !force) {
        changes.errors.push(`Image target already exists: ${target}`);
        return undefined;
      }
    }
  }

  return { postPath, bundleIndexPath, imageDirPath: hasImageDir ? imageDirPath : undefined, slug };
}

async function planChanges(options: Options): Promise<[ChangeSet, PlannedPost[]]> {
  const changes = new ChangeSet();
  const postFiles = await collectPostFiles(options.postsDir, options.post);

  if (options.post && postFiles.length === 0) {
    changes.errors.push(`Post not found: ${path.join(options.postsDir, `${options.post}.md`)}`);
    return [changes, []];
  }

  const planned: PlannedPost[] = [];

  for (const postPath of postFiles) {
    const post = await validatePost(postPath, options.postsDir, options.imagesDir, options.force, changes);

    if (!post) {
      continue;
    }

    changes.moves.push({ source: post.postPath, target: post.bundleIndexPath });

    if (post.imageDirPath) {
      for (const source of await listFiles(post.imageDirPath)) {
        changes.moves.push({
          source,
          target: path.join(path.dirname(post.bundleIndexPath), path.relative(post.imageDirPath, source)),
        });
      }
    }

    const text = await readFile(post.postPath, "utf8");
    rewritePostText(text, post.postPath, post.slug, changes);
    planned.push(post);
  }

  return [changes, planned];
}

function printPlan(changes: ChangeSet, dryRun: boolean) {
  console.log(`[${dryRun ? "DRY RUN" : "APPLY"}] bundle posts\n`);

  if (changes.moves.length > 0) {
    console.log("[Moves]");
    for (const move of changes.moves) {
      console.log(`- ${move.source} -> ${move.target}`);
    }
    console.log();
  }

  if (changes.rewrites.length > 0) {
    console.log("[Rewrites]");
    for (const rewrite of changes.rewrites) {
      console.log(`- ${rewrite.file}: ${rewrite.before} -> ${rewrite.after}`);
    }
    console.log();
  }

  if (changes.warnings.length > 0) {
    console.log("[Warnings]");
    for (const warning of changes.warnings) {
      console.log(`- ${warning}`);
    }
    console.log();
  }

  if (changes.errors.length > 0) {
    console.log("[Errors]");
    for (const error of changes.errors) {
      console.log(`- ${error}`);
    }
    console.log();
  }

  console.log(
    `Summary: ${changes.moves.length} move(s), ${changes.rewrites.length} rewrite(s), ` +
      `${changes.warnings.length} warning(s), ${changes.errors.length} error(s)`,
  );
}

async function applyChanges(planned: PlannedPost[], force: boolean) {
  for (const post of planned) {
    const text = await readFile(post.postPath, "utf8");
    const rewriteChanges = new ChangeSet();
    const rewritten = rewritePostText(text, post.postPath, post.slug, rewriteChanges);
    const bundleDir = path.dirname(post.bundleIndexPath);

    await mkdir(bundleDir, { recursive: true });

    if ((await exists(post.bundleIndexPath)) && force) {
      await unlink(post.bundleIndexPath);
    }

    await rename(post.postPath, post.bundleIndexPath);
    await writeFile(post.bundleIndexPath, rewritten, "utf8");

    if (!post.imageDirPath) {
      continue;
    }

    for (const source of await listFiles(post.imageDirPath)) {
      const target = path.join(bundleDir, path.relative(post.imageDirPath, source));
      await mkdir(path.dirname(target), { recursive: true });

      if ((await exists(target)) && force) {
        await unlink(target);
      }

      await rename(source, target);
    }

    await rm(post.imageDirPath, { recursive: true, force: true });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!(await isDirectory(options.postsDir))) {
    throw new Error(`Posts directory not found: ${options.postsDir}`);
  }

  if (!(await isDirectory(options.imagesDir))) {
    throw new Error(`Images directory not found: ${options.imagesDir}`);
  }

  const [changes, planned] = await planChanges(options);
  printPlan(changes, options.dryRun);

  if (changes.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (options.dryRun) {
    return;
  }

  await applyChanges(planned, options.force);
  console.log(`Bundled ${planned.length} post(s).`);
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
