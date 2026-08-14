# Design-System Port Implementation Plan (max variant → Astro)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Port the user-approved design baseline `docs/design/monitor-room-v1-max.html` (the ONLY source of truth for visuals) into the Astro site: real `tokens.css`, chassis layout, homepage sections as components. The live homepage becomes the monitor-room console instead of the placeholder shell.

**Architecture:** All CSS custom properties move verbatim from the mockup's `:root` into `src/styles/tokens.css`; `global.css` imports it and carries base + chassis rules. Homepage sections become Astro components (`TransportNav`, `HeroPanel`, `SignalPath`, `Rack`, `ControlRoom`, `Provenance`, `OutputBus`) composed by `src/pages/index.astro`. Content stays hard-coded for now (content collections arrive in the next plan) — copy is taken VERBATIM from the mockup; do not rewrite any user-facing sentence.

**Tech Stack:** Astro ^5, Tailwind v4 (kept for utilities but the design system is token-CSS-first), Google Fonts (Noto Sans TC + IBM Plex Mono) — self-host subsets is a recorded follow-up, not this plan.

## Global Constraints

- `docs/design/monitor-room-v1-max.html` is authoritative for every token value, selector effect, and copy string. Deviations only where Astro componentization requires them.
- No absolute local paths in any committed file (`check:paths` enforces).
- Reduced-motion is the default state: all transitions/animations live inside `@media (prefers-reduced-motion: no-preference)`.
- `npm test`, `npm run build`, `npm run check:submission` must all pass before every commit that touches src/.
- Conventional commits; end body with the executor's standard AI co-author trailer.

---

### Task 1: tokens.css + global.css from the mockup

**Files:**
- Create: `src/styles/tokens.css` — the full `:root` block from the mockup (colors, fonts, spaces, text sizes, easings, durations, rules, radius), plus the Google Fonts `@import` moved here.
- Modify: `src/styles/global.css` — keep `@import "tailwindcss";` first, then `@import "./tokens.css";`, then base rules from the mockup (`*` reset, html/body incl. `overflow-x:clip`, grid background, `a`, `:focus-visible`, `.mono`, chassis + inner + panel/plate/ticks classes, and the reduced-motion media block).

**Interfaces:**
- Produces: every `--color-*/--font-*/--space-*/--text-*/--ease-*/--dur-*/--rule-*/--radius-*` token referenced by later components; class names `.chassis .inner .panel .plate .panel-body .ticks .mono .led .led--rec` available globally.

- [ ] **Step 1:** Copy the mockup's `<style>` into the two files as described (tokens → tokens.css; base/chassis/panel/motion/responsive scaffolding → global.css; section-specific rules stay for Task 2 components as scoped styles).
- [ ] **Step 2:** Run `npm run build`; expected: success. `dist/index.html` still renders (placeholder page now inherits dark tokens).
- [ ] **Step 3:** Commit `feat: design tokens + chassis base from approved max baseline`.

### Task 2: section components + homepage assembly

**Files:**
- Create: `src/components/TransportNav.astro`, `HeroPanel.astro`, `SignalPath.astro`, `Rack.astro`, `ControlRoom.astro`, `Provenance.astro`, `OutputBus.astro` — markup + copy VERBATIM from the mockup's corresponding sections; each component carries its section-scoped `<style>` (Astro scoped styles referencing global tokens only).
- Modify: `src/pages/index.astro` — replace placeholder body with `<div class="chassis"><TransportNav/><div class="inner">…sections…</div><OutputBus/></div>`; keep `<html lang="zh-Hant-TW">`, title `如願 — 聲音 × 智能應用`, meta description unchanged.

**Interfaces:**
- Consumes: Task 1 tokens + global classes.
- Produces: the live homepage = the approved max design.

- [ ] **Step 1:** Create the seven components; move each section's scoped CSS from the mockup into the owning component.
- [ ] **Step 2:** `npm run build` then `npm run check:submission`; expected: build success, ALL GATES PASS (check:motion sees prefers-reduced-motion in dist CSS; check:wording clean — mockup copy already passes).
- [ ] **Step 3:** Visual acceptance: open `npm run preview` (or the built dist) — compare against `docs/design/monitor-room-v1-max.html` at desktop and 375px. Fix drift.
- [ ] **Step 4:** Commit `feat: monitor-room homepage — approved max design ported to components`.

### Task 3: deploy + vault write-back (main session)

- [ ] **Step 1:** Push; CI must go green; verify the Pages preview URL now serves the console page (grep for 「訊號路徑」).
- [ ] **Step 2:** Vault: log entry + spec §7 note (design system live on preview), reindex. Record follow-ups: self-host font subsets; sound islands (opt-in Web Audio) and case dossier pages belong to the content-migration plan.

## Self-Review

- Coverage: mockup regions → 7 components + base = complete; fonts via @import recorded with self-host follow-up; copy verbatim rule prevents wording-gate drift. No placeholders; interfaces named.
