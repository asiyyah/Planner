# Implementation Review & Gap Analysis

> Findings from auditing the codebase against the product flows (Flows A–C) and `prd.md` v1.0.
> **Scope:** what is built, what is not, deliberate divergences, and recommended updates.
> `prd.md` remains untouched as the authoritative v1.0 specification; section references (§) point there.
> **Date:** August 2026, refreshed October 2026 after the codebase audit · **Codebase state:** post iteration 02 + audit fixes
> Decisions that diverge from the PRD are recorded in `docs/decisions.md`.

---

## 1. Build state at a glance

| Area | State |
| --- | --- |
| Landing page (`/`) | Done — editorial hero, three-step explainer, "Start planning" CTAs |
| Onboarding wizard (`/plan`) | Done — Colours (1st + optional 2nd) → Wedding Type → Style → Coordination → animated Reveal |
| Colour engine (`lib/color/*`) | Done, exceeds PRD §12 — 7 harmony modes, multi-anchor detection, wedding-tone muting |
| Styling engine (`lib/styling/*`) | Done per §42 — couple, party, families, guests, decor from one shared `StylingContext` |
| Style guide view (`/guide`) | Done per §24 — cover, 01 Colour Story, 02–06 group panels, 07 Guests, 08 Decor |
| Save / Share / Export | Done for MVP — localStorage saves (inputs only), shareable URL codec with per-guide link previews, Web Share API, print-to-PDF (§34-8/9) |
| Saved dashboard (`/saved`) | Done — device-local list with rename/delete/reopen |
| Accounts / backend / auth | Not built — deliberate (§38–39 upheld) |
| Theme input, venue context, party sizes | Not built — gaps G1–G4 below |
| Test coverage | 129 tests across 8 files (conversion, harmony, palette, wedding adjustments, group colours, state codec, storage, styling) — green; lint/tsc/build clean |

Stack in use: Next.js 16 · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn-style Radix UI · Framer Motion · react-colorful · Vitest · no backend.

---

## 2. Current user flows (as implemented)

### Flow A — Onboarding & input

```text
Landing (/) → "Start planning"
Step 1  Colours        free-form picker, a 1st colour and an optional 2nd
Step 2  Wedding type   traditional / white / traditional+white / civil / other
Step 3  Wedding style  classic…luxury, multi-select
Step 4  Coordination   same colours / different-but-coordinated (default: different)
Reveal                 choreographed palette animation (~5s, reduced-motion aware)
       ↓
/guide?d=<codec-v3>    guide generated synchronously on load
```

Implementation notes:

* **Colour step** follows PRD §8: a 1st colour and an optional 2nd (`MAX_COLORS = 2`), any hex; each is preserved exactly in the output, never overwritten.
* **Picker** is a Figma-style anchored popover (`react-colorful`): saturation/lightness field, hue slider, HEX + RGB entry, native eyedropper where supported. Draft state discards on dismiss; only "Done" commits. No curated swatches inside the picker (Decision D2), no alpha channel (Decision D4).
* **Harmony is chosen by the engine, not the user** (Decision D1): complementary / analogous / triadic / split-complementary / tetradic / square / monochromatic selected automatically from the anchors' relationships; the guide explains the choice in plain language (§13 requirement met).
* Generated colours are shaped by the chosen styles (Bold richer, Minimal quieter) and then pass through a wedding-tone adjustment layer so they stay occasion-appropriate. The neutral and metallic are derived per palette, not fixed (see `docs/decisions.md`).
* Palette generation is synchronous and instant (<500ms target of §49 met); the reveal is presentation only. "Streaming suggestions" from the brief is N/A (Decision D7).

### Flow B — Results / lookbook

| Brief item | Status |
| --- | --- |
| Palette summary labelled by role | **Done** — swatches carry roles Hero / Secondary / Supporting / Neutral / Accent; "Your colours" kept visually distinct from "We added" |
| Outfit suggestions per role (colour + fabric + styling notes) | **Done** — panels 02 Couple, 03 Bridesmaids, 04 Groomsmen, 05 Bride's Family, 06 Groom's Family; each lists colours, outfits, fabric suggestions, accessories, notes; duplicate picks prevented across groups |
| Tabbed/scrollable cards + reference image | **Partial** — responsive editorial grid instead of tabs (fits §30 layout direction); reference images not built (Phase 4 of §52) |
| Guest guidance | **Done** — panel 07 with Recommended / Optional / Avoid swatch groups plus avoid-notes (§19 met) |
| Decor grouped by category, tied to palette | **Done** — one palette-derived base/primary/secondary/accent assignment across ceremony, reception, tablescape, stage, florals, lighting, cake, signage (§23 met) |
| Lock a colour, regenerate the rest | **Done** — picks are always locked; "Another option" on the palette regenerates everything added around them |
| Restart a single role's suggestions | **Done** — "Another option" on the couple, bridesmaids, groomsmen, each family and guests; kept in the share link |
| Save to account | **Device-local only** — localStorage with rename/delete/reopen (§39 upheld; Supabase deferred) |
| Export as shareable link | **Done** — compact URL codec v3 `hexes\|type+type\|styles\|coordination` (max 8 colours); v2 and legacy v1 links still decode |
| Export as PDF lookbook | **Partial** — browser print pipeline with print-hidden chrome (Decision D6); no dedicated branded PDF |

### Flow C — Return visit

| Brief item | Status |
| --- | --- |
| Login → dashboard | **Not applicable for MVP** — `/saved` acts as the dashboard, scoped to the device (§39) |
| Open existing palette → edit or export | **Done** — "Edit" on the guide and on saved entries reopens the wizard prefilled via `/plan?d=…` (G5 closed) |
| Start a new palette (multi-event) | **Done** — start fresh any time; save each event under its own name locally |

---

## 3. Deliberate divergences from the brief / PRD (decided)

* **D1 — Auto-harmony beats manual harmony selection.** The original flow asked users to pick complementary/analogous/triadic/monochrome with previews; PRD §4 says users should never need colour-theory vocabulary. Iteration 01 resolved the conflict in favour of automation. An optional "advanced" override remains possible later if validation questions §51-1/2 demand it.
* **D2 — Curated swatches removed from the picker.** The curated library (31 colours) was demoted to naming metadata so any picked hex gets a friendly name. If curation returns, it belongs *beside* the picker as a suggestion strip, not inside it (roadmap R4).
* **D3 — Dynamic colour list (1–8) replaces fixed primary/secondary slots**, superseding §8 while preserving its "one colour is enough" rule.
* **D4 — Solid colours only.** Engine, swatches, and URL codec validate strict `#RRGGBB`; opacity sliders were intentionally omitted from the picker.
* **D5 — localStorage instead of accounts** for saving (§39 upheld until sharing analytics justify Supabase).
* **D6 — PDF export ships as browser print** for MVP; a branded PDF renderer is a post-validation upgrade.
* **D7 — No streaming/loading states**: deterministic local generation makes them unnecessary; the reveal animation covers the perceived moment.

---

## 4. Gap analysis vs the original product flows

| # | Gap | Brief ref | Effort | Notes |
| --- | --- | --- | --- | --- |
| G1 | Venue/formality context (indoor-outdoor, casual-formal) affecting fabric & decor tone | Flow A-5 | S–M | Extend `PlannerInputs` + `StylingContext`; fabric/decor libraries already carry metadata hooks; needs codec v3 (backward compatible) |
| G2 | Family/guest guidance toggle ("include guest/family sections?") | Flow A-4 | S | Pure UI gating of guide sections; styling engine already isolates groups |
| G3 | Wedding party counts (bridesmaids/groomsmen numbers) | Flow A-4 | S | Influences copy (e.g. mixed dress styles for large parties); low engine impact |
| G4 | Theme input — free text + preset tags ("rustic", "garden romance", …) | Flow A-1 | M | Deterministic keyword→style-weight mapping keeps the no-AI rule (§40); feeds existing styles pipeline |
| G5 | ~~Edit an existing palette~~ — **done** (wizard prefill from `?d=`) | Flow C-2 | S | Shipped in the October 2026 audit |
| G6 | ~~In-guide regeneration~~ — **done** ("Another option" per section, codec v4) | Flow B-edit | M | Shipped October 2026 |
| G7 | Curated swatch strip alongside the picker | Flow A-2 | S | Reintroduce library browsing without reopening the colour-theory debate (see D2) |
| G8 | Inspiration-image colour extraction | Flow A-2 | L | Client-side quantisation (median-cut/k-means) can satisfy this with zero AI APIs; schedule post-validation (Phase 3 of §52) |
| G9 | Reference imagery on recommendation cards | Flow B | L | Needs licensed/curated assets; Phase 4 of §52 |
| G10 | Branded PDF lookbook export | Flow B-export | M | Render-to-print stylesheet or PDF lib; D6 covers MVP meanwhile |
| G11 | Cross-device saved weddings / accounts | Flow C-1 | L | Supabase per §38; blocked on validation signals |

---

## 5. Recommended iterations (priority order)

1. **R1 — Edit & regenerate (G5, G6)** — shipped.
2. **R2 — Context inputs (G1, G2, G3).** Venue/formality, include-families/guests toggle, party counts; codec v3 with legacy decode; fabric/decor tone selection keyed off venue+formality.
3. **R3 — Theme tags (G4).** Preset tags + optional free text mapped onto style weights; no AI.
4. **R4 — Curated swatch strip (G7).** Optional quick-pick row under the colour step.
5. **R5 — Image inspiration (G8)** and **R6 — branded PDF (G10)** once core loops validate.
6. **Later:** accounts/backend (G11), reference imagery (G9), marketplace phases per §52.

---

## 6. Quality gates currently green

* `npx vitest run` — 129/129 tests pass (colour conversion, harmony maths, palette generation, wedding adjustments, group colours, URL codec incl. legacy decode, storage migration, styling engine).
* `npm run lint`, `npx tsc --noEmit`, `npm run build` — clean.
* Golden-path smoke test: Coffee × Sage → analogous harmony → full guide renders; share link round-trips through the codec.
