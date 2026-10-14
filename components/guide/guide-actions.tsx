"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { encodeInputs } from "@/lib/state";
import { guideTitle } from "@/lib/guide-title";
import { rememberLastGuide } from "@/lib/last-guide";
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
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const [name, setName] = useState(guideTitle(guide));
  const [open, setOpen] = useState(false);

  const encoded = encodeInputs(guide.inputs);

  useEffect(() => {
    rememberLastGuide(encoded);
  }, [encoded]);

  function flashShareStatus(status: "copied" | "failed") {
    setShareStatus(status);
    setTimeout(() => setShareStatus("idle"), 2500);
  }

  async function handleShare() {
    // Built from the guide's own inputs, never from the current URL.
    const url = `${window.location.origin}/guide?d=${encoded}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: guideTitle(guide), url });
        return;
      } catch (error) {
        // The user closed the share sheet — not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flashShareStatus("copied");
    } catch {
      flashShareStatus("failed");
    }
  }

  function handleSave() {
    saveGuide(name.trim() || guideTitle(guide), guide.inputs);
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
              placeholder={guideTitle(guide)}
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
        aria-live="polite"
        onClick={handleShare}
        className="border border-black px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
      >
        {shareStatus === "copied"
          ? "Link copied ✓"
          : shareStatus === "failed"
            ? "Copy failed — use the address bar"
            : "Share link"}
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="border border-black px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
      >
        Print / Save PDF
      </button>

      <Link
        href={`/plan?d=${encoded}`}
        className="px-3 py-2.5 text-xs uppercase tracking-widest underline-offset-4 hover:underline"
      >
        Edit
      </Link>
    </div>
  );
}
