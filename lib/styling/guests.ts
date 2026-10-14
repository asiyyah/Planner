import type { Color, ColorRef, GuestGuide } from "@/types";
import { describeColor, hexesNearDuplicate } from "@/lib/color/palette";
import { type StylingContext, variantOf } from "./context";
import {
  BRIDAL_WHITES,
  ColourLedger,
  generateGroupColours,
} from "./group-colors";

/** Couple colours shown on the avoid list before the bridal whites. */
const MAX_COUPLE_AVOID = 4;

/**
 * Guest colour guide (PRD §19, iteration 02 §7/§22).
 *
 * Guests receive broad generated guidance — soft neutrals and muted tones
 * derived from the wedding theme — while every couple-exclusive colour moves
 * into the avoid list. White weddings also reserve white and ivory for the
 * bride.
 */
export function buildGuests(ctx: StylingContext, ledger: ColourLedger): GuestGuide {
  // The couple claims first, so the head of the ledger is the couple's colours.
  const coupleHexes = ledger.taken.slice(0, MAX_COUPLE_AVOID);

  const options = { tone: ctx.tone, variant: variantOf(ctx, "guests") };
  const recommended: Color[] = generateGroupColours(ctx.palette, "guests", ledger, 3, options);
  const optional: Color[] = generateGroupColours(ctx.palette, "guests", ledger, 2, options);

  const avoid: ColorRef[] = coupleHexes.map((hex) => ({
    name: nameFor(ctx, hex),
    hex,
  }));

  const whiteWedding = ctx.weddingTypes.some(
    (t) => t === "white" || t === "traditional-white"
  );
  if (whiteWedding) {
    for (const white of BRIDAL_WHITES) {
      if (!avoid.some((c) => hexesNearDuplicate(c.hex, white.hex))) {
        avoid.push({ name: white.name, hex: white.hex });
      }
    }
  }

  return {
    recommended: recommended.map((c) => ({ name: c.name, hex: c.hex })),
    optional: optional.map((c) => ({ name: c.name, hex: c.hex })),
    avoid,
    avoidNotes: [
      "These colours are reserved for the couple's looks",
      ...(whiteWedding ? ["White and ivory are traditionally kept for the bride"] : []),
      "Very bright or neon shades can fight a coordinated palette",
      "Colours reserved for specific wedding-party groups",
    ],
    notes:
      "A colour guide rather than a dress code — guests could choose whichever of these feels closest to their wardrobe.",
  };
}

function nameFor(ctx: StylingContext, hex: string): string {
  const known = [
    ...ctx.palette.anchors,
    ctx.palette.secondary,
    ...ctx.palette.supporting,
    ctx.palette.neutral,
    ...(ctx.palette.accent ? [ctx.palette.accent] : []),
  ].find((c) => c.hex === hex);
  return known?.name ?? describeColor(hex);
}
