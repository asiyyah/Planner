import type { Color, StylingRecommendation } from "@/types";
import { selectFabrics, selectOutfits } from "./catalog";
import { type StylingContext } from "./context";
import {
  ColourLedger,
  generateGroupColours,
} from "./group-colors";

/**
 * Wedding party + family recommendations (iteration 02).
 *
 * Colours come from the group generator — freshly derived from the master
 * palette's theme, shaped per group — and are checked against the ledger so
 * nothing assigned to the couple (or an earlier group) can appear here.
 */

function partyNotes(primary: Color, secondary: Color | undefined, same: boolean): string {
  if (same) {
    return `${primary.name} shared across the wedding party keeps everyone connected — proportion and fabric may vary between groups.`;
  }
  return `${primary.name} leads this group${secondary ? `, lifted by ${secondary.name.toLowerCase()}` : ""} — derived from your palette, distinct from the couple.`;
}

/** Bridesmaids + groomsmen with coordination modes (PRD §14–17). */
export function buildParty(
  ctx: StylingContext,
  ledger: ColourLedger
): { bridesmaids: StylingRecommendation; groomsmen: StylingRecommendation } {
  const same = ctx.coordination === "same";

  const bridesmaidColours = generateGroupColours(ctx.palette, "bridesmaids", ledger, 2);
  const bridesmaids: StylingRecommendation = {
    group: "bridesmaids",
    title: "Bridesmaids",
    colors: bridesmaidColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("female", "bridesmaids", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("bridesmaids", ctx.weddingTypes, ctx.styles),
    accessories: [
      `${ctx.palette.accent?.name ?? "metallic"} details with a subtle touch of ${ctx.palette.neutral.name.toLowerCase()}`,
    ],
    notes: partyNotes(bridesmaidColours[0], bridesmaidColours[1], false),
  };

  // Same-mode shares the bridesmaid primary; different-mode generates its own
  // groomsmen direction — both always clear of the couple.
  const groomsmanColours = same && bridesmaidColours[0]
    ? [bridesmaidColours[0], ...generateGroupColours(ctx.palette, "groomsmen", ledger, 1)]
    : generateGroupColours(ctx.palette, "groomsmen", ledger, 2);

  const groomsmen: StylingRecommendation = {
    group: "groomsmen",
    title: "Groomsmen",
    colors: groomsmanColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("male", "groomsmen", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("groomsmen", ctx.weddingTypes, ctx.styles),
    accessories: [
      `${ctx.palette.accent?.name ?? ctx.palette.neutral.name} could appear in pocket squares or caps`,
    ],
    notes: same
      ? `The shared ${bridesmaidColours[0]?.name ?? "party"} colour continues here — a different outfit cut keeps the two groups from looking identical.`
      : `${groomsmanColours[0]?.name ?? "A deeper tone"} anchors the look against a ${groomsmanColours[1]?.name.toLowerCase() ?? "neutral"} shirt or inner.`,
  };

  return { bridesmaids, groomsmen };
}

/** Bride's family + groom's family (PRD §18) with distinct generated identities. */
export function buildFamilies(
  ctx: StylingContext,
  ledger: ColourLedger
): { brideFamily: StylingRecommendation; groomFamily: StylingRecommendation } {
  const brideColours = generateGroupColours(ctx.palette, "bride-family", ledger, 2);
  const brideFamily: StylingRecommendation = {
    group: "bride-family",
    title: "Bride's Family",
    colors: brideColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("female", "bride-family", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("bride-family", ctx.weddingTypes, ctx.styles),
    accessories: undefined,
    notes: `An aso-ebi direction of its own — warm companions to the couple's colours rather than echoes of them.`,
  };

  const groomColours = generateGroupColours(ctx.palette, "groom-family", ledger, 2);
  const groomFamily: StylingRecommendation = {
    group: "groom-family",
    title: "Groom's Family",
    colors: groomColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("male", "groom-family", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("groom-family", ctx.weddingTypes, ctx.styles),
    accessories: undefined,
    notes: `A separate family identity in the same visual language as the rest of the wedding.`,
  };

  return { brideFamily, groomFamily };
}
