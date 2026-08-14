import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { walkTextFiles, readLines, report } from "./lib.mjs";

export function scanMotion({ htmlFiles, cssFiles }) {
  const findings = [];
  for (const file of htmlFiles) {
    readLines(file).forEach((text, i) => {
      if (/<(video|audio)\b[^>]*\bautoplay\b/i.test(text)) {
        findings.push({ file, line: i + 1, reason: "autoplay is banned — sound/motion is opt-in" });
      }
    });
  }
  const cssBlob = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (!/prefers-reduced-motion/.test(cssBlob)) {
    findings.push({
      file: cssFiles[0] ?? "(no css found)",
      reason: "no prefers-reduced-motion handling — reduced motion must be the default state",
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = walkTextFiles(["dist"]).filter((f) => f.endsWith(".html"));
  const css = walkTextFiles(["dist", "src/styles"]).filter((f) => f.endsWith(".css"));
  process.exit(report("check:motion", scanMotion({ htmlFiles: html, cssFiles: css })));
}
