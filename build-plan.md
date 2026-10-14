# Wedding Planner — MVP Build Plan

> **Status (October 2026):** historical plan. Phases 0–8 have shipped, on Next.js 16 rather than 15, with the
> divergences recorded in [`docs/decisions.md`](docs/decisions.md). Notable ones: 1–8 colours, multi-select wedding
> types, couple-exclusive colours, no library snapping. `neutrals.ts`/`wedding-styles.ts` were folded into
> `data/colors.ts` and `data/wedding-types.ts`. Phase 9 QA items (cross-browser, Lighthouse) have not been
> verified. Current status lives in [`prd-findings.md`](prd-findings.md); the checkboxes below are left as written.

> Derived from `prd.md` v1.0. Scope is strictly the MVP: two colours in, complete coordinated wedding visual direction out.
>
> **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (selective) · Framer Motion (reveal/transitions only) · Local TS data. No backend, no auth, no database, no AI.

---

## Guiding Constraints (from PRD)

1. **Deterministic engine, zero cost** — no external APIs; palette generation < 500ms, fully local.
2. **Black & white UI** — user palette is the only colour in the interface (`#000000`, `#FFFFFF`, sparse grey).
3. **Data-driven, not hard-coded UI** — all recommendation content lives in `data/` config, engines live in `lib/`.
4. **Editorial lookbook feel** — not SaaS dashboard. Instrument Serif + Inter, white cards, black borders, large swatches.
5. **Non-prescriptive language** — "suggested", "recommended", "could work well"; never "best" or "you should".
6. **Nigerian context first-class** — Aso-ebi, Aso-oke, Lace, George, Agbada, Senator, family coordination.

---

## Architecture Overview

```text
app/
  page.tsx                    # Landing
  plan/page.tsx               # Onboarding wizard (steps 1–4 + reveal)
  guide/page.tsx              # Generated style guide (?d=<encoded state>)
  saved/page.tsx              # Saved guides list
lib/
  color/
    conversion.ts             # HEX ↔ HSL ↔ RGB
    harmony.ts                # complementary, analogous, triadic, split-comp, mono
    palette.ts                # generatePalette(): roles hero→accent
    contrast.ts               # WCAG contrast helpers (text on swatches)
  styling/
    index.ts                  # orchestrator: Palette+Inputs → StyleGuide
    couple.ts  bridesmaids.ts  groomsmen.ts
    family.ts  guests.ts       fabrics.ts  outfits.ts
    decor.ts
  storage.ts                  # localStorage save/load/rename/delete
data/
  colors.ts                   # ~30 curated colours w/ name, hex, hsl, category
  harmonies.ts                # harmony rules + selection heuristics
  neutrals.ts                 # configurable neutral balancing set
  fabrics.ts                  # traditional + contemporary, metadata-tagged
  outfits.ts                  # female/male categories, context tags
  wedding-types.ts            # Traditional | White | Both | Civil | Other
  wedding-styles.ts           # Classic … Luxury (multi-select)
  decor.ts                    # ceremony/reception/tablescape/florals/lighting…
types/
  index.ts                    # Color, Palette, StyleGuide, WeddingGroup, etc.
components/
  ui/                         # shadcn primitives (themed to B/W)
  swatch/                     # SwatchBlock, PaletteBoard
  wizard/                     # step components + progress
  guide/                      # one section component per style-guide section
```

---

## Phases

### Phase 0 — Scaffold & Design System (~0.5 day)

- [ ] `create-next-app@latest` (TS, App Router, Tailwind, ESLint), init shadcn/ui
- [ ] Install Framer Motion; configure fonts: **Instrument Serif** (display) + **Inter** (UI) via `next/font`
- [ ] Design tokens: black/white/grey scale only; border/radius/shadow conventions per §28
- [ ] Base components themed to B/W: Button, Card (lookbook panel), Dialog, Select, Tabs, Input, Tooltip
- [ ] Layout shell: minimal nav (Logo · Plan · Style Guide · Saved · My Wedding →), mobile-first
- [ ] CI basics: lint + typecheck scripts pass

**Deliverable:** empty app shell matching the editorial B/W direction.

---

### Phase 1 — Types & Data Libraries (~1–1.5 days)

- [ ] `types/`: implement PRD §35–36 models exactly (`Color`, `Palette`, `StylingRecommendation`, `WeddingGroup`) plus `StyleGuide`, `WeddingType`, `WeddingStyle`, `CoordinationMode`, `DecorCategory`
- [ ] `data/colors.ts`: 25–40 curated colours across Neutral / Earthy / Jewel / Soft / Accent categories (§45) with HSL precomputed
- [ ] `data/fabrics.ts`: 12 fabrics (6 Nigerian-traditional, 6 contemporary) with metadata: group fit, formality, seasonality notes (§46)
- [ ] `data/outfits.ts`: female + male categories tagged by wedding type / style / group (§47)
- [ ] `data/wedding-types.ts`, `data/wedding-styles.ts`, `data/decor.ts`: option sets + copy (§48, §9–10)
- [ ] Unit-test fixtures: sample inputs from PRD §43 (Coffee Brown × Sage)

**Deliverable:** complete typed content layer; engines have everything they consume.

---

### Phase 2 — Colour Engine (~1.5–2 days) ⚠️ Core logic

- [ ] `conversion.ts`: hex↔hsl↔rgb utilities
- [ ] `harmony.ts`: complementary (+180°), analogous (±30°), triadic (±120°), split-complementary, monochromatic — pure functions, hue math mod 360
- [ ] Two-input resolution logic: given C1+C2, measure hue/sat/light distance and pick the best-fit harmony rule; snap generated colours back to nearest curated library colour where sensible
- [ ] Single-colour path: synthesize second colour from harmony rules (PRD §8 optional behaviour)
- [ ] `neutrals.ts` + neutral balancing: configurable (White, Ivory, Cream, Champagne, Grey, Black) — rule-based, not purely mathematical (§12)
- [ ] `palette.ts`: role assignment — Hero / Secondary / Supporting / Neutral / Accent (§13), including accent/metallic inference (e.g., warm earthy → Gold)
- [ ] Palette explanation generator: template-based plain-language summary ("A warm, earthy palette balanced with soft neutrals…")
- [ ] `contrast.ts`: pick readable text colour over any swatch
- [ ] **Unit tests:** every harmony function, edge cases (achromatic input, near-duplicate C1/C2, single colour), determinism, <500ms perf sanity

**Deliverable:** tested, UI-independent engine. `generatePalette(C1, C2?) → Palette`.

---

### Phase 3 — Styling Engine (~2 days) ⚠️ Core logic

- [ ] Orchestrator signature: `(Palette, WeddingType, WeddingStyle[], CoordinationMode) → StyleGuide`
- [ ] **Couple** section: bride/groom colour + outfit/fabric direction
- [ ] **Bridesmaids**: primary/secondary/accent colours, outfit type, fabrics, accessories, alternative styling (§14)
- [ ] **Groomsmen**: main + shirt/inner + accent, outfit (Agbada/Senator/Suit…), fabric, accessories (§15)
- [ ] **Same-colours mode** (§16): shared colour family across party groups; vary proportion/fabric/outfit/accent placement
- [ ] **Different-but-coordinated mode** (§17, default): distinct combos per group drawn from one palette — this is the showcase feature
- [ ] **Family styling** (§18): bride's family vs groom's family get different combos incl. Aso-ebi direction; never identical across groups unless same-mode chosen
- [ ] **Guest colour guide** (§19): Recommended / Optional / Avoid lists (exclude exact couple colours + reserved group colours + clashing brights)
- [ ] `outfits.ts` + `fabrics.ts` selectors: filter by wedding type × style × group × palette warmth (§20–21); suggestion-framed copy (§22)
- [ ] **Decor engine** (§23): reuse same palette; ceremony + reception outputs (backdrop, aisle, florals, tables, linens, centrepieces, stage, cake, signage, lighting) with base/primary/secondary/accent usage
- [ ] **Golden-path test:** PRD §43 example must produce output closely matching its expected result (Coffee×Sage, Traditional+White, Elegant, Different-but-coordinated)

**Deliverable:** full deterministic pipeline: `inputs → StyleGuide` object ready for any renderer.

---

### Phase 4 — Onboarding Wizard (~1.5 days)

- [ ] Route `/plan`; client-side state (URL-syncable or React context); 4 steps + auto-advance
- [ ] Step 1 Colours: curated swatch grid + native/custom picker; large touch targets; "continue with one colour" affordance; supporting copy from §8
- [ ] Step 2 Wedding Type: single-select cards (Traditional / White / Both / Civil / Other)
- [ ] Step 3 Wedding Style: multi-select chips (8 options)
- [ ] Step 4 Party Coordination: Same vs Different-but-coordinated (default highlighted as recommended)
- [ ] Progress indication, back navigation, keyboard-accessible controls, semantic HTML
- [ ] Mobile-first single column; sticky primary CTA on mobile

**Deliverable:** frictionless 4-step flow collecting all engine inputs.

---

### Phase 5 — Palette Reveal (~0.5 day)

- [ ] Generating screen on submit: C1 + C2 → "Finding your harmony…" → staggered swatch reveal of final palette → "Your palette is ready" (Framer Motion fade/slide/colour-reveal only)
- [ ] Keep it short (<3s total); deterministic delay, not fake AI loading
- [ ] Then navigate to `/guide`

**Deliverable:** the curated reveal moment from PRD §32.

---

### Phase 6 — Style Guide Page (~2–2.5 days)

The digital lookbook (§24). One component per section, all rendering from the `StyleGuide` data object:

- [ ] Cover: "YOUR WEDDING / Coffee × Sage / A coordinated wedding style guide"
- [ ] 01 Colour Story: original colours, palette board, roles, explanation line
- [ ] 02 Couple · 03 Bridesmaids · 04 Groomsmen · 05 Bride's Family · 06 Groom's Family: colour, outfit, fabric, accessories per group
- [ ] 07 Guests: Recommended / Optional / Avoid swatch rows
- [ ] 08 Decor: ceremony, reception, tablescape, florals, lighting
- [ ] Editorial card system: numbered panels, black borders, generous whitespace, asymmetric grids on desktop
- [ ] Swatch blocks: large rectangles, name + HEX + role labels
- [ ] Responsive: swipeable sections on mobile, 2–3 col editorial grids on desktop
- [ ] Guide state encoded in URL (`?d=…`) so it's inherently link-shareable without backend
- [ ] Subtle interactions: hover transitions, swatch expansion (no bouncy motion)

**Deliverable:** the core product artifact — beautiful, data-rendered lookbook.

---

### Phase 7 — Save / Share / Download (~1 day)

- [ ] **Save** → localStorage: list with rename/delete/reopen (`/saved`)
- [ ] **Share link** → copies current `/guide?d=…` URL (works cross-device since state is in URL)
- [ ] **Download** → print-optimised stylesheet (`@media print`): clean paginated PDF via browser Print; explicit "Export PDF" button
- [ ] Empty states for Saved page

**Deliverable:** full Start → Generate → View → Save/Share/Download loop, no auth (§39).

---

### Phase 8 — Landing Page (~0.5 day)

- [ ] Value proposition hero ("Choose two colours. We'll help you build the rest."), primary CTA → `/plan`
- [ ] Light editorial preview of what a guide contains (B/W mock with placeholder swatch shapes)
- [ ] Footer

**Deliverable:** entry point that converts to the wizard.

---

### Phase 9 — Polish & QA (~1 day)

- [ ] Accessibility audit: WCAG contrast, keyboard-only walkthrough, focus states, aria labels on pickers/swatches, info never conveyed by colour alone (role/name text always present)
- [ ] Cross-browser check: Chrome/Safari/Edge/Firefox; iOS Safari share-sheet behaviour
- [ ] Perf: palette generation timing assertion; Lighthouse mobile pass; font loading strategy
- [ ] Copy review: non-prescriptive tone everywhere (§22, principle 5)
- [ ] Edge cases: identical C1/C2, greyscale picks, very long flows, localStorage unavailable
- [ ] Final run against §54 MVP success checklist end-to-end

**Deliverable:** release-ready MVP.

---

## Milestones & Rough Timeline

| Milestone | Phases | Est. | Demoable outcome |
|---|---|---|---|
| M1 — Foundation | 0–1 | ~2 days | App shell + full typed data layer |
| M2 — Engine complete | 2–3 | ~3.5 days | CLI-testable pipeline: inputs → StyleGuide |
| M3 — Product usable | 4–5 | ~2 days | End-to-end flow to generated guide |
| M4 — Shareable product | 6–8 | ~3.5 days | Lookbook + save/share/download + landing |
| M5 — Release | 9 | ~1 day | Polished, accessible, responsive MVP |

**Total estimate: ~11–12 focused working days** (solo dev).

---

## Key Risks / Open Decisions

1. **Palette quality is the whole product.** The harmony-selection heuristic (which rule applies to which colour pair) needs curation + visual review, not just math. Mitigation: golden-path tests + eyeball batch of ~20 popular combinations early (end of Phase 2).
2. **Curated snapping vs pure math.** Generated hues may not match named library colours; decide snapping tolerance early.
3. **Accent/metallic inference** (Gold vs Silver vs Rose Gold) is rule-based taste — needs an editable rules table in `data/harmonies.ts`.
4. **URL-encoded guide state** could grow large with multi-select styles; keep payload minimal, consider compression if needed.
5. **Cultural accuracy** of outfit/fabric pairings should be reviewed against real Nigerian wedding norms before launch (validation Q5 in §51).

## Explicitly NOT Building (per PRD §5)

Vendor marketplace, budgets, guest lists, RSVP, timelines, payments, AI features, accounts, vendor booking, shopping integrations, pricing feeds. Supabase/auth arrive post-validation.
