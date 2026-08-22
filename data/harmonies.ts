import type { HarmonyName } from "@/types";

export type HarmonyMeta = {
  id: HarmonyName;
  label: string;
  /** Plain-language description used when explaining a generated palette. */
  description: string;
};

/** Harmony rules (PRD §12) with user-facing copy. */
export const HARMONIES: Record<HarmonyName, HarmonyMeta> = {
  complementary: {
    id: "complementary",
    label: "Complementary",
    description:
      "opposites on the colour wheel that bring out the best in each other",
  },
  analogous: {
    id: "analogous",
    label: "Analogous",
    description: "neighbouring hues that blend effortlessly together",
  },
  triadic: {
    id: "triadic",
    label: "Triadic",
    description: "three evenly spaced colours with lively balance",
  },
  "split-complementary": {
    id: "split-complementary",
    label: "Split Complementary",
    description:
      "a base hue softened by two gentle neighbours of its opposite",
  },
  tetradic: {
    id: "tetradic",
    label: "Tetradic",
    description:
      "two complementary pairs forming a rich, balanced rectangle of colour",
  },
  square: {
    id: "square",
    label: "Square",
    description:
      "four evenly spaced hues working together in confident harmony",
  },
  monochromatic: {
    id: "monochromatic",
    label: "Monochromatic",
    description: "one hue explored through depth, from rich to pale",
  },
};

/**
 * Tone vocabulary used to build plain-language palette explanations
 * (PRD §13). Keyed by warmth and depth of the hero colour.
 */
export const TONE_WORDS = {
  warm: ["warm", "earthy", "sunlit"],
  cool: ["cool", "serene", "crisp"],
  deep: ["deep", "rich", "dramatic"],
  light: ["soft", "airy", "delicate"],
} as const;
