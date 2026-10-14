import type {
  CoordinationMode,
  PlannerInputs,
  SavedGuide,
  Variants,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { normalizeHex } from "@/lib/color/conversion";
import {
  isStyleId,
  isWeddingTypeId,
  MAX_COLORS,
  VARIANT_KEYS,
} from "@/lib/constants";
import { encodeInputs, normalizeVariant } from "@/lib/state";

const STORAGE_KEY = "wp.saved-guides";
/** Unparseable payloads are copied here before being replaced, never lost. */
export const CORRUPT_BACKUP_KEY = `${STORAGE_KEY}.corrupt`;

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
  return colors.slice(0, MAX_COLORS);
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
  const types = raw.filter(isWeddingTypeId);
  return types.length > 0 ? [...new Set(types)] : ["white"];
}

function normalizeStyles(inputs: UnknownRecord): WeddingStyleId[] {
  if (!Array.isArray(inputs.styles)) return [];
  return [...new Set(inputs.styles.filter(isStyleId))];
}

function normalizeVariants(inputs: UnknownRecord): Variants | undefined {
  if (!isRecord(inputs.variants)) return undefined;
  const raw = inputs.variants;
  const variants: Variants = {};
  for (const key of VARIANT_KEYS) {
    const value = normalizeVariant(raw[key]);
    if (value > 0) variants[key] = value;
  }
  return Object.keys(variants).length > 0 ? variants : undefined;
}

function normalizeInputs(inputs: UnknownRecord): PlannerInputs | null {
  const colors = normalizeColors(inputs);
  if (colors.length === 0) return null;
  const coordination: CoordinationMode =
    inputs.coordination === "same" ? "same" : "different";
  const variants = normalizeVariants(inputs);
  return {
    colors,
    weddingTypes: normalizeWeddingTypes(inputs),
    styles: normalizeStyles(inputs),
    coordination,
    ...(variants ? { variants } : {}),
  };
}

/**
 * Saved entries hold only the planner inputs — the engine is deterministic,
 * so the guide (and its preview palette) is regenerated on read.
 *
 * Entries may come from any earlier iteration:
 *   current — { id, name, savedAt, inputs }
 *   legacy  — { id, name, savedAt, guide: { inputs, palette, … } } where
 *             inputs were { color1, color2, weddingType } (v0),
 *             { colors, weddingType } (v1) or { colors, weddingTypes } (v2)
 *
 * Returns null for entries that cannot be recovered (no valid colours).
 */
function migrateEntry(entry: unknown): SavedGuide | null {
  if (!isRecord(entry)) return null;
  const rawInputs = isRecord(entry.inputs)
    ? entry.inputs
    : isRecord(entry.guide) && isRecord(entry.guide.inputs)
      ? entry.guide.inputs
      : null;
  if (!rawInputs) return null;

  const inputs = normalizeInputs(rawInputs);
  if (!inputs) return null;

  return {
    id: typeof entry.id === "string" ? entry.id : newId(),
    name: typeof entry.name === "string" ? entry.name : "Untitled",
    savedAt:
      typeof entry.savedAt === "string" ? entry.savedAt : new Date(0).toISOString(),
    inputs,
  };
}

function backupCorrupt(raw: string): void {
  try {
    if (window.localStorage.getItem(CORRUPT_BACKUP_KEY) === null) {
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
    }
  } catch {
    // Storage unavailable — nothing more we can do.
  }
}

function readCache(): SavedGuide[] {
  if (!isBrowser()) return EMPTY;
  if (cache) return cache;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      cache = parsed
        .map(migrateEntry)
        .filter((entry): entry is SavedGuide => entry !== null);
    } else {
      if (raw) backupCorrupt(raw);
      cache = EMPTY;
    }
  } catch {
    if (raw) backupCorrupt(raw);
    cache = EMPTY;
  }
  return cache;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Another tab changed the saved list — drop the cache and re-read. */
function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  cache = null;
  notify();
}

/** Stable snapshot + subscription so components can useSyncExternalStore. */
export function subscribeGuides(listener: () => void): () => void {
  if (listeners.size === 0 && isBrowser() && "addEventListener" in window) {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && isBrowser() && "removeEventListener" in window) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
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
  notify();
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* --------------------------------- Actions --------------------------------- */

/**
 * Save a guide by its inputs. Saving inputs that already exist renames and
 * re-dates that entry (moving it to the top) instead of adding a duplicate.
 */
export function saveGuide(name: string, inputs: PlannerInputs): SavedGuide {
  const key = encodeInputs(inputs);
  const current = readCache();
  const existing = current.find((entry) => encodeInputs(entry.inputs) === key);
  const entry: SavedGuide = {
    id: existing?.id ?? newId(),
    name,
    savedAt: new Date().toISOString(),
    inputs,
  };
  commit([entry, ...current.filter((e) => e.id !== entry.id)]);
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
