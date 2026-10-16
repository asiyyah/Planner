import type {
  PlannerInputs,
  Traditions,
  Variants,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { normalizeHex } from "@/lib/color/conversion";
import {
  isCoordinationMode,
  isCultureId,
  isStyleId,
  isWeddingTypeId,
  MAX_COLORS,
  MAX_VARIANT,
  VARIANT_KEYS,
} from "@/lib/constants";

/**
 * Compact URL codec so a generated style guide is fully shareable via
 * /guide?d=… without any backend (PRD §9, §34-9).
 *
 * v5 format — colours, multi-select wedding types, optional reshuffles and
 * optional traditions:
 *   hex1,hex2|type1+type2|styles|coordination[|p.c.b.g.m.n.u[|bride,groom,b]]
 * The fifth segment holds "Regenerate" counters in VARIANT_KEYS order,
 * dot-separated with trailing zeros trimmed (empty when all are 0). The
 * sixth holds the bride's and groom's cultures and whose ceremony the
 * couple's traditional look follows ("b" or "g"); it is omitted when unset.
 *
 * Backward compatible: v3 (no fifth segment), v2 (a single wedding type)
 * and the legacy v1 format (color1|color2|type|styles|coordination) still
 * decode. Colours beyond MAX_COLORS are dropped.
 */

/**
 * Parse a comma-separated list of hexes; requires at least one valid colour.
 * Extra colours beyond MAX_COLORS are dropped, matching what the wizard allows.
 */
function parseColorList(raw: string): string[] | null {
  const parts = raw.split(",").filter(Boolean);
  if (parts.length === 0) return null;
  const colors: string[] = [];
  for (const part of parts) {
    const normalized = normalizeHex(part);
    if (!normalized) return null;
    if (!colors.includes(normalized)) colors.push(normalized);
  }
  return colors.slice(0, MAX_COLORS);
}

function parseTail(
  weddingTypesRaw: string,
  stylesRaw: string,
  coordination: string
): Pick<PlannerInputs, "weddingTypes" | "styles" | "coordination"> | null {
  // "+"-separated since v3; a single value decodes as a one-element array.
  const typeParts = weddingTypesRaw.split("+").filter(Boolean);
  if (typeParts.length === 0) return null;
  const weddingTypes: WeddingTypeId[] = [];
  for (const part of typeParts) {
    if (!isWeddingTypeId(part)) return null;
    if (!weddingTypes.includes(part)) weddingTypes.push(part);
  }
  if (!isCoordinationMode(coordination)) return null;

  const styles: WeddingStyleId[] = [];
  for (const part of stylesRaw.split(",")) {
    const style = part.trim();
    if (isStyleId(style) && !styles.includes(style)) styles.push(style);
  }

  return { weddingTypes, styles, coordination };
}

/** Clamp an untrusted reshuffle counter to a small non-negative integer. */
export function normalizeVariant(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_VARIANT, Math.floor(n));
}

function encodeVariants(variants: Variants | undefined): string {
  const counts = VARIANT_KEYS.map((key) => normalizeVariant(variants?.[key]));
  while (counts.length > 0 && counts[counts.length - 1] === 0) counts.pop();
  return counts.join(".");
}

/** Parse the dot-separated counters; anything malformed reads as 0. */
function parseVariants(raw: string): Variants | undefined {
  const variants: Variants = {};
  raw.split(".").forEach((part, i) => {
    const key = VARIANT_KEYS[i];
    const value = normalizeVariant(part);
    if (key && value > 0) variants[key] = value;
  });
  return Object.keys(variants).length > 0 ? variants : undefined;
}

function encodeTraditions(traditions: Traditions): string {
  return [traditions.bride, traditions.groom, traditions.ceremony === "groom" ? "g" : "b"].join(",");
}

/** Parse "bride,groom,b|g"; anything malformed reads as no traditions. */
export function parseTraditions(raw: string): Traditions | undefined {
  const [bride, groom, ceremony] = raw.split(",");
  if (!isCultureId(bride) || !isCultureId(groom)) return undefined;
  return { bride, groom, ceremony: ceremony === "g" ? "groom" : "bride" };
}

export function encodeInputs(inputs: PlannerInputs): string {
  const parts = [
    inputs.colors.map((hex) => hex.replace("#", "")).join(","),
    inputs.weddingTypes.join("+"),
    inputs.styles.join(","),
    inputs.coordination,
  ];
  const variants = encodeVariants(inputs.variants);
  if (inputs.traditions) {
    parts.push(variants, encodeTraditions(inputs.traditions));
  } else if (variants) {
    parts.push(variants);
  }
  return encodeURIComponent(parts.join("|"));
}

export function decodeInputs(raw: string): PlannerInputs | null {
  try {
    const parts = decodeURIComponent(raw).split("|");

    // v1 also has five segments, but ends in the coordination mode.
    const legacy = parts.length === 5 && isCoordinationMode(parts[4]);

    if (parts.length === 4 || (parts.length === 5 && !legacy) || parts.length === 6) {
      const [colorsRaw, weddingTypesRaw, stylesRaw, coordination, variantsRaw, traditionsRaw] = parts;
      const colors = parseColorList(colorsRaw);
      if (!colors) return null;
      const tail = parseTail(weddingTypesRaw, stylesRaw, coordination);
      if (!tail) return null;
      const variants = variantsRaw ? parseVariants(variantsRaw) : undefined;
      const traditions = traditionsRaw ? parseTraditions(traditionsRaw) : undefined;
      return {
        colors,
        ...tail,
        ...(variants ? { variants } : {}),
        ...(traditions ? { traditions } : {}),
      };
    }

    // Legacy v1 payload: two fixed colour slots.
    if (legacy) {
      const [color1, color2, weddingType, stylesRaw, coordination] = parts;
      const first = normalizeHex(color1);
      if (!first) return null;
      const second = color2 ? normalizeHex(color2) : null;
      if (color2 && !second) return null;
      const tail = parseTail(weddingType, stylesRaw, coordination);
      if (!tail) return null;
      return { colors: second ? [first, second] : [first], ...tail };
    }

    return null;
  } catch {
    return null;
  }
}
