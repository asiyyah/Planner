import { describe, expect, it } from "vitest";
import {
  hexesNearDuplicate,
  isNearDuplicate,
} from "@/lib/color/palette";
import { generatePalette } from "@/lib/color/palette";
import { ColourLedger, generateGroupColours } from "@/lib/styling/group-colors";

describe("near-duplicate detection (iteration 02 §21)", () => {
  it("flags exact matches", () => {
    expect(hexesNearDuplicate("#5C4033", "#5c4033")).toBe(true);
  });

  it("flags near-identical variations of the same colour", () => {
    // Deep Burgundy vs Wine / Dark Burgundy territory.
    expect(isNearDuplicate({ h: 345, s: 50, l: 30 }, { h: 348, s: 46, l: 33 })).toBe(true);
    expect(hexesNearDuplicate("#4A1F2B", "#55242F")).toBe(true);
  });

  it("separates genuinely different colours", () => {
    expect(isNearDuplicate({ h: 345, s: 50, l: 30 }, { h: 100, s: 30, l: 60 })).toBe(false);
    expect(hexesNearDuplicate("#5C4033", "#9CAF88")).toBe(false);
  });

  it("judges true greys by lightness alone", () => {
    expect(isNearDuplicate({ h: 0, s: 0, l: 40 }, { h: 200, s: 2, l: 44 })).toBe(true);
    expect(isNearDuplicate({ h: 0, s: 0, l: 40 }, { h: 0, s: 0, l: 75 })).toBe(false);
  });

  it("judges near-whites (metallics/ivories) by their saturation band", () => {
    expect(isNearDuplicate({ h: 45, s: 40, l: 93 }, { h: 210, s: 30, l: 94 })).toBe(true);
    expect(isNearDuplicate({ h: 45, s: 40, l: 93 }, { h: 45, s: 8, l: 93 })).toBe(false);
  });
});

describe("group colour generation (iteration 02 §5–7, §20)", () => {
  const palette = generatePalette(["#5C4033", "#9CAF88"]);

  it("fills the requested count for every profile", () => {
    for (const profile of [
      "bridesmaids",
      "groomsmen",
      "bride-family",
      "groom-family",
      "guests",
    ] as const) {
      const ledger = new ColourLedger();
      ledger.claim(["#5C4033", "#D4AF37"]);
      const colours = generateGroupColours(palette, profile, ledger, 3);
      expect(colours).toHaveLength(3);
    }
  });

  it("never returns a couple colour or a perceptual near-duplicate", () => {
    const ledger = new ColourLedger();
    ledger.claim(["#5C4033", "#D4AF37", "#9CAF88"]);
    const colours = generateGroupColours(palette, "bridesmaids", ledger, 4);
    for (const colour of colours) {
      for (const forbidden of ["#5C4033", "#D4AF37", "#9CAF88"]) {
        expect(hexesNearDuplicate(colour.hex, forbidden)).toBe(false);
        expect(colour.hex.toUpperCase()).not.toBe(forbidden.toUpperCase());
      }
    }
  });

  it("generates colours beyond the master palette's own hexes", () => {
    const ledger = new ColourLedger();
    ledger.claim(["#5C4033", "#9CAF88"]);
    const colours = generateGroupColours(palette, "groom-family", ledger, 3);
    const masterHexes = [
      ...palette.anchors,
      palette.secondary,
      ...palette.supporting,
      palette.neutral,
      ...(palette.accent ? [palette.accent] : []),
    ].map((c) => c.hex.toUpperCase());
    const fresh = colours.filter((c) => !masterHexes.includes(c.hex.toUpperCase()));
    expect(fresh.length).toBeGreaterThan(0);
  });

  it("is deterministic for identical inputs", () => {
    const ledgerA = new ColourLedger();
    ledgerA.claim(["#5C4033"]);
    const ledgerB = new ColourLedger();
    ledgerB.claim(["#5C4033"]);
    const a = generateGroupColours(palette, "bridesmaids", ledgerA, 2);
    const b = generateGroupColours(palette, "bridesmaids", ledgerB, 2);
    expect(a.map((c) => c.hex)).toEqual(b.map((c) => c.hex));
  });

  it("shapes bridesmaid colours softer than groomsmen colours", () => {
    const ledgerA = new ColourLedger();
    const bridesmaids = generateGroupColours(palette, "bridesmaids", ledgerA, 3);
    const ledgerB = new ColourLedger();
    const groomsmen = generateGroupColours(palette, "groomsmen", ledgerB, 3);
    const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    expect(avg(bridesmaids.map((c) => c.lightness))).toBeGreaterThan(
      avg(groomsmen.map((c) => c.lightness))
    );
  });

  it("keeps later groups clear of earlier groups' claims via the ledger", () => {
    const ledger = new ColourLedger();
    const bridesmaids = generateGroupColours(palette, "bridesmaids", ledger, 2);
    const families = generateGroupColours(palette, "bride-family", ledger, 2);
    for (const family of families) {
      for (const bridesmaid of bridesmaids) {
        expect(hexesNearDuplicate(family.hex, bridesmaid.hex)).toBe(false);
      }
    }
  });
});
