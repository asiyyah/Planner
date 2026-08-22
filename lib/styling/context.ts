import type {
  ColorRef,
  CoordinationMode,
  Palette,
  WeddingStyleId,
  WeddingTypeId,
} from "@/types";

export type StylingContext = {
  palette: Palette;
  /** Multi-select wedding types (iteration 02 §14–18). */
  weddingTypes: WeddingTypeId[];
  styles: WeddingStyleId[];
  coordination: CoordinationMode;
};

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
