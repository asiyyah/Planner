import { generatePalette } from "@/lib/color/palette";
import { toneFor } from "@/lib/color/wedding-adjustments";
import { normalizeHex } from "@/lib/color/conversion";
import type { PlannerInputs, StyleGuide } from "@/types";
import type { StylingContext } from "./context";
import { buildCouple } from "./couple";
import { ColourLedger } from "./group-colors";
import { assignGroupColours } from "./group-assignment";
import { buildFamilies, buildParty } from "./groups";
import { buildGuests } from "./guests";
import { buildDecor } from "./decor";

/**
 * The full deterministic pipeline (PRD §42, iteration 02 §19):
 *
 *   user colours → master palette → couple looks → couple assigned colours
 *     → independent group recommendations (couple colours excluded,
 *       new theme-derived colours generated) → decor
 */
export function generateStyleGuide(inputs: PlannerInputs): StyleGuide {
  if (inputs.colors.length === 0) {
    throw new Error("At least one colour is required");
  }
  for (const hex of inputs.colors) {
    if (!hex.startsWith("#") || !normalizeHex(hex)) {
      throw new Error(`Invalid colour: ${hex}`);
    }
  }
  if (inputs.weddingTypes.length === 0) {
    throw new Error("At least one wedding type is required");
  }

  const variants = inputs.variants ?? {};
  const palette = generatePalette(inputs.colors, {
    styles: inputs.styles,
    variant: variants.palette,
  });

  const ctx: StylingContext = {
    palette,
    weddingTypes: inputs.weddingTypes,
    styles: inputs.styles,
    coordination: inputs.coordination,
    tone: toneFor(inputs.styles),
    variants,
  };

  // 1. The couple first — their looks claim exclusive colours.
  const { couple, assignedHexes } = buildCouple(ctx);

  // 2. Wedding party (around the couple's colours), families and guests —
  //    each clear of the couple, and independent of one another's reshuffles.
  const ledger = new ColourLedger();
  ledger.claim(assignedHexes);
  const colours = assignGroupColours(
    ctx,
    ledger,
    couple.looks.flatMap((look) => look.colors)
  );

  const party = buildParty(ctx, ledger, colours);
  const families = buildFamilies(ctx, colours);
  const guests = buildGuests(ctx, ledger, colours.guests);

  // 3. Decor stays tied to the master palette — the wedding's visual language.
  const decor = buildDecor(ctx);

  return {
    inputs,
    palette,
    couple,
    bridesmaids: party.bridesmaids,
    groomsmen: party.groomsmen,
    brideFamily: families.brideFamily,
    groomFamily: families.groomFamily,
    guests,
    decor,
  };
}
