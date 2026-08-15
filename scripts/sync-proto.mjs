// Deploys the journey prototype onto the -next PREVIEW site so the phone
// five-item checklist (Round E, user-executed) has a reachable URL — the
// previous checklist pointed at docs/design/, which never enters dist.
// Single source of truth stays docs/design/; this copy is generated at
// prebuild and never edited by hand. noindex is injected because the preview
// must not be indexable (Pages sends no X-Robots-Tag; meta is the only lever).
// [R3 K-40]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "docs", "design", "journey-proto-1.html");
const out = join(root, "public", "design", "journey-proto-1.html");

const anchor = '<meta name="viewport" content="width=device-width, initial-scale=1" />';
const html = readFileSync(src, "utf8");
if (!html.includes(anchor)) {
  console.error("sync-proto: viewport anchor not found in prototype — refusing to emit without noindex");
  process.exit(1);
}
const stamped = html.replace(
  anchor,
  anchor + '\n<meta name="robots" content="noindex" /><!-- generated copy for preview-phone testing; source of truth: docs/design/ -->'
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, stamped, "utf8");
console.log("sync-proto: docs/design/journey-proto-1.html -> public/design/ (noindex injected)");
