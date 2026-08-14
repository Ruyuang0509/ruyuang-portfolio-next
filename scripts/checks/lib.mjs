import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const TEXT_EXTS = new Set([
  ".astro", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".css", ".html", ".json",
  ".md", ".mdx", ".yml", ".yaml", ".svg", ".txt", ".xml", ".webmanifest",
]);
const DEFAULT_EXCLUDES = new Set(["node_modules", ".git", ".astro"]);

export function walkTextFiles(roots, { excludeDirs = [] } = {}) {
  const skip = new Set([...DEFAULT_EXCLUDES, ...excludeDirs]);
  const out = [];
  const visit = (dir) => {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const name of entries) {
      if (skip.has(name)) continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) visit(p);
      else if (TEXT_EXTS.has(extname(name).toLowerCase())) out.push(p);
    }
  };
  for (const r of roots) visit(r);
  return out;
}

export function readLines(file) {
  return readFileSync(file, "utf8").split(/\r?\n/);
}

export function report(name, findings) {
  if (findings.length === 0) {
    console.log(`${name}: PASS`);
    return 0;
  }
  for (const f of findings) {
    console.error(`${name}: ${f.file}:${f.line ?? "?"} — ${f.match ?? f.reason}`);
  }
  console.error(`${name}: FAIL (${findings.length} finding(s))`);
  return 1;
}
