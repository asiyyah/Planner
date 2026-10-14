import { COLORS } from "@/data/colors";
import { HARMONIES, TONE_WORDS } from "@/data/harmonies";
import { METALS, type Metal, type MetalTemperature } from "@/data/metallics";
import { BASE_TONE, type StyleTone } from "@/data/style-tones";
import type {
  Color,
  ColorCategory,
  HarmonyName,
  Palette,
  WeddingStyleId,
} from "@/types";
import {
  hexToHsl,
  hslToHex,
  hueDistance,
  normalizeHex,
  normalizeHue,
  type Hsl,
} from "./conversion";
import { classifyAnchors, generateHarmony } from "./harmony";
import {
  adjustForWedding,
  applyTone,
  companionDepth,
  neutralCandidates,
  toneFor,
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
const NEAR_DUPLICATE_DISTANCE = 0.2;

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

/** How far an arbitrary colour may sit from a library entry to borrow its name. */
export const NAMING_TOLERANCE = 0.24;

/**
 * Nearest curated colour within naming tolerance — the library as optional
 * metadata (iteration §6). Returns null when a colour is truly its own thing.
 */
export function nearestLibraryColor(
  hsl: Hsl,
  options: { allowMetals?: boolean } = {}
): { color: Color; distance: number } | null {
  const allowMetals = options.allowMetals ?? true;
  let best = COLORS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const color of COLORS) {
    if (!allowMetals && color.category === "accent") continue;
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

/** Canonical `#RRGGBB` form; throws on anything that is not a solid hex. */
function requireHex(hex: string): string {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`Invalid colour: ${hex}`);
  return normalized;
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
/**
 * Library name when close enough, otherwise a descriptive fallback. Generated
 * colours pass `allowMetals: false` so a grey is never called "Silver" or a
 * yellow "Gold" — metal names belong to the palette's metallic accent.
 */
export function describeColor(
  hex: string,
  options: { allowMetals?: boolean } = {}
): string {
  const hsl = hexToHsl(hex);
  const near = nearestLibraryColor(hsl, options);
  return near ? near.color.name : describeHsl(hsl);
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
  const normalized = requireHex(hex);
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

/** Build a Color from final HSL values (no further adjustment). */
export function colorFromHsl(
  hsl: Hsl,
  kind: string,
  category: ColorCategory = classifyColor(hsl)
): Color {
  const hex = hslToHex(hsl);
  return {
    id: `gen-${kind}-${hex.slice(1).toLowerCase()}`,
    name: describeColor(hex, { allowMetals: false }),
    hex,
    hue: hsl.h,
    saturation: hsl.s,
    lightness: hsl.l,
    category,
  };
}

/**
 * An engine-generated colour — shaped by the style tone, then passed
 * through the wedding filter (whose ceiling the tone also sets).
 */
export function makeGeneratedColor(
  hsl: Hsl,
  kind: string,
  tone: StyleTone = BASE_TONE
): Color {
  return colorFromHsl(adjustForWedding(applyTone(hsl, tone), tone.maxSat), kind);
}

/* ------------------------------ Role selection ----------------------------- */

/** Harmonies tried for a single pick, by style tone; reshuffling walks the list. */
const RICH_MODES: HarmonyName[] = ["complementary", "split-complementary", "triadic", "analogous", "tetradic"];
const BALANCED_MODES: HarmonyName[] = ["analogous", "complementary", "split-complementary", "triadic", "monochromatic"];
const SOFT_MODES: HarmonyName[] = ["analogous", "monochromatic", "split-complementary", "complementary"];

/** Further relationships explored once the main harmony's hues are used up. */
const EXTENSION_MODES: HarmonyName[] = ["analogous", "split-complementary", "triadic", "complementary"];

function singleAnchorModes(tone: StyleTone): HarmonyName[] {
  if (tone.satScale >= 1.2) return RICH_MODES;
  if (tone.satScale <= 0.75) return SOFT_MODES;
  return BALANCED_MODES;
}

/**
 * Candidate hues for supporting colours, drawn from every chromatic pick (not
 * just the first): the main harmony first, then wider relationships. Hues
 * near a pick or near each other are dropped.
 */
function supportingHues(seeds: Hsl[], mode: HarmonyName): number[] {
  const hues: number[] = [];
  for (const m of [mode, ...EXTENSION_MODES.filter((x) => x !== mode)]) {
    for (const seed of seeds) {
      for (const { h } of generateHarmony(seed, m)) {
        if (seeds.some((a) => hueDistance(a.h, h) <= 16)) continue;
        if (hues.some((x) => hueDistance(x, h) < 12)) continue;
        hues.push(normalizeHue(h));
      }
    }
  }
  return hues;
}

/**
 * The neutral is derived from the user's colour — a tinted white, cream or
 * stone carrying its hue — rather than taken from a fixed list. Deeper styles
 * start a step darker; crisp styles may get a deep neutral.
 */
function pickNeutral(
  hero: Color,
  anchors: Color[],
  styles: readonly WeddingStyleId[],
  tone: StyleTone,
  variant: number
): Color {
  const deep = styles.includes("modern") || styles.includes("bold");
  const candidates = neutralCandidates(colorToHsl(hero), { deep });
  const start = (tone.lightShift <= -4 ? 1 : 0) + variant;
  for (let i = 0; i < candidates.length; i += 1) {
    const base = candidates[(start + i) % candidates.length];
    // Richer styles carry more of the hue into the neutral; quieter ones less.
    const hsl = { ...base, s: Math.min(40, base.s * tone.satScale) };
    if (anchors.some((a) => isNearDuplicate(colorToHsl(a), hsl))) continue;
    return colorFromHsl(hsl, "neutral", "neutral");
  }
  const fallback = candidates[start % candidates.length];
  return colorFromHsl(
    { ...fallback, s: Math.min(40, fallback.s * tone.satScale) },
    "neutral",
    "neutral"
  );
}

function metalTemperature(color: Color): MetalTemperature {
  if (isAchromatic(color)) return "cool";
  if (color.saturation >= 10 && hueDistance(color.hue, 335) < 40) return "pink";
  return isWarm(color) ? "warm" : "cool";
}

/** How many top-ranked metals reshuffling cycles through. */
const METAL_SHORTLIST = 4;

/**
 * Metallic accent ranked against the palette's temperature and the chosen
 * styles; reshuffling walks down the shortlist.
 */
function pickMetal(
  hero: Color,
  secondary: Color,
  styles: readonly WeddingStyleId[],
  variant: number
): Color {
  const heroTemp = metalTemperature(hero);
  const secondaryTemp = metalTemperature(secondary);
  const score = (metal: Metal) =>
    (metal.temperature === heroTemp
      ? 3
      : heroTemp !== "cool" && metal.temperature !== "cool"
        ? 1
        : 0) +
    (metal.temperature === secondaryTemp ? 1 : 0) +
    2 * styles.filter((s) => metal.styles.includes(s)).length;

  const shortlist = METALS.map((metal, index) => ({ metal, index, score: score(metal) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, METAL_SHORTLIST);
  const { metal } = shortlist[variant % shortlist.length];
  const hsl = hexToHsl(metal.hex);
  return {
    id: `metal-${metal.id}`,
    name: metal.name,
    hex: metal.hex,
    hue: hsl.h,
    saturation: hsl.s,
    lightness: hsl.l,
    category: "accent",
  };
}

/* --------------------------------- Explainer ------------------------------- */

function toneWords(hero: Color): string {
  const warmth = isWarm(hero) ? TONE_WORDS.warm : TONE_WORDS.cool;
  const depth = hero.lightness < 45 ? TONE_WORDS.deep : TONE_WORDS.light;
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

export type PaletteOptions = {
  /** Wedding styles — shape every generated colour (never the user's picks). */
  styles?: readonly WeddingStyleId[];
  /** Reshuffle counter: 0 is the first option, each step another. */
  variant?: number;
};

/**
 * Generate a wedding palette from the user's picks (1 to MAX_COLORS).
 *
 * User colours are anchors: they enter the palette exactly as chosen, in
 * order. Everything else is generated around them — supporting colours from
 * harmony relationships with every pick, a neutral tinted from the lead
 * colour, and a metallic ranked for the palette — all shaped by the chosen
 * styles. `variant` deterministically selects alternative options.
 */
export function generatePalette(
  colorInputs: string[],
  options: PaletteOptions = {}
): Palette {
  if (colorInputs.length === 0) {
    throw new Error("At least one colour is required");
  }
  const styles = options.styles ?? [];
  const variant = Math.max(0, Math.floor(options.variant ?? 0));
  const tone = toneFor(styles);

  // Dedupe while preserving input order (case-insensitive exact match).
  const seen = new Set<string>();
  const uniqueHexes = colorInputs
    .map(requireHex)
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

  let mode: HarmonyName;
  if (chromatic.length === 0) {
    mode = "monochromatic";
  } else if (chromatic.length === 1) {
    const modes = singleAnchorModes(tone);
    mode = modes[variant % modes.length];
  } else {
    // Two picks: their own relationship defines the harmony.
    mode = classifyAnchors(chromatic.map(colorToHsl));
  }

  // Aim for a 6–7 colour palette: one pick gets a generated secondary plus
  // two supporting, two picks get two, three or more picks get one.
  const wantedSupporting = anchors.length === 1 ? 3 : anchors.length === 2 ? 2 : 1;

  const hues =
    chromatic.length > 0 ? supportingHues(chromatic.map(colorToHsl), mode) : [];
  const start = hues.length > 0 ? (variant * wantedSupporting) % hues.length : 0;

  const supporting: Color[] = [];
  const accept = (color: Color): void => {
    if (usedHexes.has(color.hex)) return;
    const hsl = colorToHsl(color);
    if (anchors.some((a) => isNearDuplicate(colorToHsl(a), hsl))) return;
    if (supporting.some((c) => isNearDuplicate(colorToHsl(c), hsl))) return;
    usedHexes.add(color.hex);
    supporting.push(color);
  };

  for (let i = 0; i < hues.length && supporting.length < wantedSupporting; i += 1) {
    const depth = companionDepth(baseHsl, supporting.length + variant);
    accept(makeGeneratedColor({ h: hues[(start + i) % hues.length], ...depth }, "support", tone));
  }

  // Neutral picks (or same-hue pairs) have no harmony hues to draw on; fall
  // back to depth variations of the base so the palette never runs thin.
  if (supporting.length < wantedSupporting) {
    const steps = generateHarmony(baseHsl, "monochromatic");
    for (let i = 0; i < steps.length && supporting.length < wantedSupporting; i += 1) {
      accept(makeGeneratedColor(steps[(variant + i) % steps.length], "support", tone));
    }
  }

  // Secondary role: the user's 2nd colour when present, otherwise the first
  // generated supporting colour is promoted.
  const secondary =
    anchors.length >= 2
      ? anchors.find((a) => a.id !== hero.id)!
      : (supporting.shift() ??
        makeGeneratedColor({ ...baseHsl, l: baseHsl.l >= 50 ? 32 : 72 }, "support", tone));

  const neutral = pickNeutral(hero, anchors, styles, tone, variant);
  usedHexes.add(neutral.hex);

  const accent = pickMetal(hero, secondary, styles, variant);
  usedHexes.add(accent.hex);

  const palette: Omit<Palette, "explanation"> = {
    hero,
    secondary,
    supporting,
    neutral,
    accent,
    harmony: mode,
    anchors,
    additions: [
      ...(!isAnchor(secondary, anchors) ? [secondary] : []),
      ...supporting,
      neutral,
      accent,
    ],
  };

  return { ...palette, explanation: explain(palette) };
}

function isAnchor(color: Color, anchors: Color[]): boolean {
  return anchors.some((a) => a.hex === color.hex);
}
