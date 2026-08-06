import { readdir, stat } from "node:fs/promises";
import path from "node:path";

type ListFilesOptions = {
  recursive?: boolean;
  include?: (filePath: string, relativePath: string) => boolean;
  skip?: (relativePath: string) => boolean;
};

export async function exists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function isDirectory(targetPath: string): Promise<boolean> {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function listFiles(root: string, options: ListFilesOptions = {}): Promise<string[]> {
  const { recursive = true, include, skip } = options;
  return listFilesFromRoot(root, root, { recursive, include, skip });
}

async function listFilesFromRoot(currentRoot: string, baseDir: string, options: ListFilesOptions): Promise<string[]> {
  const { recursive = true, include, skip } = options;
  const entries = await readdir(currentRoot, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(currentRoot, entry.name);
    const relativePath = path.relative(baseDir, entryPath);

    if (skip?.(relativePath)) return [];
    if (entry.isDirectory()) return recursive ? listFilesFromRoot(entryPath, baseDir, { recursive, include, skip }) : [];
    if (entry.isFile() && entry.name !== ".DS_Store" && (!include || include(entryPath, relativePath))) return [entryPath];
    return [];
  }));
  return nested.flat().sort();
}
