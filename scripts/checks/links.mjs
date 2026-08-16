import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { report } from "./lib.mjs";

// Site-local src/href in the BUILT output must resolve to a file that actually shipped.
// Shipped incident 2026-08-16 (K-35 migration, caught by review before deploy): the journey
// prototype's dev-only poster path `../../public/media/...` was rewritten in the engine but
// NOT in the markup, so the front page's only photograph resolved to /public/media/... —
// outside the deploy root entirely. Eight gates, 25 tests and a warning-free build all passed:
// nothing verified that a link points at something. This gate is that verification.
const BASE = "/ruyuang-portfolio-next";
const ATTR = /(?:src|href)="([^"]+)"/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function scanLinks(distDir, { base = BASE } = {}) {
  const findings = [];
  if (!existsSync(distDir)) {
    return [{ file: distDir, reason: "dist/ missing — build before running check:links" }];
  }
  const files = walk(distDir).filter((f) => f.endsWith(".html"));
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const pageDir = posix.dirname(file.replaceAll("\\", "/").slice(distDir.length).replace(/^\/?/, "/"));
    for (const [, raw] of html.matchAll(ATTR)) {
      const url = raw.trim();
      if (!url || url.startsWith("#") || url.startsWith("data:") || url.startsWith("mailto:")) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) continue; // external
      const [path] = url.split(/[?#]/);
      if (!path) continue;
      // absolute site paths must carry the base; relative ones resolve against the page
      const resolved = path.startsWith("/") ? path : posix.normalize(posix.join(pageDir, path));
      if (!resolved.startsWith(base + "/") && resolved !== base) {
        findings.push({ file, match: url, reason: `resolves to ${resolved}, outside the deploy base ${base}` });
        continue;
      }
      let target = join(distDir, resolved.slice(base.length));
      if (resolved.endsWith("/")) target = join(target, "index.html");
      if (!existsSync(target)) {
        findings.push({ file, match: url, reason: `no such file in dist: ${resolved}` });
      }
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = process.argv[2] ?? "dist";
  process.exit(report("check:links", scanLinks(dist)));
}
