/**
 * Remembers the most recently viewed guide (its encoded `?d=` payload) so the
 * nav's "Style Guide" link reopens it instead of an empty state.
 */

const KEY = "wp.last-guide";
const listeners = new Set<() => void>();

export function rememberLastGuide(encoded: string): void {
  try {
    if (window.localStorage.getItem(KEY) === encoded) return;
    window.localStorage.setItem(KEY, encoded);
  } catch {
    return; // Storage unavailable — the nav falls back to /guide.
  }
  listeners.forEach((listener) => listener());
}

export function getLastGuide(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getServerLastGuide(): string | null {
  return null;
}

export function subscribeLastGuide(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
