import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { walkTextFiles, readLines, report } from "./lib.mjs";

export function scanWording(files, rules) {
  const findings = [];
  for (const file of files) {
    const applicable = rules.filter((r) => !r.scope || file.includes(r.scope) ||
      file.includes(r.scope.replaceAll("/", "\\")));
    if (applicable.length === 0) continue;
    readLines(file).forEach((text, i) => {
      for (const r of applicable) {
        if (new RegExp(r.pattern, r.flags ?? "u").test(text)) {
          findings.push({ file, line: i + 1, match: r.pattern, reason: r.reason });
        }
      }
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const rules = JSON.parse(readFileSync(join(here, "wording-rules.json"), "utf8"));
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["src", "dist"]);
  process.exit(report("check:wording", scanWording(files, rules)));
}
