import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { report } from "./lib.mjs";

// Approval is human-only; absence is not permission (vault evidence rule).
export function checkApproval(dir) {
  const findings = [];
  let files = [];
  try { files = readdirSync(dir).filter((f) => f.endsWith(".md")); } catch { return findings; }
  for (const f of files) {
    const p = join(dir, f);
    const raw = readFileSync(p, "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) { findings.push({ file: p, reason: "entry has no frontmatter" }); continue; }
    let data;
    try { data = parse(m[1]); } catch (e) {
      findings.push({ file: p, reason: `frontmatter parse error: ${e.message}` }); continue;
    }
    if (data.thirdParty === true) {
      const a = data.approval;
      const ok = a && a.by && a.date && a.scope && a.evidence;
      if (!ok) findings.push({ file: p, reason: "thirdParty entry lacks complete approval {by,date,scope,evidence} — approval is human-only, absence is not permission" });
    }
    if (!data.aiDisclosure || String(data.aiDisclosure).trim().length < 8) {
      findings.push({ file: p, reason: "aiDisclosure is required on every entry" });
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(report("check:approval", checkApproval(process.argv[2] ?? "src/content/works")));
}
