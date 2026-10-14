export type ColorCategory = "neutral" | "earthy" | "jewel" | "soft" | "accent";

export type Color = {
  id: string;
  name: string;
  hex: string;
  /** 0–360 */
  hue: number;
  /** 0–100 */
  saturation: number;
  /** 0–100 */
  lightness: number;
  category: ColorCategory;
};

export type ColorRef = {
  name: string;
  hex: string;
};

/** Role a colour plays in the wedding palette (PRD §13). */
export type PaletteRole =
  | "hero"
  | "secondary"
  | "supporting"
  | "neutral"
  | "accent";

export type HarmonyName =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "square"
  | "monochromatic";

export type Palette = {
  hero: Color;
  secondary: Color;
  supporting: Color[];
  neutral: Color;
  accent?: Color;
  harmony: HarmonyName;
  explanation: string;
  /**
   * User-selected anchor colours — exact hexes preserved, in input order.
   * Never overwritten by generated colours.
   */
  anchors: Color[];
  /** Engine-generated colours: everything in the palette the user didn't pick. */
  additions: Color[];
};

/* ---------------------------------- Inputs --------------------------------- */

export type WeddingTypeId =
  | "traditional"
  | "white"
  | "traditional-white"
  | "civil"
  | "other";

export type WeddingStyleId =
  | "classic"
  | "elegant"
  | "modern"
  | "romantic"
  | "traditional"
  | "minimal"
  | "bold"
  | "luxury";

export type CoordinationMode = "same" | "different";

export type PlannerInputs = {
  /**
   * Dynamic colour selection — one or more user-chosen hex values.
   * Colours are anchors: the engine builds the harmony around them.
   */
  colors: string[];
  /**
   * Multi-select wedding types (iteration 02 §14–17) — at least one.
   * e.g. Traditional + White Wedding planned as separate events.
   */
  weddingTypes: WeddingTypeId[];
  styles: WeddingStyleId[];
  coordination: CoordinationMode;
};

/* ------------------------------- Styling output ---------------------------- */

export type WeddingGroup =
  | "couple"
  | "bridesmaids"
  | "groomsmen"
  | "bride-family"
  | "groom-family"
  | "guests";

export type StylingRecommendation = {
  group: WeddingGroup;
  title: string;
  colors: ColorRef[];
  outfits: string[];
  fabrics: string[];
  accessories?: string[];
  notes: string;
};

/**
 * One of the couple's two distinct looks (iteration 02 §9–12).
 * Colours appearing here become exclusive to the couple.
 */
export type CoupleLook = {
  /** "Look 01" / "Look 02" */
  label: string;
  /** Primary first, then the companion/accent colour. */
  colors: ColorRef[];
  outfits: string[];
  fabrics: string[];
  accessories?: string[];
  notes: string;
};

export type CoupleGuide = {
  group: "couple";
  title: "The Couple";
  looks: [CoupleLook, CoupleLook];
};

export type GuestGuide = {
  recommended: ColorRef[];
  optional: ColorRef[];
  avoid: ColorRef[];
  avoidNotes: string[];
  notes: string;
};

export type DecorCategoryId =
  | "ceremony"
  | "reception"
  | "tablescape"
  | "stage"
  | "florals"
  | "lighting"
  | "cake"
  | "signage";

export type DecorElement = {
  category: DecorCategoryId;
  title: string;
  colorUsage: string;
  element: string;
  note: string;
};

export type DecorGuide = {
  base: ColorRef;
  primary: ColorRef;
  secondary: ColorRef;
  accent: ColorRef;
  elements: DecorElement[];
  summary: string;
};

export type StyleGuide = {
  inputs: PlannerInputs;
  palette: Palette;
  /** Two exclusive couple looks (iteration 02). */
  couple: CoupleGuide;
  bridesmaids: StylingRecommendation;
  groomsmen: StylingRecommendation;
  brideFamily: StylingRecommendation;
  groomFamily: StylingRecommendation;
  guests: GuestGuide;
  decor: DecorGuide;
};

/* --------------------------------- Catalogue ------------------------------- */

export type FabricKind = "traditional" | "contemporary";

export type Fabric = {
  id: string;
  name: string;
  kind: FabricKind;
  /** Wedding types this fabric suits. */
  weddingTypes: WeddingTypeId[];
  /** Styles it expresses well. */
  styles: WeddingStyleId[];
  /** Groups it is most appropriate for. */
  groups: WeddingGroup[];
  note: string;
};

export type OutfitGender = "female" | "male";

export type Outfit = {
  id: string;
  name: string;
  gender: OutfitGender;
  weddingTypes: WeddingTypeId[];
  styles: WeddingStyleId[];
  groups: WeddingGroup[];
  note?: string;
};

/**
 * A guide saved on this device. Only the inputs are stored: generation is
 * deterministic, so the guide is regenerated whenever it is opened.
 */
export type SavedGuide = {
  id: string;
  name: string;
  savedAt: string;
  inputs: PlannerInputs;
};
