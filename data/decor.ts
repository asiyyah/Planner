import type { DecorCategoryId } from "@/types";

/**
 * Decor element templates (PRD §48). The styling engine substitutes
 * {base} {primary} {secondary} {accent} with palette colour names.
 */
export type DecorTemplate = {
  category: DecorCategoryId;
  title: string;
  colorUsage:
    | "base"
    | "primary"
    | "secondary"
    | "accent"
    | "base-secondary"
    | "base-primary-accent"
    | "base-accent"
    | "base-primary";
  element: string;
  note: string;
};

export const DECOR_TEMPLATES: DecorTemplate[] = [
  // -------------------------------- Ceremony --------------------------------
  {
    category: "ceremony",
    title: "Backdrop",
    colorUsage: "base-secondary",
    element: "Draped fabric arch or floral wall",
    note: "Keep the backdrop light so vows read clearly in photographs.",
  },
  {
    category: "ceremony",
    title: "Aisle",
    colorUsage: "accent",
    element: "Petal scatter, potted markers or aisle runners",
    note: "Repeat the accent sparingly to draw the eye down the aisle.",
  },
  {
    category: "ceremony",
    title: "Floral arrangements",
    colorUsage: "base-secondary",
    element: "Standing arrangements and pew ends",
    note: "Anchor arrangements at eye level for maximum impact.",
  },
  {
    category: "ceremony",
    title: "Chairs",
    colorUsage: "base",
    element: "Chiavari chairs or covered seating with sashes",
    note: "Neutral seating lets florals and attire carry the palette.",
  },
  {
    category: "ceremony",
    title: "Entrance",
    colorUsage: "base-primary-accent",
    element: "Welcome sign, entrance arch and greeters' table",
    note: "The first impression — layer all three roles here.",
  },
  {
    category: "ceremony",
    title: "Lighting",
    colorUsage: "accent",
    element: "Warm string lights or uplighting",
    note: "Warm white light flatters every palette; avoid coloured gels.",
  },
  // ------------------------------- Reception --------------------------------
  {
    category: "reception",
    title: "Tables & linens",
    colorUsage: "base",
    element: "Tablecloths, runners and overlays",
    note: "A light table base keeps the room feeling open.",
  },
  {
    category: "tablescape",
    title: "Napkins & place settings",
    colorUsage: "secondary",
    element: "Cloth napkins, chargers and menu cards",
    note: "Fold napkins to show both secondary and base tones.",
  },
  {
    category: "tablescape",
    title: "Centrepieces",
    colorUsage: "base-secondary",
    element: "Low floral posies or tall candelabra",
    note: "Mix heights but keep one flower family for cohesion.",
  },
  {
    category: "stage",
    title: "Stage & sweetheart table",
    colorUsage: "base-primary-accent",
    element: "Backdrop panels, throne chairs or head-table garland",
    note: "Frame the couple with their hero colour behind them.",
  },
  {
    category: "florals",
    title: "Florals",
    colorUsage: "base-secondary",
    element: "Bridal bouquet, buttonholes and venue installations",
    note: "Echo bridesmaid colours subtly within the bouquet greens.",
  },
  {
    category: "lighting",
    title: "Lighting",
    colorUsage: "accent",
    element: "Candlelight, chandeliers and warm uplighting",
    note: "Layer candlelight low and warm light high for depth.",
  },
  {
    category: "cake",
    title: "Cake",
    colorUsage: "base-accent",
    element: "Tiered cake with textured finish",
    note: "Metallic accents on a pale base photograph beautifully.",
  },
  {
    category: "signage",
    title: "Signage",
    colorUsage: "base-primary",
    element: "Welcome board, seating chart and bar menu",
    note: "Black lettering on a pale ground keeps signage legible.",
  },
];

export const DECOR_CATEGORY_LABELS: Record<DecorCategoryId, string> = {
  ceremony: "Ceremony",
  reception: "Reception",
  tablescape: "Tablescape",
  stage: "Stage",
  florals: "Florals",
  lighting: "Lighting",
  cake: "Cake",
  signage: "Signage",
};
