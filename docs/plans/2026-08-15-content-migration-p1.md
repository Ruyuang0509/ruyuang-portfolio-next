# Content Migration — Phase 1 Implementation Plan

> **For agentic workers:** executed via the fabsol lane (worker emits exact file contents; Advisor materializes, verifies, commits). Task payloads live in the delegation specs; the resulting repo files are the durable record.

**Goal:** Governance-bearing content collections + machine-enforced approval/obligation gates + dossier pages for the three featured works, linked from the homepage console.

**Architecture:** Astro 5 content layer (`src/content.config.ts`, glob loader over `src/content/works/*.md`). Schema carries governance fields: `role`, `aiDisclosure` (required), `evidence[]`, `thirdParty` + `approval{by,date,scope,evidence}` (drema-style, fail-closed), `obligations[]` (suno-attribution / no-monetization), `restricted[]`. Two new gates join `check:submission`: **check:approval** (thirdParty entry without complete approval object = FAIL; missing aiDisclosure = FAIL) and **check:obligations** (entries flagged suno-attribution must render a Suno credit in their built page; no-monetization pages must render the 無廣告/無付費牆 statement). Dossier route `src/pages/work/[slug].astro` renders featured entries in the panel language (plate, mono evidence rows, obligations footer). Homepage SignalPath strips link to dossiers via `import.meta.env.BASE_URL`.

**Out of scope (phase 2):** rack-entry detail pages, media files (四部影片 faststart 轉檔、Canva 匯出、Hamlet mp4 搬遷), sound islands, content-collection-driven homepage.

## Tasks

1. **C1 — schema + featured entries**: `package.json` (+`yaml` dev dep, +check:approval/check:obligations scripts), `src/content.config.ts`, `src/content/works/{pd-crossmodal,hamlet-story-mv,guide-videos}.md`. Entry facts verbatim from vault-verified sources; wording-gate discipline (四部/後製訊號處理; no banned phrases). Hamlet carries `thirdParty: true` + the 2026-07-26 attestation as approval (SHA-256 evidence) + both obligations. Accept: `npm install` clean, `npm run build` passes (schema validates).
2. **C2 — gates**: `scripts/checks/approval.mjs`, `scripts/checks/obligations.mjs`, vitest suites for both (runtime-built fixtures), updated `submission.mjs` GATES list. Accept: `npm test` green incl. new suites; `npm run check:submission` ALL GATES PASS.
3. **C3 — dossier pages + links**: `src/pages/work/[slug].astro` (+`src/styles/dossier.css`, global.css import, SignalPath strips wrapped in links). Accept: build emits `dist/work/<slug>/index.html` ×3; Suno credit string present in hamlet page; gates green.
4. **C4 — deploy + write-back** (Advisor): push, CI green, live grep (hamlet dossier serves), vault log/spec update, reindex.

## Acceptance (phase gate)

All of: vitest suites green; `check:submission` exit 0 (now six gates); CI success; live pages verified; no banned wording in any rendered page; Hamlet dossier renders attestation facts + Suno credit + no-monetization statement.
