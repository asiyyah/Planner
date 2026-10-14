import type { StyleTone } from "@/data/style-tones";
import type {
  ColorRef,
  CoordinationMode,
  Palette,
  VariantKey,
  Variants,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";

export type StylingContext = {
  palette: Palette;
  /** Multi-select wedding types (iteration 02 §14–18). */
  weddingTypes: WeddingTypeId[];
  styles: WeddingStyleId[];
  coordination: CoordinationMode;
  /** Blended tone of the selected styles — shapes every generated colour. */
  tone: StyleTone;
  /** Per-section reshuffle counters. */
  variants: Variants;
};

/** Reshuffle counter for a section (0 when never reshuffled). */
export function variantOf(ctx: StylingContext, key: VariantKey): number {
  return ctx.variants[key] ?? 0;
}

export function toRef(color: { name: string; hex: string }): ColorRef {
  return { name: color.name, hex: color.hex };
}

export function refs(
  ...colors: ({ name: string; hex: string } | undefined)[]
): ColorRef[] {
  return colors
    .filter((c): c is { name: string; hex: string } => Boolean(c))
    .map(toRef);
}
