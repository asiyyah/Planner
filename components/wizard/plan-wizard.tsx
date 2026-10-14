"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { encodeInputs } from "@/lib/state";
import type {
  CoordinationMode,
  PlannerInputs,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { ColourStep } from "./colour-step";
import { TypeStep } from "./type-step";
import { StyleStep } from "./style-step";
import { CoordinationStep } from "./coordination-step";
import { RevealStep } from "./reveal-step";
import { WizardProgress } from "./wizard-bits";

const TOTAL_STEPS = 4;

export function PlanWizard({ initial }: { initial?: PlannerInputs | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0–3 inputs, 4 reveal
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [weddingTypes, setWeddingTypes] = useState<WeddingTypeId[]>(
    initial?.weddingTypes ?? []
  );
  const [styles, setStyles] = useState<WeddingStyleId[]>(initial?.styles ?? []);
  const [coordination, setCoordination] = useState<CoordinationMode>(
    initial?.coordination ?? "different"
  );

  // Mirror a decodable draft into the URL so a refresh restores it.
  useEffect(() => {
    if (colors.length === 0 || weddingTypes.length === 0) return;
    const encoded = encodeInputs({ colors, weddingTypes, styles, coordination });
    window.history.replaceState(null, "", `/plan?d=${encoded}`);
  }, [colors, weddingTypes, styles, coordination]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {step < TOTAL_STEPS ? (
        <>
          <WizardProgress current={step + 1} total={TOTAL_STEPS} />
          <div className="mt-12">
            {step === 0 && (
              <ColourStep
                colors={colors}
                onChange={setColors}
                onBack={() => router.push("/")}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <TypeStep
                value={weddingTypes}
                onChange={setWeddingTypes}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StyleStep
                value={styles}
                onChange={setStyles}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <CoordinationStep
                value={coordination}
                onChange={setCoordination}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}
          </div>
        </>
      ) : (
        colors.length > 0 && weddingTypes.length > 0 && (
          <RevealStep
            colors={colors}
            weddingTypes={weddingTypes}
            styles={styles}
            coordination={coordination}
          />
        )
      )}
    </main>
  );
}
