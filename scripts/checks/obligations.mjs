import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { report } from "./lib.mjs";

// Obligations are enforced against the BUILT output, not against intentions.
export function checkObligations(contentDir, distDir) {
  const findings = [];
  let files = [];
  try { files = readdirSync(contentDir).filter((f) => f.endsWith(".md")); } catch { return findings; }
  for (const f of files) {
    const p = join(contentDir, f);
    const raw = readFileSync(p, "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    let data;
    try { data = parse(m[1]); } catch { continue; }
    const obligations = data.obligations ?? [];
    if (obligations.length === 0) continue;
    const slug = basename(f, ".md");
    const page = join(distDir, "work", slug, "index.html");
    if (!existsSync(page)) {
      if (data.tier === "featured") {
        findings.push({ file: p, reason: `obligated entry has no built page at work/${slug}/ — build before checking` });
      }
      continue;
    }
    const html = readFileSync(page, "utf8");
    if (obligations.includes("suno-attribution") && !html.includes("Suno")) {
      findings.push({ file: page, reason: "suno-attribution obligation: built page carries no Suno credit" });
    }
    if (obligations.includes("no-monetization") && !html.includes("無廣告")) {
      findings.push({ file: page, reason: "no-monetization obligation: built page carries no 無廣告 statement" });
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = checkObligations(process.argv[2] ?? "src/content/works", process.argv[3] ?? "dist");
  process.exit(report("check:obligations", findings));
}
