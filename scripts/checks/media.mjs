import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import { report } from "./lib.mjs";

const RESTRICTED_EXTS = new Set([
  ".pbix", ".eml", ".clip", ".xlsx", ".xls", ".csv", ".msg", ".psd",
]);
const GPS_EXTS = new Set([".jpg", ".jpeg", ".tiff", ".tif", ".heic", ".png"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".astro"]);

function walkAll(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkAll(p, out);
    else out.push(p);
  }
  return out;
}

export async function scanMedia(rootDirs, { gpsReader } = {}) {
  const readGps = gpsReader ?? ((f) => exifr.gps(f).catch(() => undefined));
  const findings = [];
  for (const root of rootDirs) {
    for (const file of walkAll(root)) {
      const ext = extname(file).toLowerCase();
      if (RESTRICTED_EXTS.has(ext)) {
        findings.push({ file, reason: `restricted media type ${ext} must never ship` });
        continue;
      }
      if (GPS_EXTS.has(ext)) {
        const gps = await readGps(file);
        if (gps && typeof gps.latitude === "number") {
          findings.push({ file, reason: "image carries GPS EXIF — strip before shipping" });
        }
      }
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  const findings = await scanMedia(roots.length ? roots : ["public", "src", "dist"]);
  process.exit(report("check:media", findings));
}
