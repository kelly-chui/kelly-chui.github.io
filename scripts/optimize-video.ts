#!/usr/bin/env tsx

import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

type Options = {
  dryRun: boolean;
  deleteOriginals: boolean;
  force: boolean;
  keepVfr: boolean;
  recursive: boolean;
  input: string;
  outputDir?: string;
  post?: string;
  crf: number;
  preset: string;
  fps: number;
};

const CONFIG = {
  postsDir: "content/posts",
  defaultCrf: 23,
  defaultPreset: "medium",
  defaultFps: 30,
  sourceExtension: ".mov",
  outputExtension: ".mp4",
  backupSuffix: "-original-video",
  optimizedSuffix: "-optimized-video",
  audioCodec: "aac",
  videoCodec: "libx264",
} as const;

const sourceExtension = CONFIG.sourceExtension;
const backupSuffix = CONFIG.backupSuffix;
const optimizedSuffix = CONFIG.optimizedSuffix;

function parseArgs(argv: string[]): Options {
  const options: Options = {
    dryRun: false,
    deleteOriginals: false,
    force: false,
    keepVfr: false,
    recursive: true,
    input: CONFIG.postsDir,
    crf: CONFIG.defaultCrf,
    preset: CONFIG.defaultPreset,
    fps: CONFIG.defaultFps,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--dry-run":
      case "-n":
        options.dryRun = true;
        break;
      case "--force":
        options.force = true;
        break;
      case "--delete-originals":
        options.deleteOriginals = true;
        break;
      case "--keep-vfr":
        options.keepVfr = true;
        break;
      case "--recursive":
      case "-r":
        options.recursive = true;
        break;
      case "--input":
      case "-i":
        options.input = argv[++index];
        break;
      case "--output-dir":
      case "-o":
        options.outputDir = argv[++index];
        break;
      case "--post":
        options.post = argv[++index];
        options.input = path.join(CONFIG.postsDir, options.post);
        options.recursive = true;
        break;
      case "--crf":
        options.crf = Number(argv[++index]);
        break;
      case "--preset":
        options.preset = argv[++index];
        break;
      case "--fps":
        options.fps = Number(argv[++index]);
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.input) {
    throw new Error("--input is required.");
  }

  if (!Number.isInteger(options.crf) || options.crf < 0 || options.crf > 51) {
    throw new Error("--crf must be an integer from 0 to 51.");
  }

  if (!Number.isInteger(options.fps) || options.fps < 1) {
    throw new Error("--fps must be a positive integer.");
  }

  return options;
}

function printHelp() {
  console.log(`Optimize MOV files as MP4 with ffmpeg.

Usage:
  npm run optimize:video -- --dry-run
  npm run optimize:video -- --post <slug>
  npm run optimize:video -- --input <path>

Options:
  --input <path>        Input file or directory. Default: content/posts
  --post <slug>         Process one post bundle.
  --output-dir <path>   Write outputs under this directory.
  --recursive, -r       Scan subdirectories when input is a directory. Default for content/posts.
  --dry-run, -n         Show planned changes without writing files.
  --delete-originals    Delete originals instead of renaming them.
  --force               Overwrite existing outputs.
  --keep-vfr            Preserve variable frame rate instead of forcing CFR.
  --crf <number>        H.264 quality. Default: 23.
  --preset <name>       ffmpeg preset. Default: medium.
  --fps <number>        Target FPS when forcing CFR. Default: 30.
`);
}

function buildOutputPath(source: string, inputRoot: string, outputDir?: string) {
  const relative = path.relative(inputRoot, source);
  const relativeDir = path.dirname(relative);
  const baseName = `${path.basename(source, path.extname(source))}${optimizedSuffix}${CONFIG.outputExtension}`;

  if (outputDir) {
    return path.join(outputDir, relativeDir === "." ? "" : relativeDir, baseName);
  }

  return path.join(path.dirname(source), baseName);
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

async function listFiles(root: string, recursive: boolean): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);

      if (entry.isDirectory()) {
        return recursive ? listFiles(entryPath, true) : [];
      }

      if (entry.isFile() && entry.name !== ".DS_Store") {
        return [entryPath];
      }

      return [];
    }),
  );

  return nested.flat().sort();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

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

function formatSavings(originalBytes: number, outputBytes: number) {
  const savedBytes = originalBytes - outputBytes;
  const savedPercent = originalBytes === 0 ? 0 : (savedBytes / originalBytes) * 100;

  return `${formatBytes(originalBytes)} -> ${formatBytes(outputBytes)} (${savedBytes >= 0 ? "saved" : "increased"} ${formatBytes(Math.abs(savedBytes))}, ${Math.abs(savedPercent).toFixed(1)}%)`;
}

async function updateMarkdownReference(source: string, output: string) {
  const index = path.join(path.dirname(source), "index.md");

  if (!(await exists(index))) {
    return;
  }

  const sourceName = path.basename(source);
  const outputName = path.basename(output);
  const text = await readFile(index, "utf8");
  const updated = text.replaceAll(sourceName, outputName);

  if (updated !== text) {
    await writeFile(index, updated);
  }
}

function buildFfmpegArgs(source: string, output: string, options: Options) {
  const args = [
    "-hide_banner",
    "-y",
    "-i",
    source,
    "-c:v",
    CONFIG.videoCodec,
    "-crf",
    String(options.crf),
    "-preset",
    options.preset,
    "-c:a",
    CONFIG.audioCodec,
    "-movflags",
    "+faststart",
  ];

  if (options.keepVfr) {
    args.push("-fps_mode", "passthrough");
  } else {
    args.push("-vf", `fps=${options.fps}`);
  }

  args.push(output);
  return args;
}

function runFfmpeg(args: string[]) {
  const executable = ffmpegPath;

  if (!executable) {
    throw new Error("ffmpeg-static did not provide an ffmpeg binary for this platform.");
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, { stdio: "inherit" });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(options.input);

  if (!(await exists(inputPath))) {
    throw new Error(`Input path not found: ${inputPath}`);
  }

  const inputIsDirectory = await isDirectory(inputPath);
  const sourceFiles = inputIsDirectory ? await listFiles(inputPath, options.recursive) : [inputPath];
  const targets = sourceFiles.filter((file) => {
    const name = path.basename(file);
    return (
      path.extname(file).toLowerCase() === sourceExtension &&
      !name.includes(backupSuffix) &&
      !name.includes(optimizedSuffix)
    );
  });

  if (targets.length === 0) {
    console.log("No MOV files found.");
    return;
  }

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let totalOriginalBytes = 0;
  let totalOutputBytes = 0;

  for (const source of targets) {
    const output = buildOutputPath(source, inputIsDirectory ? inputPath : path.dirname(source), options.outputDir);
    const outputDir = path.dirname(output);
    const backup = backupPath(source);

    if (!options.force && await exists(output)) {
      console.log(`[skip] ${source} -> ${output} (exists)`);
      skipped += 1;
      continue;
    }

    if (!options.force && await exists(backup)) {
      console.log(`[skip] ${source} -> ${output} (original backup exists)`);
      skipped += 1;
      continue;
    }

    const originalBytes = (await stat(source)).size;
    console.log(`[convert] ${source} -> ${output}`);

    if (options.dryRun) {
      converted += 1;
      continue;
    }

    await mkdir(outputDir, { recursive: true });

    try {
      await runFfmpeg(buildFfmpegArgs(source, output, options));
      if (options.deleteOriginals) {
        await unlink(source);
      } else {
        await rename(source, backup);
      }
      if (!options.deleteOriginals && !(await exists(backup))) {
        throw new Error(`Original video backup was not created: ${backup}`);
      }
      if (!(await exists(output))) {
        throw new Error(`Optimized video was not created: ${output}`);
      }
      if (!options.outputDir) {
        await updateMarkdownReference(source, output);
      }
      const outputBytes = (await stat(output)).size;
      totalOriginalBytes += originalBytes;
      totalOutputBytes += outputBytes;

      console.log(`  ${formatSavings(originalBytes, outputBytes)}`);
      converted += 1;
    } catch (error) {
      failed += 1;
      console.error(`[error] ${source}`);
      console.error(error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`${options.dryRun ? "Would process" : "Processed"} ${converted} video(s).`);
  if (!options.dryRun && converted > 0) {
    console.log(`Total: ${formatSavings(totalOriginalBytes, totalOutputBytes)}`);
  }

  if (skipped > 0 || failed > 0) {
    console.log(`Summary: ${skipped} skipped, ${failed} failed.`);
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
