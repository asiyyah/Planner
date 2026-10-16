# Wedding Planner

A minimal, editorial wedding styling tool: pick one to four colours you love (anything) and get a
coordinated style guide — palette, couple looks, wedding party, families, guest colour guide and decor direction.

Fully deterministic and local: no backend, no accounts, no AI APIs. See [`prd.md`](prd.md) for the
product spec and [`docs/decisions.md`](docs/decisions.md) for where the build intentionally diverges.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
npm test        # Vitest unit tests
npx tsc --noEmit
```

## How it works

```text
/            landing
/plan        wizard: colours (1–4) → wedding types → [traditions] → styles → coordination → reveal
             (?d=<payload> prefills it — used by "Edit" and to survive refresh)
/guide?d=…   server-rendered style guide, regenerated from the URL payload;
             "Regenerate" links advance one section's reshuffle counter
/saved       guides saved on this device (localStorage, inputs only)
```

- **`lib/color/`** — colour engine: conversion, harmony maths, palette roles, wedding-tone muting,
  contrast.
- **`lib/styling/`** — styling engine. The couple claims its colours first (`ColourLedger`); other
  groups get freshly derived, exclusion-aware colours; decor reuses the master palette.
- **`lib/state.ts`** — the `?d=` URL codec (`hex,hex|type+type|styles|coordination[|reshuffles]`),
  backward compatible with older links.
- **`lib/storage.ts`** — saved guides with legacy migration and corrupt-data backup.
- **`lib/constants.ts`** — canonical option IDs shared by everything above.
- **`data/`** — colour names, metallics, style tones, fabrics, outfits, cultural attire (draft,
  reviewed in Notion), decor templates and option copy.

The app runs on Next.js 16 — APIs differ from older versions; check `node_modules/next/dist/docs/`
before changing framework code (see `AGENTS.md`).
