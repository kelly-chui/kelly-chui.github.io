import path from "node:path";

export function backupPath(file: string, suffix: string): string {
  const extension = path.extname(file);
  return path.join(path.dirname(file), `${path.basename(file, extension)}${suffix}${extension}`);
}

export const CONTENT_ROOT = "content";

export type MediaPolicy = {
  sourceExtensions: Set<string>;
  optimizedSuffix: string;
  backupSuffix: string;
};

export const DEFAULT_MEDIA_POLICY: MediaPolicy = {
  sourceExtensions: new Set([".png", ".jpg", ".jpeg", ".webp"]),
  optimizedSuffix: "-optimized-image",
  backupSuffix: "-original-image",
};

export const VIDEO_MEDIA_POLICY: MediaPolicy = {
  sourceExtensions: new Set([".mov"]),
  optimizedSuffix: "-optimized-video",
  backupSuffix: "-original-video",
};

export function isMediaSourceFile(filePath: string, policy: MediaPolicy = DEFAULT_MEDIA_POLICY) {
  return policy.sourceExtensions.has(path.extname(filePath).toLowerCase());
}

export function isOptimizedMediaName(fileName: string, policy: MediaPolicy = DEFAULT_MEDIA_POLICY) {
  return fileName.includes(policy.optimizedSuffix);
}

export function isBackupMediaName(fileName: string, policy: MediaPolicy = DEFAULT_MEDIA_POLICY) {
  return fileName.includes(policy.backupSuffix);
}
