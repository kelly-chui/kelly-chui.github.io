import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("find", ["content", "-type", "f", "-name", "*.md"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

const offenders: string[] = [];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  let insideCodeBlock = false;
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      insideCodeBlock = !insideCodeBlock;
    } else if (insideCodeBlock && line.includes("\t")) {
      offenders.push(`${file}:${index + 1}`);
    }
  });
}

if (offenders.length) {
  console.error("Tab indentation found in Markdown code blocks:");
  offenders.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Code indentation check passed.");
