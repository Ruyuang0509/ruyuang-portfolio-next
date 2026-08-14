import { fileURLToPath } from "node:url";
import { walkTextFiles, readLines, report } from "./lib.mjs";

// Generic by design: any drive-letter user-profile or Projects path is a
// leak, so the config never needs to contain a real username or real folder
// name (which would itself be the leak).
const PATTERNS = [
  /[A-Za-z]:[\\/]+Users[\\/]+[^\s"'<>]+/g,
  /[A-Za-z]:[\\/]+Projects[\\/]+[^\s"'<>]+/g,
  /[A-Za-z]:[\\/]+Softwares[\\/]+[^\s"'<>]+/g,
];

export function scanPaths(files) {
  const findings = [];
  for (const file of files) {
    readLines(file).forEach((text, i) => {
      for (const re of PATTERNS) {
        re.lastIndex = 0;
        const m = re.exec(text);
        if (m) findings.push({ file, line: i + 1, match: m[0].slice(0, 60) });
      }
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["."]);
  process.exit(report("check:paths", scanPaths(files)));
}
