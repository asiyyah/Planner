import type { Color, GuestGuide } from "@/types";
import { describeColor } from "@/lib/color/palette";
import { type StylingContext } from "./context";
import { ColourLedger, generateGroupColours } from "./group-colors";

/**
 * Guest colour guide (PRD §19, iteration 02 §7/§22).
 *
 * Guests receive broad generated guidance — soft neutrals and muted tones
 * derived from the wedding theme — while every couple-exclusive colour moves
 * into the avoid list.
 */
export function buildGuests(ctx: StylingContext, ledger: ColourLedger): GuestGuide {
  const recommended: Color[] = generateGroupColours(ctx.palette, "guests", ledger, 3);
  const optional: Color[] = generateGroupColours(ctx.palette, "guests", ledger, 2);

  return {
    recommended: recommended.map((c) => ({ name: c.name, hex: c.hex })),
    optional: optional.map((c) => ({ name: c.name, hex: c.hex })),
    avoid: ledger.taken.slice(0, 4).map((hex) => ({
      name: nameFor(ctx, hex),
      hex,
    })),
    avoidNotes: [
      "These colours are reserved for the couple's looks",
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
