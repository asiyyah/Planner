"use client";

import { describeColor, MAX_COLORS } from "@/lib/color/palette";
import { readableTextColor } from "@/lib/color/contrast";
import { cn } from "@/lib/utils";
import { ColorPickerPopover } from "@/components/swatch/color-picker-popover";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

type ColourStepProps = {
  colors: string[];
  onChange: (colors: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ColourStep({ colors, onChange, onBack, onNext }: ColourStepProps) {
  const canAddMore = colors.length < MAX_COLORS;

  const addColor = (hex: string) => {
    const normalized = hex.toUpperCase();
    if (colors.some((c) => c.toUpperCase() === normalized)) return;
    onChange([...colors, normalized]);
  };

  const removeColor = (hex: string) => {
    onChange(colors.filter((c) => c !== hex));
  };

  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step="Step 01 — Colours"
          title="Choose your colours"
          supporting="Pick a colour you love — that’s all it takes. We’ll build a harmonious palette around it, and you can add more colours any time."
        />
      </div>

      {/* Colour selection */}
      {colors.length === 0 ? (
        <ColorPickerPopover
          initialHex={colors[colors.length - 1] ?? null}
          onApply={addColor}
        >
          <button
            type="button"
            className="mt-10 flex h-28 w-48 items-center justify-center rounded-[var(--swatch-radius)] border border-dashed border-neutral-400 text-sm uppercase tracking-widest text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            Pick a colour
          </button>
        </ColorPickerPopover>
      ) : null}

      {/* Selected colours */}
      {colors.length > 0 ? (
        <ul
          aria-label="Your chosen colours"
          className="mt-10 flex flex-wrap gap-3"
        >
          {colors.map((hex) => {
            const name = describeColor(hex);
            return (
              <li key={hex}>
                <div
                  className="swatch-frame relative flex h-28 w-40 flex-col justify-end p-3"
                  style={{
                    backgroundColor: hex,
                    color: readableTextColor(hex),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeColor(hex)}
                    aria-label={`Remove ${name}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-base leading-none opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                  <span className="text-sm font-medium leading-tight">
                    {name}
                  </span>
                  <span className="font-mono text-xs uppercase opacity-70">
                    {hex}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Add another colour */}
      {canAddMore ? (
        <ColorPickerPopover
          initialHex={colors[colors.length - 1] ?? null}
          onApply={addColor}
        >
          <button
            type="button"
            className={cn(
              "text-sm uppercase tracking-widest underline-offset-4 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-black",
              colors.length === 0 ? "hidden" : "mt-6 block"
            )}
          >
            + Add another colour
          </button>
        </ColorPickerPopover>
      ) : (
        <p className="mt-6 text-xs uppercase tracking-widest text-neutral-500">
          That’s a full palette — remove a colour to make room.
        </p>
      )}

      {colors.length > 1 && canAddMore ? (
        <p className="mt-3 text-xs text-neutral-500">
          Two or three colours is plenty — but follow your instinct.
        </p>
      ) : null}

      <WizardActions
        onNext={onNext}
        nextDisabled={colors.length === 0}
        nextLabel={colors.length > 0 ? "Continue" : "Pick at least one colour"}
      />
    </div>
  );
}
