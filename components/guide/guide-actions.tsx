"use client";

import { useState } from "react";
import { saveGuide } from "@/lib/storage";
import type { StyleGuide } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Save / Share / Download actions (PRD §34-9). */
export function GuideActions({ guide }: { guide: StyleGuide }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(defaultName(guide));
  const [open, setOpen] = useState(false);

  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/guide?d=${encodeURIComponent(
          window.location.search.startsWith("?d=")
            ? window.location.search.slice(3)
            : ""
        )}`;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op.
    }
  }

  function handleSave() {
    saveGuide(name.trim() || defaultName(guide), guide);
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="border border-black bg-black px-5 py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
        </DialogTrigger>
        <DialogContent className="border border-black sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Save this style guide
            </DialogTitle>
            <DialogDescription>
              Guides are stored on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="guide-name">Name</Label>
            <Input
              id="guide-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coffee × Sage"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleSave}
              className="border border-black bg-black px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        onClick={handleShare}
        className="border border-black px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
      >
        {copied ? "Link copied ✓" : "Share link"}
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="border border-black px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
      >
        Download PDF
      </button>
    </div>
  );
}

function defaultName(guide: StyleGuide): string {
  const c1 = guide.palette.hero.name;
  const c2 = guide.palette.secondary.name;
  return `${c1} × ${c2}`;
}
