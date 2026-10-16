import { describe, expect, it } from "vitest";
import { generateStyleGuide } from "@/lib/styling";
import { hexesNearDuplicate } from "@/lib/color/palette";
import { hexToHsl } from "@/lib/color/conversion";
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
    expect(guide.palette.neutral.category).toBe("neutral");
    expect(guide.palette.accent?.category).toBe("accent");
    expect(guide.palette.anchors.map((c) => c.hex)).toEqual([
      "#5C4033",
      "#9CAF88",
    ]);
  });

  it("decor reuses the same palette", () => {
    expect(guide.decor.base.hex).toBe(guide.palette.neutral.hex);
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

describe("styling engine — audit regressions", () => {
  const guide = generateStyleGuide(GOLDEN);

  it("decor's secondary is the user's second colour, not a generated one", () => {
    expect(guide.decor.secondary.hex).toBe("#9CAF88");
  });

  it("never recommends white or near-white to any group", () => {
    for (const types of [["white"], ["traditional"], ["traditional-white"]] as const) {
      const g = generateStyleGuide({ ...GOLDEN, weddingTypes: [...types] });
      for (const hex of groupColours(g)) {
        expect(hexesNearDuplicate(hex, "#FFFFFF")).toBe(false);
        expect(hexesNearDuplicate(hex, "#FFFFF4")).toBe(false);
      }
    }
  });

  it("asks guests to avoid white and ivory at a white wedding", () => {
    const g = generateStyleGuide({ ...GOLDEN, weddingTypes: ["white"] });
    const avoid = g.guests.avoid.map((c) => c.name);
    expect(avoid).toContain("White");
    expect(avoid).toContain("Ivory");
  });

  it("uses shared-colour copy for bridesmaids in same mode", () => {
    const g = generateStyleGuide({ ...GOLDEN, coordination: "same" });
    expect(g.bridesmaids.notes).toContain("shared across the wedding party");
  });

  it("keeps couple-claimed colours out of party accessory copy", () => {
    const coupleNames = guide.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => c.name.toLowerCase());
    for (const group of [guide.bridesmaids, guide.groomsmen]) {
      const text = (group.accessories ?? []).join(" ").toLowerCase();
      for (const name of coupleNames) {
        expect(text).not.toContain(name);
      }
    }
  });

  it("gives two same-hue anchors at least one supporting colour", () => {
    const g = generateStyleGuide({
      ...GOLDEN,
      colors: ["#336699", "#7A9CC2"],
    });
    expect(g.palette.supporting.length).toBeGreaterThan(0);
  });
});

describe("styling engine — style tone, derived roles and reshuffles", () => {
  const chromaticSaturation = (g: StyleGuide) => {
    const generated = [
      ...g.palette.supporting,
      ...g.bridesmaids.colors,
      ...g.groomsmen.colors,
      ...g.brideFamily.colors,
      ...g.groomFamily.colors,
      ...g.guests.recommended,
    ];
    const sats = generated.map((c) => hexToHsl(c.hex).s);
    return sats.reduce((a, b) => a + b, 0) / sats.length;
  };

  it("lets the chosen style change the generated colours", () => {
    const bold = generateStyleGuide({ ...GOLDEN, styles: ["bold"] });
    const minimal = generateStyleGuide({ ...GOLDEN, styles: ["minimal"] });
    expect(groupColours(bold)).not.toEqual(groupColours(minimal));
    expect(chromaticSaturation(bold)).toBeGreaterThan(chromaticSaturation(minimal) + 10);
  });

  it("lets bold styles go beyond the old muted ceiling", () => {
    const vivid = generateStyleGuide({
      ...GOLDEN,
      colors: ["#FF0000", "#0000FF"],
      styles: ["bold"],
    });
    const max = Math.max(...groupColours(vivid).map((hex) => hexToHsl(hex).s));
    expect(max).toBeGreaterThan(50);
  });

  it("never pins the neutral or metallic to one fixed colour", () => {
    const neutrals = new Set<string>();
    const metals = new Set<string>();
    for (const hex of ["#5C4033", "#1F3A93", "#B03A2E", "#2E7D32", "#7D3C98", "#C9A227"]) {
      for (const styles of [[], ["romantic"], ["modern"]] as const) {
        const p = generateStyleGuide({ ...GOLDEN, colors: [hex], styles: [...styles] }).palette;
        neutrals.add(p.neutral.hex);
        if (p.accent) metals.add(p.accent.name);
      }
    }
    expect(neutrals.size).toBeGreaterThan(6);
    expect(metals.size).toBeGreaterThan(3);
  });

  const SECTIONS = [
    ["palette", (g: StyleGuide) => g.palette.additions.map((c) => c.hex)],
    ["couple", (g: StyleGuide) => g.couple.looks.flatMap((l) => l.colors.map((c) => c.hex))],
    ["bridesmaids", (g: StyleGuide) => g.bridesmaids.colors.map((c) => c.hex)],
    ["groomsmen", (g: StyleGuide) => g.groomsmen.colors.map((c) => c.hex)],
    ["brideFamily", (g: StyleGuide) => g.brideFamily.colors.map((c) => c.hex)],
    ["groomFamily", (g: StyleGuide) => g.groomFamily.colors.map((c) => c.hex)],
    ["guests", (g: StyleGuide) => g.guests.recommended.map((c) => c.hex)],
  ] as const;

  for (const [key, pick] of SECTIONS) {
    it(`"another option" changes ${key} and is repeatable`, () => {
      const first = generateStyleGuide(GOLDEN);
      const next = generateStyleGuide({ ...GOLDEN, variants: { [key]: 1 } });
      expect(pick(next)).not.toEqual(pick(first));
      expect(generateStyleGuide({ ...GOLDEN, variants: { [key]: 1 } })).toEqual(next);
    });
  }

  it("keeps every section full under quiet styles and crowded reshuffles", () => {
    // Soft styles crowd colours together; these reshuffles once left guests short.
    const base: PlannerInputs = {
      colors: ["#664AF3"],
      weddingTypes: ["white"],
      styles: ["elegant", "romantic", "minimal"],
      coordination: "different",
    };
    for (const variants of [{ palette: 1 }, { palette: 11 }, { couple: 10 }, { couple: 23 }]) {
      const g = generateStyleGuide({ ...base, variants });
      expect(g.guests.recommended).toHaveLength(3);
      expect(g.guests.optional).toHaveLength(2);
    }
  });

  it("never names a generated colour after a metal", () => {
    const g = generateStyleGuide({ ...GOLDEN, colors: ["#4A5D26", "#299505"], styles: ["minimal"] });
    const generated = [
      g.palette.neutral,
      ...g.palette.supporting,
      ...g.bridesmaids.colors,
      ...g.groomsmen.colors,
      ...g.guests.recommended,
    ];
    for (const c of generated) {
      expect(["Gold", "Silver", "Rose Gold", "Champagne Gold"]).not.toContain(c.name);
    }
  });

  it("keeps the user's picks exactly as chosen through palette reshuffles", () => {
    for (let v = 0; v < 6; v += 1) {
      const g = generateStyleGuide({ ...GOLDEN, variants: { palette: v } });
      expect(g.palette.anchors.map((c) => c.hex)).toEqual(GOLDEN.colors);
    }
  });

  it("keeps couple colours exclusive through any combination of reshuffles", () => {
    for (let v = 0; v < 6; v += 1) {
      const g = generateStyleGuide({
        ...GOLDEN,
        variants: { palette: v, couple: v + 1, bridesmaids: v, groomsmen: 2 * v, brideFamily: v, groomFamily: v + 2, guests: v },
      });
      const coupleHexes = g.couple.looks.flatMap((l) => l.colors).map((c) => c.hex);
      for (const groupHex of groupColours(g)) {
        for (const coupleHex of coupleHexes) {
          expect(hexesNearDuplicate(groupHex, coupleHex)).toBe(false);
        }
      }
    }
  });
});

describe("couple looks — independent reshuffles", () => {
  const lookHexes = (g: StyleGuide, i: 0 | 1) => g.couple.looks[i].colors.map((c) => c.hex);

  it("does not automatically give Look 02 the user's 2nd colour", () => {
    const g = generateStyleGuide(GOLDEN);
    expect(g.couple.looks[1].colors[0].hex).not.toBe(GOLDEN.colors[1]);
  });

  it("still offers the user's 2nd colour for Look 02 among its options", () => {
    const leads = new Set<string>();
    for (let v = 0; v < 8; v += 1) {
      leads.add(generateStyleGuide({ ...GOLDEN, variants: { lookTwo: v } }).couple.looks[1].colors[0].hex);
    }
    expect(leads.has(GOLDEN.colors[1])).toBe(true);
  });

  it("reshuffles Look 02 without touching Look 01", () => {
    const first = generateStyleGuide(GOLDEN);
    const next = generateStyleGuide({ ...GOLDEN, variants: { lookTwo: 1 } });
    expect(lookHexes(next, 0)).toEqual(lookHexes(first, 0));
    expect(lookHexes(next, 1)).not.toEqual(lookHexes(first, 1));
  });

  it("keeps Look 01 led by the user's 1st colour through its reshuffles", () => {
    for (let v = 0; v < 5; v += 1) {
      const g = generateStyleGuide({ ...GOLDEN, variants: { couple: v } });
      expect(g.couple.looks[0].colors[0].hex).toBe(GOLDEN.colors[0]);
      // The looks never share a colour.
      expect(lookHexes(g, 1).some((h) => lookHexes(g, 0).includes(h))).toBe(false);
    }
  });

  it("builds a full guide from four picks, keeping all of them", () => {
    const colors = ["#5C4033", "#9CAF88", "#1F3A93", "#C9A227"];
    const g = generateStyleGuide({ ...GOLDEN, colors });
    expect(g.palette.anchors.map((c) => c.hex)).toEqual(colors);
    expect(g.palette.supporting.length).toBeGreaterThan(0);
    expect(g.bridesmaids.colors).toHaveLength(2);
  });
});

describe("group reshuffles are independent", () => {
  const sections = (g: StyleGuide) => ({
    couple: g.couple.looks.flatMap((l) => l.colors.map((c) => c.hex)),
    bridesmaids: g.bridesmaids.colors.map((c) => c.hex),
    groomsmen: g.groomsmen.colors.map((c) => c.hex),
    brideFamily: g.brideFamily.colors.map((c) => c.hex),
    groomFamily: g.groomFamily.colors.map((c) => c.hex),
    guests: [...g.guests.recommended, ...g.guests.optional].map((c) => c.hex),
  });
  const GROUPS = ["bridesmaids", "groomsmen", "brideFamily", "groomFamily", "guests"] as const;

  for (const key of GROUPS) {
    it(`reshuffling ${key} changes no other section`, () => {
      const before = sections(generateStyleGuide(GOLDEN));
      for (let v = 1; v <= 5; v += 1) {
        const after = sections(generateStyleGuide({ ...GOLDEN, variants: { [key]: v } }));
        for (const other of Object.keys(before) as (keyof typeof before)[]) {
          if (other !== key) expect(after[other]).toEqual(before[other]);
        }
      }
    });
  }

  it("in same-colour mode, only the groomsmen follow a bridesmaid reshuffle", () => {
    const same = { ...GOLDEN, coordination: "same" as const };
    const before = sections(generateStyleGuide(same));
    const after = sections(generateStyleGuide({ ...same, variants: { bridesmaids: 1 } }));
    expect(after.groomsmen[0]).toBe(after.bridesmaids[0]);
    expect(after.brideFamily).toEqual(before.brideFamily);
    expect(after.groomFamily).toEqual(before.groomFamily);
    expect(after.guests).toEqual(before.guests);
  });

  it("keeps guests' recommended and optional colours distinct from each other", () => {
    const g = generateStyleGuide(GOLDEN);
    const guests = [...g.guests.recommended, ...g.guests.optional].map((c) => c.hex);
    for (let i = 0; i < guests.length; i += 1) {
      for (let j = i + 1; j < guests.length; j += 1) {
        expect(hexesNearDuplicate(guests[i], guests[j])).toBe(false);
      }
    }
  });
});

describe("group roles — party around the couple, families and guests from the palette", () => {
  const GROUP_LISTS = (g: StyleGuide) => [
    g.bridesmaids.colors,
    g.groomsmen.colors,
    g.brideFamily.colors,
    g.groomFamily.colors,
    [...g.guests.recommended, ...g.guests.optional],
  ].map((list) => list.map((c) => c.hex));

  for (const coordination of ["same", "different"] as const) {
    it(`keeps every group distinct on first load (${coordination})`, () => {
      const lists = GROUP_LISTS(generateStyleGuide({ ...GOLDEN, coordination }));
      for (let a = 0; a < lists.length; a += 1) {
        for (let b = a + 1; b < lists.length; b += 1) {
          for (const x of lists[a]) {
            for (const y of lists[b]) {
              // Same mode shares exactly one colour between bridesmaids and groomsmen.
              if (coordination === "same" && a === 0 && b === 1 && x === y) continue;
              expect(hexesNearDuplicate(x, y)).toBe(false);
            }
          }
        }
      }
    });
  }

  it("builds the wedding party around the couple's colours", () => {
    const g = generateStyleGuide(GOLDEN);
    const coupleHues = g.couple.looks
      .flatMap((l) => l.colors)
      .map((c) => hexToHsl(c.hex))
      .filter((hsl) => hsl.s >= 8)
      .map((hsl) => hsl.h);
    const lead = hexToHsl(g.bridesmaids.colors[0].hex).h;
    const nearest = Math.min(...coupleHues.map((h) => Math.min(Math.abs(h - lead), 360 - Math.abs(h - lead))));
    expect(nearest).toBeLessThanOrEqual(30);
  });

  it("uses one reshuffle for the whole party in same-colour mode", () => {
    const same = { ...GOLDEN, coordination: "same" as const };
    const base = generateStyleGuide(same);
    // The groomsmen counter has no effect on its own…
    const colours = (g: StyleGuide) => [g.bridesmaids.colors, g.groomsmen.colors];
    expect(colours(generateStyleGuide({ ...same, variants: { groomsmen: 3 } }))).toEqual(colours(base));
    // …while the party counter moves both panels together.
    const next = generateStyleGuide({ ...same, variants: { bridesmaids: 1 } });
    expect(next.bridesmaids.colors).not.toEqual(base.bridesmaids.colors);
    expect(next.groomsmen.colors).not.toEqual(base.groomsmen.colors);
    expect(next.groomsmen.colors[0]).toEqual(next.bridesmaids.colors[0]);
  });
});
