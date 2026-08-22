"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { generatePalette } from "@/lib/color/palette";
import { encodeInputs } from "@/lib/state";
import type {
  CoordinationMode,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";
import { readableTextColor } from "@/lib/color/contrast";

type RevealStepProps = {
  colors: string[];
  weddingTypes: WeddingTypeId[];
  styles: WeddingStyleId[];
  coordination: CoordinationMode;
};

type Stage = "intro" | "harmony" | "reveal" | "ready";

export function RevealStep({
  colors,
  weddingTypes,
  styles,
  coordination,
}: RevealStepProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");

  const palette = useMemo(() => generatePalette(colors), [colors]);

  useEffect(() => {
    if (reducedMotion) {
      const skip = setTimeout(() => setStage("ready"), 0);
      return () => clearTimeout(skip);
    }
    const timers = [
      setTimeout(() => setStage("harmony"), 900),
      setTimeout(() => setStage("reveal"), 1900),
      setTimeout(() => setStage("ready"), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const guideHref = `/guide?d=${encodeInputs({
    colors,
    weddingTypes,
    styles,
    coordination,
  })}`;

  useEffect(() => {
    if (stage !== "ready") return;
    const timer = setTimeout(() => router.push(guideHref), 1800);
    return () => clearTimeout(timer);
  }, [stage, guideHref, router]);

  // Anchors first (in the order chosen), then everything we added.
  const entries = [
    ...palette.anchors.map((c) => ({ hex: c.hex, name: c.name })),
    ...palette.additions
      .filter((c) => !palette.anchors.some((a) => a.hex === c.hex))
      .map((c) => ({ hex: c.hex, name: c.name })),
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      {(stage === "intro" || stage === "harmony") && (
        <motion.div
          key="inputs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Your colours
          </p>
          <div className="flex flex-wrap items-start justify-center gap-3">
            {colors.map((hex) => (
              <div
                key={hex}
                className="swatch-frame h-24 w-24 sm:h-28 sm:w-28"
                style={{
                  backgroundColor: hex,
                  color: readableTextColor(hex),
                }}
                role="img"
                aria-label={`Your colour ${hex}`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {(stage === "harmony" || stage === "reveal" || stage === "ready") && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === "harmony" ? 1 : 0.45 }}
          className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600"
        >
          Finding your harmony…
        </motion.p>
      )}

      {(stage === "reveal" || stage === "ready") && (
        <>
          <div className="swatch-strip mt-10 grid w-full max-w-xl auto-rows-fr grid-cols-5">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.hex}-${index}`}
                initial={reducedMotion ? false : { scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: index * 0.18, duration: 0.45 }}
                className="relative h-32 origin-bottom sm:h-40"
                style={{
                  backgroundColor: entry.hex,
                  ...(index > 4
                    ? { borderTop: "1px solid var(--swatch-border)" }
                    : {}),
                }}
                role="img"
                aria-label={`Palette colour: ${entry.name}`}
              >
                <span
                  className="absolute inset-x-0 bottom-2 px-1 text-[9px] uppercase tracking-widest"
                  style={{
                    color: readableTextColor(entry.hex),
                    opacity: 0.75,
                  }}
                >
                  {entry.name}
                </span>
              </motion.div>
            ))}
          </div>

          {stage === "ready" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-6"
            >
              <p className="font-heading text-3xl">Your palette is ready.</p>
              <a
                href={guideHref}
                className="inline-block border border-black bg-black px-10 py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
              >
                View your style guide →
              </a>
            </motion.div>
          ) : null}
        </>
      )}
    </div>
  );
}
