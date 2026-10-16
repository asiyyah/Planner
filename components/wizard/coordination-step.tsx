"use client";

import type { CoordinationMode } from "@/types";
import { cn } from "@/lib/utils";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

const OPTIONS: {
  id: CoordinationMode;
  title: string;
  description: string;
}[] = [
  {
    id: "same",
    title: "Same colours",
    description:
      "Bridesmaids and groomsmen share the same core colours.",
  },
  {
    id: "different",
    title: "Different but coordinated",
    description:
      "Each group gets its own colours while staying connected to the overall wedding palette.",
  },
];

type CoordinationStepProps = {
  value: CoordinationMode;
  onChange: (value: CoordinationMode) => void;
  onBack: () => void;
  onNext: () => void;
  /** Position in the wizard (moves when the Traditions step is shown). */
  stepNumber: number;
};

export function CoordinationStep({
  value,
  onChange,
  onBack,
  onNext,
  stepNumber,
}: CoordinationStepProps) {
  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step={`Step ${String(stepNumber).padStart(2, "0")} — Wedding Party`}
          title="How should your wedding party coordinate?"
        />
      </div>

      <div
        role="radiogroup"
        aria-label="Wedding party coordination"
        className="mt-10 grid gap-3 sm:grid-cols-2"
      >
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className="option-card relative p-6 text-left"
            >
              {option.id === "different" ? (
                <span
                  className={cn(
                    "absolute right-4 top-4 border px-2 py-1 text-[10px] uppercase tracking-widest",
                    selected
                      ? "border-white text-white"
                      : "border-black text-neutral-600"
                  )}
                >
                  Recommended
                </span>
              ) : null}
              <span className="block font-heading text-2xl">
                {selected ? "✓ " : ""}
                {option.title}
              </span>
              <span
                className={cn(
                  "mt-2 block max-w-xs text-sm",
                  selected ? "text-white/70" : "text-neutral-600"
                )}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <WizardActions onNext={onNext} nextLabel="Generate style guide" />
    </div>
  );
}
