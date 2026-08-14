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
