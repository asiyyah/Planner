import { WEDDING_TYPE_IDS as ALL_WEDDING_TYPES } from "@/lib/constants";
import type { Fabric } from "@/types";

/**
 * MVP fabric library (PRD §46). Metadata describes where each fabric is
 * most appropriate so the styling engine can filter by context.
 */
export const FABRICS: Fabric[] = [
  // ------------------------------ Traditional ------------------------------
  {
    id: "aso-oke",
    name: "Aso-oke",
    kind: "traditional",
    weddingTypes: ["traditional", "traditional-white"],
    styles: ["classic", "elegant", "luxury", "traditional", "bold"],
    groups: ["couple", "bride-family", "groom-family"],
    note: "Hand-woven Yoruba fabric; a signature choice for family aso-ebi and the couple's traditional attire.",
  },
  {
    id: "lace",
    name: "Lace",
    kind: "traditional",
    weddingTypes: ["traditional", "white", "traditional-white"],
    styles: ["elegant", "romantic", "luxury", "classic"],
    groups: ["bride-family", "groom-family", "guests"],
    note: "A mainstay for family outfits and aso-ebi; works beautifully in coordinated colour-dyed sets.",
  },
  {
    id: "george",
    name: "George",
    kind: "traditional",
    weddingTypes: ["traditional", "traditional-white"],
    styles: ["classic", "bold", "luxury", "traditional"],
    groups: ["bride-family", "groom-family"],
    note: "Rich, heavily patterned fabric popular for Eastern Nigerian traditional weddings.",
  },
  {
    id: "damask",
    name: "Damask",
    kind: "traditional",
    weddingTypes: ["traditional", "traditional-white", "civil"],
    styles: ["classic", "elegant", "luxury"],
    groups: ["groomsmen", "groom-family", "couple"],
    note: "Structured and lustrous; excellent for Agbada and Senator sets.",
  },
  {
    id: "brocade",
    name: "Brocade",
    kind: "traditional",
    weddingTypes: ["traditional", "traditional-white", "civil"],
    styles: ["classic", "elegant", "luxury", "bold"],
    groups: ["groomsmen", "groom-family", "couple"],
    note: "Raised patterns catch the light — a confident choice for traditional menswear.",
  },
  {
    id: "ankara",
    name: "Ankara",
    kind: "traditional",
    weddingTypes: ["traditional", "civil", "other", "traditional-white"],
    styles: ["modern", "bold", "romantic", "minimal"],
    groups: ["guests", "bridesmaids", "bride-family"],
    note: "Versatile wax print; lovely for guest styling and playful accent pieces.",
  },
  // ----------------------------- Contemporary ------------------------------
  {
    id: "silk",
    name: "Silk",
    kind: "contemporary",
    weddingTypes: [...ALL_WEDDING_TYPES],
    styles: ["elegant", "luxury", "romantic", "minimal", "modern"],
    groups: ["bridesmaids", "couple", "bride-family"],
    note: "Fluid drape with a soft sheen; flatters flowing silhouettes.",
  },
  {
    id: "satin",
    name: "Satin",
    kind: "contemporary",
    weddingTypes: [...ALL_WEDDING_TYPES],
    styles: ["elegant", "luxury", "romantic", "modern"],
    groups: ["bridesmaids", "couple"],
    note: "High-shine finish that photographs beautifully under warm light.",
  },
  {
    id: "chiffon",
    name: "Chiffon",
    kind: "contemporary",
    weddingTypes: [...ALL_WEDDING_TYPES],
    styles: ["romantic", "minimal", "elegant", "modern"],
    groups: ["bridesmaids", "guests"],
    note: "Lightweight and airy; ideal for floor-length dresses and soft movement.",
  },
  {
    id: "crepe",
    name: "Crepe",
    kind: "contemporary",
    weddingTypes: [...ALL_WEDDING_TYPES],
    styles: ["minimal", "modern", "classic", "elegant"],
    groups: ["couple", "bridesmaids", "guests"],
    note: "Clean matte texture; suits structured, contemporary silhouettes.",
  },
  {
    id: "linen",
    name: "Linen",
    kind: "contemporary",
    weddingTypes: ["white", "civil", "other", "traditional-white"],
    styles: ["minimal", "modern", "classic"],
    groups: ["guests", "groomsmen"],
    note: "Breathable and understated; well suited to daytime and outdoor ceremonies.",
  },
  {
    id: "velvet",
    name: "Velvet",
    kind: "contemporary",
    weddingTypes: ["white", "traditional-white", "civil", "other"],
    styles: ["luxury", "bold", "romantic", "elegant"],
    groups: ["groomsmen", "guests", "couple"],
    note: "Deep, light-absorbing pile; a dramatic accent for evening celebrations.",
  },
];

export const FABRIC_BY_ID = new Map(FABRICS.map((f) => [f.id, f]));
