"use client";

import { WEDDING_TYPES } from "@/data/wedding-types";
import type { WeddingTypeId } from "@/types";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

type TypeStepProps = {
  value: WeddingTypeId[];
  onChange: (value: WeddingTypeId[]) => void;
  onBack: () => void;
  onNext: () => void;
};

/**
 * Wedding type is multi-select (iteration 02 §14–16): couples may be
 * planning a traditional wedding and a white wedding, for example.
 */
export function TypeStep({ value, onChange, onBack, onNext }: TypeStepProps) {
  const toggle = (id: WeddingTypeId) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step="Step 02 — Wedding Type"
          title="What kind of wedding are you planning?"
          supporting="Select every celebration that applies — the recommendations adapt to each of them."
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {WEDDING_TYPES.map((option) => {
          const selected = value.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(option.id)}
              className="option-card px-5 py-3 text-sm uppercase tracking-widest"
            >
              {selected ? "✓ " : ""}
              {option.label}
            </button>
          );
        })}
      </div>

      <WizardActions onNext={onNext} nextDisabled={value.length === 0} />
    </div>
  );
}
