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
 *
 * Regenerating a couple look:
 *   • the wedding party follows the couple — it is rebuilt around the new
 *     couple colours and moves on to its next complete set;
 *   • families and guests stay put — they are worked out against the
 *     couple's first-option colours, and only a colour that would clash with
 *     a new couple colour is swapped, individually.
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

const chromaticHues = (colours: ColorRef[]) =>
  colours
    .map((c) => hexToHsl(c.hex))
    .filter((hsl) => hsl.s >= 8)
    .map((hsl) => hsl.h);

const ledgerOf = (colours: ColorRef[]) => new ColourLedger().with(colours.map((c) => c.hex));

/** The couple's colours after `lookOne` / `lookTwo` regenerations. */
export type CoupleColoursAt = (lookOne: number, lookTwo: number) => ColorRef[];

/**
 * How far back the party's regeneration history is replayed exactly. Beyond
 * this (hundreds of clicks), one step back is approximated.
 */
const MAX_REPLAYED_REGENERATIONS = 8;

export function assignGroupColours(
  ctx: StylingContext,
  coupleAt: CoupleColoursAt
): GroupColours {
  const same = ctx.coordination === "same";
  const lookOne = variantOf(ctx, "couple");
  const lookTwo = variantOf(ctx, "lookTwo");
  const coupleMemo = new Map<string, ColorRef[]>();
  const coupleFor = (a: number, b: number) => {
    const key = `${a}:${b}`;
    if (!coupleMemo.has(key)) coupleMemo.set(key, coupleAt(a, b));
    return coupleMemo.get(key)!;
  };
  const couple = { current: coupleFor(lookOne, lookTwo), base: coupleFor(0, 0) };
  const currentCouple = ledgerOf(couple.current);
  const baseCouple = ledgerOf(couple.base);
  // Every colour a look can be regenerated to comes from the palette, so
  // families and guests steer clear of all of them up front — regenerating a
  // look can then never collide with them.
  // (Independent of every reshuffle counter, like the first options.)
  const paletteHexes = [
    ...ctx.palette.anchors.map((c) => c.hex),
    ...ctx.palette.additions.map((c) => c.hex),
  ];
  const reachableByCouple = baseCouple.with(paletteHexes);
  const baseHues = chromaticHues(couple.base);

  const generate = (
    spec: GroupSpec,
    ledger: ColourLedger,
    count: number,
    variant: number,
    hues: number[] = baseHues
  ) =>
    generateGroupColours(ctx.palette, spec.profile, ledger, count, {
      tone: ctx.tone,
      variant,
      leadHues: spec.aroundCouple ? hues : undefined,
    });

  /**
   * Keep every pick that is still clear of the current couple; swap only the
   * ones that clash, for the nearest valid alternatives.
   */
  const clearOfCouple = (spec: GroupSpec, picks: Color[], ledger: ColourLedger): Color[] => {
    const clashing = picks.filter((c) => currentCouple.isTaken(c.hex));
    if (clashing.length === 0) return picks;
    const kept = picks.filter((c) => !clashing.includes(c));
    const replacements = generate(
      spec,
      ledger.with([...couple.current.map((c) => c.hex), ...hexesOf(kept)]),
      clashing.length,
      0
    );
    let next = 0;
    return picks.map((c) => (clashing.includes(c) ? (replacements[next++] ?? c) : c));
  };

  /**
   * Same mode: groomsmen wear the bridesmaids' lead colour plus one of their
   * own; the pair shares one reshuffle counter (the bridesmaids').
   */
  const sameModeGroomsmen = (
    spec: GroupSpec,
    ledger: ColourLedger,
    bridesmaids: Color[],
    variant: number,
    hues: number[] = baseHues
  ) => {
    const [shared] = bridesmaids;
    if (!shared) return generate(spec, ledger, spec.count, variant, hues);
    return [shared, ...generate(spec, ledger.with(hexesOf(bridesmaids)), spec.count - 1, variant, hues)];
  };

  // Pass 1 — first options, in order, each avoiding the couple's first-option
  // colours and earlier defaults. Independent of every reshuffle counter.
  const defaults = {} as GroupColours;
  const cumulative = baseCouple.with([]);
  for (const spec of GROUP_SPECS) {
    // Families and guests are computed exactly as they will be shown, clear
    // of every colour a look could take.
    const ledger = spec.aroundCouple ? cumulative : cumulative.with(paletteHexes);
    defaults[spec.key] =
      same && spec.key === "groomsmen"
        ? sameModeGroomsmen(spec, ledger, defaults.bridesmaids, 0)
        : generate(spec, ledger, spec.count, 0);
    cumulative.claim(hexesOf(defaults[spec.key]));
  }

  const othersDefaultsFor = (spec: GroupSpec) => {
    const own = new Set(hexesOf(defaults[spec.key]));
    return GROUP_SPECS.filter((s) => s.key !== spec.key)
      .flatMap((s) => hexesOf(defaults[s.key]))
      .filter((hex) => !own.has(hex));
  };
  const partySpecs = GROUP_SPECS.filter((spec) => spec.aroundCouple);
  type Party = Pick<GroupColours, "bridesmaids" | "groomsmen">;

  /**
   * The wedding party around a given set of couple colours. `shift` (the
   * number of look regenerations) moves it on to its next set each time.
   */
  const partyFor = (
    coupleColours: ColorRef[],
    previous: Party[],
    shift: number
  ): Party => {
    const partyVariant = variantOf(ctx, "bridesmaids") + shift;
    const hues = chromaticHues(coupleColours);
    const coupleLedger = ledgerOf(coupleColours);
    const party = {} as Party;
    for (const spec of partySpecs) {
      const base = coupleLedger.with(othersDefaultsFor(spec));
      const pick = (ledger: ColourLedger, extra = 0) =>
        same && spec.key === "groomsmen"
          ? sameModeGroomsmen(spec, ledger, party.bridesmaids, partyVariant + extra, hues)
          : generate(spec, ledger, spec.count, (same ? partyVariant : variantOf(ctx, spec.key) + shift) + extra, hues);
      const key = spec.key as "bridesmaids" | "groomsmen";
      // Prefer a set clear of the whole previous party; failing that, clear
      // of this group's previous colours; only then allow overlap.
      const allPrevious = previous.flatMap((p) => [...hexesOf(p.bridesmaids), ...hexesOf(p.groomsmen)]);
      const ownPrevious = previous.flatMap((p) => hexesOf(p[key]));
      const attempts = [allPrevious, ownPrevious, []];
      let chosen: Color[] = [];
      for (const avoid of attempts) {
        chosen = pick(base.with(avoid));
        if (chosen.length >= spec.count) break;
      }
      // Crowded palettes: if that is still the previous set, step through
      // the next alternatives so a regeneration always shows a change.
      const isPreviousSet = (colours: Color[]) =>
        colours.length === ownPrevious.length && colours.every((c) => ownPrevious.includes(c.hex));
      for (let extra = 1; previous.length > 0 && isPreviousSet(chosen) && extra <= 8; extra += 1) {
        const next = pick(base, extra);
        if (next.length >= spec.count) chosen = next;
      }
      party[key] = chosen;
    }
    return party;
  };

  /**
   * The party exactly as it was shown after `a` / `b` look regenerations:
   * each state avoids the party of the state(s) one regeneration earlier, so
   * every look regeneration brings a visibly new set.
   */
  const partyMemo = new Map<string, Party>();
  const shownParty = (a: number, b: number): Party => {
    const key = `${a}:${b}`;
    const cached = partyMemo.get(key);
    if (cached) return cached;
    const exact = a <= MAX_REPLAYED_REGENERATIONS && b <= MAX_REPLAYED_REGENERATIONS;
    const before = (x: number, y: number) =>
      exact ? shownParty(x, y) : partyFor(coupleFor(x, y), [], x + y);
    const previous = [
      ...(a > 0 ? [before(a - 1, b)] : []),
      ...(b > 0 ? [before(a, b - 1)] : []),
    ];
    const party = partyFor(coupleFor(a, b), previous, a + b);
    partyMemo.set(key, party);
    return party;
  };

  // Pass 2 — the shown options, each avoiding every *other* group's defaults
  // (never their current, possibly reshuffled, colours).
  const result = { ...shownParty(lookOne, lookTwo) } as GroupColours;

  for (const spec of GROUP_SPECS) {
    if (spec.aroundCouple) continue;
    // Families and guests are anchored to the couple's first options and
    // clear of every colour a look could take, so a look regeneration never
    // moves them; the clash check is a last-resort safety net.
    const ledger = reachableByCouple.with(othersDefaultsFor(spec));
    const picks = generate(spec, ledger, spec.count, variantOf(ctx, spec.key));
    result[spec.key] = clearOfCouple(spec, picks, ledger);
  }
  return result;
}
