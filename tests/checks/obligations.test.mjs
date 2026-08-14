import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkObligations } from "../../scripts/checks/obligations.mjs";

function fixture(obligations, html) {
  const root = mkdtempSync(join(tmpdir(), "oblig-"));
  const content = join(root, "works");
  mkdirSync(content, { recursive: true });
  writeFileSync(join(content, "w.md"),
    `---\ntitle: x\ntier: featured\naiDisclosure: 已揭露。\nobligations: [${obligations}]\n---\nbody`, "utf8");
  const dist = join(root, "dist");
  mkdirSync(join(dist, "work", "w"), { recursive: true });
  writeFileSync(join(dist, "work", "w", "index.html"), html, "utf8");
  return { content, dist };
}

describe("check:obligations", () => {
  it("fails when suno-attribution page lacks a Suno credit", () => {
    const { content, dist } = fixture("suno-attribution", "<p>hello</p>");
    expect(checkObligations(content, dist).length).toBe(1);
  });
  it("passes when the credit and statement are present", () => {
    const { content, dist } = fixture("suno-attribution, no-monetization", "<p>Suno 生成 · 本站無廣告</p>");
    expect(checkObligations(content, dist).length).toBe(0);
  });
  it("fails when no-monetization page lacks the statement", () => {
    const { content, dist } = fixture("no-monetization", "<p>hi</p>");
    expect(checkObligations(content, dist).length).toBe(1);
  });
});
