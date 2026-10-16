"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkIcon, PencilIcon, PrinterIcon, Share2Icon } from "lucide-react";
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

const BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded px-4 text-sm uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
/** Primary: black fill. */
const PRIMARY = `${BUTTON} border border-black bg-black text-white hover:bg-white hover:text-black`;
/** Secondary: black outline. */
const SECONDARY = `${BUTTON} border border-black bg-white text-black hover:bg-black hover:text-white`;
/** Tertiary: ghost — no border until hovered. */
const GHOST = `${BUTTON} border border-transparent px-3 text-black hover:bg-neutral-100`;

/** Edit / Save / Share / Print actions (PRD §34-9), in that order of emphasis. */
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
    // Primary + secondary as buttons, then tertiary text buttons — one row
    // from tablet width up; on phones the tertiary pair wraps beneath,
    // aligned to Edit.
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary */}
        <Link href={`/plan?d=${encoded}`} className={PRIMARY}>
          <PencilIcon aria-hidden="true" className="h-4 w-4" />
          Edit
        </Link>

        {/* Secondary */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className={SECONDARY}>
              <BookmarkIcon aria-hidden="true" className="h-4 w-4" />
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
              <button type="button" onClick={handleSave} className={PRIMARY}>
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tertiary */}
      <div className="-ml-3 flex flex-wrap items-center md:ml-0">
        <button type="button" aria-live="polite" onClick={handleShare} className={GHOST}>
          <Share2Icon aria-hidden="true" className="h-4 w-4" />
          {shareStatus === "copied"
            ? "Link copied ✓"
            : shareStatus === "failed"
              ? "Copy failed — use the address bar"
              : "Share link"}
        </button>

        <button type="button" onClick={() => window.print()} className={GHOST}>
          <PrinterIcon aria-hidden="true" className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}
