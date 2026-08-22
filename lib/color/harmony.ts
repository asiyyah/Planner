import type { HarmonyName } from "@/types";
import { hueDistance, normalizeHue, type Hsl } from "./conversion";

/**
 * Colour Harmony Engine (iteration §7–11).
 *
 * Pure colour-wheel mathematics. Takes a base colour in HSL and returns a
 * structured set of colours realising the requested harmony mode. Hue is the
 * meaningful output; saturation/lightness inherit from the base so results are
 * usable colours rather than bare hues. Wedding-friendly refinement happens in
 * a separate layer (`wedding-adjustments.ts`) — never here.
 */

export type HarmonyOptions = {
  /** Angular distance for analogous neighbours (default 30°). */
  spread?: number;
  /** Offset from the complement for split-complementary (default 30°). */
  offset?: number;
  /** Smaller angle of the tetradic rectangle (default 60°). */
  angle?: number;
};

/** Default wedding-friendly approach when no explicit mode is chosen. */
export const DEFAULT_HARMONY: HarmonyName = "analogous";

export const HARMONY_MODES: HarmonyName[] = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "tetradic",
  "square",
  "monochromatic",
];

function rebase(base: Hsl, hue: number): Hsl {
  return { h: normalizeHue(hue), s: base.s, l: base.l };
}

/** The colour opposite the base hue: H + 180°. */
export function generateComplementary(base: Hsl): Hsl[] {
  return [rebase(base, base.h), rebase(base, base.h + 180)];
}

/** Colours adjacent to the base hue, configurable spread. */
export function generateAnalogous(base: Hsl, spread = 30): Hsl[] {
  return [
    rebase(base, base.h - spread),
    rebase(base, base.h),
    rebase(base, base.h + spread),
  ];
}

/** Three colours separated by ~120°. */
export function generateTriadic(base: Hsl): Hsl[] {
  return [
    rebase(base, base.h),
    rebase(base, base.h + 120),
    rebase(base, base.h + 240),
  ];
}

/** Base plus the two colours surrounding its complement. */
export function generateSplitComplementary(base: Hsl, offset = 30): Hsl[] {
  const complement = base.h + 180;
  return [
    rebase(base, base.h),
    rebase(base, complement - offset),
    rebase(base, complement + offset),
  ];
}

/** Two complementary pairs forming a rectangle on the wheel. */
export function generateTetradic(base: Hsl, angle = 60): Hsl[] {
  return [
    rebase(base, base.h),
    rebase(base, base.h + angle),
    rebase(base, base.h + 180),
    rebase(base, base.h + 180 + angle),
  ];
}

/** Four hues separated by ~90°. */
export function generateSquare(base: Hsl): Hsl[] {
  return [
    rebase(base, base.h),
    rebase(base, base.h + 90),
    rebase(base, base.h + 180),
    rebase(base, base.h + 270),
  ];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Variations of a single hue through lightness and gentle saturation shifts —
 * a palette, not a duplicate.
 */
export function generateMonochromatic(
  base: Hsl,
  steps: number[] = [-24, -12, 12]
): Hsl[] {
  return steps.map((delta) => ({
    h: base.h,
    s: clamp(base.s - Math.abs(delta) / 6, 8, 90),
    l: clamp(base.l + delta, 14, 92),
  }));
}

/** Central entry point: any base colour → any harmony mode → palette plan. */
export function generateHarmony(
  base: Hsl,
  mode: HarmonyName,
  options: HarmonyOptions = {}
): Hsl[] {
  switch (mode) {
    case "complementary":
      return generateComplementary(base);
    case "analogous":
      return generateAnalogous(base, options.spread ?? 30);
    case "triadic":
      return generateTriadic(base);
    case "split-complementary":
      return generateSplitComplementary(base, options.offset ?? 30);
    case "tetradic":
      return generateTetradic(base, options.angle ?? 60);
    case "square":
      return generateSquare(base);
    case "monochromatic":
      return generateMonochromatic(base);
  }
}

/* ------------------------- Multi-anchor classification ------------------------ */

/** Signed shortest rotation between two hues (-180–180). */
function signedDelta(a: number, b: number): number {
  const d = normalizeHue(b - a);
  return d > 180 ? d - 360 : d;
}

/** Midpoint of two hues on the colour wheel (wrap-safe). */
export function hueMidpoint(a: number, b: number): number {
  return normalizeHue(a + signedDelta(a, b) / 2);
}

/**
 * Classify the relationship between two hues (or one hue alone) into a
 * harmony mode. Used when users pick multiple anchor colours.
 */
export function classifyPair(
  hue1: number,
  hue2?: number
): HarmonyName | null {
  if (hue2 === undefined || hueDistance(hue1, hue2) < 1) {
    return null; // effectively monochromatic anchors
  }
  const d = hueDistance(hue1, hue2);
  if (d <= 40) return "analogous";
  if (d <= 80) return "analogous";
  if (d <= 135) return "triadic";
  if (d <= 165) return "split-complementary";
  return "complementary";
}

/**
 * Choose the harmony that best explains a set of chromatic anchor hues:
 *   • 1 anchor  → default wedding approach (analogous)
 *   • 2 anchors → pair classification
 *   • 3+        → spacing-based detection (square / triadic / tetradic / …)
 */
export function classifyAnchors(anchors: Hsl[]): HarmonyName {
  if (anchors.length === 0) return DEFAULT_HARMONY;
  if (anchors.length === 1) return DEFAULT_HARMONY;

  const first = anchors[0];
  if (anchors.length === 2) {
    return classifyPair(first.h, anchors[1].h) ?? "monochromatic";
  }

  // Sort hues around the wheel and measure the gaps between neighbours.
  const sorted = [...new Set(anchors.map((a) => a.h))]
    .map(normalizeHue)
    .sort((a, b) => a - b);

  if (sorted.length < 3) {
    return classifyPair(sorted[0], sorted[1]) ?? "monochromatic";
  }

  const gaps = sorted.map((hue, i) => {
    const next = sorted[(i + 1) % sorted.length];
    return next > hue ? next - hue : next + 360 - hue;
  });

  // A wrap-around gap close to 360 means all hues cluster on one side.
  const maxGap = Math.max(...gaps);
  if (maxGap >= 200) {
    // Anchors live in one arc: fall back to pair-style reading.
    return classifyPair(first.h, sorted[1]) ?? DEFAULT_HARMONY;
  }

  const meanGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;

  if (meanGap > 105 && meanGap <= 135) return "triadic";
  if (meanGap > 75 && meanGap <= 105) return "square";

  // Two near-opposite pairs read as tetradic.
  const oppositePairs = gaps.filter((g) => Math.abs(g - 180) < 25).length;
  if (oppositePairs >= 1 && sorted.length === 4) return "tetradic";

  return DEFAULT_HARMONY;
}

/** Convenience for tests and tooling: hues produced by a mode from a base. */
export function harmonyHues(
  base: Hsl,
  mode: HarmonyName,
  options?: HarmonyOptions
): number[] {
  return generateHarmony(base, mode, options).map((c) => c.h);
}
