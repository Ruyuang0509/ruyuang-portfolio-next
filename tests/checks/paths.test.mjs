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
