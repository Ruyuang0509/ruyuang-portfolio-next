import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanFmPunct } from "../../scripts/checks/fmpunct.mjs";

const FW = String.fromCharCode(0xff0c); // full-width comma, assembled so this file never trips its own gate

function fixture(content) {
  const dir = mkdtempSync(join(tmpdir(), "fmpunct-"));
  const f = join(dir, "x.md");
  writeFileSync(f, content, "utf8");
  return f;
}

describe("check:fmpunct", () => {
  it("flags a full-width comma as flow-sequence separator (the K-64 tags incident)", () => {
    const f = fixture(`---\ntags: [互動音訊${FW} 訊號處理]\n---\nbody`);
    const found = scanFmPunct([f]);
    expect(found.length).toBe(1);
    expect(found[0].line).toBe(2);
  });
  it("allows a full-width comma inside a quoted flow item", () => {
    const f = fixture(`---\nrestricted: ["僅存本地${FW}永不入 repo"]\n---\nbody`);
    expect(scanFmPunct([f]).length).toBe(0);
  });
  it("ignores full-width commas in block scalars and in the body", () => {
    const f = fixture(`---\nsummary: 甲${FW}乙。\n---\n內文${FW}也沒事。`);
    expect(scanFmPunct([f]).length).toBe(0);
  });
  it("flags a full-width comma inside a flow mapping outside quotes", () => {
    const f = fixture(`---\nevidence:\n  - { label: X${FW} value: Y }\n---\nbody`);
    expect(scanFmPunct([f]).length).toBe(1);
  });
});
