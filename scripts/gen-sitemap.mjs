// K-72 正式切換:sitemap 產生器。手寫而非 @astrojs/sitemap —— 12 個靜態 URL 不值得
// 在 9/20 前的相依凍結窗內新增依賴(K-41)。robots.txt 刻意不產:project page 只有
// 網域根的 robots.txt 有效,本 repo 管不到 ruyuang0509.github.io 根 —— sitemap 靠
// canonical+站內連結被發現,或由使用者提交 Search Console。
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://ruyuang0509.github.io/ruyuang-portfolio-next/";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
if (!existsSync(dist)) {
  console.error("gen-sitemap: dist/ missing — run after astro build");
  process.exit(1);
}

const urls = [];
function walk(dir, rel = "") {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p, rel + name + "/"); continue; }
    // index.html only: 404 stays out of the index, and so does the /design/ redirect stub
    // (K-35 — the prototype URL now forwards to the root; listing it would advertise a hop)
    if (name === "index.html" && rel !== "404/") urls.push(SITE + rel);
  }
}
walk(dist);
urls.sort();

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => "  <url><loc>" + u + "</loc></url>").join("\n") +
  "\n</urlset>\n";
writeFileSync(join(dist, "sitemap.xml"), xml, "utf8");
console.log("gen-sitemap: " + urls.length + " URLs -> dist/sitemap.xml");
