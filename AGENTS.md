# ruyuang-portfolio-next — agent guide

Canonical workspace for the NEW portfolio site (v2). The live v1 site keeps
serving at the current URL until cutover; never deploy this repo to the v1 URL.

- Run everything from the repo root: `npm ci`, `npm test`, `npm run build`.
- Governance gates: `npm run check:submission` (added in the foundation plan)
  must exit 0 before any deploy. Gate semantics: 0 pass / 1 product fail / 2
  infra fail — exit 2 is NOT a pass.
- NEVER commit absolute local paths, usernames, restricted media (.pbix, .eml,
  .clip, raw spreadsheets), or images carrying GPS EXIF. `check:paths` and
  `check:media` enforce this; do not weaken them to make a commit pass.
- Design spec and content governance live in the owner's vault, outside this
  repo. When a gate blocks you, the gate is right until the owner says
  otherwise.

## Session continuity (multi-session build, read this FIRST)

- This repo lives inside the owner's vault workspace. Before doing ANYTHING,
  read the vault project note 「跨session建站交接守則」 (project 如願個人網站) —
  it lists locked decisions, open items, and ten hard lessons. Do not re-decide
  locked decisions; do not trust your own fresh reasoning over that note.
- **Copy is verbatim-protected.** Every user-facing sentence in src/content and
  components passed wording/governance review. Never "improve" copy in passing;
  a one-word change can violate a ruled constraint. Copy changes require a new
  ruling upstream, not an edit here.
- **Verification chain, in order, never skipped:** `npm test` → `npm run build`
  → `npm run check:submission` → commit → push → watch CI to success → live
  spot-check → write back to the vault. Gate exit 2 is NOT a pass.
- **One build session at a time.** Parallel sessions may do research/content
  work outside this repo, but only one session builds here (git/CI races).
  Always `git pull --rebase` before committing; unexpected new commits mean
  another session worked here — read history before continuing.
- Current phase and status snapshot live in the same vault note. Do not deploy
  to the v1 URL; cutover is a user-gated step.
