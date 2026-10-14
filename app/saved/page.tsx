"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  deleteSaved,
  getServerGuides,
  listSavedGuides,
  renameSaved,
  subscribeGuides,
} from "@/lib/storage";
import { encodeInputs } from "@/lib/state";
import { generatePalette } from "@/lib/color/palette";
import type { SavedGuide } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRIMARY_BUTTON =
  "border border-black bg-black px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black";
const QUIET_BUTTON =
  "px-4 py-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black";

export default function SavedPage() {
  const guides = useSyncExternalStore(
    subscribeGuides,
    listSavedGuides,
    getServerGuides
  );
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(
    null
  );
  const [deleting, setDeleting] = useState<SavedGuide | null>(null);

  function handleRename() {
    if (!renaming) return;
    renameSaved(renaming.id, renaming.name.trim() || "Untitled");
    setRenaming(null);
  }

  function handleDelete() {
    if (!deleting) return;
    deleteSaved(deleting.id);
    setDeleting(null);
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
          {guides.map((entry) => (
            <SavedCard
              key={entry.id}
              entry={entry}
              onRename={() => setRenaming({ id: entry.id, name: entry.name })}
              onDelete={() => setDeleting(entry)}
            />
          ))}
        </ul>
      )}

      <Dialog
        open={renaming !== null}
        onOpenChange={(open) => !open && setRenaming(null)}
      >
        <DialogContent className="border border-black sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Rename</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
          >
            <Label htmlFor="rename-guide">Name</Label>
            <Input
              id="rename-guide"
              autoFocus
              value={renaming?.name ?? ""}
              onChange={(e) =>
                setRenaming((r) => (r ? { ...r, name: e.target.value } : r))
              }
            />
          </form>
          <DialogFooter>
            <button type="button" onClick={() => setRenaming(null)} className={QUIET_BUTTON}>
              Cancel
            </button>
            <button type="button" onClick={handleRename} className={PRIMARY_BUTTON}>
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="border border-black sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Delete “{deleting?.name}”?
            </DialogTitle>
            <DialogDescription>
              This removes the guide from this device. Anyone you shared the
              link with can still open it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setDeleting(null)} className={QUIET_BUTTON}>
              Cancel
            </button>
            <button type="button" onClick={handleDelete} className={PRIMARY_BUTTON}>
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SavedCard({
  entry,
  onRename,
  onDelete,
}: {
  entry: SavedGuide;
  onRename: () => void;
  onDelete: () => void;
}) {
  const encoded = encodeInputs(entry.inputs);
  // Regenerated from inputs so the preview always matches the opened guide.
  const colors = useMemo(() => {
    const palette = generatePalette(entry.inputs.colors, {
      styles: entry.inputs.styles,
      variant: entry.inputs.variants?.palette,
    });
    return [...palette.anchors, ...palette.additions];
  }, [entry.inputs]);

  return (
    <li className="border border-black bg-white">
      <Link href={`/guide?d=${encoded}`} className="block">
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
          onClick={onRename}
          className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
        >
          Rename
        </button>
        <Link
          href={`/plan?d=${encoded}`}
          className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
