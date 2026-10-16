# Product & engineering decisions

Decisions where the build intentionally differs from `prd.md` v1.0. Code comments that cite
"iteration 01 / 01.1 / 02 §…" refer to briefs that were never committed; this file is the
surviving record of what they decided.

## Inputs

- **D1 — Harmony is chosen by the engine, not the user.** The palette's harmony (complementary,
  analogous, triadic, split-complementary, tetradic, square, monochromatic) is inferred from the
  anchor colours and explained in plain language (PRD §4, §13).
- **D2 — No curated swatches inside the picker.** Colours are named from a ~170-name library
  (`data/color-names.ts`) that is used for naming only, never to pick or seed colours. A colour
  borrows a name only when it is a close match; otherwise it gets a plain descriptive name ("Soft
  Indigo", "Deep Magenta").
- **D3 — 1 to 4 colours**, any hex (PRD §8 asked for two; four gives couples more room). One colour
  is enough — the engine generates its partners. Links carrying more than 4 keep the first four.
- **D4 — Solid colours only** (`#RRGGBB`, no alpha).
- **Wedding types are multi-select** (e.g. Traditional and White as separate events), unlike the
  single choice in PRD §9.

## Palette generation

- **Nothing is fixed.** Every generated colour derives from the user's picks:
  - *Supporting colours* come from harmony relationships with **every** pick, not just the first.
  - *The neutral* is tinted from the lead colour (a cream, mist or stone carrying its hue), not
    chosen from a list of library neutrals.
  - *The metallic* is ranked from a wider set — gold, champagne gold, antique gold, bronze,
    copper, rose gold, silver, platinum, pewter (`data/metallics.ts`) — by the palette's
    temperature and the chosen styles.
  - Generated colours never borrow metal names (a grey is "Cloud Grey", not "Silver").
  - Opening the picker never adds a colour: a new slot stays empty until the user picks, and the
    picker starts on a plain grey that suggests nothing.
- **Style shapes colour.** Each style has a tone (`data/style-tones.ts`): Bold, Traditional and
  Luxury are richer and deeper; Romantic and Minimal softer and airier; several styles blend. For
  a single pick, the style also leads the harmony (rich styles start complementary).
- **Three groups, each built differently.**
  - *Wedding party* (bridesmaids + groomsmen) is built around the **couple's colours**, so their
    outfits complement the couple.
  - *Families* (bride's + groom's) and *guests* are built from the wider palette.
  - Every group avoids the couple's colours. Each also avoids the other groups' **first-option**
    colours, so a freshly generated guide never repeats a colour across groups.
- **"Another option" never moves another section.** Each section reshuffles on its own, because
  groups avoid each other's first options, which never change, not their current ones. Rules:
  - Palette and couple reshuffles recalculate everything after them (they are what the rest is
    built from). Look 01 can nudge Look 02; Look 02 never changes Look 01.
  - *"Same colours"* mode: one button reshuffles bridesmaids and groomsmen together as a matched
    set (they share their lead colour).
  - *"Different but coordinated"* mode: separate bridesmaid and groomsmen buttons, fully
    independent.
  - Families and guests: one button each, independent.
  - Trade-off: reshuffling one section never creates a repeat, but after reshuffling two sections
    they can occasionally land on similar shades (about 1 guide in 5 in testing).
- Counters live in the share link (codec v4), so a reshuffled guide is shareable and saved as-is,
  Back returns to the previous option, and the user's picks never change.

## Output

- **Couple looks.** Look 01 is always led by the user's 1st colour. Look 02 leads with one of the
  palette's generated colours by default — the user's other picks are options it reaches on
  reshuffle, not an automatic assignment. Reshuffling Look 01 can change Look 02 (the looks never
  share a colour); reshuffling Look 02 never changes Look 01.
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

## Interface

- **Mobile navigation is a hamburger menu below 768px.** Shrinking the full menu made links wrap
  onto two lines; between 640px and 768px the desktop row is still too tight, so the switch sits at
  tablet width. Desktop is unchanged.
- **The colour step is a Coolors-style strip.** Picks form one joined bar with names and hex codes;
  tapping a block edits it in place, + adds (up to 4), − removes the selected colour. Names stay
  visible because most couples are not designers, at the cost of truncation on small phones.
- **Live editing, Esc to undo.** Picker changes apply as you drag, like Coolors, instead of waiting
  for a Done button; Esc restores the colour (or drops a just-added one), clicking outside keeps it.
- **Card headers read "03 Bridesmaids" on the left, "⇄ Regenerate" on the right** (a black text
  link with a shuffle icon; it was labelled "Another option" until the October 2026 card designs).
  Cards follow those designs: short colour chips, grey sentence-case labels, upright grey notes;
  the cover stacks title, subtitle, a slim palette strip and then the action row.
- **Cards and buttons share a 4px corner radius** (guide, saved and landing cards; filled,
  outlined and ghost buttons; the wizard's choice buttons) instead of sharp corners. The wizard's
  step-number markers stay square; plain text links have no shape to round.
- **Guide actions are ranked:** Edit is the primary button, Save the secondary, and Share link and
  Print / Save PDF are ghost (text) buttons.
- **Two picker modes only: Picker and RGB.** HSB/HSL/CMYK were left out to keep the card simple.
- **The interface stays black and white** (PRD §26) even where Coolors uses colour; the user's
  colours are the only colour on screen.

## Persistence & sharing

- **D5 — localStorage instead of accounts.** Saved entries store only the planner inputs; the
  guide is regenerated on open, so previews always match. Saving identical inputs updates the
  existing entry.
- **D6 — "Print / Save PDF"** uses the browser print pipeline; no branded PDF renderer yet.
- **D7 — No loading states.** Generation is synchronous; the reveal animation is presentation only.
- Share links are built from the guide's inputs and use the Web Share API where available, falling
  back to the clipboard.
