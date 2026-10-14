import { BASE_TONE, STYLE_TONES, type StyleTone } from "@/data/style-tones";
import type { WeddingStyleId } from "@/types";
import { normalizeHue, type Hsl } from "./conversion";

/**
 * Wedding-friendly adjustment layer (iteration §13, §21).
 *
 * Raw colour-wheel maths can produce technically-correct-but-harsh colours —
 * a pure #FF7700 orange, say. This layer softens generated colours toward
 * what actually flatters a wedding: muted saturation, comfortable lightness,
 * room for neutrals to breathe.
 *
 * User-selected anchor colours are NEVER passed through here — the user's
 * vision is preserved exactly as chosen.
 */

/** Soft ceiling for generated saturation when no style says otherwise. */
export const MAX_WEDDING_SATURATION = BASE_TONE.maxSat;

/** Saturation above this reads as neon and gets pulled down harder. */
const NEON_SATURATION = 85;

/** Comfortable lightness window for generated colours. */
export const MIN_WEDDING_LIGHTNESS = 16;
export const MAX_WEDDING_LIGHTNESS = 90;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Mute and rebalance an arbitrary generated colour into wedding-friendly
 * territory. Deterministic; idempotent on already-gentle colours.
 * `maxSaturation` lets bolder styles raise the ceiling.
 */
export function adjustForWedding(
  { h, s, l }: Hsl,
  maxSaturation = MAX_WEDDING_SATURATION
): Hsl {
  const hue = round(normalizeHue(h));
  const lightness = round(
    Math.max(MIN_WEDDING_LIGHTNESS, Math.min(MAX_WEDDING_LIGHTNESS, l))
  );

  if (s < 6) {
    // Intentionally near-neutral input stays near-neutral (lightness clamped).
    return { h: hue, s: round(s), l: lightness };
  }

  let saturation = s;
  if (saturation >= Math.max(NEON_SATURATION, maxSaturation + 4)) {
    // Hard neon: pull well inside the band.
    saturation = maxSaturation - 8;
  } else if (saturation > maxSaturation) {
    // Compress excess saturation rather than clipping it.
    const excess = saturation - maxSaturation;
    saturation = maxSaturation + excess * 0.35;
  }

  return { h: hue, s: round(saturation), l: lightness };
}

/**
 * Depth recipe for a supporting colour that complements `base`:
 * deep heroes get soft, pale companions; light heroes get grounded ones.
 */
export function companionDepth(
  base: Hsl,
  index = 0
): { s: number; l: number } {
  if (base.l < 55) {
    return index % 2 === 0 ? { s: 26, l: 76 } : { s: 34, l: 60 };
  }
  return index % 2 === 0 ? { s: 36, l: 46 } : { s: 28, l: 66 };
}

/* ------------------------------- Style tone -------------------------------- */

/** Blend the tones of every selected style; no styles → the base tone. */
export function toneFor(styles: readonly WeddingStyleId[]): StyleTone {
  if (styles.length === 0) return BASE_TONE;
  const tones = styles.map((style) => STYLE_TONES[style]);
  const mean = (pick: (t: StyleTone) => number) =>
    tones.reduce((sum, t) => sum + pick(t), 0) / tones.length;
  return {
    satScale: mean((t) => t.satScale),
    lightShift: mean((t) => t.lightShift),
    maxSat: mean((t) => t.maxSat),
  };
}

/** Shift a generated colour's intensity and depth toward the style's tone. */
export function applyTone({ h, s, l }: Hsl, tone: StyleTone): Hsl {
  return {
    h,
    s: Math.max(0, Math.min(100, s * tone.satScale)),
    l: Math.max(8, Math.min(92, l + tone.lightShift)),
  };
}

/* --------------------------------- Neutrals -------------------------------- */

/**
 * Neutral options derived from the user's own colour — tinted whites,
 * creams and stones carrying a whisper of its hue, plus a deep neutral for
 * crisper styles. Ordered lightest-first; callers rotate for alternatives.
 */
export function neutralCandidates(
  base: Hsl,
  options: { deep?: boolean } = {}
): Hsl[] {
  const chromatic = base.s >= 8;
  const warm = !chromatic || base.h <= 70 || base.h >= 330;
  // Achromatic picks borrow a warm stone hue so neutrals don't read as grey.
  const h = chromatic ? base.h : 40;
  const tint = chromatic ? 1 : 0.6;
  const candidates: Hsl[] = [
    { h, s: (warm ? 30 : 16) * tint, l: 94 },
    { h, s: (warm ? 26 : 14) * tint, l: 87 },
    { h, s: (warm ? 16 : 10) * tint, l: 77 },
    { h, s: (warm ? 12 : 8) * tint, l: 64 },
  ];
  if (options.deep) candidates.push({ h, s: 10 * tint, l: 22 });
  return candidates;
}

/** True when a colour already sits within wedding-friendly bounds. */
export function isWeddingFriendly({ s, l }: Hsl): boolean {
  if (s < 6) return true;
  // Near-white / near-black reads as neutral regardless of nominal saturation
  // (HSL saturation blows up at the lightness extremes).
  if (l >= 93 || l <= 10) return true;
  return (
    s <= MAX_WEDDING_SATURATION &&
    l >= MIN_WEDDING_LIGHTNESS - 2 &&
    l <= MAX_WEDDING_LIGHTNESS + 2
  );
}
