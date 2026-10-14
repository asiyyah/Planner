import { FABRICS } from "@/data/fabrics";
import { OUTFITS } from "@/data/outfits";
import { TRADITIONAL_TYPES } from "@/lib/constants";
import type {
  FabricKind,
  OutfitGender,
  WeddingGroup,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";

/**
 * Multi-type scoring (iteration 02 §13–18): selections reward outfits and
 * fabrics that suit several of the chosen celebrations at once.
 */
function typeScore(candidates: WeddingTypeId[], selected: WeddingTypeId[]): number {
  const matches = candidates.filter((t) => selected.includes(t)).length;
  return matches === 0 ? 0 : 2 + matches;
}

function scoreFabric(
  fabric: (typeof FABRICS)[number],
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  preferredKind?: FabricKind,
  biasType?: WeddingTypeId
): number {
  let score = typeScore(fabric.weddingTypes, weddingTypes);
  if (fabric.groups.includes(group)) score += 2;
  score += 2 * styles.filter((s) => fabric.styles.includes(s)).length;
  if (preferredKind && fabric.kind === preferredKind) score += 2;
  if (biasType && fabric.weddingTypes.includes(biasType)) score += 2;
  return score;
}

function preferredFabricKind(
  weddingTypes: WeddingTypeId[]
): FabricKind | undefined {
  return weddingTypes.some((t) => TRADITIONAL_TYPES.includes(t))
    ? undefined
    : "contemporary";
}

/**
 * Rank fabrics for a group. Suggestions only — never prescriptive (PRD §22).
 * Full ranked list so callers (e.g. couple looks) can take disjoint slices.
 */
export function rankFabrics(
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  options: { kind?: FabricKind; biasType?: WeddingTypeId } = {}
): string[] {
  const preferredKind =
    options.kind ?? preferredFabricKind(weddingTypes);

  return [...FABRICS]
    .map((fabric, index) => ({
      fabric,
      index,
      score: scoreFabric(
        fabric,
        group,
        weddingTypes,
        styles,
        preferredKind,
        options.biasType
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ fabric }) => fabric.name);
}

export function selectFabrics(
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  options: { limit?: number } = {}
): string[] {
  return rankFabrics(group, weddingTypes, styles).slice(
    0,
    options.limit ?? 3
  );
}

function scoreOutfit(
  outfit: (typeof OUTFITS)[number],
  gender: OutfitGender,
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  biasType?: WeddingTypeId
): number {
  if (outfit.gender !== gender) return -1;
  let score = typeScore(outfit.weddingTypes, weddingTypes);
  if (outfit.groups.includes(group)) score += 2;
  score += styles.filter((s) => outfit.styles.includes(s)).length;
  if (biasType && outfit.weddingTypes.includes(biasType)) score += 2;
  return score;
}

/** Full ranked outfit-name list for a gender/group across selected types. */
export function rankOutfits(
  gender: OutfitGender,
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  biasType?: WeddingTypeId
): string[] {
  const ranked = [...OUTFITS]
    .map((outfit, index) => ({
      outfit,
      index,
      score: scoreOutfit(outfit, gender, group, weddingTypes, styles, biasType),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  // Preference ladder: outfits matching a selected type and this group,
  // then any outfit matching a selected type, then group-appropriate
  // entries, then anything viable — so recommendations always lean on the
  // celebrations actually being planned.
  const matchesType = ({ outfit }: { outfit: (typeof OUTFITS)[number] }) =>
    outfit.weddingTypes.some((t) => weddingTypes.includes(t));
  const matchesGroup = ({ outfit }: { outfit: (typeof OUTFITS)[number] }) =>
    outfit.groups.includes(group);

  const tierA = ranked.filter(matchesType).filter(matchesGroup);
  const tierB = ranked.filter(matchesType);
  const tierC = ranked.filter(matchesGroup);
  const source =
    tierA.length > 0 ? tierA : tierB.length > 0 ? tierB : tierC.length > 0 ? tierC : ranked;
  return source.map(({ outfit }) => outfit.name);
}

export function selectOutfits(
  gender: OutfitGender,
  group: WeddingGroup,
  weddingTypes: WeddingTypeId[],
  styles: WeddingStyleId[],
  limit = 2
): string[] {
  return rankOutfits(gender, group, weddingTypes, styles).slice(0, limit);
}
