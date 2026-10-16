import type { CultureId } from "@/types";

/**
 * Traditional wedding attire by culture.
 *
 * DRAFT: transcribed from the "Cultural Attire Review" database in Notion
 * (web research, October 2026). Every culture stays `review: "draft"` until
 * someone from that culture approves it there; update this file to match.
 * Wording is suggestive — the app presents these as ideas, not rules.
 */

export type AttireSet = {
  /** Display-ready outfit suggestions, most typical first. */
  outfits: string[];
  fabrics: string[];
  accessories: string[];
};

export type Culture = {
  id: CultureId;
  name: string;
  /** Name of the traditional ceremony, for copy. */
  ceremony: string;
  bride: AttireSet;
  groom: AttireSet;
  /** Bridesmaids, family and guests (women). */
  women: AttireSet;
  /** Groomsmen, family and guests (men). */
  men: AttireSet;
  review: "draft" | "approved";
};

export const CULTURES: Culture[] = [
  {
    id: "yoruba",
    name: "Yoruba",
    ceremony: "traditional engagement",
    bride: {
      outfits: ["Iro and buba with gele and ipele", "Aso-oke gown", "Aso-oke skirt and blouse"],
      fabrics: ["Aso-oke", "Lace", "Damask", "Brocade"],
      accessories: ["Gele", "Ipele", "Coral beads", "Abebe hand fan"],
    },
    groom: {
      outfits: ["Agbada over buba and sokoto", "Buba and sokoto"],
      fabrics: ["Aso-oke", "Brocade", "Damask", "Aran"],
      accessories: ["Fila", "Coral beads"],
    },
    women: {
      outfits: ["Aso-ebi iro and buba with gele", "Aso-ebi gown", "Aso-ebi skirt and blouse"],
      fabrics: ["Aso-oke", "Lace", "Ankara", "Damask"],
      accessories: ["Gele", "Ipele"],
    },
    men: {
      outfits: ["Aso-ebi agbada", "Buba and sokoto"],
      fabrics: ["Aso-oke", "Brocade", "Damask", "Ankara"],
      accessories: ["Fila"],
    },
    review: "draft",
  },
  {
    id: "igbo",
    name: "Igbo",
    ceremony: "Igba Nkwu",
    bride: {
      outfits: ["George wrapper with lace blouse", "Isiagu or George gown"],
      fabrics: ["George", "Lace", "Isiagu"],
      accessories: ["Coral beads", "Gele", "Hand fan"],
    },
    groom: {
      outfits: ["Isiagu top with trousers", "Isiagu top with wrapper"],
      fabrics: ["Isiagu"],
      // The red okpu is traditionally for titled men; suggest the striped cap.
      accessories: ["Striped okpu cap", "Coral beads", "Walking stick"],
    },
    women: {
      outfits: ["George wrapper and blouse", "George or lace gown"],
      fabrics: ["George", "Lace", "Ankara"],
      accessories: ["Gele", "Beads"],
    },
    men: {
      outfits: ["Isiagu", "Senator"],
      fabrics: ["Isiagu", "Ankara"],
      accessories: ["Cap"],
    },
    review: "draft",
  },
  {
    id: "hausa",
    name: "Hausa",
    ceremony: "Kamu and Fatiha",
    bride: {
      outfits: ["Embroidered zani wrapper and blouse with veil", "Full-length embroidered gown with veil"],
      fabrics: ["Lace", "Silk", "Atamfa"],
      accessories: ["Henna (lalle)", "Veil or shawl", "Gold jewellery"],
    },
    groom: {
      outfits: ["Babban riga over kaftan", "Kaftan"],
      fabrics: ["Brocade", "Damask", "Embroidered cotton"],
      accessories: ["Hula cap"],
    },
    women: {
      outfits: ["Modest wrapper and blouse with headscarf", "Long gown with veil"],
      fabrics: ["Lace", "Atamfa", "Silk"],
      accessories: ["Headscarf or veil", "Henna"],
    },
    men: {
      outfits: ["Babban riga", "Kaftan"],
      fabrics: ["Brocade", "Damask", "Cotton"],
      accessories: ["Hula cap"],
    },
    review: "draft",
  },
  {
    id: "fulani",
    name: "Fulani",
    ceremony: "Kamu and Fatiha",
    bride: {
      outfits: ["Embroidered wrapper and blouse with headscarf", "Embroidered full-length gown"],
      fabrics: ["Embroidered cotton", "Brocade"],
      accessories: ["Beadwork", "Henna", "Tied headscarf"],
    },
    groom: {
      outfits: ["Embroidered boubou", "Kaftan"],
      fabrics: ["Bazin", "Embroidered cotton"],
      accessories: ["Turban or cap"],
    },
    women: {
      outfits: ["Colourful wrapper and embroidered blouse"],
      fabrics: ["Embroidered cotton", "Wax print"],
      accessories: ["Beads", "Headscarf"],
    },
    men: {
      outfits: ["Kaftan", "Boubou"],
      fabrics: ["Embroidered cotton", "Bazin"],
      accessories: ["Turban or cap"],
    },
    review: "draft",
  },
  {
    id: "edo",
    name: "Edo",
    ceremony: "traditional marriage",
    bride: {
      outfits: ["Chest-tied wrapper with coral-bead cape (ewu-ivie)", "Wrapper and blouse"],
      fabrics: ["Velvet", "Lace", "George"],
      accessories: ["Okuku coral crown", "Coral beads", "Coral-beaded bag"],
    },
    groom: {
      outfits: ["Velvet wrapper with white shirt", "Agbada over wrapper"],
      fabrics: ["Velvet", "George", "Lace"],
      accessories: ["Coral beads", "White cap"],
    },
    women: {
      outfits: ["Wrapper and blouse"],
      fabrics: ["Lace", "George", "Velvet"],
      accessories: ["Beads"],
    },
    men: {
      outfits: ["Wrapper with white shirt"],
      fabrics: ["George", "Velvet"],
      accessories: ["Cap", "Beads"],
    },
    review: "draft",
  },
  {
    id: "ijaw",
    name: "Ijaw",
    ceremony: "traditional marriage",
    bride: {
      outfits: ["Njiri wrapper and blouse with gele", "Double wrapper with beaded crown"],
      fabrics: ["Njiri (George)"],
      accessories: ["Coral or ivory beads", "Gele or beaded crown"],
    },
    groom: {
      outfits: ["Etibo shirt with wrapper", "Etibo shirt with trousers"],
      fabrics: ["Njiri (George)"],
      accessories: ["Hat", "Walking stick"],
    },
    women: {
      outfits: ["Blouse, wrapper and gele"],
      fabrics: ["Njiri (George)"],
      accessories: ["Gele", "Beads"],
    },
    men: {
      outfits: ["Etibo with wrapper", "Owoko with wrapper"],
      fabrics: ["Njiri (George)"],
      accessories: ["Hat", "Walking stick"],
    },
    review: "draft",
  },
  {
    id: "tiv",
    name: "Tiv",
    ceremony: "traditional marriage",
    bride: {
      outfits: ["A'nger two-piece wrapper", "A'nger gown"],
      fabrics: ["A'nger"],
      accessories: ["Black-and-white beads"],
    },
    groom: {
      outfits: ["A'nger wrapper with white shirt", "A'nger agbada or robe"],
      fabrics: ["A'nger"],
      accessories: ["Traditional cap", "Staff"],
    },
    women: {
      outfits: ["A'nger wrapper and blouse", "A'nger gown"],
      fabrics: ["A'nger"],
      accessories: ["Beads"],
    },
    men: {
      outfits: ["A'nger shirt or robe"],
      fabrics: ["A'nger"],
      accessories: ["Cap"],
    },
    review: "draft",
  },
  {
    id: "efik",
    name: "Efik",
    ceremony: "traditional marriage",
    bride: {
      outfits: ["Ofong Ukod Anwang (beaded blouse and skirt)", "Onyonyo gown"],
      fabrics: ["Lace", "George"],
      accessories: ["Gold hair combs", "Decorated staff", "Beads"],
    },
    groom: {
      outfits: ["White shirt with usobo wrapper"],
      fabrics: ["George", "Lace"],
      accessories: ["Beaded jacket", "Hat"],
    },
    women: {
      outfits: ["Wrapper and blouse", "Onyonyo-style gown"],
      fabrics: ["George", "Lace"],
      accessories: ["Head tie", "Beads"],
    },
    men: {
      outfits: ["Shirt with usobo wrapper"],
      fabrics: ["George", "Lace"],
      accessories: ["Hat"],
    },
    review: "draft",
  },
  {
    id: "ibibio",
    name: "Ibibio",
    ceremony: "traditional marriage",
    bride: {
      outfits: ["Double George wrapper with styled blouse and head tie", "Wrapper sewn into a gown"],
      fabrics: ["George"],
      accessories: ["Coral and glass beads", "Head tie"],
    },
    groom: {
      outfits: ["Usobo wrapper with knee-length lace shirt"],
      fabrics: ["Lace", "George"],
      accessories: ["Hat"],
    },
    women: {
      outfits: ["George wrapper and blouse with head tie"],
      fabrics: ["George", "Lace"],
      accessories: ["Head tie", "Beads"],
    },
    men: {
      outfits: ["Shirt with usobo wrapper"],
      fabrics: ["Lace", "George"],
      accessories: ["Hat"],
    },
    review: "draft",
  },
];

/** Wizard options, including General (keeps the broad Nigerian library). */
export const CULTURE_OPTIONS: { id: CultureId; name: string }[] = [
  { id: "general", name: "General Nigerian" },
  ...CULTURES.map(({ id, name }) => ({ id, name })),
];

/** The culture's attire data, or undefined for General. */
export function cultureById(id: CultureId): Culture | undefined {
  return CULTURES.find((c) => c.id === id);
}
