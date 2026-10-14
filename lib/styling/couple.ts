import type { Color, CoupleGuide, CoupleLook } from "@/types";
import {
  hexToHsl,
  hueDistance,
  normalizeHue,
  type Hsl,
} from "@/lib/color/conversion";
import type { StyleTone } from "@/data/style-tones";
import { adjustForWedding, applyTone } from "@/lib/color/wedding-adjustments";
import {
  colorFromHsl,
  colorToHsl,
  isAchromatic,
  isNearDuplicate,
  isWarm,
  makeGeneratedColor,
} from "@/lib/color/palette";
import { TRADITIONAL_TYPES } from "@/lib/constants";
import { rankFabrics, rankOutfits } from "./catalog";
import { type StylingContext, variantOf } from "./context";

/**
 * The Couple Engine (iteration 02 §9–13, §19).
 *
 * Builds two distinct looks for the couple and reports the colours those
 * looks consume. Everything the couple wears becomes exclusive — downstream
 * groups must generate their own theme-derived colours instead.
 *
 * Wedding types influence the direction of each look (e.g. a traditional
 * celebration leans one way, a white wedding the other) without hard-coding
 * a fixed type→look mapping: with a single type selected, both looks still
 * emerge as distinct interpretations of the same palette.
 */

export type CoupleBuild = {
  couple: CoupleGuide;
  /** Every colour worn by either look — exclusive to the couple. */
  assignedHexes: string[];
};

/** Pool colours meaningfully distinct from `base`'s hue, in pool order. */
function distinctHues(
  base: Color,
  pool: Color[],
  minHueGap = 24
): Color[] {
  return pool.filter(
    (c) =>
      c.hex !== base.hex &&
      !isAchromatic(c) &&
      !isAchromatic(base) &&
      hueDistance(base.hue, c.hue) >= minHueGap
  );
}

/** Pick the `variant`-th option, wrapping; undefined for an empty list. */
function rotate<T>(options: T[], variant: number): T | undefined {
  return options.length > 0 ? options[variant % options.length] : undefined;
}

/** Monochromatic fallback so Look 2 exists even in single-hue palettes. */
function deriveLookTwoPrimary(
  hero: Color,
  usedHexes: string[],
  tone: StyleTone
): Color {
  const base = colorToHsl(hero);
  const candidates: Hsl[] = [
    { h: base.h, s: Math.max(10, base.s - 8), l: base.l >= 50 ? Math.max(24, base.l - 26) : Math.min(80, base.l + 26) },
    { h: normalizeHue(base.h + 178), s: Math.max(12, Math.min(46, base.s)), l: base.l >= 50 ? 38 : 66 },
    { h: normalizeHue(base.h + 30), s: Math.max(10, base.s - 6), l: base.l >= 50 ? 62 : 40 },
  ];
  for (const candidate of candidates) {
    const shaped = adjustForWedding(applyTone(candidate, tone), tone.maxSat);
    if (
      !usedHexes.some((hex) => isNearDuplicate(hexToHsl(hex), shaped)) &&
      hueDistance(shaped.h, hero.hue) > 0
    ) {
      return colorFromHsl(shaped, "couple-look2");
    }
  }
  return makeGeneratedColor({ ...base, l: base.l >= 50 ? 28 : 74 }, "couple-look2", tone);
}

/** Allocate disjoint outfit/fabric names across the two looks. */
function allocateRankings(
  ctx: StylingContext,
  primaryBias: "traditional" | "contemporary"
): {
  lookOne: { outfits: string[]; fabrics: string[] };
  lookTwo: { outfits: string[]; fabrics: string[] };
} {
  const biasFor = (preference: "traditional" | "contemporary") => {
    const tradType = ctx.weddingTypes.find((t) => TRADITIONAL_TYPES.includes(t));
    const westernType = ctx.weddingTypes.find((t) => !TRADITIONAL_TYPES.includes(t));
    if (preference === "traditional") return tradType ?? westernType;
    return westernType ?? tradType;
  };

  // Look 1 outfits: best female + best male entry under its bias.
  const takenOutfits = new Set<string>();
  const outfitOne: string[] = [];
  for (const gender of ["female", "male"] as const) {
    const ranked = rankOutfits(
      gender,
      "couple",
      ctx.weddingTypes,
      ctx.styles,
      biasFor(primaryBias)
    );
    if (ranked[0]) {
      outfitOne.push(ranked[0]);
      takenOutfits.add(ranked[0]);
    }
  }

  // Look 2: opposite preference, never repeating Look 1's picks.
  const opposite = primaryBias === "traditional" ? "contemporary" : "traditional";
  const outfitTwo: string[] = [];
  for (const gender of ["female", "male"] as const) {
    const ranked = rankOutfits(gender, "couple", ctx.weddingTypes, ctx.styles, biasFor(opposite))
      .filter((name) => !takenOutfits.has(name));
    if (ranked[0]) {
      outfitTwo.push(ranked[0]);
      takenOutfits.add(ranked[0]);
    }
  }

  // Fabrics follow the same bias split with no repeats.
  const fabricsOne = rankFabrics("couple", ctx.weddingTypes, ctx.styles, {
    biasType: biasFor(primaryBias),
  }).slice(0, 2);
  const fabricsTwo = rankFabrics("couple", ctx.weddingTypes, ctx.styles, {
    biasType: biasFor(opposite),
  })
    .filter((name) => !fabricsOne.includes(name))
    .slice(0, 2);

  return {
    lookOne: { outfits: outfitOne, fabrics: fabricsOne },
    lookTwo: { outfits: outfitTwo, fabrics: fabricsTwo },
  };
}

/** Drop missing entries and repeated hexes, keeping first occurrences. */
function uniqueColours(colours: (Color | undefined)[]): Color[] {
  const seen = new Set<string>();
  return colours.filter((c): c is Color => {
    if (!c || seen.has(c.hex)) return false;
    seen.add(c.hex);
    return true;
  });
}

export function buildCouple(ctx: StylingContext): CoupleBuild {
  const { palette, styles } = ctx;

  const variant = variantOf(ctx, "couple");

  const hero = palette.hero;
  // Reshuffling rotates every pairing choice below.
  const lookOneOptions = uniqueColours([
    palette.accent,
    palette.neutral,
    ...palette.supporting,
  ]).filter((c) => c.hex !== hero.hex);
  const lookOneCompanion = rotate(lookOneOptions, variant) ?? palette.neutral;

  const pool = uniqueColours([
    palette.secondary,
    ...palette.supporting,
    ...palette.anchors.filter((a) => a.hex !== hero.hex),
  ]).filter((c) => c.hex !== lookOneCompanion.hex);

  const lookTwoPrimary =
    rotate(distinctHues(hero, pool), variant) ??
    deriveLookTwoPrimary(hero, [hero.hex, lookOneCompanion.hex], ctx.tone);

  const remaining = uniqueColours([
    palette.neutral,
    ...palette.supporting,
    palette.accent,
    palette.secondary,
  ]).filter(
    (c) => c.hex !== lookTwoPrimary.hex && c.hex !== lookOneCompanion.hex && c.hex !== hero.hex
  );
  const lookTwoCompanion =
    rotate(remaining, variant) ??
    deriveLookTwoPrimary(
      lookTwoPrimary,
      [hero.hex, lookOneCompanion.hex, lookTwoPrimary.hex],
      ctx.tone
    );

  const wantsTraditional =
    ctx.weddingTypes.some((t) => TRADITIONAL_TYPES.includes(t)) ||
    styles.includes("traditional");
  const allocation = allocateRankings(ctx, wantsTraditional ? "traditional" : "contemporary");

  const mood = (primary: Color) =>
    isWarm(primary) ? "rich, warm" : "cooler, contemporary";

  const lookOne: CoupleLook = {
    label: "Look 01",
    colors: [
      { name: hero.name, hex: hero.hex },
      { name: lookOneCompanion.name, hex: lookOneCompanion.hex },
    ],
    outfits: allocation.lookOne.outfits,
    fabrics: allocation.lookOne.fabrics,
    accessories: [
      `${palette.accent?.name ?? lookOneCompanion.name} details could finish both outfits`,
    ],
    notes: `Built around ${hero.name.toLowerCase()}, the deeper hero of your palette — ${mood(hero)} styling for the first look.`,
  };

  const lookTwo: CoupleLook = {
    label: "Look 02",
    colors: [
      { name: lookTwoPrimary.name, hex: lookTwoPrimary.hex },
      { name: lookTwoCompanion.name, hex: lookTwoCompanion.hex },
    ],
    outfits: allocation.lookTwo.outfits.length > 0 ? allocation.lookTwo.outfits : allocation.lookOne.outfits,
    fabrics: allocation.lookTwo.fabrics,
    accessories: [
      `${lookTwoCompanion.name} accents keep this second look connected to the first`,
    ],
    notes: `A ${mood(lookTwoPrimary)} interpretation pairing ${lookTwoPrimary.name.toLowerCase()} with ${lookTwoCompanion.name.toLowerCase()} — clearly part of the same wedding, unmistakably not the first look.`,
  };

  const assignedHexes = [...new Set([...lookOne.colors, ...lookTwo.colors].map((c) => c.hex))];

  return {
    couple: { group: "couple", title: "The Couple", looks: [lookOne, lookTwo] },
    assignedHexes,
  };
}
