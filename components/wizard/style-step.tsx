"use client";

import { WEDDING_STYLES } from "@/data/wedding-types";
import type { WeddingStyleId } from "@/types";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

type StyleStepProps = {
  value: WeddingStyleId[];
  onChange: (value: WeddingStyleId[]) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StyleStep({ value, onChange, onBack, onNext }: StyleStepProps) {
  const toggle = (id: WeddingStyleId) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step="Step 03 — Wedding Style"
          title="How do you want your wedding to feel?"
          supporting="Choose one, or a few. These preferences shape the outfit, fabric and decor suggestions."
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {WEDDING_STYLES.map((style) => {
          const selected = value.includes(style.id);
          return (
            <button
              key={style.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(style.id)}
              title={style.description}
              className="option-card px-5 py-3 text-sm uppercase tracking-widest"
            >
              {selected ? "✓ " : ""}
              {style.label}
            </button>
          );
        })}
      </div>

      <WizardActions onNext={onNext} />
    </div>
  );
}
