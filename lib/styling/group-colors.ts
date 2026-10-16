import { COLORS } from "@/data/colors";
import { BASE_TONE, type StyleTone } from "@/data/style-tones";
import type { Color, Palette } from "@/types";
import { hexToHsl, hslToHex, normalizeHue, type Hsl } from "@/lib/color/conversion";
import { adjustForWedding, applyTone } from "@/lib/color/wedding-adjustments";
import {
  colorFromHsl,
  colorToHsl,
  isAchromatic,
  isNearDuplicate,
} from "@/lib/color/palette";

/**
 * Group colour generation (iteration 02 §2–8, §20–22).
 *
 * Non-couple groups do NOT split up whatever is left of the master palette.
 * Instead each group receives freshly derived colours that are generated
 * *from* the master theme — harmony relationships over its hues, shaped by
 * group-specific styling priorities — while excluding every colour already
 * assigned to the couple (and to earlier groups).
 *
 * Generation is deterministic and exclusion-aware by construction: candidates
 * walk a fixed relationship × depth ladder, so we never "reroll and hope".
 */

export type GroupProfile =
  | "bridesmaids"
  | "groomsmen"
  | "bride-family"
  | "groom-family"
  | "guests";

/* --------------------------- Group shaping rules --------------------------- */

type DepthRecipe = { s: number; l: number };

/**
 * Saturation/lightness priorities per group (§22). Recommendations, not rigid
 * rules — every recipe still passes through the wedding-adjustment layer.
 */
const DEPTH_RECIPES: Record<GroupProfile, DepthRecipe[]> = {
  // Softer tones, dress-friendly elegance — dusty rose / mauve / blush band.
  bridesmaids: [
    { s: 32, l: 72 },
    { s: 26, l: 63 },
    { s: 40, l: 68 },
  ],
  // Stronger neutrals, suiting/traditionalwear depth — slate / charcoal / taupe.
  groomsmen: [
    { s: 16, l: 34 },
    { s: 11, l: 50 },
    { s: 28, l: 42 },
  ],
  // Warm, earthy aso-ebi mid-tones — terracotta / copper direction.
  "bride-family": [
    { s: 44, l: 52 },
    { s: 36, l: 61 },
    { s: 48, l: 45 },
  ],
  // Distinct sibling identity — olive / moss / warm taupe direction.
  "groom-family": [
    { s: 30, l: 47 },
    { s: 24, l: 57 },
    { s: 38, l: 40 },
  ],
  // Broader guidance — soft neutrals and gentle muted tones.
  guests: [
    { s: 22, l: 80 },
    { s: 32, l: 66 },
    { s: 14, l: 72 },
  ],
};

/**
 * White and ivory are the bride's colours. No generated group colour may
 * read as either, so guests are never steered toward wearing white.
 */
export const BRIDAL_WHITES: Color[] = COLORS.filter(
  (c) => c.id === "white" || c.id === "ivory"
);

function isBridalWhite(candidate: Hsl): boolean {
  return (
    candidate.l >= 90 ||
    BRIDAL_WHITES.some((c) => isNearDuplicate(candidate, colorToHsl(c)))
  );
}

/**
 * Hue offsets explored around each palette seed. Early entries stay close to
 * the theme; later entries reach further out (split-complementary,
 * complementary) so exclusivity never starves a group of options.
 */
const RELATIONSHIP_LADDER = [0, 28, -28, 152, -152, 178, 118, -118];

/** Family identities lean opposite ways around the seed hues. */
const PROFILE_HUE_BIAS: Partial<Record<GroupProfile, number[]>> = {
  "bride-family": [16, 34],
  "groom-family": [-16, -34],
};

/* ------------------------------ Colour building ---------------------------- */

/** Chromatic palette entries become seeds; all-neutral palettes plan from stone. */
function seedHues(palette: Palette): number[] {
  const candidates = [...palette.anchors, palette.secondary, ...palette.supporting];
  const chromatic = candidates.filter((c) => !isAchromatic(c));
  if (chromatic.length > 0) {
    return [...new Set(chromatic.map((c) => Math.round(c.hue)))];
  }
  return [40]; // warm stone tone keeps neutral weddings cohesive
}

export class ColourLedger {
  /** Hexes no group may wear (near-)duplicates of: the couple's colours. */
  readonly taken: string[] = [];

  claim(hexes: string[]): void {
    for (const hex of hexes) {
      if (!this.taken.includes(hex)) this.taken.push(hex);
    }
  }

  /** A copy that additionally excludes `hexes` — this ledger is unchanged. */
  with(hexes: string[]): ColourLedger {
    const copy = new ColourLedger();
    copy.claim([...this.taken, ...hexes]);
    return copy;
  }

  isTaken(hex: string): boolean {
    return this.isNearTaken(hexToHsl(hex));
  }

  isNearTaken(candidate: Hsl): boolean {
    return this.taken.some((hex) => isNearDuplicate(candidate, hexToHsl(hex)));
  }
}

export type GroupColourOptions = {
  /** Reshuffle counter: 0 is the first option, each step the next set. */
  variant?: number;
  /** Style tone shaping saturation and depth. */
  tone?: StyleTone;
  /** Hues to build around first (e.g. the couple's); palette hues follow. */
  leadHues?: number[];
};

/** Lightness steps the widening sweep may explore (tried nearest-first). */
const WIDEN_LIGHTNESS = [28, 34, 40, 46, 52, 58, 64, 70, 76, 82];

/** Reshuffles cycle after this many options per group. */
const MAX_GROUP_VARIANTS = 64;

/**
 * Walk the candidate pool from `start` (wrapping) and take up to `count`
 * mutually distinct colours, skipping any hex in `avoid`.
 */
function selectWindow(
  pool: Hsl[],
  count: number,
  start: number,
  avoid: Set<string>
): { picks: Hsl[]; next: number } {
  const picks: Hsl[] = [];
  let i = 0;
  for (; i < pool.length && picks.length < count; i += 1) {
    const candidate = pool[(start + i) % pool.length];
    if (avoid.has(hslToHex(candidate))) continue;
    if (picks.some((p) => isNearDuplicate(p, candidate))) continue;
    picks.push(candidate);
  }
  return { picks, next: pool.length > 0 ? (start + i) % pool.length : 0 };
}

/** Pool size, in multiples of `count`, the widening sweep aims for. */
const MIN_ALTERNATIVES = 3;

const sameSet = (a: Hsl[], b: Hsl[]) => {
  const hexes = new Set(a.map(hslToHex));
  return b.length === a.length && b.every((c) => hexes.has(hslToHex(c)));
};

/**
 * The set after `current`: ideally all-new colours, else a full set that
 * differs by at least one colour. Stays put only when the pool holds no
 * other complete set.
 */
function nextWindow(
  pool: Hsl[],
  count: number,
  current: { picks: Hsl[]; next: number }
): { picks: Hsl[]; next: number } {
  const fresh = selectWindow(pool, count, current.next, new Set(current.picks.map(hslToHex)));
  if (fresh.picks.length === count) return fresh;
  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = selectWindow(pool, count, (current.next + offset) % pool.length, new Set());
    if (candidate.picks.length === count && !sameSet(candidate.picks, current.picks)) {
      return candidate;
    }
  }
  return current;
}

/**
 * Generate `count` distinct colours for a non-couple group: harmonised with
 * the master palette, shaped for the group and the chosen styles, and
 * guaranteed clear of every ledger entry (the couple's exclusive colours).
 *
 * Groups do not claim colours from one another, so each group's result
 * depends only on the palette, the couple and its own reshuffle counter —
 * reshuffling one group never changes another.
 *
 * Valid candidates are collected in a fixed relationship × depth order.
 * Variant 0 takes the first distinct set (closest to the theme); each later
 * variant continues where the previous set stopped and never repeats its
 * colours — deterministic, never "reroll and hope".
 */
export function generateGroupColours(
  palette: Palette,
  profile: GroupProfile,
  ledger: ColourLedger,
  count: number,
  options: GroupColourOptions = {}
): Color[] {
  const tone = options.tone ?? BASE_TONE;
  const variant = Math.max(0, Math.floor(options.variant ?? 0)) % MAX_GROUP_VARIANTS;
  const biases = PROFILE_HUE_BIAS[profile] ?? [];
  const recipes = DEPTH_RECIPES[profile];
  const pool: Hsl[] = [];
  const poolHexes = new Set<string>();

  const consider = (raw: Hsl): void => {
    // Judge the colour exactly as it will be shown (after hex rounding).
    const hex = hslToHex(adjustForWedding(applyTone(raw, tone), tone.maxSat));
    if (poolHexes.has(hex)) return;
    const candidate = hexToHsl(hex);
    if (isBridalWhite(candidate)) return;
    if (ledger.isNearTaken(candidate)) return;
    poolHexes.add(hex);
    pool.push(candidate);
  };

  const seeds = [
    ...new Set([
      ...(options.leadHues ?? []).map(Math.round),
      ...seedHues(palette),
    ]),
  ];
  for (const seed of seeds) {
    for (const relation of RELATIONSHIP_LADDER) {
      const baseHue = normalizeHue(seed + relation);
      const hueVariants = [baseHue, ...biases.map((b) => normalizeHue(baseHue + b))];
      for (const hue of hueVariants) {
        for (const recipe of recipes) consider({ h: hue, s: recipe.s, l: recipe.l });
      }
    }
  }

  // Widening for crowded weddings (groups late in line, e.g. guests, or
  // quiet styles where soft tones crowd together): sweep the whole wheel at
  // the group's own depths, then across a full deep-to-pale lightness ladder,
  // until a full distinct set exists. Deterministic and bounded.
  // Enough room for a full set plus at least one different set to
  // reshuffle into.
  const fullSet = () => {
    const first = selectWindow(pool, count, 0, new Set());
    return (
      first.picks.length >= count &&
      pool.length >= count * MIN_ALTERNATIVES &&
      nextWindow(pool, count, first) !== first
    );
  };
  // Stay close to the group's own character: lightness levels nearest its
  // recipes come first (so bridesmaids stay soft rather than turning deep),
  // at the group's own saturation and a slightly richer one.
  const meanL = recipes.reduce((sum, r) => sum + r.l, 0) / recipes.length;
  const meanS = recipes.reduce((sum, r) => sum + r.s, 0) / recipes.length;
  const WIDEN_DEPTHS = [
    ...recipes,
    ...[...WIDEN_LIGHTNESS]
      .sort((a, b) => Math.abs(a - meanL) - Math.abs(b - meanL) || a - b)
      .flatMap((l) => [{ s: meanS, l }, { s: meanS + 14, l }]),
  ];
  for (const recipe of WIDEN_DEPTHS) {
    if (fullSet()) break;
    for (let hue = 0; hue < 360; hue += 15) {
      consider({ h: normalizeHue(seeds[0] + hue), s: recipe.s, l: recipe.l });
    }
  }

  let window = selectWindow(pool, count, 0, new Set());
  if (window.picks.length < count) {
    // Truly crowded: show what exists rather than nothing.
    return window.picks.map((hsl) => colorFromHsl(hsl, profile));
  }
  for (let v = 1; v <= variant; v += 1) {
    window = nextWindow(pool, count, window);
  }

  return window.picks.map((hsl) => colorFromHsl(hsl, profile));
}
