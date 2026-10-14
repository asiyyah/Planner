import { describe, expect, it } from "vitest";
import {
  classifyColor,
  colorToHsl,
  describeColor,
  generatePalette,
  isAchromatic,
} from "@/lib/color/palette";
import { normalizeHex } from "@/lib/color/conversion";
import { MAX_COLORS } from "@/lib/constants";
import { isWeddingFriendly } from "@/lib/color/wedding-adjustments";
import type { Color } from "@/types";

const COFFEE = "#5C4033";
const SAGE = "#9CAF88";

function fullPalette(palette: ReturnType<typeof generatePalette>): Color[] {
  return [
    ...palette.anchors,
    ...palette.additions.filter(
      (c) => !palette.anchors.some((a) => a.hex === c.hex)
    ),
  ];
}

describe("naming support (iteration §6)", () => {
  it("borrows library names for close colours only", () => {
    expect(describeColor(COFFEE)).toBe("Coffee Brown");
    expect(describeColor(SAGE)).toBe("Sage");
  });

  it("falls back to descriptive names off the full colour space", () => {
    const label = describeColor("#ABCDEF");
    expect(label.length).toBeGreaterThan(2);
    expect(typeof label).toBe("string");
    // Greys get grey vocabulary.
    expect(describeColor("#3A3A3A")).toMatch(/Grey|Slate|Charcoal/);
  });

  it("infers categories for dynamic colours", () => {
    expect(classifyColor({ h: 30, s: 35, l: 45 })).toBe("earthy");
    expect(classifyColor({ h: 260, s: 60, l: 40 })).toBe("jewel");
    expect(classifyColor({ h: 200, s: 20, l: 80 })).toBe("soft");
    expect(classifyColor({ h: 0, s: 0, l: 50 })).toBe("neutral");
  });
});

describe("generatePalette — golden pair (Coffee × Sage, iteration §12)", () => {
  const palette = generatePalette([COFFEE, SAGE]);

  it("keeps user-selected colours exactly as chosen", () => {
    expect(palette.hero.hex).toBe(COFFEE);
    expect(palette.secondary.hex).toBe(SAGE);
    expect(palette.anchors.map((c) => c.hex)).toEqual([COFFEE, SAGE]);
    expect(isAchromatic(palette.hero)).toBe(false);
  });

  it("adds generated supporting colours without touching the anchors", () => {
    const anchorHexes = new Set(palette.anchors.map((a) => a.hex));
    expect(palette.additions.length).toBeGreaterThan(0);
    for (const addition of palette.additions) {
      expect(anchorHexes.has(addition.hex)).toBe(false);
      // Engine-generated colours pass through the wedding filter; curated
      // neutrals/metals are hand-approved already.
      if (addition.id.startsWith("gen-")) {
        expect(isWeddingFriendly(colorToHsl(addition))).toBe(true);
      } else {
        const { s, l } = colorToHsl(addition);
        // Curated neutrals/metals are hand-approved; guard against neons
        // within the perceptible saturation band only.
        if (l > 10 && l < 93) {
          expect(s).toBeLessThanOrEqual(80);
        }
      }
    }
  });

  it("assigns every PRD role without duplicates", () => {
    const colors = fullPalette(palette).map((c) => c.hex);
    expect(new Set(colors).size).toBe(colors.length);
    expect(palette.neutral.id).toBe("ivory");
    expect(palette.accent?.id).toBe("gold");
  });

  it("explains the palette in plain language around the anchors", () => {
    expect(palette.explanation).toMatch(/built around coffee brown and sage/i);
    expect(palette.explanation).toContain(palette.neutral.name.toLowerCase());
  });

  it("is deterministic", () => {
    expect(generatePalette([COFFEE, SAGE])).toEqual(palette);
  });
});

describe("generatePalette — one colour must be valid (iteration §5)", () => {
  it("generates a complete palette from a single colour", () => {
    const palette = generatePalette(["#0F5132"]); // Emerald
    expect(palette.hero.hex).toBe("#0F5132");
    expect(palette.harmony).toBe("analogous"); // wedding-friendly default
    expect(palette.supporting.length + palette.additions.length).toBeGreaterThanOrEqual(2);
    const colors = fullPalette(palette).map((c) => c.hex);
    expect(new Set(colors).size).toBe(colors.length);
    expect(palette.neutral.category).toBe("neutral");
    expect(palette.accent).toBeDefined();
  });

  it("treats duplicate selections as one colour", () => {
    const palette = generatePalette(["#0F5132", "#0f5132", "#0F5132"]);
    expect(palette.anchors).toHaveLength(1);
  });
});

describe("generatePalette — arbitrary colours (iteration §6)", () => {
  it("works with colours that exist nowhere in the library", () => {
    const palette = generatePalette(["#7FE3B4"]);
    expect(palette.hero.hex).toBe("#7FE3B4"); // never snapped
    expect(palette.hero.name.length).toBeGreaterThan(0);
    expect(palette.neutral.category).toBe("neutral");
    for (const addition of palette.additions) {
      expect(addition.name.length).toBeGreaterThan(0);
    }
  });

  it("softens neon inputs in generated colours but keeps the user pick vivid", () => {
    const palette = generatePalette(["#FF00AA"]);
    expect(palette.hero.saturation).toBeGreaterThan(80); // user colour preserved
    for (const addition of palette.additions) {
      expect(isWeddingFriendly(colorToHsl(addition))).toBe(true);
    }
  });
});

describe("generatePalette — achromatic handling", () => {
  it("leads with the chromatic anchor when white is picked first", () => {
    const palette = generatePalette(["#FFFFFF", SAGE]);
    expect(palette.hero.hex).toBe(SAGE);
    expect(isAchromatic(palette.hero)).toBe(false);
    // Both picks survive as anchors.
    expect(palette.anchors.map((c) => c.hex)).toEqual(["#FFFFFF", SAGE]);
  });

  it("builds an elegant all-neutral palette from greys alone", () => {
    const palette = generatePalette(["#FFFFFF", "#3A3A3A"]);
    const colors = fullPalette(palette).map((c) => c.hex);
    expect(new Set(colors).size).toBe(colors.length);
    expect(palette.harmony).toBe("monochromatic");
    expect(palette.accent).toBeUndefined();
    expect(palette.secondary.hex).toBe("#3A3A3A");
  });
});

describe("generatePalette — many colours (no fixed limit)", () => {
  it("supports five anchors without displacing any of them", () => {
    const picks = [COFFEE, SAGE, "#1F3A5F", "#F7E7CE", "#D4AF37"];
    const palette = generatePalette(picks);
    expect(palette.anchors.map((c) => c.hex)).toEqual(picks);
    expect(MAX_COLORS).toBeGreaterThanOrEqual(picks.length);
    const colors = fullPalette(palette).map((c) => c.hex);
    expect(new Set(colors).size).toBe(colors.length);
    expect(palette.neutral.category).toBe("neutral");
  });

  it("classifies well-spread four-colour picks as square", () => {
    const palette = generatePalette([
      "#5C4033",
      "#4A6FA5",
      "#5C8A5C",
      "#B77BB7",
    ]);
    expect(palette.harmony).toBe("square");
  });
});

describe("input hygiene", () => {
  it("validates hex input strictly", () => {
    expect(normalizeHex("#5C4033")).toBe("#5C4033");
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("fff")).toBe("#FFFFFF");
    expect(normalizeHex("not-a-colour")).toBeNull();
    expect(() => generatePalette([])).toThrow();
    expect(() => generatePalette(["zzzzzz"])).toThrow();
  });
});

describe("performance", () => {
  it("generates well under 500ms (PRD §49)", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      generatePalette([COFFEE, SAGE]);
    }
    const elapsed = performance.now() - start;
    expect(elapsed / 100).toBeLessThan(5); // ms per generation
  });
});
