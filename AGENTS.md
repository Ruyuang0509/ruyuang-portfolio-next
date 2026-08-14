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
