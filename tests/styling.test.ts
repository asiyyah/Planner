import { describe, expect, it } from "vitest";
import { generateStyleGuide } from "@/lib/styling";
import { hexesNearDuplicate } from "@/lib/color/palette";
import type { PlannerInputs, StyleGuide } from "@/types";

// PRD §43 golden path
const GOLDEN: PlannerInputs = {
  colors: ["#5C4033", "#9CAF88"], // Coffee Brown × Sage
  weddingTypes: ["traditional-white"],
  styles: ["elegant"],
  coordination: "different",
};

function groupColours(guide: StyleGuide): string[] {
  return [
    ...guide.bridesmaids.colors,
    ...guide.groomsmen.colors,
    ...guide.brideFamily.colors,
    ...guide.groomFamily.colors,
    ...guide.guests.recommended,
    ...guide.guests.optional,
  ].map((c) => c.hex.toUpperCase());
}

describe("styling engine — PRD §43 golden path", () => {
  const guide = generateStyleGuide(GOLDEN);

  it("builds the expected palette roles around user anchors", () => {
    expect(guide.palette.hero.hex).toBe("#5C4033");
    expect(guide.palette.secondary.hex).toBe("#9CAF88");
    expect(guide.palette.neutral.id).toBe("ivory");
    expect(guide.palette.accent?.category).toBe("accent");
    expect(guide.palette.anchors.map((c) => c.hex)).toEqual([
      "#5C4033",
      "#9CAF88",
    ]);
  });

  it("decor reuses the same palette", () => {
    expect(guide.decor.base.name).toBe("Ivory");
    expect(guide.decor.primary.name).toBe("Coffee Brown");
    const allUsage = guide.decor.elements.map((e) => e.colorUsage).join(" ");
    expect(allUsage).toContain("Coffee Brown");
    expect(guide.decor.elements.length).toBeGreaterThanOrEqual(12);
  });
});

describe("couple engine — two distinct looks (iteration 02 §9–12)", () => {
  const guide = generateStyleGuide(GOLDEN);
  const [lookOne, lookTwo] = guide.couple.looks;

  it("produces exactly two looks with the required structure", () => {
    expect(guide.couple.looks).toHaveLength(2);
    for (const look of guide.couple.looks) {
      expect(look.colors.length).toBeGreaterThanOrEqual(2);
      expect(look.outfits.length).toBeGreaterThan(0);
      expect(look.fabrics.length).toBeGreaterThan(0);
      expect(look.notes.length).toBeGreaterThan(0);
    }
    expect(lookOne.label).toBe("Look 01");
    expect(lookTwo.label).toBe("Look 02");
  });

  it("gives each look its own primary colour combination", () => {
    expect(lookOne.colors[0].hex).not.toBe(lookTwo.colors[0].hex);
    const oneKey = lookOne.colors.map((c) => c.hex).join();
    const twoKey = lookTwo.colors.map((c) => c.hex).join();
    expect(oneKey).not.toBe(twoKey);
  });

  it("keeps the two looks visually distinct (no near-duplicate primaries)", () => {
    expect(
      hexesNearDuplicate(lookOne.colors[0].hex, lookTwo.colors[0].hex)
    ).toBe(false);
  });

  it("varies outfit direction between the looks where possible", () => {
    expect(lookOne.outfits.join()).not.toBe(lookTwo.outfits.join());
  });
});

describe("colour exclusivity — couple colours are reserved (iteration 02 §1–8)", () => {
  const guide = generateStyleGuide(GOLDEN);

  it("collects the couple's assigned colours after both looks", () => {
    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex.toUpperCase());
    expect(new Set(coupleHexes).size).toBeGreaterThanOrEqual(3);
  });

  it("gives no couple colour to bridesmaids or groomsmen", () => {
    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex.toUpperCase());
    for (const hex of [
      ...guide.bridesmaids.colors,
      ...guide.groomsmen.colors,
    ].map((c) => c.hex.toUpperCase())) {
      expect(coupleHexes).not.toContain(hex);
    }
  });

  it("gives no near-duplicate of a couple colour to any group", () => {
    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex);
    for (const groupHex of groupColours(guide)) {
      for (const coupleHex of coupleHexes) {
        expect(hexesNearDuplicate(groupHex, coupleHex)).toBe(false);
      }
    }
  });

  it("does not restrict other groups to leftover master colours", () => {
    const masterHexes = [
      ...guide.palette.anchors,
      guide.palette.secondary,
      ...guide.palette.supporting,
      guide.palette.neutral,
      ...(guide.palette.accent ? [guide.palette.accent] : []),
    ].map((c) => c.hex.toUpperCase());

    const generated = groupColours(guide);
    const outsideMaster = generated.filter((h) => !masterHexes.includes(h));
    // The engine derives fresh theme colours rather than dividing the palette.
    expect(outsideMaster.length).toBeGreaterThan(0);
  });

  it("lists the couple's colours as what guests should avoid", () => {
    const avoid = guide.guests.avoid.map((c) => c.hex.toUpperCase());
    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex.toUpperCase());
    for (const hex of coupleHexes.slice(0, 4)) {
      expect(avoid).toContain(hex);
    }
  });
});

describe("styling engine — same-colour mode (PRD §16)", () => {
  const guide = generateStyleGuide({ ...GOLDEN, coordination: "same" });

  it("shares a colour family across bridesmaids and groomsmen — still couple-free", () => {
    const bridesmaidHexes = guide.bridesmaids.colors.map((c) => c.hex);
    const groomsmanHexes = guide.groomsmen.colors.map((c) => c.hex);
    expect(bridesmaidHexes.some((h) => groomsmanHexes.includes(h))).toBe(true);

    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex.toUpperCase());
    for (const shared of [...bridesmaidHexes, ...groomsmanHexes]) {
      expect(coupleHexes).not.toContain(shared.toUpperCase());
    }
  });

  it("still varies outfit direction between groups", () => {
    expect(guide.bridesmaids.outfits.join()).not.toBe(
      guide.groomsmen.outfits.join()
    );
  });
});

describe("styling engine — multi-select wedding types (iteration 02 §13–18)", () => {
  const guide = generateStyleGuide({
    ...GOLDEN,
    weddingTypes: ["traditional", "white"],
  });

  it("generates two distinct looks across event types", () => {
    const [one, two] = guide.couple.looks;
    expect(one.colors[0].hex).not.toBe(two.colors[0].hex);
    expect(one.outfits.join()).not.toBe(two.outfits.join());
  });

  it("keeps exclusivity intact with multiple types selected", () => {
    const coupleHexes = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.hex);
    for (const groupHex of groupColours(guide)) {
      for (const coupleHex of coupleHexes) {
        expect(hexesNearDuplicate(groupHex, coupleHex)).toBe(false);
      }
    }
  });
});

describe("styling engine — robustness", () => {
  it("rejects invalid hex input", () => {
    expect(() =>
      generateStyleGuide({ ...GOLDEN, colors: ["not-a-colour"] })
    ).toThrow();
  });

  it("rejects empty colour selections", () => {
    expect(() => generateStyleGuide({ ...GOLDEN, colors: [] })).toThrow();
  });

  it("rejects empty wedding type selections", () => {
    expect(() =>
      generateStyleGuide({ ...GOLDEN, weddingTypes: [] })
    ).toThrow();
  });

  it("works with a single colour input", () => {
    const guide = generateStyleGuide({
      ...GOLDEN,
      colors: ["#5C4033"],
      coordination: "same",
    });
    expect(guide.palette.hero.hex).toBe("#5C4033");
    expect(guide.bridesmaids.colors.length).toBeGreaterThan(0);
    expect(guide.couple.looks[0].colors[0].hex).not.toBe(
      guide.couple.looks[1].colors[0].hex
    );
  });

  it("is deterministic across runs", () => {
    expect(generateStyleGuide(GOLDEN)).toEqual(generateStyleGuide(GOLDEN));
  });

  it("generates fast enough (<500ms budget per PRD §49)", () => {
    const start = performance.now();
    generateStyleGuide(GOLDEN);
    expect(performance.now() - start).toBeLessThan(500);
  });
});
