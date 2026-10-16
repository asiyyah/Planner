"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { describeColor } from "@/lib/color/palette";
import { readableTextColor } from "@/lib/color/contrast";
import { MAX_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPickerPanel } from "@/components/swatch/color-picker-popover";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

type ColourStepProps = {
  colors: string[];
  onChange: (colors: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

/**
 * Where the picker starts for a new colour: a plain mid-grey, so nothing is
 * suggested. It is never added to the palette on its own.
 */
const NEW_COLOUR_START = "#B3B3B3";

const STRIP_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded border border-neutral-300 bg-white transition-colors hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-300";

/**
 * Colour step, Coolors-style: the picks form one joined strip. Tap a block
 * to edit it in place (live), + opens a new empty slot, − removes the
 * selected colour.
 *
 * A new slot holds no colour until the user actually picks one, so opening
 * the picker never adds anything by itself. Esc while editing restores the
 * colour as it was (or drops a just-added one).
 */
export function ColourStep({ colors, onChange, onBack, onNext }: ColourStepProps) {
  const [selected, setSelected] = useState<number | null>(colors.length > 0 ? 0 : null);
  const [editing, setEditing] = useState<{ index: number; original: string | null } | null>(null);
  /** An open, still-empty slot after the last colour. */
  const [drafting, setDrafting] = useState(false);
  const canAdd = colors.length < MAX_COLORS;

  const setColorAt = (index: number, hex: string) =>
    onChange(colors.map((c, i) => (i === index ? hex : c)));

  const openNewSlot = () => {
    if (!canAdd) return;
    setDrafting(true);
    setEditing(null);
  };

  /** First real choice in the empty slot: the colour joins the palette. */
  const commitDraft = (hex: string) => {
    const index = colors.length;
    onChange([...colors, hex]);
    setSelected(index);
    setDrafting(false);
    // null original: Esc removes the colour again.
    setEditing({ index, original: null });
  };

  const removeSelected = () => {
    if (selected === null) return;
    const next = colors.filter((_, i) => i !== selected);
    onChange(next);
    setSelected(next.length > 0 ? Math.min(selected, next.length - 1) : null);
    setEditing(null);
  };

  const cancelEdit = () => {
    setDrafting(false);
    if (!editing) return;
    if (editing.original === null) {
      const next = colors.filter((_, i) => i !== editing.index);
      onChange(next);
      setSelected(next.length > 0 ? Math.min(editing.index, next.length - 1) : null);
    } else {
      setColorAt(editing.index, editing.original);
    }
    setEditing(null);
  };

  // Real colours, plus the empty slot while one is open. The slot renders at
  // the same position (and key) its colour will take, so the picker stays
  // mounted — and a drag keeps going — when the first choice adds it.
  const slots: (string | null)[] = drafting ? [...colors, null] : colors;

  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step="Step 01 — Colours"
          title="Choose your colours"
          supporting="Choose up to four colours you love — they can be anything. Don’t worry about whether they match; we’ll work out the harmony. Only have one? That’s enough — we’ll find its partners."
        />
      </div>

      <div className="mt-10 flex items-stretch gap-3">
        {slots.length === 0 ? (
          <button
            type="button"
            onClick={openNewSlot}
            className="flex h-36 flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-400 text-sm uppercase tracking-widest text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black sm:h-44"
          >
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            Pick your first colour
          </button>
        ) : (
          <ul
            aria-label="Your chosen colours"
            className="flex h-36 min-w-0 flex-1 overflow-hidden rounded-2xl border border-[var(--swatch-border)] sm:h-44"
          >
            {slots.map((hex, index) => {
              const isDraft = hex === null;
              const name = hex ? describeColor(hex) : "New colour";
              const isSelected = !isDraft && selected === index;
              const open = isDraft || editing?.index === index;
              return (
                <li
                  key={index}
                  className="flex min-w-0 flex-1 transition-[flex-grow] duration-200 hover:flex-[1.15]"
                >
                  <Popover
                    open={open}
                    onOpenChange={(next) => {
                      if (next && hex) {
                        setDrafting(false);
                        setSelected(index);
                        setEditing({ index, original: hex });
                      } else if (!next) {
                        setDrafting(false);
                        setEditing(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={
                          hex
                            ? `Colour ${index + 1}: ${name} ${hex}. Tap to change.`
                            : "New colour — choose it in the picker"
                        }
                        className={cn(
                          "relative flex h-full w-full min-w-0 flex-col items-center justify-between px-2 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-current",
                          isDraft && "bg-[repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5_8px,#ffffff_8px,#ffffff_16px)] text-neutral-500"
                        )}
                        style={hex ? { backgroundColor: hex, color: readableTextColor(hex) } : undefined}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1 h-2.5 w-2.5 rounded-full bg-current transition-opacity",
                            isSelected ? "opacity-90" : "opacity-0"
                          )}
                        />
                        <span className="w-full min-w-0 text-center">
                          <span className="block truncate text-xs font-medium sm:text-sm">
                            {name}
                          </span>
                          <span className="block truncate font-mono text-[10px] uppercase opacity-70 sm:text-xs">
                            {hex ?? "Use the picker"}
                          </span>
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="center"
                      sideOffset={10}
                      onEscapeKeyDown={cancelEdit}
                      className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-neutral-200 p-4 shadow-xl"
                    >
                      <ColorPickerPanel
                        hex={hex ?? NEW_COLOUR_START}
                        onChange={(next) =>
                          hex === null ? commitDraft(next) : setColorAt(index, next)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-col justify-center gap-2">
          <button
            type="button"
            onClick={openNewSlot}
            disabled={!canAdd || drafting}
            aria-label="Add a colour"
            title={canAdd ? "Add a colour" : "Four colours is the maximum"}
            className={STRIP_BUTTON}
          >
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={removeSelected}
            disabled={selected === null}
            aria-label="Remove the selected colour"
            title="Remove the selected colour"
            className={STRIP_BUTTON}
          >
            <MinusIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        {colors.length === 0
          ? "Tap to choose a colour — any colour at all."
          : `${colors.length} of ${MAX_COLORS} colours · tap a colour to change it${
              canAdd ? ", + to add another" : ""
            }.`}
      </p>

      <WizardActions
        onNext={onNext}
        nextDisabled={colors.length === 0}
        nextLabel={colors.length > 0 ? "Continue" : "Pick at least one colour"}
      />
    </div>
  );
}
