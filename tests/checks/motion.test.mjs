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
