import type { StyleGuide } from "@/types";

/** "Coffee Brown × Sage" — the guide's display and default save name. */
export function guideTitle(guide: StyleGuide): string {
  return `${guide.palette.hero.name} × ${guide.palette.secondary.name}`;
}
