import { spawnSync } from "node:child_process";

const GATES = [
  { name: "check:paths", cmd: ["node", "scripts/checks/paths.mjs", "src", "public", "scripts", "docs", "dist"] },
  { name: "check:media", cmd: ["node", "scripts/checks/media.mjs", "public", "src", "dist"] },
  { name: "check:wording", cmd: ["node", "scripts/checks/wording.mjs", "src", "dist", "docs/design"] },
  { name: "check:motion", cmd: ["node", "scripts/checks/motion.mjs"] },
  { name: "check:approval", cmd: ["node", "scripts/checks/approval.mjs"] },
  { name: "check:obligations", cmd: ["node", "scripts/checks/obligations.mjs"] },
  { name: "check:csspunct", cmd: ["node", "scripts/checks/csspunct.mjs", "src", "docs/design"] },
  { name: "check:fmpunct", cmd: ["node", "scripts/checks/fmpunct.mjs", "src/content"] },
  { name: "check:links", cmd: ["node", "scripts/checks/links.mjs", "dist"] },
];

let worst = 0;
for (const g of GATES) {
  const r = spawnSync(g.cmd[0], g.cmd.slice(1), { stdio: "inherit", shell: process.platform === "win32" });
  const code = r.status ?? 2;
  if (code === 1) worst = 1;
  else if (code >= 2 && worst === 0) worst = 2;
}
console.log(worst === 0 ? "check:submission: ALL GATES PASS"
  : `check:submission: FAIL (worst=${worst})`);
process.exit(worst);
