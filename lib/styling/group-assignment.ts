import type { Color, ColorRef, VariantKey } from "@/types";
import { hexToHsl } from "@/lib/color/conversion";
import { type StylingContext, variantOf } from "./context";
import {
  ColourLedger,
  generateGroupColours,
  type GroupProfile,
} from "./group-colors";

/**
 * Colour assignment for every non-couple group.
 *
 * Groups:
 *   • Wedding party (bridesmaids + groomsmen) — built around the couple's
 *     colours so their outfits complement the couple.
 *   • Families (bride's + groom's) — built from the wider palette.
 *   • Guests — built from the wider palette.
 *
 * Every group avoids the couple's colours. To stay distinct without coupling
 * reshuffles together, each group also avoids the other groups' *first
 * option* (default) colours, which never change when anything is reshuffled.
 * So reshuffling one section never changes another — except in "same
 * colours" mode, where bridesmaids and groomsmen are one matched set with a
 * single reshuffle counter.
 */

export type GroupKey = "bridesmaids" | "groomsmen" | "brideFamily" | "groomFamily" | "guests";

export type GroupColours = Record<GroupKey, Color[]>;

type GroupSpec = {
  key: GroupKey & VariantKey;
  profile: GroupProfile;
  count: number;
  /** Party groups lead with the couple's hues. */
  aroundCouple: boolean;
};

/** Generation order also decides who keeps a colour when defaults compete. */
const GROUP_SPECS: GroupSpec[] = [
  { key: "bridesmaids", profile: "bridesmaids", count: 2, aroundCouple: true },
  { key: "groomsmen", profile: "groomsmen", count: 2, aroundCouple: true },
  { key: "brideFamily", profile: "bride-family", count: 2, aroundCouple: false },
  { key: "groomFamily", profile: "groom-family", count: 2, aroundCouple: false },
  { key: "guests", profile: "guests", count: 5, aroundCouple: false },
];

const hexesOf = (colours: Color[]) => colours.map((c) => c.hex);

export function assignGroupColours(
  ctx: StylingContext,
  coupleLedger: ColourLedger,
  coupleColours: ColorRef[]
): GroupColours {
  const same = ctx.coordination === "same";
  const coupleHues = coupleColours
    .map((c) => hexToHsl(c.hex))
    .filter((hsl) => hsl.s >= 8)
    .map((hsl) => hsl.h);

  const generate = (spec: GroupSpec, ledger: ColourLedger, count: number, variant: number) =>
    generateGroupColours(ctx.palette, spec.profile, ledger, count, {
      tone: ctx.tone,
      variant,
      leadHues: spec.aroundCouple ? coupleHues : undefined,
    });

  /**
   * Same mode: groomsmen wear the bridesmaids' lead colour plus one of their
   * own; the pair shares one reshuffle counter (the bridesmaids').
   */
  const sameModeGroomsmen = (spec: GroupSpec, ledger: ColourLedger, bridesmaids: Color[], variant: number) => {
    const [shared] = bridesmaids;
    if (!shared) return generate(spec, ledger, spec.count, variant);
    return [shared, ...generate(spec, ledger.with(hexesOf(bridesmaids)), spec.count - 1, variant)];
  };

  // Pass 1 — first options, in order, each avoiding the couple and earlier defaults.
  const defaults = {} as GroupColours;
  const cumulative = coupleLedger.with([]);
  for (const spec of GROUP_SPECS) {
    defaults[spec.key] =
      same && spec.key === "groomsmen"
        ? sameModeGroomsmen(spec, cumulative, defaults.bridesmaids, 0)
        : generate(spec, cumulative, spec.count, 0);
    cumulative.claim(hexesOf(defaults[spec.key]));
  }

  // Pass 2 — the shown options, each avoiding the couple and every *other*
  // group's defaults (never their current, possibly reshuffled, colours).
  const partyVariant = variantOf(ctx, "bridesmaids");
  const result = {} as GroupColours;
  for (const spec of GROUP_SPECS) {
    const own = new Set(hexesOf(defaults[spec.key]));
    const othersDefaults = GROUP_SPECS.filter((s) => s.key !== spec.key)
      .flatMap((s) => hexesOf(defaults[s.key]))
      .filter((hex) => !own.has(hex));
    const ledger = coupleLedger.with(othersDefaults);

    if (same && spec.key === "groomsmen") {
      result.groomsmen = sameModeGroomsmen(spec, ledger, result.bridesmaids, partyVariant);
    } else {
      const variant = same && spec.key === "bridesmaids" ? partyVariant : variantOf(ctx, spec.key);
      result[spec.key] = generate(spec, ledger, spec.count, variant);
    }
  }
  return result;
}
