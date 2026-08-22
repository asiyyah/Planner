import { COLORS } from "@/data/colors";
import { HARMONIES, TONE_WORDS } from "@/data/harmonies";
import type { Color, ColorCategory, HarmonyName, Palette } from "@/types";
import {
  hexToHsl,
  hslToHex,
  hueDistance,
  normalizeHue,
  type Hsl,
} from "./conversion";
import {
  classifyAnchors,
  DEFAULT_HARMONY,
  generateHarmony,
} from "./harmony";
import {
  adjustForWedding,
  companionDepth,
  neutralTone,
} from "./wedding-adjustments";

/**
 * Palette Engine (iteration §9, §12, §21).
 *
 * Layer 1 — the harmony engine decides *which colours harmonise* (full
 * selectable colour space, never snapped to the library).
 * Layer 2 — this module decides *how those colours are used*: combines the
 * user's anchors with generated supporting colours, assigns roles, and leans
 * on the curated library only for tasteful neutrals/metals and naming.
 */

/* ------------------------------ Colour helpers ----------------------------- */

export function colorToHsl(color: Color): Hsl {
  return { h: color.hue, s: color.saturation, l: color.lightness };
}

export function weightedDistance(a: Hsl, b: Hsl): number {
  const dh = hueDistance(a.h, b.h) / 180;
  const chromaWeight = 0.35 + 0.4 * ((a.s + b.s) / 200);
  const ds = Math.abs(a.s - b.s) / 100;
  const dl = Math.abs(a.l - b.l) / 100;
  return Math.sqrt(chromaWeight * dh * dh + ds * ds * 0.9 + dl * dl);
}

/**
 * Perceptual closeness threshold for colour exclusivity (iteration 02 §21):
 * colours closer than this read as "the same colour, renamed" and must not
 * be given to another group when the couple owns one of them.
 */
export const NEAR_DUPLICATE_DISTANCE = 0.2;

/**
 * True when two colours are perceptually too alike to sit in different
 * groups — exact matches, near-identical tones, and tight hue/depth
 * clusters ("Deep Burgundy" vs "Wine").
 */
export function isNearDuplicate(a: Hsl, b: Hsl): boolean {
  // Near-whites (metallics, ivories): hue and saturation blow up in HSL,
  // so judge by lightness band alone.
  if (Math.min(a.l, b.l) >= 90) return Math.abs(a.s - b.s) < 24;
  // True greys: only depth separates them.
  if (a.s < 12 && b.s < 12) return Math.abs(a.l - b.l) < 10;
  if (weightedDistance(a, b) < NEAR_DUPLICATE_DISTANCE) return true;
  // Tight cluster: same hue family at similar depth and intensity.
  return (
    hueDistance(a.h, b.h) < 14 &&
    Math.abs(a.s - b.s) < 15 &&
    Math.abs(a.l - b.l) < 15
  );
}

/** Convenience: hex-pair variant used by the exclusion checks. */
export function hexesNearDuplicate(hexA: string, hexB: string): boolean {
  return isNearDuplicate(hexToHsl(hexA), hexToHsl(hexB));
}

/** Snap an HSL value to the nearest curated library colour. */
export function snapToLibrary(hsl: Hsl, excludeIds: string[] = []): Color {
  const excluded = new Set(excludeIds);
  let best = COLORS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const color of COLORS) {
    if (excluded.has(color.id)) continue;
    const d = weightedDistance(hsl, colorToHsl(color));
    if (d < bestDist) {
      bestDist = d;
      best = color;
    }
  }
  return best;
}

/** How far an arbitrary colour may sit from a library entry to borrow its name. */
export const NAMING_TOLERANCE = 0.24;

/**
 * Nearest curated colour within naming tolerance — the library as optional
 * metadata (iteration §6). Returns null when a colour is truly its own thing.
 */
export function nearestLibraryColor(
  hsl: Hsl
): { color: Color; distance: number } | null {
  let best = COLORS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const color of COLORS) {
    const d = weightedDistance(hsl, colorToHsl(color));
    if (d < bestDist) {
      bestDist = d;
      best = color;
    }
  }
  return bestDist <= NAMING_TOLERANCE ? { color: best, distance: bestDist } : null;
}

export function isAchromatic(color: Color): boolean {
  return color.saturation < 8;
}

export function isWarm(color: Color): boolean {
  return color.hue <= 70 || color.hue >= 330;
}

export function isValidHexValue(hex: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(hex.trim().toUpperCase());
}

/** Normalise user hex input to canonical `#RRGGBB` form. */
export function normalizeHexInput(hex: string): string {
  let value = hex.trim().replace("#", "").toUpperCase();
  if (value.length === 3) {
    value = value
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (!/^[0-9A-F]{6}$/.test(value)) {
    throw new Error(`Invalid colour: ${hex}`);
  }
  return `#${value}`;
}

/* --------------------------- Descriptive naming ---------------------------- */

const HUE_FAMILIES: ReadonlyArray<{ max: number; name: string }> = [
  { max: 14, name: "Rose" },
  { max: 34, name: "Terracotta" },
  { max: 49, name: "Amber" },
  { max: 69, name: "Gold" },
  { max: 89, name: "Olive" },
  { max: 119, name: "Moss" },
  { max: 149, name: "Emerald" },
  { max: 179, name: "Teal" },
  { max: 209, name: "Sky" },
  { max: 244, name: "Blue" },
  { max: 269, name: "Indigo" },
  { max: 294, name: "Violet" },
  { max: 319, name: "Plum" },
  { max: 344, name: "Berry" },
  { max: 361, name: "Rose" },
];

function greyName(l: number): string {
  if (l >= 93) return "Off White";
  if (l >= 70) return "Cloud Grey";
  if (l >= 45) return "Stone Grey";
  if (l >= 25) return "Slate";
  return "Charcoal";
}

/** Build a graceful human label straight from HSL values. */
export function describeHsl({ h, s, l }: Hsl): string {
  if (s < 8) return greyName(l);
  const family =
    HUE_FAMILIES.find((f) => normalizeHue(h) < f.max)?.name ?? "Rose";
  if (l < 28) return `Deep ${family}`;
  if (l > 82) return `Pale ${family}`;
  if (s < 24) return `Dusty ${family}`;
  return family;
}

/** Library name when close enough, otherwise a descriptive fallback. */
export function describeColor(hex: string): string {
  const near = nearestLibraryColor(hexToHsl(hex));
  return near ? near.color.name : describeHsl(hexToHsl(hex));
}

/** Rough category inference so dynamic colours carry usable metadata. */
export function classifyColor({ h, s, l }: Hsl): ColorCategory {
  if (s < 8 || l >= 95 || l <= 6) return "neutral";
  const warm = h <= 75 || h >= 330;
  if (warm && s >= 22 && s < 52 && l <= 64) return "earthy";
  if (s >= 42 && l <= 58) return "jewel";
  if (s < 34 || l >= 72) return "soft";
  return warm ? "earthy" : "jewel";
}

/* ------------------------------ Colour builders ---------------------------- */

/** A user-selected anchor — exact hex preserved, named via metadata. */
export function makeAnchorColor(hex: string, index: number): Color {
  const normalized = normalizeHexInput(hex);
  const hsl = hexToHsl(normalized);
  const near = nearestLibraryColor(hsl);
  return {
    id: `anchor-${index}-${normalized.slice(1).toLowerCase()}`,
    name: near ? near.color.name : describeHsl(hsl),
    hex: normalized,
    hue: hsl.h,
    saturation: hsl.s,
    lightness: hsl.l,
    category: classifyColor(hsl),
  };
}

/** An engine-generated colour — always passed through the wedding filter. */
function makeGeneratedColor(hsl: Hsl, kind: string): Color {
  const adjusted = adjustForWedding(hsl);
  const hex = hslToHex(adjusted);
  return {
    id: `gen-${kind}-${hex.slice(1).toLowerCase()}`,
    name: describeColor(hex),
    hex,
    hue: adjusted.h,
    saturation: adjusted.s,
    lightness: adjusted.l,
    category: classifyColor(adjusted),
  };
}

/* ------------------------------ Role selection ----------------------------- */

const NEUTRAL_PRIORITY_WARM = ["ivory", "champagne", "cream", "beige", "taupe"];
const NEUTRAL_PRIORITY_COOL = ["white", "cream", "ivory", "taupe"];

const ACCENT_WARM = "gold";
const ACCENT_WARM_FALLBACK = "champagne-gold";
const ACCENT_COOL = "silver";
const ACCENT_ROSE = "rose-gold";

function pickNeutral(
  hero: Color,
  usedHexes: Set<string>
): Color {
  const priority = isWarm(hero) ? NEUTRAL_PRIORITY_WARM : NEUTRAL_PRIORITY_COOL;

  for (const id of priority) {
    const neutral = COLORS.find((c) => c.id === id);
    if (neutral && !usedHexes.has(neutral.hex)) return neutral;
  }
  const fallback = COLORS.find(
    (c) => c.category === "neutral" && !usedHexes.has(c.hex)
  );
  return fallback ?? neutralFallback(hero);
}

/** Last-resort neutral generated in the base's temperature family. */
function neutralFallback(hero: Color): Color {
  return makeGeneratedColor(neutralTone(colorToHsl(hero)), "neutral");
}

function pickAccent(
  hero: Color,
  secondary: Color | undefined,
  usedHexes: Set<string>
): Color | undefined {
  const pinkish =
    hero.saturation >= 10 &&
    hueDistance(hero.hue, 335) < 40 &&
    (secondary === undefined ||
      (secondary.saturation >= 10 && hueDistance(secondary.hue, 335) < 60));

  const order = pinkish
    ? [ACCENT_ROSE, ACCENT_WARM_FALLBACK]
    : isWarm(hero)
      ? [ACCENT_WARM, ACCENT_WARM_FALLBACK]
      : [ACCENT_COOL];

  for (const id of order) {
    const accent = COLORS.find((c) => c.id === id);
    if (accent && !usedHexes.has(accent.hex)) return accent;
  }
  return undefined;
}

/* --------------------------------- Explainer ------------------------------- */

function toneWords(hero: Color): string {
  const warmth = isWarm(hero) ? TONE_WORDS.warm[0] : TONE_WORDS.cool[0];
  const depth = hero.lightness < 45 ? TONE_WORDS.deep[0] : TONE_WORDS.light[0];
  return `${depth}, ${warmth}`;
}

function explain(palette: Omit<Palette, "explanation">): string {
  const tones = toneWords(palette.hero);
  const harmonyLabel = HARMONIES[palette.harmony].label.toLowerCase();

  const names = palette.anchors.map((a) => a.name.toLowerCase());
  const lead =
    names.length > 2
      ? `${names.slice(0, 2).join(" and ")} and your other picks`
      : names.join(" and ");

  const parts = [
    `Built around ${lead}`,
    `a ${tones} palette on ${harmonyLabel} colour relationships`,
    `balanced with ${palette.neutral.name.toLowerCase()}`,
  ];
  if (palette.accent) {
    parts.push(
      `finished with a subtle ${palette.accent.name.toLowerCase()} accent`
    );
  }
  return `${parts.join(", ")}.`;
}

/* -------------------------------- Entry point ------------------------------ */

/** Upper bound on selected colours per guide — generous, not a fixed slot count. */
export const MAX_COLORS = 8;

/**
 * Generate a wedding palette from one or more user-selected hex colours.
 *
 * User colours are anchors: they enter the palette exactly as chosen, in
 * order. Everything else is generated from the harmony engine over the full
 * colour space, softened by the wedding-adjustment layer, then balanced with
 * a curated neutral and metallic accent.
 */
export function generatePalette(colorInputs: string[]): Palette {
  if (colorInputs.length === 0) {
    throw new Error("At least one colour is required");
  }

  // Dedupe while preserving input order (case-insensitive exact match).
  const seen = new Set<string>();
  const uniqueHexes = colorInputs
    .map(normalizeHexInput)
    .filter((hex) => {
      if (seen.has(hex)) return false;
      seen.add(hex);
      return true;
    });

  const anchors = uniqueHexes.map((hex, i) => makeAnchorColor(hex, i));
  const usedHexes = new Set(anchors.map((a) => a.hex));

  const chromatic = anchors.filter((c) => !isAchromatic(c));

  // Lead with a chromatic colour so the palette has personality, but never
  // invent colours the user didn't choose.
  const hero = chromatic[0] ?? anchors[0];
  const baseHsl = chromatic.length > 0
    ? colorToHsl(hero)
    : { h: 40, s: 10, l: hero.lightness }; // all-neutral input plans from a warm stone tone

  const mode: HarmonyName =
    chromatic.length === 0
      ? "monochromatic"
      : chromatic.length === 1
        ? DEFAULT_HARMONY
        : classifyAnchors(chromatic.map(colorToHsl));

  // Target ≈5 core colours including neutral + accent; extra anchors simply
  // grow the palette instead of displacing anything.
  const wantedSupporting = Math.max(0, Math.min(3, 5 - anchors.length - 2));

  const plan = generateHarmony(baseHsl, mode);
  const anchorHues = chromatic.map(colorToHsl).map((c) => c.h);

  const supporting: Color[] = [];
  for (const candidate of plan) {
    if (supporting.length >= wantedSupporting) break;
    if (anchorHues.some((hue) => hueDistance(hue, candidate.h) <= 16)) continue;

    const depth = companionDepth(baseHsl, supporting.length);
    const color = makeGeneratedColor({ h: candidate.h, ...depth }, "support");
    if (usedHexes.has(color.hex)) continue;

    usedHexes.add(color.hex);
    supporting.push(color);
  }

  // Secondary role: the next anchor when present, otherwise the first
  // generated supporting colour is promoted.
  const secondary =
    anchors.length >= 2
      ? anchors.find((a) => a.id !== hero.id)!
      : (supporting.shift() ?? neutralFallback(hero));

  const neutral = pickNeutral(hero, usedHexes);
  usedHexes.add(neutral.hex);

  const accent =
    chromatic.length === 0 ? undefined : pickAccent(hero, secondary, usedHexes);
  if (accent) usedHexes.add(accent.hex);

  const palette: Omit<Palette, "explanation"> = {
    hero,
    secondary,
    supporting,
    neutral,
    ...(accent ? { accent } : {}),
    harmony: mode,
    anchors,
    additions: [
      ...(secondary && !isAnchor(secondary, anchors) ? [secondary] : []),
      ...supporting,
      neutral,
      ...(accent ? [accent] : []),
    ],
  };

  return { ...palette, explanation: explain(palette) };
}

function isAnchor(color: Color, anchors: Color[]): boolean {
  return anchors.some((a) => a.hex === color.hex);
}
