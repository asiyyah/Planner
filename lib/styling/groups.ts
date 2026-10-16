import type { Color, StylingRecommendation } from "@/types";
import { selectFabrics, selectOutfits } from "./catalog";
import type { AttireSet, Culture } from "@/data/cultures";
import type { OutfitGender, WeddingGroup, WeddingTypeId } from "@/types";
import { hasWesternEvent, type StylingContext } from "./context";
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
 * Outfits, fabrics and accessories for a group: the family's culture when
 * one was chosen for a traditional ceremony (plus one Western option when
 * the wedding also has a white or civil event), otherwise the broad library.
 */
function groupAttire(
  ctx: StylingContext,
  culture: Culture | undefined,
  attire: (c: Culture) => AttireSet,
  gender: OutfitGender,
  group: WeddingGroup
): { outfits: string[]; fabrics: string[]; accessories: string[]; note: string } {
  if (!culture) {
    return {
      outfits: selectOutfits(gender, group, ctx.weddingTypes, ctx.styles),
      fabrics: selectFabrics(group, ctx.weddingTypes, ctx.styles),
      accessories: [],
      note: "",
    };
  }
  const set = attire(culture);
  const westernTypes: WeddingTypeId[] = ctx.weddingTypes
    .filter((t) => t !== "traditional")
    .map((t) => (t === "traditional-white" ? "white" : t));
  const western = hasWesternEvent(ctx) ? selectOutfits(gender, group, westernTypes, ctx.styles, 1) : [];
  return {
    outfits: [...set.outfits.slice(0, 2), ...western.filter((o) => !set.outfits.includes(o))],
    fabrics: set.fabrics.slice(0, 3),
    accessories: set.accessories,
    note: ` Inspired by ${culture.name} traditions; styles vary by family.`,
  };
}

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
  const bridesmaidAttire = groupAttire(ctx, ctx.traditions?.bride, (c) => c.women, "female", "bridesmaids");
  const groomsmenAttire = groupAttire(ctx, ctx.traditions?.groom, (c) => c.men, "male", "groomsmen");
  /** Culture accessories not already named in the given line (e.g. "caps"). */
  const extraAccessories = (line: string, items: string[]) =>
    items.filter((item) => !line.toLowerCase().includes(item.toLowerCase()));
  const groomsmanColours = colours.groomsmen;
  const bridesmaids: StylingRecommendation = {
    group: "bridesmaids",
    title: "Bridesmaids",
    colors: bridesmaidColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: bridesmaidAttire.outfits,
    fabrics: bridesmaidAttire.fabrics,
    accessories: (() => {
      const line = `${partyMetal(ctx, ledger)} details${bridesmaidColours[1] ? ` with a subtle touch of ${bridesmaidColours[1].name.toLowerCase()}` : ""}`;
      return [line, ...extraAccessories(line, bridesmaidAttire.accessories)];
    })(),
    notes: partyNotes(bridesmaidColours[0], bridesmaidColours[1], same) + bridesmaidAttire.note,
  };

  const groomsmen: StylingRecommendation = {
    group: "groomsmen",
    title: "Groomsmen",
    colors: groomsmanColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: groomsmenAttire.outfits,
    fabrics: groomsmenAttire.fabrics,
    accessories: (() => {
      const line = `${partyMetal(ctx, ledger)} details could appear in pocket squares or caps`;
      return [line, ...extraAccessories(line, groomsmenAttire.accessories)];
    })(),
    notes:
      (same
        ? `The shared ${bridesmaidColours[0]?.name ?? "party"} colour continues here — a different outfit cut keeps the two groups from looking identical.`
        : `${groomsmanColours[0]?.name ?? "A deeper tone"} anchors the look against a ${groomsmanColours[1]?.name.toLowerCase() ?? "neutral"} shirt or inner.`) +
      groomsmenAttire.note,
  };

  return { bridesmaids, groomsmen };
}

/** Bride's family + groom's family (PRD §18) with distinct generated identities. */
export function buildFamilies(
  ctx: StylingContext,
  colours: Pick<GroupColours, "brideFamily" | "groomFamily">
): { brideFamily: StylingRecommendation; groomFamily: StylingRecommendation } {
  const brideColours = colours.brideFamily;
  const brideAttire = groupAttire(ctx, ctx.traditions?.bride, (c) => c.women, "female", "bride-family");
  const groomAttire = groupAttire(ctx, ctx.traditions?.groom, (c) => c.men, "male", "groom-family");
  const brideFamily: StylingRecommendation = {
    group: "bride-family",
    title: "Bride's Family",
    colors: brideColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: brideAttire.outfits,
    fabrics: brideAttire.fabrics,
    accessories: brideAttire.accessories.length > 0 ? brideAttire.accessories : undefined,
    notes: `A family colour direction of its own — warm companions to the couple's colours rather than echoes of them.${brideAttire.note}`,
  };

  const groomColours = colours.groomFamily;
  const groomFamily: StylingRecommendation = {
    group: "groom-family",
    title: "Groom's Family",
    colors: groomColours.map((c) => ({ name: c.name, hex: c.hex })),
    outfits: groomAttire.outfits,
    fabrics: groomAttire.fabrics,
    accessories: groomAttire.accessories.length > 0 ? groomAttire.accessories : undefined,
    notes: `A separate family identity in the same visual language as the rest of the wedding.${groomAttire.note}`,
  };

  return { brideFamily, groomFamily };
}
