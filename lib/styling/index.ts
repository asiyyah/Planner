import { generatePalette } from "@/lib/color/palette";
import type {
  CoordinationMode,
  PlannerInputs,
  StyleGuide,
  WeddingTypeId,
} from "@/types";
import type { StylingContext } from "./context";
import { buildCouple } from "./couple";
import { ColourLedger } from "./group-colors";
import { buildFamilies, buildParty } from "./groups";
import { buildGuests } from "./guests";
import { buildDecor } from "./decor";

export const WEDDING_TYPE_IDS: WeddingTypeId[] = [
  "traditional",
  "white",
  "traditional-white",
  "civil",
  "other",
];

export const COORDINATION_MODES: CoordinationMode[] = ["same", "different"];

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(hex: string): boolean {
  return HEX_PATTERN.test(hex);
}

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
    if (!isValidHex(hex)) {
      throw new Error(`Invalid colour: ${hex}`);
    }
  }
  if (inputs.weddingTypes.length === 0) {
    throw new Error("At least one wedding type is required");
  }

  const palette = generatePalette(inputs.colors);

  const ctx: StylingContext = {
    palette,
    weddingTypes: inputs.weddingTypes,
    styles: inputs.styles,
    coordination: inputs.coordination,
  };

  // 1. The couple first — their looks claim exclusive colours.
  const { couple, assignedHexes } = buildCouple(ctx);

  // 2. Every other group generates independently, excluding the couple.
  const ledger = new ColourLedger();
  ledger.claim(assignedHexes);

  const party = buildParty(ctx, ledger);
  const families = buildFamilies(ctx, ledger);
  const guests = buildGuests(ctx, ledger);

  // 3. Decor stays tied to the master palette — the wedding's visual language.
  const decor = buildDecor(ctx);

  return {
    version: 2,
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
