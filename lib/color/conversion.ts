import type { Color } from "@/types";

export type Hsl = { h: number; s: number; l: number };

/** Normalise a hue into [0, 360). */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/** Shortest distance between two hues in degrees (0–180). */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(normalizeHue(a) - normalizeHue(b));
  return d > 180 ? 360 - d : d;
}

function toHexPart(n: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(n)));
  return clamped.toString(16).padStart(2, "0");
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  const sector = normalizeHue(h) / 60;
  if (sector < 1) [r, g, b] = [c, x, 0];
  else if (sector < 2) [r, g, b] = [x, c, 0];
  else if (sector < 3) [r, g, b] = [0, c, x];
  else if (sector < 4) [r, g, b] = [0, x, c];
  else if (sector < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const red = toHexPart((r + m) * 255);
  const green = toHexPart((g + m) * 255);
  const blue = toHexPart((b + m) * 255);
  return `#${red}${green}${blue}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`.toUpperCase();
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }

  return {
    h: Math.round(h * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

/** Build a library-style Color from raw HSL values. */
export function makeColor(
  id: string,
  name: string,
  hsl: Hsl,
  category: Color["category"]
): Color {
  return {
    id,
    name,
    hex: hslToHex(hsl),
    hue: Math.round(normalizeHue(hsl.h) * 10) / 10,
    saturation: Math.round(hsl.s * 10) / 10,
    lightness: Math.round(hsl.l * 10) / 10,
    category,
  };
}
