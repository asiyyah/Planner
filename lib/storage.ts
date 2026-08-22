import type {
  CoordinationMode,
  PlannerInputs,
  SavedGuide,
  StyleGuide,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { normalizeHex } from "@/lib/state";
import { WEDDING_TYPE_IDS } from "@/lib/styling";

const STORAGE_KEY = "wp.saved-guides";

const EMPTY: SavedGuide[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/* ------------------------- External store (React 19) ------------------------ */

let cache: SavedGuide[] | null = null;
const listeners = new Set<() => void>();

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

/**
 * Colours from a `colors` array (iteration 01+) or the pre-iteration-01
 * fixed `color1`/`color2` slots. Invalid and duplicate hexes are dropped.
 */
function normalizeColors(inputs: UnknownRecord): string[] {
  const raw = Array.isArray(inputs.colors)
    ? inputs.colors
    : [inputs.color1, inputs.color2];
  const colors: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const hex = normalizeHex(value);
    if (hex && !colors.includes(hex)) colors.push(hex);
  }
  return colors;
}

/**
 * Wedding types from a `weddingTypes` array (iteration 02+) or the single
 * legacy `weddingType` string; unknown ids fall back to "white" so the
 * regenerated share link always decodes.
 */
function normalizeWeddingTypes(inputs: UnknownRecord): WeddingTypeId[] {
  const raw = Array.isArray(inputs.weddingTypes)
    ? inputs.weddingTypes
    : [inputs.weddingType];
  const types = raw.filter(
    (t): t is WeddingTypeId =>
      typeof t === "string" && WEDDING_TYPE_IDS.includes(t as WeddingTypeId)
  );
  return types.length > 0 ? [...new Set(types)] : ["white"];
}

function normalizeStyles(inputs: UnknownRecord): WeddingStyleId[] {
  if (!Array.isArray(inputs.styles)) return [];
  return [
    ...new Set(
      inputs.styles.filter((s): s is WeddingStyleId => typeof s === "string")
    ),
  ];
}

/**
 * The saved page renders swatches straight from the stored palette; an
 * entry missing any required role cannot be displayed or reopened.
 */
function hasUsablePalette(palette: UnknownRecord): boolean {
  return (
    isRecord(palette.hero) &&
    isRecord(palette.secondary) &&
    isRecord(palette.neutral) &&
    Array.isArray(palette.supporting)
  );
}

/**
 * Saved guides may come from any earlier iteration:
 *   v0 — { color1, color2, weddingType, … }   (fixed colour slots)
 *   v1 — { colors, weddingType, … }           (dynamic colours)
 *   v2+ — { colors, weddingTypes, … }         (multi-select types)
 *
 * Normalizes every entry to the current PlannerInputs shape. Returns null
 * for entries that cannot be recovered (no valid colours, broken palette);
 * readCache filters those out instead of crashing consumers like the
 * saved page's encodeInputs call.
 */
function migrateEntry(entry: unknown): SavedGuide | null {
  if (!isRecord(entry) || !isRecord(entry.guide)) return null;
  const guide = entry.guide;
  if (!isRecord(guide.inputs) || !isRecord(guide.palette)) return null;
  if (!hasUsablePalette(guide.palette)) return null;

  const inputs = guide.inputs;
  const colors = normalizeColors(inputs);
  if (colors.length === 0) return null;

  const coordination: CoordinationMode =
    inputs.coordination === "same" ? "same" : "different";

  guide.inputs = {
    colors,
    weddingTypes: normalizeWeddingTypes(inputs),
    styles: normalizeStyles(inputs),
    coordination,
  } satisfies PlannerInputs;

  return entry as SavedGuide;
}

function readCache(): SavedGuide[] {
  if (!isBrowser()) return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed
          .map(migrateEntry)
          .filter((entry): entry is SavedGuide => entry !== null)
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

/** Stable snapshot + subscription so components can useSyncExternalStore. */
export function subscribeGuides(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServerGuides(): SavedGuide[] {
  return EMPTY;
}

function commit(next: SavedGuide[]): void {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — keep the in-memory view working.
  }
  listeners.forEach((listener) => listener());
}

/* --------------------------------- Actions --------------------------------- */

export function saveGuide(name: string, guide: StyleGuide): SavedGuide {
  const entry: SavedGuide = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    savedAt: new Date().toISOString(),
    guide,
  };
  commit([entry, ...readCache()]);
  return entry;
}

export function renameSaved(id: string, name: string): void {
  commit(
    readCache().map((entry) => (entry.id === id ? { ...entry, name } : entry))
  );
}

export function deleteSaved(id: string): void {
  commit(readCache().filter((entry) => entry.id !== id));
}

export { readCache as listSavedGuides };
