import { describe, expect, it } from "vitest";
import {
  adjustForWedding,
  companionDepth,
  isWeddingFriendly,
  MAX_WEDDING_SATURATION,
  neutralCandidates,
  toneFor,
} from "@/lib/color/wedding-adjustments";

describe("wedding adjustments (iteration §13)", () => {
  it("lets gentle colours through untouched", () => {
    const gentle = { h: 95, s: 30, l: 55 };
    expect(adjustForWedding(gentle)).toEqual(gentle);
  });

  it("pulls neon saturation into muted territory", () => {
    const neon = adjustForWedding({ h: 25, s: 100, l: 50 }); // pure orange
    expect(neon.s).toBeLessThanOrEqual(MAX_WEDDING_SATURATION - 5);
    expect(neon.h).toBe(25);
  });

  it("compresses moderately loud colours rather than clipping", () => {
    const loud = adjustForWedding({ h: 200, s: 75, l: 45 });
    expect(loud.s).toBeGreaterThan(MAX_WEDDING_SATURATION - 1);
    expect(loud.s).toBeLessThan(75);
  });

  it("clamps extreme lightness", () => {
    expect(adjustForWedding({ h: 10, s: 40, l: 2 }).l).toBeGreaterThan(10);
    expect(adjustForWedding({ h: 10, s: 40, l: 99 }).l).toBeLessThan(93);
  });

  it("keeps near-neutrals near-neutral", () => {
    const adjusted = adjustForWedding({ h: 210, s: 3, l: 80 });
    expect(adjusted.s).toBeLessThanOrEqual(6);
  });

  it("is idempotent on its own output", () => {
    const once = adjustForWedding({ h: 300, s: 90, l: 60 });
    expect(adjustForWedding(once)).toEqual(once);
  });

  it("pairs deep bases with soft companions and vice versa", () => {
    const deep = companionDepth({ h: 20, s: 40, l: 28 }, 0);
    expect(deep.l).toBeGreaterThan(60);
    const light = companionDepth({ h: 20, s: 40, l: 70 }, 0);
    expect(light.l).toBeLessThan(55);
  });

  it("derives neutrals from the user's hue rather than a fixed list", () => {
    const fromRust = neutralCandidates({ h: 20, s: 50, l: 40 });
    const fromTeal = neutralCandidates({ h: 190, s: 50, l: 40 });
    expect(fromRust.every((n) => n.h === 20)).toBe(true);
    expect(fromTeal.every((n) => n.h === 190)).toBe(true);
    // Gently tinted, lightest first.
    expect(fromRust[0].l).toBeGreaterThan(90);
    expect(fromRust[0].s).toBeLessThan(35);
    expect(neutralCandidates({ h: 20, s: 50, l: 40 }, { deep: true }).at(-1)!.l).toBeLessThan(30);
  });

  it("blends style tones: bold is richer than minimal", () => {
    expect(toneFor(["bold"]).satScale).toBeGreaterThan(toneFor(["minimal"]).satScale);
    expect(toneFor(["bold"]).maxSat).toBeGreaterThan(MAX_WEDDING_SATURATION);
    expect(toneFor([])).toEqual({ satScale: 1, lightShift: 0, maxSat: MAX_WEDDING_SATURATION });
  });

  it("verifies friendliness honestly", () => {
    expect(isWeddingFriendly({ h: 20, s: 40, l: 50 })).toBe(true);
    expect(isWeddingFriendly({ h: 20, s: 95, l: 50 })).toBe(false);
    // Extremes of lightness read as neutral regardless of nominal saturation.
    expect(isWeddingFriendly({ h: 60, s: 100, l: 97 })).toBe(true);
    expect(isWeddingFriendly({ h: 240, s: 40, l: 4 })).toBe(true);
  });
});
