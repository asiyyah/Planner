"use client";

import { useState, useSyncExternalStore } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { CheckIcon, ChevronDownIcon, CopyIcon, PipetteIcon } from "lucide-react";
import { hexToRgb, rgbToHex } from "@/lib/color/conversion";

/**
 * Design-tool colour picker card (Coolors-style).
 *
 * Controlled and live: every drag, typed hex or RGB change is reported
 * through `onChange` immediately — the caller decides what "cancel" means
 * (the colour step restores the original on Esc).
 *
 *   Picker mode  saturation/lightness field + hue slider
 *   RGB mode     red / green / blue sliders with exact number entry
 *   Footer       mode switch, eyedropper (where supported), copy hex
 *
 * Deliberately free of curated swatches or wedding palettes: this control is
 * for free-form selection only.
 */

type Mode = "picker" | "rgb";

const noopSubscribe = () => () => {};

function eyeDropperAvailable(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

async function pickFromScreen(onPick: (hex: string) => void) {
  try {
    const ctor = (
      window as unknown as {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
      }
    ).EyeDropper;
    if (!ctor) return;
    const result = await new ctor().open();
    onPick(result.sRGBHex.toUpperCase());
  } catch {
    // Eyedropper cancelled — keep the current colour.
  }
}

const CHANNELS = [
  { key: "r", label: "Red" },
  { key: "g", label: "Green" },
  { key: "b", label: "Blue" },
] as const;

const ICON_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black";

type PickerPanelProps = {
  /** Current colour, `#RRGGBB`. */
  hex: string;
  /** Called on every change, live. */
  onChange: (hex: string) => void;
};

export function ColorPickerPanel({ hex, onChange }: PickerPanelProps) {
  const [mode, setMode] = useState<Mode>("picker");
  const [copied, setCopied] = useState(false);
  const rgb = hexToRgb(hex);
  const emit = (value: string) => onChange(value.toUpperCase());

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
    emit(rgbToHex({ ...rgb, [channel]: clamped }));
  };

  async function copyHex() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — the hex is still visible to copy by hand.
    }
  }

  return (
    <div className="grid gap-4 text-black">
      {mode === "picker" ? (
        <HexColorPicker
          color={hex}
          onChange={emit}
          className="colour-picker"
          aria-label="Colour field and hue slider"
        />
      ) : (
        <div className="grid gap-3">
          {CHANNELS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-[1fr_4.5rem] items-center gap-3">
              <label className="grid gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  {label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={rgb[key]}
                  onChange={(e) => setChannel(key, e.target.value)}
                  aria-label={`${label} channel`}
                  className="rgb-slider"
                  style={{
                    background: `linear-gradient(to right, ${rgbToHex({ ...rgb, [key]: 0 })}, ${rgbToHex({ ...rgb, [key]: 255 })})`,
                  }}
                />
              </label>
              <input
                type="number"
                min={0}
                max={255}
                step={1}
                value={rgb[key]}
                onChange={(e) => setChannel(key, e.target.value)}
                onFocus={(e) => e.target.select()}
                aria-label={`${label} value`}
                className="mt-5 h-10 w-full rounded-lg border border-neutral-200 px-2 text-center font-mono text-sm outline-none focus:border-black"
              />
            </div>
          ))}
        </div>
      )}

      {/* Exact hex entry with a live swatch */}
      <label className="flex h-14 items-center gap-2 rounded-xl border border-neutral-300 pl-4 pr-2 focus-within:border-black">
        <span className="sr-only">Hex value</span>
        <HexColorInput
          color={hex}
          onChange={emit}
          prefixed
          className="h-full min-w-0 flex-1 bg-transparent font-mono text-lg uppercase outline-none"
        />
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-md border border-black/10"
          style={{ backgroundColor: hex }}
        />
      </label>

      {/* Footer: mode switch · eyedropper · copy */}
      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-neutral-200 px-4 py-2">
        <label className="relative flex items-center">
          <span className="sr-only">Picker mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="h-10 cursor-pointer appearance-none rounded bg-transparent pl-2 pr-8 text-base outline-none hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <option value="picker">Picker</option>
            <option value="rgb">RGB</option>
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute right-2 h-4 w-4"
          />
        </label>
        <div className="flex items-center gap-1">
          {eyeDropperSupported ? (
            <button
              type="button"
              onClick={() => pickFromScreen(emit)}
              aria-label="Pick a colour from the screen"
              title="Pick a colour from the screen"
              className={ICON_BUTTON}
            >
              <PipetteIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={copyHex}
            aria-label={copied ? "Hex copied" : `Copy ${hex}`}
            title="Copy hex"
            className={ICON_BUTTON}
          >
            {copied ? (
              <CheckIcon aria-hidden="true" className="h-5 w-5" />
            ) : (
              <CopyIcon aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
