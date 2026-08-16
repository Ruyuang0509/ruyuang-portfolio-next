// Deploys the journey prototype onto the -next site. Single source of truth
// stays docs/design/; this copy is generated at prebuild and never edited by
// hand. K-72 formal switch (user ruling 2026-08-16): the -next URL IS the
// official URL — noindex injection retired; canonical + OG + site icon are
// injected instead, so docs/design stays environment-neutral. [R3 K-40→K-72]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "docs", "design", "journey-proto-1.html");
const out = join(root, "public", "design", "journey-proto-1.html");

const CANONICAL = "https://ruyuang0509.github.io/ruyuang-portfolio-next/design/journey-proto-1.html";
const anchor = '<meta name="viewport" content="width=device-width, initial-scale=1" />';
const html = readFileSync(src, "utf8");
if (!html.includes(anchor)) {
  console.error("sync-proto: viewport anchor not found in prototype — refusing to emit without canonical/icon injection");
  process.exit(1);
}
const inject = [
  anchor,
  '<!-- generated copy; source of truth: docs/design/ — head additions injected by sync-proto [K-72] -->',
  '<link rel="canonical" href="' + CANONICAL + '" />',
  '<meta property="og:title" content="如願 — 訊號的旅程" />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:url" content="' + CANONICAL + '" />',
  '<meta property="og:site_name" content="如願 — 訊號的旅程" />',
  '<meta property="og:locale" content="zh_TW" />',
  '<link rel="icon" href="../favicon.svg" type="image/svg+xml" />',
  '<link rel="icon" href="../favicon-32.png" type="image/png" sizes="32x32" />',
  '<link rel="apple-touch-icon" href="../apple-touch-icon.png" />',
].join("\n");
const stamped = html.replace(anchor, inject);
mkdirSync(dirname(out), { recursive: true });
// docs/design/ references ../../public/media (repo-root dev server); the deployed copy at
// /design/ must reach the same files at ../media (Astro copies public/* into the dist root).
// User-reported: the Hamlet poster 404'd on the deployed prototype.
const rewritten = stamped.replaceAll("../../public/", "../");
if (rewritten === stamped && stamped.includes("../../public/")) {
  console.error("sync-proto: media path rewrite no-oped — refusing");
  process.exit(1);
}
writeFileSync(out, rewritten, "utf8");
console.log("sync-proto: docs/design/journey-proto-1.html -> public/design/ (canonical+OG+icon injected)");
