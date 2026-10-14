"use client";

import { useState, useSyncExternalStore } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { hexToRgb, normalizeHex, rgbToHex } from "@/lib/color/conversion";

/**
 * Design-tool colour picker (iteration 01.1).
 *
 * A compact Figma-style popover anchored to the trigger: saturation/lightness
 * field, full-spectrum hue slider, live preview, HEX and RGB entry, and an
 * optional native eyedropper. Draft state lives only while the popover is
 * open — the selection reaches the app exclusively through "Done", so
 * dismissing never overwrites an existing colour.
 *
 * Deliberately free of curated swatches or wedding palettes: this control is
 * for free-form selection only.
 */

const noopSubscribe = () => () => {};

function eyeDropperAvailable(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

async function pickFromScreen(setHex: (hex: string) => void) {
  try {
    const ctor = (
      window as unknown as {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
      }
    ).EyeDropper;
    if (!ctor) return;
    const result = await new ctor().open();
    setHex(result.sRGBHex.toUpperCase());
  } catch {
    // Eyedropper cancelled — keep the current draft.
  }
}

function seedHex(initialHex: string | null | undefined): string {
  return (initialHex && normalizeHex(initialHex)) || "#FFFFFF";
}

type PickerPanelProps = {
  initialHex?: string | null;
  /** Called once, on confirm. */
  onDone: (hex: string) => void;
};

export function ColorPickerPanel({ initialHex, onDone }: PickerPanelProps) {
  // Fresh draft per open — the panel unmounts with the popover.
  const [hex, setHex] = useState(() => seedHex(initialHex));
  const rgb = hexToRgb(hex);

  // Feature-detect without hydration mismatch (server snapshot: false).
  const eyeDropperSupported = useSyncExternalStore(
    noopSubscribe,
    eyeDropperAvailable,
    () => false
  );

  const setChannel = (channel: "r" | "g" | "b", raw: string) => {
    const parsed = Number(raw);
    if (raw.trim() === "" || Number.isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(255, Math.round(parsed)));
    setHex(rgbToHex({ ...rgb, [channel]: clamped }));
  };

  return (
    <div className="grid gap-3 text-black">
      {/* Saturation / lightness field + hue slider */}
      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-widest text-neutral-500">
          Hue &amp; shade
        </p>
        <HexColorPicker
          color={hex}
          onChange={setHex}
          className="[--react-colorful-saturation-height:176px]"
          aria-label="Colour field and hue slider"
        />
      </div>

      {/* Preview + exact hex entry */}
      <div className="flex items-center gap-2">
        <span
          className="h-9 w-9 shrink-0 rounded-md border border-neutral-300"
          style={{ backgroundColor: hex }}
          role="img"
          aria-label={`Selected colour ${hex}`}
        />
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Hex
          </span>
          <HexColorInput
            color={hex}
            onChange={setHex}
            prefixed
            aria-label="Hex value"
            className="h-9 w-full min-w-0 border border-neutral-200 bg-white px-2 font-mono text-sm uppercase outline-none focus:border-black"
          />
        </label>
      </div>

      {/* RGB entry */}
      <div className="grid grid-cols-3 gap-2">
        {(["r", "g", "b"] as const).map((channel) => (
          <label key={channel} className="grid gap-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              {channel.toUpperCase()}
            </span>
            <input
              type="number"
              min={0}
              max={255}
              step={1}
              value={rgb[channel]}
              onChange={(event) => setChannel(channel, event.target.value)}
              onFocus={(event) => event.target.select()}
              aria-label={`${channel.toUpperCase()} channel`}
              className="h-9 w-full border border-neutral-200 bg-white px-2 font-mono text-sm outline-none focus:border-black"
            />
          </label>
        ))}
      </div>

      {/* Confirm (+ optional eyedropper) */}
      <div className="mt-1 flex items-center justify-between gap-2">
        {eyeDropperSupported ? (
          <button
            type="button"
            onClick={() => pickFromScreen(setHex)}
            aria-label="Pick a colour from the screen"
            title="Pick a colour from the screen"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m2 22 1-1h3l9-9" />
              <path d="M3 21v-3l9-9" />
              <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
            </svg>
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onDone(hex)}
          className="border border-black bg-black px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Done
        </button>
      </div>
    </div>
  );
}

type ColorPickerPopoverProps = {
  children: React.ReactNode;
  initialHex?: string | null;
  onApply: (hex: string) => void;
};

/** Anchored picker popover: opens on click, closes outside/Esc, commits on Done. */
export function ColorPickerPopover({
  children,
  initialHex,
  onApply,
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-4">
        <ColorPickerPanel
          initialHex={initialHex}
          onDone={(hex) => {
            onApply(hex);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
