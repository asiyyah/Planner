"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  deleteSaved,
  getServerGuides,
  listSavedGuides,
  renameSaved,
  subscribeGuides,
} from "@/lib/storage";
import { encodeInputs } from "@/lib/state";

export default function SavedPage() {
  const guides = useSyncExternalStore(
    subscribeGuides,
    listSavedGuides,
    getServerGuides
  );
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(
    null
  );

  function handleRename() {
    if (!renaming) return;
    renameSaved(renaming.id, renaming.name.trim() || "Untitled");
    setRenaming(null);
  }

  function handleDelete(id: string) {
    deleteSaved(id);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Saved
      </p>
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl">Your weddings</h1>

      {guides.length === 0 ? (
        <div className="mt-12 border border-dashed border-black p-12 text-center">
          <p className="font-heading text-2xl">Nothing saved yet</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-600">
            Generate a style guide and save it here to revisit or share it
            later.
          </p>
          <Link
            href="/plan"
            className="mt-8 inline-block border border-black bg-black px-8 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            Start planning
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((entry) => {
            const href = `/guide?d=${encodeInputs(entry.guide.inputs)}`;
            const colors = [
              entry.guide.palette.hero,
              entry.guide.palette.secondary,
              ...entry.guide.palette.supporting,
              entry.guide.palette.neutral,
              ...(entry.guide.palette.accent
                ? [entry.guide.palette.accent]
                : []),
            ];
            return (
              <li key={entry.id} className="border border-black bg-white">
                <Link href={href} className="block">
                  <span className="swatch-strip m-3 flex h-20" aria-hidden="true">
                    {colors.map((c, i) => (
                      <span
                        key={`${c.hex}-${i}`}
                        className="flex-1"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </span>
                  <span className="block p-5">
                    <span className="block font-heading text-2xl leading-tight">
                      {entry.name}
                    </span>
                    <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      {new Date(entry.savedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </Link>
                <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 print:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setRenaming({ id: entry.id, name: entry.name })
                    }
                    className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Rename dialog */}
      {renaming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Rename guide"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
          onClick={() => setRenaming(null)}
        >
          <div
            className="w-full max-w-sm border border-black bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-2xl">Rename</h2>
            <input
              autoFocus
              value={renaming.name}
              onChange={(e) =>
                setRenaming({ ...renaming, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setRenaming(null);
              }}
              aria-label="Guide name"
              className="mt-4 w-full border border-black px-3 py-2 text-sm outline-none focus:bg-neutral-50"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRenaming(null)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRename}
                className="border border-black bg-black px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
