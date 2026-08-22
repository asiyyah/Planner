import { hexToRgb } from "./conversion";

/** WCAG relative luminance (0–1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  );
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick black or white text for maximum legibility on a swatch. */
export function readableTextColor(bgHex: string): "#000000" | "#FFFFFF" {
  return contrastRatio(bgHex, "#000000") >= 4.5 ? "#000000" : "#FFFFFF";
}
