import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanLinks } from "../../scripts/checks/links.mjs";

const BASE = "/site";

function dist(files) {
  const dir = mkdtempSync(join(tmpdir(), "links-"));
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, content, "utf8");
  }
  return dir;
}

describe("check:links", () => {
  it("catches the dev-only ../../public/ path that survived the K-35 migration", () => {
    const d = dist({ "index.html": `<img src="../../public/media/poster.webp" />`, "media/poster.webp": "x" });
    const found = scanLinks(d, { base: BASE });
    expect(found.length).toBe(1);
    expect(found[0].reason).toMatch(/outside the deploy base/);
  });
  it("accepts a base-prefixed asset that exists", () => {
    const d = dist({ "index.html": `<img src="${BASE}/media/poster.webp" />`, "media/poster.webp": "x" });
    expect(scanLinks(d, { base: BASE }).length).toBe(0);
  });
  it("flags a base-prefixed asset that does not exist", () => {
    const d = dist({ "index.html": `<img src="${BASE}/media/missing.webp" />` });
    const found = scanLinks(d, { base: BASE });
    expect(found.length).toBe(1);
    expect(found[0].reason).toMatch(/no such file/);
  });
  it("resolves directory URLs to their index.html", () => {
    const d = dist({ "index.html": `<a href="${BASE}/works/">all</a>`, "works/index.html": "<p>ok</p>" });
    expect(scanLinks(d, { base: BASE }).length).toBe(0);
  });
  it("ignores external, hash, data and mailto targets", () => {
    const d = dist({
      "index.html": `<a href="https://example.com">x</a><a href="#hook">y</a><img src="data:image/png;base64,AA" /><a href="mailto:a@b.c">z</a>`,
    });
    expect(scanLinks(d, { base: BASE }).length).toBe(0);
  });
});
