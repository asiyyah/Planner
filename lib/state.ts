import type { CoordinationMode, PlannerInputs, WeddingStyleId, WeddingTypeId } from "@/types";
import { WEDDING_TYPE_IDS } from "@/lib/styling";

/**
 * Compact URL codec so a generated style guide is fully shareable via
 * /guide?d=… without any backend (PRD §9, §34-9).
 *
 * v3 format — dynamic colour list + multi-select wedding types:
 *   hex1,hex2,…|type1+type2|styles|coordination
 *
 * Backward compatible: payloads with a single wedding type (v2, no "+")
 * and the legacy v1 format (color1|color2|type|styles|coordination)
 * still decode.
 */

const HEX_RE = /^([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

const STYLE_IDS = new Set<WeddingStyleId>([
  "classic",
  "elegant",
  "modern",
  "romantic",
  "traditional",
  "minimal",
  "bold",
  "luxury",
]);

const COORD_OK = new Set<string>(["same", "different"]);

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim().replace(/^#/, "");
  if (!HEX_RE.test(trimmed)) return null;
  const upper = trimmed.toUpperCase();
  const expanded =
    upper.length === 3
      ? upper
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : upper;
  return `#${expanded}`;
}

/** Parse a comma-separated list of hexes; requires at least one valid colour. */
function parseColorList(raw: string): string[] | null {
  const parts = raw.split(",").filter(Boolean);
  if (parts.length === 0) return null;
  const colors: string[] = [];
  for (const part of parts) {
    const normalized = normalizeHex(part);
    if (!normalized) return null;
    if (!colors.includes(normalized)) colors.push(normalized);
  }
  return colors;
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
    if (!WEDDING_TYPE_IDS.includes(part as WeddingTypeId)) return null;
    if (!weddingTypes.includes(part as WeddingTypeId)) {
      weddingTypes.push(part as WeddingTypeId);
    }
  }
  if (!COORD_OK.has(coordination)) return null;

  const styles = stylesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s): s is WeddingStyleId => STYLE_IDS.has(s as WeddingStyleId));

  return {
    weddingTypes,
    styles,
    coordination: coordination as CoordinationMode,
  };
}

export function encodeInputs(inputs: PlannerInputs): string {
  const compact = [
    inputs.colors.map((hex) => hex.replace("#", "")).join(","),
    inputs.weddingTypes.join("+"),
    inputs.styles.join(","),
    inputs.coordination,
  ].join("|");
  return encodeURIComponent(compact);
}

export function decodeInputs(raw: string): PlannerInputs | null {
  try {
    const parts = decodeURIComponent(raw).split("|");

    if (parts.length === 4) {
      const [colorsRaw, weddingTypesRaw, stylesRaw, coordination] = parts;
      const colors = parseColorList(colorsRaw);
      if (!colors) return null;
      const tail = parseTail(weddingTypesRaw, stylesRaw, coordination);
      if (!tail) return null;
      return { colors, ...tail };
    }

    // Legacy v1 payload: two fixed colour slots.
    if (parts.length === 5) {
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
