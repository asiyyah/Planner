import { describe, expect, it } from "vitest";
import {
  hexToHsl,
  hexToRgb,
  hslToHex,
  hueDistance,
  normalizeHue,
} from "@/lib/color/conversion";

describe("normalizeHue", () => {
  it("wraps negative and overflowing hues", () => {
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(390)).toBe(30);
    expect(normalizeHue(360)).toBe(0);
  });
});

describe("hueDistance", () => {
  it("measures shortest path across the wheel", () => {
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(10, 350)).toBe(20);
    expect(hueDistance(0, 180)).toBe(180);
    expect(hueDistance(90, 90)).toBe(0);
  });
});

describe("hexToRgb / hexToHsl", () => {
  it("parses hex", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#5C4033")).toEqual({ r: 92, g: 64, b: 51 });
  });

  it("converts primary red", () => {
    expect(hexToHsl("#FF0000")).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("handles achromatic greys", () => {
    expect(hexToHsl("#FFFFFF")).toEqual({ h: 0, s: 0, l: 100 });
    expect(hexToHsl("#000000")).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("matches precomputed library values for coffee brown", () => {
    const hsl = hexToHsl("#5C4033");
    expect(hsl.h).toBeCloseTo(19, 0);
    expect(hsl.s).toBeCloseTo(28.7, 0);
    expect(hsl.l).toBeCloseTo(28, 0);
  });
});

describe("hslToHex", () => {
  it("round-trips through HSL without meaningful drift", () => {
    const samples = ["#5C4033", "#9CAF88", "#D4AF37", "#0F5132", "#F2CFCE"];
    for (const hex of samples) {
      expect(hslToHex(hexToHsl(hex))).toBe(hex);
    }
  });
});
