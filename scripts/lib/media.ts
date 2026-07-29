import path from "node:path";

export function backupPath(file: string, suffix: string): string {
  const extension = path.extname(file);
  return path.join(path.dirname(file), `${path.basename(file, extension)}${suffix}${extension}`);
}
