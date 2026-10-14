import type { WeddingStyleId } from "@/types";

/**
 * How each wedding style shapes generated colours (never the user's picks).
 *
 *   satScale    multiplies saturation — richer above 1, quieter below
 *   lightShift  adds lightness — deeper when negative, airier when positive
 *   maxSat      soft saturation ceiling for generated colours
 */
export type StyleTone = {
  satScale: number;
  lightShift: number;
  maxSat: number;
};

/** Applied when no style is selected. */
export const BASE_TONE: StyleTone = { satScale: 1, lightShift: 0, maxSat: 62 };

export const STYLE_TONES: Record<WeddingStyleId, StyleTone> = {
  bold: { satScale: 1.45, lightShift: -4, maxSat: 82 },
  traditional: { satScale: 1.3, lightShift: -6, maxSat: 76 },
  luxury: { satScale: 1.25, lightShift: -10, maxSat: 72 },
  modern: { satScale: 1.05, lightShift: 0, maxSat: 66 },
  classic: { satScale: 0.95, lightShift: -2, maxSat: 60 },
  elegant: { satScale: 0.85, lightShift: -4, maxSat: 56 },
  romantic: { satScale: 0.8, lightShift: 10, maxSat: 52 },
  minimal: { satScale: 0.6, lightShift: 6, maxSat: 44 },
};
