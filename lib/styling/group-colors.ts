import { COLORS } from "@/data/colors";
import type { Color, Palette } from "@/types";
import {
  hexToHsl,
  hslToHex,
  normalizeHue,
  type Hsl,
} from "@/lib/color/conversion";
import { adjustForWedding } from "@/lib/color/wedding-adjustments";
import {
  colorToHsl,
  isAchromatic,
  isNearDuplicate,
  makeGeneratedColor,
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
  /** Hexes already spoken for: couple-assigned plus prior groups' picks. */
  readonly taken: string[] = [];

  claim(hexes: string[]): void {
    for (const hex of hexes) {
      if (!this.taken.includes(hex)) this.taken.push(hex);
    }
  }

  isTaken(hex: string): boolean {
    return this.isNearTaken(hexToHsl(hex));
  }

  isNearTaken(candidate: Hsl): boolean {
    return this.taken.some((hex) => isNearDuplicate(candidate, hexToHsl(hex)));
  }
}

/**
 * Generate `count` distinct colours for a non-couple group: harmonised with
 * the master palette, shaped for the group, and guaranteed clear of every
 * ledger entry (the couple's exclusive colours come first).
 */
export function generateGroupColours(
  palette: Palette,
  profile: GroupProfile,
  ledger: ColourLedger,
  count: number
): Color[] {
  const accepted: Color[] = [];
  const biases = PROFILE_HUE_BIAS[profile] ?? [];
  const recipes = DEPTH_RECIPES[profile];

  const tryCandidate = (hue: number, recipeIndex: number): boolean => {
    const recipe = recipes[recipeIndex % recipes.length];
    const candidate = adjustForWedding({
      h: normalizeHue(hue),
      s: recipe.s,
      l: recipe.l,
    });
    const hex = hslToHex(candidate);

    if (accepted.some((c) => c.hex === hex)) return false;
    if (isBridalWhite(candidate)) return false;
    if (ledger.isNearTaken(candidate)) return false;
    if (
      accepted.some((c) => isNearDuplicate(candidate, colorToHsl(c)))
    ) {
      return false;
    }

    accepted.push(makeGeneratedColor(candidate, profile));
    return true;
  };

  const seeds = seedHues(palette);

  outer: for (const seed of seeds) {
    for (const relation of RELATIONSHIP_LADDER) {
      const baseHue = normalizeHue(seed + relation);
      const hueVariants = [baseHue, ...biases.map((b) => normalizeHue(baseHue + b))];
      for (const hue of hueVariants) {
        for (let r = 0; r < recipes.length; r += 1) {
          if (tryCandidate(hue, r) && accepted.length >= count) break outer;
        }
      }
    }
  }

  // Guaranteed-termination widening: deepen/lighten progressively until the
  // count is met. Deterministic, and unreachable in practice.
  let widenStep = 0;
  while (accepted.length < count && widenStep < 24) {
    const seed = seeds[widenStep % seeds.length];
    const hue = normalizeHue(seed + ((widenStep * 17) % 360));
    const l = 24 + ((widenStep * 9) % 64);
    const s = 12 + ((widenStep * 7) % 40);
    const candidate = adjustForWedding({ h: hue, s, l });
    const hex = hslToHex(candidate);
    if (
      !accepted.some((c) => c.hex === hex) &&
      !isBridalWhite(candidate) &&
      !ledger.isNearTaken(candidate) &&
      !accepted.some((c) => isNearDuplicate(candidate, colorToHsl(c)))
    ) {
      accepted.push(makeGeneratedColor(candidate, profile));
    }
    widenStep += 1;
  }

  ledger.claim(accepted.map((c) => c.hex));
  return accepted;
}
