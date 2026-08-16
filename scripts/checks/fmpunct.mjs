import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { walkTextFiles, report } from "./lib.mjs";

// A full-width comma inside YAML *flow syntax* ([...] sequences, {...} mappings) is not a
// separator — the parser silently merges what were separate items into one scalar.
// Shipped incident 2026-08-16 (found by the K-67 dossier audit): the K-64 punctuation
// conversion turned `tags: [互動音訊, 訊號處理]` into `[互動音訊， 訊號處理]` on 7 of 9 works
// files — schema still passed (an array of ONE string is an array), pages rendered one
// merged tag. Same failure class as csspunct, one layer up. Quoted strings are exempt:
// `["…僅存本地，永不入 repo"]` is one item that legitimately contains 全形逗號.
const FW_COMMA = "，";

function outsideQuotes(line) {
  // blank out double-quoted spans so their content is never scanned
  return line.replace(/"[^"]*"/g, (m) => " ".repeat(m.length));
}

export function scanFmPunct(files) {
  const findings = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const src = readFileSync(file, "utf8");
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    m[1].split("\n").forEach((line, i) => {
      const bare = outsideQuotes(line);
      // flow context on this line = any [...] or {...} span; scan only inside those spans
      for (const span of bare.matchAll(/\[[^\]]*\]|\{[^}]*\}/g)) {
        if (span[0].includes(FW_COMMA)) {
          findings.push({
            file, line: i + 2,
            match: "full-width comma in YAML flow syntax (outside quotes)",
            reason: "parser merges items silently — quote the item or use a half-width separator (K-64 tags incident)",
          });
        }
      }
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["src/content"]);
  process.exit(report("check:fmpunct", scanFmPunct(files)));
}
