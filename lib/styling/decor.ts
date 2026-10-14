import { DECOR_TEMPLATES } from "@/data/decor";
import type { Color, DecorGuide, DecorElement } from "@/types";
import type { StylingContext } from "./context";

function usageColors(
  usage: string,
  base: Color,
  primary: Color,
  secondary: Color,
  accent: Color
): string {
  switch (usage) {
    case "base":
      return base.name;
    case "primary":
      return primary.name;
    case "secondary":
      return secondary.name;
    case "accent":
      return accent.name;
    case "base-secondary":
      return `${base.name} + ${secondary.name}`;
    case "base-primary":
      return `${base.name} + ${primary.name}`;
    case "base-accent":
      return `${base.name} + ${accent.name}`;
    case "base-primary-accent":
      return `${base.name} + ${primary.name} + ${accent.name}`;
    default:
      return base.name;
  }
}

/** Decor direction driven by the same palette (PRD §23). */
export function buildDecor(ctx: StylingContext): DecorGuide {
  const { palette } = ctx;
  const base = palette.neutral;
  const primary = palette.hero;
  // The user's second colour (or the promoted companion) leads decor
  // support, so a picked colour is never skipped for a generated one.
  const secondary = palette.secondary;
  const accent = palette.accent ?? palette.supporting[0] ?? palette.neutral;

  const elements: DecorElement[] = DECOR_TEMPLATES.map((template) => ({
    category: template.category,
    title: template.title,
    colorUsage: usageColors(template.colorUsage, base, primary, secondary, accent),
    element: template.element,
    note: template.note,
  }));

  return {
    base: { name: base.name, hex: base.hex },
    primary: { name: primary.name, hex: primary.hex },
    secondary: { name: secondary.name, hex: secondary.hex },
    accent: { name: accent.name, hex: accent.hex },
    elements,
    summary: `${base.name} as the room's base lets ${primary.name} lead and ${secondary.name} support, finished with ${accent.name} accents.`,
  };
}
