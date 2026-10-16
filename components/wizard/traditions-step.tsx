"use client";

import { CULTURE_OPTIONS } from "@/data/cultures";
import type { CultureId, Traditions } from "@/types";
import { StepBack, StepHeading, WizardActions } from "./wizard-bits";

type TraditionsStepProps = {
  value: Traditions;
  onChange: (value: Traditions) => void;
  onBack: () => void;
  onNext: () => void;
  stepNumber: number;
};

/** One labelled single-choice row of culture chips. */
function CultureChoice({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: CultureId;
  onSelect: (id: CultureId) => void;
}) {
  return (
    <fieldset className="mt-10">
      <legend className="text-xs uppercase tracking-[0.3em] text-neutral-500">{label}</legend>
      <div role="radiogroup" aria-label={label} className="mt-4 flex flex-wrap gap-2">
        {CULTURE_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className="option-card px-5 py-3 text-sm uppercase tracking-widest"
            >
              {selected ? "✓ " : ""}
              {option.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Whose traditions the traditional ceremony follows (only shown when a
 * traditional ceremony was chosen). Bride's and groom's sides are chosen
 * separately: families usually dress in their own tradition.
 */
export function TraditionsStep({ value, onChange, onBack, onNext, stepNumber }: TraditionsStepProps) {
  const nameOf = (id: CultureId) => CULTURE_OPTIONS.find((o) => o.id === id)?.name ?? id;

  return (
    <div>
      <StepBack onClick={onBack} />

      <div className="mt-10">
        <StepHeading
          step={`Step ${String(stepNumber).padStart(2, "0")} — Traditions`}
          title="Whose traditions are you celebrating?"
          supporting="We’ll suggest traditional attire from each family’s culture. Not sure, or prefer to keep it broad? Choose General Nigerian."
        />
      </div>

      <CultureChoice
        label="Bride’s side"
        value={value.bride}
        onSelect={(bride) => onChange({ ...value, bride })}
      />
      <CultureChoice
        label="Groom’s side"
        value={value.groom}
        onSelect={(groom) => onChange({ ...value, groom })}
      />

      {value.bride !== value.groom ? (
        <fieldset className="mt-10">
          <legend className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Whose ceremony is it?
          </legend>
          <p className="mt-2 text-sm text-neutral-600">
            The couple’s traditional look follows this side. It’s usually the bride’s family that hosts.
          </p>
          <div role="radiogroup" aria-label="Whose ceremony is it?" className="mt-4 flex flex-wrap gap-2">
            {(["bride", "groom"] as const).map((side) => {
              const selected = value.ceremony === side;
              return (
                <button
                  key={side}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange({ ...value, ceremony: side })}
                  className="option-card px-5 py-3 text-sm uppercase tracking-widest"
                >
                  {selected ? "✓ " : ""}
                  {side === "bride" ? "Bride’s" : "Groom’s"} ({nameOf(value[side])})
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <WizardActions onNext={onNext} />
    </div>
  );
}
