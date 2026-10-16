import type { Color, StylingRecommendation } from "@/types";
import { selectFabrics, selectOutfits } from "./catalog";
import { type StylingContext } from "./context";
import type { GroupColours } from "./group-assignment";
import type { ColourLedger } from "./group-colors";

/**
 * Wedding party + family recommendations (iteration 02).
 *
 * Colours are assigned in `group-assignment.ts` (party built around the
 * couple's colours, families around the wider palette); this module turns
 * them into outfit, fabric and styling recommendations.
 */

/**
 * Metallic for party accessories — the palette accent unless the couple has
 * claimed it, in which case a generic metallic keeps their colour exclusive.
 */
function partyMetal(ctx: StylingContext, ledger: ColourLedger): string {
  const accent = ctx.palette.accent;
  return accent && !ledger.isTaken(accent.hex) ? accent.name : "Metallic";
}

function partyNotes(primary: Color | undefined, secondary: Color | undefined, same: boolean): string {
  if (!primary) {
    return "A direction derived from your palette, distinct from the couple.";
  }
  if (same) {
    return `${primary.name} shared across the wedding party keeps everyone connected — proportion and fabric may vary between groups.`;
  }
  return `${primary.name} leads this group${secondary ? `, lifted by ${secondary.name.toLowerCase()}` : ""} — derived from your palette, distinct from the couple.`;
}

/** Bridesmaids + groomsmen with coordination modes (PRD §14–17). */
export function buildParty(
  ctx: StylingContext,
  ledger: ColourLedger,
  colours: Pick<GroupColours, "bridesmaids" | "groomsmen">
): { bridesmaids: StylingRecommendation; groomsmen: StylingRecommendation } {
  const same = ctx.coordination === "same";
  const bridesmaidColours = colours.bridesmaids;
  const groomsmanColours = colours.groomsmen;
  const bridesmaids: StylingRecommendation = {
    group: "bridesmaids",
    title: "Bridesmaids",
    colors: bridesmaidColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("female", "bridesmaids", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("bridesmaids", ctx.weddingTypes, ctx.styles),
    accessories: [
      `${partyMetal(ctx, ledger)} details${bridesmaidColours[1] ? ` with a subtle touch of ${bridesmaidColours[1].name.toLowerCase()}` : ""}`,
    ],
    notes: partyNotes(bridesmaidColours[0], bridesmaidColours[1], same),
  };

  const groomsmen: StylingRecommendation = {
    group: "groomsmen",
    title: "Groomsmen",
    colors: groomsmanColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("male", "groomsmen", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("groomsmen", ctx.weddingTypes, ctx.styles),
    accessories: [
      `${partyMetal(ctx, ledger)} details could appear in pocket squares or caps`,
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
  colours: Pick<GroupColours, "brideFamily" | "groomFamily">
): { brideFamily: StylingRecommendation; groomFamily: StylingRecommendation } {
  const brideColours = colours.brideFamily;
  const brideFamily: StylingRecommendation = {
    group: "bride-family",
    title: "Bride's Family",
    colors: brideColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: selectOutfits("female", "bride-family", ctx.weddingTypes, ctx.styles),
    fabrics: selectFabrics("bride-family", ctx.weddingTypes, ctx.styles),
    accessories: undefined,
    notes: `An aso-ebi direction of its own — warm companions to the couple's colours rather than echoes of them.`,
  };

  const groomColours = colours.groomFamily;
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
