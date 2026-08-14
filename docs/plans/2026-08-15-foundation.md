# ruyuang-portfolio-next Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new portfolio site's skeleton: Astro 5 + Tailwind v4 shell page, the seven-gate `check:*` pipeline (machine-enforced governance), and GitHub Pages preview deployment.

**Architecture:** Static Astro 5 MPA (islands added in later plans). Governance gates are standalone Node ESM scripts under `scripts/checks/`, each with fixture-based vitest coverage, aggregated by `check:submission`; CI runs gates on source AND on built `dist/` before deploying to Pages.

**Tech Stack:** Astro ^5, Tailwind ^4 (`@tailwindcss/vite`), vitest, exifr (EXIF GPS detection), GitHub Actions → GitHub Pages.

## Global Constraints

- Working directory: the repo root (this file's `../../`). NEVER write absolute local paths — of this machine, any `C:\Users\...`, any `D:\...` — into ANY committed file; that is exactly what `check:paths` polices. Refer to locations relative to repo root.
- Gate configs and committed tests must NOT contain the literal secrets/patterns they police (no real username, no vault folder name). Generic regexes in config; test fixtures build offending strings at runtime by concatenation.
- Spec of record: the vault note `projects/如願個人網站/2026-08-14-新站設計規格.md` (do not copy it here; do not need it to execute this plan).
- Node >= 20. Package manager: npm (lockfile committed).
- All site text lang: `zh-Hant-TW`. Reduced-motion is the DEFAULT design state: base CSS must not animate; motion is added inside `@media (prefers-reduced-motion: no-preference)` only.
- Conventional commit messages (`feat:`, `test:`, `chore:`); end every commit message body with the executor's standard AI co-author trailer.
- Every gate exits 0 = pass, 1 = product fail (findings printed), 2 = infra fail (could not evaluate). Never treat exit 2 as pass.

---

### Task 1: Astro + Tailwind shell, repo hygiene

**Files:**
- Create: `package.json`, `astro.config.mjs`, `.gitignore`, `.gitattributes`, `.editorconfig`, `AGENTS.md`, `src/styles/global.css`, `src/pages/index.astro`
- (This plan file `docs/plans/2026-08-15-foundation.md` already exists in the tree and is committed here.)

**Interfaces:**
- Produces: `npm run build` → static site in `dist/`; `src/styles/global.css` tokens `--bg`, `--fg`, `--accent` used by all later UI plans.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "ruyuang-portfolio-next",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^3.0.0",
    "exifr": "^7.1.3"
  }
}
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ruyuang0509.github.io",
  base: "/ruyuang-portfolio-next",
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Write repo hygiene files**

`.gitignore`:

```
node_modules/
dist/
.astro/
*.tmp
```

`.gitattributes`:

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.avif binary
*.webp binary
*.mp4 binary
```

`.editorconfig`:

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
```

- [ ] **Step 4: Write `src/styles/global.css`** (dark studio tokens; reduced-motion as default state)

```css
@import "tailwindcss";

:root {
  --bg: #0e0f12;
  --fg: #e8e6e1;
  --accent: #57c7a3;
}

html {
  background: var(--bg);
  color: var(--fg);
}

/* Reduced motion is the DEFAULT: base styles animate nothing.
   Motion opts IN under no-preference; never the other way around. */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

- [ ] **Step 5: Write `src/pages/index.astro`** (placeholder shell — real design lands in the design-system plan)

```astro
---
import "../styles/global.css";
---

<html lang="zh-Hant-TW">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>如願 — 聲音 × 智能應用</title>
    <meta
      name="description"
      content="如願的作品集:聲音互動、AI 協作與混合多聲道監聽研究。建置中。"
    />
  </head>
  <body class="min-h-screen grid place-items-center">
    <main class="text-center space-y-4 p-8">
      <h1 class="text-3xl font-bold tracking-wide">如願 — 監聽室建置中</h1>
      <p class="opacity-70">聲音 × 智能應用 · 新站施工中,現行作品集仍在原網址服務。</p>
    </main>
  </body>
</html>
```

- [ ] **Step 6: Write `AGENTS.md`**

```markdown
# ruyuang-portfolio-next — agent guide

Canonical workspace for the NEW portfolio site (v2). The live v1 site keeps
serving at the current URL until cutover; never deploy this repo to the v1 URL.

- Run everything from the repo root: `npm ci`, `npm test`, `npm run build`.
- Governance gates: `npm run check:submission` (added in this foundation plan)
  must exit 0 before any deploy. Gate semantics: 0 pass / 1 product fail / 2
  infra fail — exit 2 is NOT a pass.
- NEVER commit absolute local paths, usernames, restricted media (.pbix, .eml,
  .clip, raw spreadsheets), or images carrying GPS EXIF. `check:paths` and
  `check:media` enforce this; do not weaken them to make a commit pass.
- Design spec and content governance live in the owner's vault, outside this
  repo. When a gate blocks you, the gate is right until the owner says
  otherwise.
```

- [ ] **Step 7: Install and build**

Run: `npm install` then `npm run build`
Expected: build completes, `dist/index.html` exists and contains `監聽室建置中`.

- [ ] **Step 8: Init repo and commit**

```bash
git init -b main
git add -A
git commit -m "feat: scaffold Astro 5 + Tailwind v4 shell with reduced-motion-default base"
```

---

### Task 2: Gate harness + check:paths (local path/username leak)

**Files:**
- Create: `scripts/checks/lib.mjs`, `scripts/checks/paths.mjs`
- Test: `tests/checks/paths.test.mjs`

**Interfaces:**
- Produces: `lib.mjs` exports `walkTextFiles(roots, {excludeDirs}) -> string[]` (absolute file paths) and `report(name, findings) -> exitCode` (prints findings, returns 1 if any, else 0). `paths.mjs` exports `scanPaths(files) -> {file, line, match}[]` and, when run directly, exits per gate semantics.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the failing test**

`tests/checks/paths.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanPaths } from "../../scripts/checks/paths.mjs";

// Offending strings are BUILT AT RUNTIME so this public repo never
// contains a real-looking local path verbatim.
const winPath = ["C:", "Users", "someone", "Desktop", "x.png"].join("\\");
const projPath = ["D:", "Projects", "secret-folder"].join("\\");

function fixture(content) {
  const dir = mkdtempSync(join(tmpdir(), "paths-"));
  const f = join(dir, "sample.js");
  writeFileSync(f, content, "utf8");
  return f;
}

describe("check:paths", () => {
  it("flags a Windows user-profile absolute path", () => {
    const f = fixture(`const p = "${winPath.replaceAll("\\", "\\\\")}";`);
    expect(scanPaths([f]).length).toBe(1);
  });
  it("flags a drive-letter Projects path", () => {
    const f = fixture(`// see ${projPath.replaceAll("\\", "\\\\")}`);
    expect(scanPaths([f]).length).toBe(1);
  });
  it("passes clean web content", () => {
    const f = fixture(`const url = "https://example.com/Users/profile";`);
    expect(scanPaths([f]).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/checks/paths.test.mjs`
Expected: FAIL (cannot resolve `scripts/checks/paths.mjs`).

- [ ] **Step 3: Write `scripts/checks/lib.mjs`**

```js
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
```

- [ ] **Step 4: Write `scripts/checks/paths.mjs`**

```js
import { fileURLToPath } from "node:url";
import { walkTextFiles, readLines, report } from "./lib.mjs";

// Generic by design: any drive-letter user-profile or Projects path is a
// leak, so the config never needs to contain a real username or real folder
// name (which would itself be the leak).
const PATTERNS = [
  /[A-Za-z]:[\\/]+Users[\\/]+[^\s"'<>]+/g,
  /[A-Za-z]:[\\/]+Projects[\\/]+[^\s"'<>]+/g,
  /[A-Za-z]:[\\/]+Softwares[\\/]+[^\s"'<>]+/g,
];

export function scanPaths(files) {
  const findings = [];
  for (const file of files) {
    readLines(file).forEach((text, i) => {
      for (const re of PATTERNS) {
        re.lastIndex = 0;
        const m = re.exec(text);
        if (m) findings.push({ file, line: i + 1, match: m[0].slice(0, 60) });
      }
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["."]);
  process.exit(report("check:paths", scanPaths(files)));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/checks/paths.test.mjs`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/checks tests/checks
git commit -m "feat: check:paths gate — block local absolute-path/username leaks"
```

---

### Task 3: check:media (restricted extensions + EXIF GPS)

**Files:**
- Create: `scripts/checks/media.mjs`
- Test: `tests/checks/media.test.mjs`

**Interfaces:**
- Consumes: `walkAllFiles` does not exist — this gate walks binaries itself; uses `report` from `lib.mjs`.
- Produces: `scanMedia(rootDirs) -> Promise<{file, reason}[]>`; CLI exits per gate semantics.

- [ ] **Step 1: Write the failing test**

`tests/checks/media.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanMedia } from "../../scripts/checks/media.mjs";

function dirWith(name, bytes = Buffer.from("x")) {
  const dir = mkdtempSync(join(tmpdir(), "media-"));
  mkdirSync(join(dir, "sub"), { recursive: true });
  writeFileSync(join(dir, "sub", name), bytes);
  return dir;
}

describe("check:media", () => {
  it("flags restricted extensions", async () => {
    for (const bad of ["data.pbix", "mail.eml", "art.clip", "raw.xlsx", "raw.csv"]) {
      const findings = await scanMedia([dirWith(bad)]);
      expect(findings.length, bad).toBe(1);
    }
  });
  it("passes ordinary web media", async () => {
    const findings = await scanMedia([dirWith("cover.webp")]);
    expect(findings.length).toBe(0);
  });
  it("flags a JPEG carrying GPS EXIF", async () => {
    // Minimal JPEG with a GPS IFD pointer is impractical to hand-craft here;
    // instead scanMedia() must call exifr.gps() for every jpg/jpeg/tiff and
    // flag when it returns coordinates. We simulate by injecting a stub.
    const dir = dirWith("photo.jpg");
    const findings = await scanMedia([dir], {
      gpsReader: async () => ({ latitude: 23.5, longitude: 120.3 }),
    });
    expect(findings.length).toBe(1);
    expect(findings[0].reason).toMatch(/GPS/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/checks/media.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `scripts/checks/media.mjs`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/checks/media.test.mjs`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/checks/media.mjs tests/checks/media.test.mjs
git commit -m "feat: check:media gate — restricted extensions + GPS EXIF detection"
```

---

### Task 4: check:wording (forbidden-phrase content lint)

**Files:**
- Create: `scripts/checks/wording.mjs`, `scripts/checks/wording-rules.json`
- Test: `tests/checks/wording.test.mjs`

**Interfaces:**
- Produces: `scanWording(files, rules) -> {file, line, match, reason}[]`; rules JSON shape `[{ "pattern": "...", "flags": "u", "scope": "src/", "reason": "..." }]` where `scope` is a path substring the file must include for the rule to apply (empty string = all files). CLI scans `src/` and `dist/` by default.
- Consumes: `walkTextFiles`, `readLines`, `report` from `lib.mjs` (Task 2 signatures).

- [ ] **Step 1: Write the failing test**

`tests/checks/wording.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanWording } from "../../scripts/checks/wording.mjs";

// Forbidden phrases are assembled at runtime so committed test code never
// contains a banned string verbatim (the gate would flag its own tests).
const banned = ["插", "畫"].join("");
const retracted = ["80", "6%"].join(".");

function fixture(content, name = "entry.md") {
  const dir = mkdtempSync(join(tmpdir(), "wording-"));
  mkdirSync(join(dir, "src", "content"), { recursive: true });
  const f = join(dir, "src", "content", name);
  writeFileSync(f, content, "utf8");
  return f;
}

const rules = [
  { pattern: banned, flags: "u", scope: join("src", "content"), reason: "AI-assist labeling rule" },
  { pattern: retracted.replace(".", "\\."), flags: "u", scope: "", reason: "retracted figure" },
];

describe("check:wording", () => {
  it("flags a scoped banned phrase inside its scope", () => {
    expect(scanWording([fixture(`風格:${banned}風`)], rules).length).toBe(1);
  });
  it("flags a retracted figure anywhere", () => {
    expect(scanWording([fixture(`填答率 ${retracted}`)], rules).length).toBe(1);
  });
  it("passes clean copy", () => {
    expect(scanWording([fixture("AI 輔助合成 × 製圖與美術指導")], rules).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/checks/wording.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `scripts/checks/wording-rules.json`**

Rules per the vault spec §6 (scoped to shipped content; scripts/tests/docs are outside the scanned roots). JSON must be plain ASCII-safe UTF-8; phrases here DO appear because this file ships only rules, not copy — and the CLI never scans `scripts/`:

```json
[
  { "pattern": "插畫", "flags": "u", "scope": "src/content", "reason": "台文中心圖像必須標示為 AI 輔助合成×製圖與美術指導,不可稱插畫(簡章第七項罰則)" },
  { "pattern": "混音", "flags": "u", "scope": "src/content", "reason": "導覽影片證據只支持後製訊號處理/音量調校,不支持混音宣稱" },
  { "pattern": "1 ?支導覽影片|一支導覽影片", "flags": "u", "scope": "src/content", "reason": "對外一律寫「導覽影片(四部,合計 9 分 29 秒)」" },
  { "pattern": "80\\.6%", "flags": "u", "scope": "", "reason": "已撤回數字,全站禁用" },
  { "pattern": "背書", "flags": "u", "scope": "src/content", "reason": "成果報告表=自我陳述;唯一第三方文件是結業證書" }
]
```

- [ ] **Step 4: Write `scripts/checks/wording.mjs`**

```js
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { walkTextFiles, readLines, report } from "./lib.mjs";

export function scanWording(files, rules) {
  const findings = [];
  for (const file of files) {
    const applicable = rules.filter((r) => !r.scope || file.includes(r.scope) ||
      file.includes(r.scope.replaceAll("/", "\\")));
    if (applicable.length === 0) continue;
    readLines(file).forEach((text, i) => {
      for (const r of applicable) {
        if (new RegExp(r.pattern, r.flags ?? "u").test(text)) {
          findings.push({ file, line: i + 1, match: r.pattern, reason: r.reason });
        }
      }
    });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const rules = JSON.parse(readFileSync(join(here, "wording-rules.json"), "utf8"));
  const roots = process.argv.slice(2);
  const files = walkTextFiles(roots.length ? roots : ["src", "dist"]);
  process.exit(report("check:wording", scanWording(files, rules)));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/checks/wording.test.mjs`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/checks/wording.mjs scripts/checks/wording-rules.json tests/checks/wording.test.mjs
git commit -m "feat: check:wording gate — spec-ruled forbidden phrases as machine lint"
```

---

### Task 5: check:motion (no autoplay; reduced-motion present)

**Files:**
- Create: `scripts/checks/motion.mjs`
- Test: `tests/checks/motion.test.mjs`

**Interfaces:**
- Produces: `scanMotion({htmlFiles, cssFiles}) -> {file, line, reason}[]`; CLI scans `dist/` HTML and `src/styles/` CSS.
- Consumes: `walkTextFiles`, `readLines`, `report` from `lib.mjs`.

- [ ] **Step 1: Write the failing test**

`tests/checks/motion.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanMotion } from "../../scripts/checks/motion.mjs";

function fixture(name, content) {
  const dir = mkdtempSync(join(tmpdir(), "motion-"));
  const f = join(dir, name);
  writeFileSync(f, content, "utf8");
  return f;
}

describe("check:motion", () => {
  it("flags autoplay in shipped HTML", () => {
    const html = fixture("page.html", `<video autoplay src="x.mp4"></video>`);
    const css = fixture("g.css", `@media (prefers-reduced-motion: no-preference) {}`);
    expect(scanMotion({ htmlFiles: [html], cssFiles: [css] }).length).toBe(1);
  });
  it("flags a CSS bundle with no reduced-motion handling", () => {
    const html = fixture("page.html", `<p>ok</p>`);
    const css = fixture("g.css", `body { color: red; }`);
    const findings = scanMotion({ htmlFiles: [html], cssFiles: [css] });
    expect(findings.length).toBe(1);
    expect(findings[0].reason).toMatch(/prefers-reduced-motion/);
  });
  it("passes autoplay-free HTML with reduced-motion CSS", () => {
    const html = fixture("page.html", `<video controls src="x.mp4"></video>`);
    const css = fixture("g.css", `@media (prefers-reduced-motion: no-preference) { html {} }`);
    expect(scanMotion({ htmlFiles: [html], cssFiles: [css] }).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/checks/motion.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `scripts/checks/motion.mjs`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/checks/motion.test.mjs`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/checks/motion.mjs tests/checks/motion.test.mjs
git commit -m "feat: check:motion gate — ban autoplay, require reduced-motion default"
```

---

### Task 6: check:submission aggregator + npm wiring + dogfood

**Files:**
- Create: `scripts/checks/submission.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**
- Consumes: the four gate CLIs (Tasks 2–5) via child-process invocation.
- Produces: `npm run check:submission` — runs every gate, prints a summary table, exits 1 if ANY gate returned 1, exits 2 if any returned 2 (and none returned 1... no: 1 beats 2 — product fail dominates), else 0. Later plans add gates by appending to the `GATES` list only.

- [ ] **Step 1: Write `scripts/checks/submission.mjs`**

```js
import { spawnSync } from "node:child_process";

const GATES = [
  { name: "check:paths", cmd: ["node", "scripts/checks/paths.mjs", "src", "public", "scripts", "docs", "dist"] },
  { name: "check:media", cmd: ["node", "scripts/checks/media.mjs", "public", "src", "dist"] },
  { name: "check:wording", cmd: ["node", "scripts/checks/wording.mjs", "src", "dist"] },
  { name: "check:motion", cmd: ["node", "scripts/checks/motion.mjs"] },
];

let worst = 0;
for (const g of GATES) {
  const r = spawnSync(g.cmd[0], g.cmd.slice(1), { stdio: "inherit" });
  const code = r.status ?? 2;
  if (code === 1) worst = 1;
  else if (code >= 2 && worst === 0) worst = 2;
}
console.log(worst === 0 ? "check:submission: ALL GATES PASS"
  : `check:submission: FAIL (worst=${worst})`);
process.exit(worst);
```

- [ ] **Step 2: Add npm scripts** (modify `package.json` scripts block to)

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "check:paths": "node scripts/checks/paths.mjs src public scripts docs dist",
    "check:media": "node scripts/checks/media.mjs public src dist",
    "check:wording": "node scripts/checks/wording.mjs src dist",
    "check:motion": "node scripts/checks/motion.mjs",
    "check:submission": "node scripts/checks/submission.mjs"
  }
}
```

- [ ] **Step 3: Dogfood — run the full pipeline on this repo**

Run: `npm test` then `npm run build` then `npm run check:submission`
Expected: all vitest suites pass; build succeeds; every gate prints PASS and `check:submission` exits 0. If check:paths flags this plan file or AGENTS.md, the offending text must be rewritten relative (the gate is right).

- [ ] **Step 4: Commit**

```bash
git add scripts/checks/submission.mjs package.json
git commit -m "feat: check:submission aggregator wiring all governance gates"
```

---

### Task 7: GitHub repo + Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: `npm run check:submission` (Task 6), `npm run build` (Task 1).
- Produces: public repo `ruyuang-portfolio-next` under the owner's GitHub account; preview URL `https://ruyuang0509.github.io/ruyuang-portfolio-next/`.

- [ ] **Step 1: Write `.github/workflows/deploy-pages.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Governance gates (source + dist)
        run: npm run check:submission
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit the workflow**

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "chore: CI — test + gates before every Pages deploy"
```

- [ ] **Step 3: Create the public repo and push** (owner approved: public repo named `ruyuang-portfolio-next`)

```bash
gh repo create ruyuang-portfolio-next --public --source . --push
```

- [ ] **Step 4: Enable Pages via Actions and verify deploy**

Run: `gh api repos/{owner}/ruyuang-portfolio-next/pages -X POST -f build_type=workflow` (ignore 409 if already enabled), then `gh run watch` until the workflow completes.
Expected: workflow green; `https://ruyuang0509.github.io/ruyuang-portfolio-next/` serves the shell page (`監聽室建置中`).

---

### Task 8: Vault write-back (main session, NOT a worker task)

**Files:**
- Modify (in the vault, outside this repo): the 如願個人網站 project INDEX + spec §5 (record the live preview URL), `log.md` (one build entry), then `python scripts/brain.py reindex`.

- [ ] **Step 1:** Record: foundation done, preview URL live, gate suite green, commit hashes. Follow vault filing rules (LF, index line, log line, reindex). This task exists so the repo work is never done without its vault record — the whole reason the workspace moved here.

---

## Self-Review (completed 2026-08-15)

- Spec coverage: foundation scope = spec §4 (stack), §5 (repo/deploy), §6 gates 2/3/4(partial: entry-scoped rules activate with content)/6, §2 motion policy baseline. Gates 1 (approval) and 5 (Suno obligations) are content-collection-bound → content-migration plan, noted there. Design (§2 visuals), IA (§3): design-system plan.
- Placeholder scan: none — all code complete.
- Type consistency: `walkTextFiles/readLines/report` signatures consistent across Tasks 2/4/5; media walks binaries itself by design.
