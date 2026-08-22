"use client";

import { cn } from "@/lib/utils";

export function StepHeading({
  step,
  title,
  supporting,
}: {
  step: string;
  title: string;
  supporting?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        {step}
      </p>
      <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
        {title}
      </h1>
      {supporting ? (
        <p className="mt-4 text-neutral-600">{supporting}</p>
      ) : null}
    </div>
  );
}

/**
 * Back control pinned to the top of a step so it stays visible without
 * scrolling through content (iteration §16).
 */
export function StepBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm uppercase tracking-widest text-neutral-500 underline-offset-4 transition-colors hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
    >
      ← Back
    </button>
  );
}

export function WizardProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <ol className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <li key={n} className="flex items-center gap-2">
          <span
            aria-current={n === current ? "step" : undefined}
            className={cn(
              "flex h-7 w-7 items-center justify-center border border-black font-mono",
              n === current && "bg-black text-white",
              n < current && "bg-neutral-200"
            )}
          >
            {String(n).padStart(2, "0")}
          </span>
          {n < total ? <span aria-hidden="true">—</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function WizardActions({
  onNext,
  nextLabel = "Continue",
  nextDisabled,
}: {
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors",
          nextDisabled
            ? "cursor-not-allowed border-neutral-300 bg-white text-neutral-400"
            : "bg-black text-white hover:bg-white hover:text-black"
        )}
      >
        {nextLabel}
      </button>
    </div>
  );
}
