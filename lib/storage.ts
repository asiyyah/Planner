import type { SavedGuide, StyleGuide } from "@/types";

const STORAGE_KEY = "wp.saved-guides";

const EMPTY: SavedGuide[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/* ------------------------- External store (React 19) ------------------------ */

let cache: SavedGuide[] | null = null;
const listeners = new Set<() => void>();

type LegacyGuide = {
  id: string;
  name: string;
  savedAt: string;
  guide: {
    inputs: { weddingType?: string; weddingTypes?: string[] } & Record<string, unknown>;
  } & Record<string, unknown>;
};

/**
 * Saved guides written before iteration 02 store a single `weddingType`
 * string; migrate them to the multi-select shape on read.
 */
function migrateEntry(entry: LegacyGuide): SavedGuide {
  const inputs = entry.guide.inputs;
  if (!Array.isArray(inputs.weddingTypes)) {
    const single = typeof inputs.weddingType === "string" ? inputs.weddingType : "white";
    entry.guide.inputs = { ...inputs, weddingTypes: [single] };
    delete entry.guide.inputs.weddingType;
  }
  return entry as unknown as SavedGuide;
}

function readCache(): SavedGuide[] {
  if (!isBrowser()) return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.map(migrateEntry) : EMPTY;
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
