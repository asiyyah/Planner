import type {
  CoordinationMode,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";

/**
 * Canonical option IDs shared by the codec, storage, data libraries and the
 * styling engine. Dependency-free so client code (codec, saved page) never
 * pulls the engine into its bundle.
 */

export const WEDDING_TYPE_IDS: readonly WeddingTypeId[] = [
  "traditional",
  "white",
  "traditional-white",
  "civil",
  "other",
];

/** Types whose celebrations call for Nigerian traditional attire. */
export const TRADITIONAL_TYPES: readonly WeddingTypeId[] = [
  "traditional",
  "traditional-white",
];

export const STYLE_IDS: readonly WeddingStyleId[] = [
  "classic",
  "elegant",
  "modern",
  "romantic",
  "traditional",
  "minimal",
  "bold",
  "luxury",
];

export const COORDINATION_MODES: readonly CoordinationMode[] = [
  "same",
  "different",
];

/** Upper bound on selected colours per guide — generous, not a fixed slot count. */
export const MAX_COLORS = 8;

export function isWeddingTypeId(value: unknown): value is WeddingTypeId {
  return WEDDING_TYPE_IDS.includes(value as WeddingTypeId);
}

export function isStyleId(value: unknown): value is WeddingStyleId {
  return STYLE_IDS.includes(value as WeddingStyleId);
}

export function isCoordinationMode(value: unknown): value is CoordinationMode {
  return COORDINATION_MODES.includes(value as CoordinationMode);
}
