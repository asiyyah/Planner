import type { WeddingTypeId, WeddingStyleId } from "@/types";

export type WeddingTypeOption = {
  id: WeddingTypeId;
  label: string;
  description: string;
};

/** Wedding type options (PRD §9 / §34-3). */
export const WEDDING_TYPES: WeddingTypeOption[] = [
  {
    id: "traditional",
    label: "Traditional",
    description: "Customary rites, aso-ebi and cultural attire take the lead.",
  },
  {
    id: "white",
    label: "White Wedding",
    description: "A Western-style ceremony — gowns, suits and bouquets.",
  },
  {
    id: "traditional-white",
    label: "Traditional + White",
    description: "Both celebrations; each gets its own styling moment.",
  },
  {
    id: "civil",
    label: "Civil / Registry",
    description: "An intimate legal ceremony with a refined dress code.",
  },
  {
    id: "other",
    label: "Other",
    description: "Something in between — we'll keep recommendations flexible.",
  },
];

export type WeddingStyleOption = {
  id: WeddingStyleId;
  label: string;
  description: string;
};

/** Wedding style options (PRD §10 / §34-4). Multi-select. */
export const WEDDING_STYLES: WeddingStyleOption[] = [
  { id: "classic", label: "Classic", description: "Timeless and graceful" },
  { id: "elegant", label: "Elegant", description: "Refined and polished" },
  { id: "modern", label: "Modern", description: "Clean lines, current" },
  { id: "romantic", label: "Romantic", description: "Soft, dreamy, tender" },
  { id: "traditional", label: "Traditional", description: "Rooted in culture" },
  { id: "minimal", label: "Minimal", description: "Understated and calm" },
  { id: "bold", label: "Bold", description: "Rich, confident colour" },
  { id: "luxury", label: "Luxury", description: "Opulent and grand" },
];
