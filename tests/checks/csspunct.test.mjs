import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanCssPunct } from "../../scripts/checks/csspunct.mjs";

const FW = String.fromCharCode(0xff0c); // full-width comma, assembled so this file never trips its own gate

function fixture(content, name) {
  const dir = mkdtempSync(join(tmpdir(), "csspunct-"));
  const f = join(dir, name);
  writeFileSync(f, content, "utf8");
  return f;
}

describe("check:csspunct", () => {
  it("flags a full-width comma inside a CSS declaration value", () => {
    const f = fixture(`.a{transition:opacity .2s${FW}transform .2s}`, "x.css");
    expect(scanCssPunct([f]).length).toBe(1);
  });
  it("ignores full-width punctuation inside CSS comments and outside style blocks", () => {
    const html = `<p>文案${FW}正常。</p><style>/* 註解${FW}沒事 */ .a{color:red}</style>`;
    const f = fixture(html, "x.html");
    expect(scanCssPunct([f]).length).toBe(0);
  });
  it("catches the violation inside an HTML style block with a correct line number", () => {
    const html = `<style>\n.a{color:red}\n.b{background:linear-gradient(red${FW}blue)}\n</style>`;
    const f = fixture(html, "x.html");
    const found = scanCssPunct([f]);
    expect(found.length).toBe(1);
    expect(found[0].line).toBe(3);
  });
});
