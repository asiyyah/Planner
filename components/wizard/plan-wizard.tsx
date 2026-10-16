"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRADITIONAL_TYPES } from "@/lib/constants";
import { encodeInputs } from "@/lib/state";
import type {
  CoordinationMode,
  PlannerInputs,
  Traditions,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { ColourStep } from "./colour-step";
import { TypeStep } from "./type-step";
import { TraditionsStep } from "./traditions-step";
import { StyleStep } from "./style-step";
import { CoordinationStep } from "./coordination-step";
import { RevealStep } from "./reveal-step";
import { WizardProgress } from "./wizard-bits";

type StepKey = "colours" | "type" | "traditions" | "style" | "coordination";

const DEFAULT_TRADITIONS: Traditions = { bride: "general", groom: "general", ceremony: "bride" };

export function PlanWizard({ initial }: { initial?: PlannerInputs | null }) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey | "reveal">("colours");
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [weddingTypes, setWeddingTypes] = useState<WeddingTypeId[]>(
    initial?.weddingTypes ?? []
  );
  const [traditions, setTraditions] = useState<Traditions>(initial?.traditions ?? DEFAULT_TRADITIONS);
  const [styles, setStyles] = useState<WeddingStyleId[]>(initial?.styles ?? []);
  const [coordination, setCoordination] = useState<CoordinationMode>(
    initial?.coordination ?? "different"
  );

  // The Traditions step only applies when a traditional ceremony is planned.
  const hasTraditional = weddingTypes.some((t) => TRADITIONAL_TYPES.includes(t));
  const steps: StepKey[] = [
    "colours",
    "type",
    ...(hasTraditional ? (["traditions"] as const) : []),
    "style",
    "coordination",
  ];
  const position = step === "reveal" ? steps.length : steps.indexOf(step);
  const goTo = (offset: number) => setStep(steps[position + offset] ?? "reveal");
  const numberOf = (key: StepKey) => steps.indexOf(key) + 1;
  const chosenTraditions = hasTraditional ? traditions : undefined;

  // Mirror a decodable draft into the URL so a refresh restores it.
  useEffect(() => {
    if (colors.length === 0 || weddingTypes.length === 0) return;
    const encoded = encodeInputs({
      colors,
      weddingTypes,
      styles,
      coordination,
      ...(chosenTraditions ? { traditions: chosenTraditions } : {}),
    });
    window.history.replaceState(null, "", `/plan?d=${encoded}`);
  }, [colors, weddingTypes, styles, coordination, chosenTraditions]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {step !== "reveal" ? (
        <>
          <WizardProgress current={position + 1} total={steps.length} />
          <div className="mt-12">
            {step === "colours" && (
              <ColourStep
                colors={colors}
                onChange={setColors}
                onBack={() => router.push("/")}
                onNext={() => goTo(1)}
              />
            )}
            {step === "type" && (
              <TypeStep
                value={weddingTypes}
                onChange={setWeddingTypes}
                onBack={() => goTo(-1)}
                onNext={() => goTo(1)}
              />
            )}
            {step === "traditions" && (
              <TraditionsStep
                value={traditions}
                onChange={setTraditions}
                onBack={() => goTo(-1)}
                onNext={() => goTo(1)}
                stepNumber={numberOf("traditions")}
              />
            )}
            {step === "style" && (
              <StyleStep
                value={styles}
                onChange={setStyles}
                onBack={() => goTo(-1)}
                onNext={() => goTo(1)}
                stepNumber={numberOf("style")}
              />
            )}
            {step === "coordination" && (
              <CoordinationStep
                value={coordination}
                onChange={setCoordination}
                onBack={() => goTo(-1)}
                onNext={() => goTo(1)}
                stepNumber={numberOf("coordination")}
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
            traditions={chosenTraditions}
          />
        )
      )}
    </main>
  );
}
