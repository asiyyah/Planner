# Product & engineering decisions

Decisions where the build intentionally differs from `prd.md` v1.0. Code comments that cite
"iteration 01 / 01.1 / 02 §…" refer to briefs that were never committed; this file is the
surviving record of what they decided.

## Inputs

- **D1 — Harmony is chosen by the engine, not the user.** The palette's harmony (complementary,
  analogous, triadic, split-complementary, tetradic, square, monochromatic) is inferred from the
  anchor colours and explained in plain language (PRD §4, §13).
- **D2 — No curated swatches inside the picker.** The 31-colour library is naming metadata; any
  picked hex gets a friendly name.
- **D3 — A 1st colour and an optional 2nd** (PRD §8), any hex. One colour is enough — the engine
  generates its partner. (An earlier iteration allowed up to 8; links carrying more than 2 now keep
  the first two.)
- **D4 — Solid colours only** (`#RRGGBB`, no alpha).
- **Wedding types are multi-select** (e.g. Traditional and White as separate events), unlike the
  single choice in PRD §9.

## Palette generation

- **Nothing is fixed.** Every generated colour derives from the user's picks:
  - *Supporting colours* come from harmony relationships with **both** picks, not just the first.
  - *The neutral* is tinted from the lead colour (a cream, mist or stone carrying its hue), not
    chosen from a list of library neutrals.
  - *The metallic* is ranked from a wider set — gold, champagne gold, antique gold, bronze,
    copper, rose gold, silver, platinum, pewter (`data/metallics.ts`) — by the palette's
    temperature and the chosen styles.
  - Generated colours never borrow metal names (a grey is "Cloud Grey", not "Silver").
- **Style shapes colour.** Each style has a tone (`data/style-tones.ts`): Bold, Traditional and
  Luxury are richer and deeper; Romantic and Minimal softer and airier; several styles blend. For
  a single pick, the style also leads the harmony (rich styles start complementary).
- **"Another option" everywhere.** Palette, couple, bridesmaids, groomsmen, each family and guests
  can each be reshuffled. Counters live in the share link (codec v4), so a reshuffled guide is
  shareable and saved as-is, and Back returns to the previous option. The user's picks never
  change.
- **Reshuffles ripple forward, not back.** Groups never repeat each other's or the couple's
  colours, so reshuffling the couple (or the palette) recalculates the groups, and reshuffling a
  group can shift a group later in line (party → families → guests) if it takes one of that
  group's colours.

## Output

- **Couple exclusivity.** The couple gets two distinct looks, and *every* colour they wear —
  including the palette's neutral and metallic accent — is exclusive to them. Bridesmaids,
  groomsmen, families and guests receive freshly derived colours that are never near-duplicates of
  a couple colour. This departs from PRD §17/§43, where groups draw straight from the palette
  (e.g. bridesmaids "Champagne + Sage"). Party accessory copy therefore uses a generic "metallic"
  when the palette accent is claimed. *Reaffirmed during the October 2026 audit.*
- **Bridal whites.** No group is ever given a white or ivory-like colour, and white weddings list
  White and Ivory on the guest "avoid" list.
- **Decor uses the master palette**: neutral as base, hero as primary, the user's second colour (or
  the promoted companion) as secondary, metallic as accent.

## Persistence & sharing

- **D5 — localStorage instead of accounts.** Saved entries store only the planner inputs; the
  guide is regenerated on open, so previews always match. Saving identical inputs updates the
  existing entry.
- **D6 — "Print / Save PDF"** uses the browser print pipeline; no branded PDF renderer yet.
- **D7 — No loading states.** Generation is synchronous; the reveal animation is presentation only.
- Share links are built from the guide's inputs and use the Web Share API where available, falling
  back to the clipboard.
