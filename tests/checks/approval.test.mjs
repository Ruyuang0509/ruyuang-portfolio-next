import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkApproval } from "../../scripts/checks/approval.mjs";

function dirWith(name, content) {
  const dir = mkdtempSync(join(tmpdir(), "approval-"));
  writeFileSync(join(dir, name), content, "utf8");
  return dir;
}

const base = "title: x\naiDisclosure: 本作無生成式 AI 參與。\n";

describe("check:approval", () => {
  it("fails a thirdParty entry without approval", () => {
    const dir = dirWith("a.md", `---\n${base}thirdParty: true\n---\nbody`);
    expect(checkApproval(dir).length).toBe(1);
  });
  it("passes a thirdParty entry with complete approval", () => {
    const fm = `${base}thirdParty: true\napproval:\n  by: 某人\n  date: "2026-01-01"\n  scope: 全部\n  evidence: hash\n`;
    const dir = dirWith("b.md", `---\n${fm}---\nbody`);
    expect(checkApproval(dir).length).toBe(0);
  });
  it("fails an entry missing aiDisclosure", () => {
    const dir = dirWith("c.md", `---\ntitle: x\nthirdParty: false\n---\nbody`);
    expect(checkApproval(dir).length).toBe(1);
  });
});
