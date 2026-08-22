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

/** Soft ceiling for generated saturation. */
export const MAX_WEDDING_SATURATION = 62;

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
 */
export function adjustForWedding({ h, s, l }: Hsl): Hsl {
  const hue = round(normalizeHue(h));
  const lightness = round(
    Math.max(MIN_WEDDING_LIGHTNESS, Math.min(MAX_WEDDING_LIGHTNESS, l))
  );

  if (s < 6) {
    // Intentionally near-neutral input stays near-neutral (lightness clamped).
    return { h: hue, s: round(s), l: lightness };
  }

  let saturation = s;
  if (saturation >= NEON_SATURATION) {
    // Hard neon: pull well inside the muted band.
    saturation = MAX_WEDDING_SATURATION - 8;
  } else if (saturation > MAX_WEDDING_SATURATION) {
    // Compress excess saturation rather than clipping it.
    const excess = saturation - MAX_WEDDING_SATURATION;
    saturation = MAX_WEDDING_SATURATION + excess * 0.35;
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

/**
 * A gentle neutral tone in the same temperature family as the base —
 * ivory/cream territory for warm palettes, soft white for cool ones.
 */
export function neutralTone(base: Hsl): Hsl {
  const warm = base.h <= 70 || base.h >= 330 || base.s < 6;
  return warm ? { h: 48, s: 24, l: 93 } : { h: 210, s: 10, l: 95 };
}

/** True when a colour already sits within wedding-friendly bounds. */
export function isWeddingFriendly({ h, s, l }: Hsl): boolean {
  void normalizeHue(h);
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
