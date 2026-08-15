import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { walkTextFiles, report } from "./lib.mjs";

// Full-width punctuation (，：；) inside CSS *code* silently invalidates the whole
// declaration — no build error, no console error, the layer just never renders.
// Shipped incident 2026-08-16: a copy-level punctuation conversion caught eight CSS
// values via a `)`-adjacent regex class; the scroll-progress filament and the whole
// scene-light layer were invisible from e0fa4d2 until a critique agent read the file
// byte by byte. Comments are exempt (full-width is fine prose there).
const FULLWIDTH = /[，：；]/;

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

export function scanCssPunct(files) {
  const findings = [];
  for (const file of files) {
    let blocks = [];
    if (file.endsWith(".css")) {
      blocks = [{ css: readFileSync(file, "utf8"), offset: 0 }];
    } else if (file.endsWith(".html") || file.endsWith(".astro")) {
      const src = readFileSync(file, "utf8");
      const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        const before = src.slice(0, m.index + m[0].indexOf(m[1]));
        blocks.push({ css: m[1], offset: before.split("\n").length - 1 });
      }
    }
    for (const { css, offset } of blocks) {
      stripComments(css).split("\n").forEach((line, i) => {
        if (FULLWIDTH.test(line)) {
          findings.push({
            file, line: offset + i + 1,
            match: "full-width punctuation in CSS code",
            reason: "invalidates the whole declaration silently (see 2026-08-16 filament incident)",
          });
        }
      });
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["src", "docs/design"]);
  process.exit(report("check:csspunct", scanCssPunct(files)));
}
