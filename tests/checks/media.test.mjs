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
    const dir = dirWith("photo.jpg");
    const findings = await scanMedia([dir], {
      gpsReader: async () => ({ latitude: 23.5, longitude: 120.3 }),
    });
    expect(findings.length).toBe(1);
    expect(findings[0].reason).toMatch(/GPS/);
  });
});
