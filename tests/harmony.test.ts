import { describe, expect, it } from "vitest";
import {
  classifyAnchors,
  classifyPair,
  DEFAULT_HARMONY,
  generateAnalogous,
  generateComplementary,
  generateHarmony,
  generateMonochromatic,
  generateSplitComplementary,
  generateSquare,
  generateTetradic,
  generateTriadic,
  HARMONY_MODES,
  harmonyHues,
} from "@/lib/color/harmony";
import { hueDistance } from "@/lib/color/conversion";
import type { HarmonyName } from "@/types";

const BASE = { h: 120, s: 40, l: 40 };

describe("harmony generators — colour-level API (iteration §7)", () => {
  it("complementary sits opposite the base hue", () => {
    const colors = generateComplementary(BASE);
    expect(colors).toHaveLength(2);
    expect(hueDistance(colors[1].h, BASE.h)).toBe(180);
    // Base colour passes through unchanged.
    expect(colors[0]).toEqual({ h: 120, s: 40, l: 40 });
  });

  it("analogous neighbours by configurable spread", () => {
    const colors = generateAnalogous(BASE);
    expect(colors.map((c) => c.h)).toEqual([90, 120, 150]);
    const wide = generateAnalogous(BASE, 45);
    expect(wide.map((c) => c.h)).toEqual([75, 120, 165]);
  });

  it("triadic spaces by ~120°", () => {
    const hues = generateTriadic(BASE).map((c) => c.h);
    expect(hues.map((h) => hueDistance(h, BASE.h)).sort((a, b) => a - b)).toEqual([
      0, 120, 120,
    ]);
  });

  it("split complementary flanks the complement", () => {
    const hues = generateSplitComplementary(BASE).map((c) => c.h);
    expect(hues[0]).toBe(120);
    expect(hueDistance(hues[1], 120)).toBe(150);
    expect(hueDistance(hues[2], 120)).toBe(150);
    const custom = generateSplitComplementary(BASE, 20);
    expect(hueDistance(custom[1].h, 120)).toBe(160);
  });

  it("tetradic forms two complementary pairs", () => {
    const hues = generateTetradic(BASE).map((c) => c.h);
    expect(hues.map((h) => hueDistance(BASE.h, h))).toEqual([0, 60, 180, 120]);
    const rectangle = generateTetradic(BASE, 90);
    expect(rectangle.map((h) => h.h)).toEqual([120, 210, 300, 30]);
  });

  it("square separates hues by ~90°", () => {
    const hues = generateSquare(BASE).map((c) => c.h);
    expect(hues).toEqual([120, 210, 300, 30]);
    expect(hueDistance(BASE.h, hues[1])).toBe(90);
    expect(hueDistance(BASE.h, hues[2])).toBe(180);
    expect(hueDistance(BASE.h, hues[3])).toBe(90);
  });

  it("monochromatic varies depth without changing hue", () => {
    const shades = generateMonochromatic(BASE);
    expect(shades.length).toBeGreaterThan(2);
    for (const shade of shades) {
      expect(shade.h).toBe(120);
      expect(shade.l).not.toBe(40);
    }
  });
});

describe("generateHarmony — central dispatcher (iteration §10)", () => {
  it("supports every declared mode", () => {
    const modes: HarmonyName[] = [
      "complementary",
      "analogous",
      "triadic",
      "split-complementary",
      "tetradic",
      "square",
      "monochromatic",
    ];
    expect(HARMONY_MODES).toEqual(modes);
    for (const mode of modes) {
      const palette = generateHarmony(BASE, mode);
      expect(palette.length).toBeGreaterThanOrEqual(2);
      for (const color of palette) {
        expect(color.s).toBeDefined();
        expect(color.l).toBeDefined();
      }
    }
  });

  it("routes options through to the underlying generators", () => {
    expect(generateHarmony(BASE, "analogous", { spread: 50 }).map((c) => c.h)).toEqual(
      [70, 120, 170]
    );
    expect(generateHarmony(BASE, "tetradic", { angle: 90 }).map((c) => c.h)).toEqual(
      [120, 210, 300, 30]
    );
  });

  it("keeps hue maths on the wheel for arbitrary bases", () => {
    for (const base of [
      { h: 5, s: 80, l: 55 },
      { h: 200, s: 65, l: 35 },
      { h: 310, s: 25, l: 70 },
    ]) {
      for (const mode of HARMONY_MODES) {
        for (const color of generateHarmony(base, mode)) {
          expect(color.h).toBeGreaterThanOrEqual(0);
          expect(color.h).toBeLessThan(360);
        }
      }
    }
  });

  it("harmonyHues exposes just the plan", () => {
    expect(harmonyHues(BASE, "complementary")).toEqual([120, 300]);
  });
});

describe("anchor classification", () => {
  it("defaults a single anchor to the wedding-friendly approach", () => {
    expect(DEFAULT_HARMONY).toBe("analogous");
    expect(classifyAnchors([BASE])).toBe("analogous");
    expect(classifyAnchors([])).toBe("analogous");
  });

  it("reads anchors clustered in one arc by the arc's endpoints", () => {
    // Input order puts the middle hue first; the arc spans 10° → 150° (140°).
    // Comparing the first input hue with itself used to fall back to analogous.
    expect(
      classifyAnchors([
        { h: 80, s: 40, l: 50 },
        { h: 10, s: 40, l: 50 },
        { h: 150, s: 40, l: 50 },
      ])
    ).toBe("split-complementary");
  });

  it("classifies two anchors by wheel distance", () => {
    expect(classifyPair(20, 50)).toBe("analogous");
    expect(classifyPair(0, 110)).toBe("triadic");
    expect(classifyPair(0, 150)).toBe("split-complementary");
    expect(classifyPair(90, 270)).toBe("complementary");
    expect(classifyPair(45, 45)).toBeNull();
  });

  it("detects triadic and square arrangements of three or four anchors", () => {
    expect(classifyAnchors([{ h: 0, s: 40, l: 50 }, { h: 120, s: 40, l: 50 }, { h: 240, s: 40, l: 50 }])).toBe("triadic");
    expect(
      classifyAnchors([
        { h: 10, s: 40, l: 50 },
        { h: 100, s: 40, l: 50 },
        { h: 190, s: 40, l: 50 },
        { h: 280, s: 40, l: 50 },
      ])
    ).toBe("square");
  });

  it("reads clustered anchors as analogous", () => {
    expect(
      classifyAnchors([
        { h: 15, s: 40, l: 50 },
        { h: 40, s: 40, l: 50 },
        { h: 70, s: 40, l: 50 },
      ])
    ).toBe("analogous");
  });
});
