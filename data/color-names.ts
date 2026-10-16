import { COLORS } from "./colors";

/**
 * Colour naming library — names only, never used to pick or seed colours.
 *
 * Any colour (the user's or a generated one) is named after the closest
 * entry here when it is a close match, otherwise it gets a descriptive name.
 * A dense library keeps names accurate and varied, so different colours
 * don't all collapse onto the same few labels.
 *
 * `metal` entries name metallic finishes; generated fabric/decor colours
 * never borrow them (a grey is not "Silver").
 */
export type ColorName = { name: string; hex: string; metal?: boolean };

/** Names beyond the curated 30-colour library (PRD §45), by family. */
const EXTRA_NAMES: ColorName[] = [
  // Whites, neutrals and greys
  { name: "Pearl", hex: "#EAE0C8" },
  { name: "Linen", hex: "#F3EBDD" },
  { name: "Eggshell", hex: "#F0EAD6" },
  { name: "Oatmeal", hex: "#DCCFB8" },
  { name: "Sand", hex: "#D6C2A1" },
  { name: "Stone", hex: "#B8AFA2" },
  { name: "Greige", hex: "#A8A096" },
  { name: "Mushroom", hex: "#A39584" },
  { name: "Dove Grey", hex: "#C9C6C1" },
  { name: "Cloud Grey", hex: "#DADCDD" },
  { name: "Ash Grey", hex: "#B2BEB5" },
  { name: "Smoke", hex: "#8F8F8B" },
  { name: "Slate Grey", hex: "#708090" },
  { name: "Graphite", hex: "#4B4E53" },
  { name: "Onyx", hex: "#2E2F33" },

  // Browns and earth tones
  { name: "Espresso", hex: "#3C2A21" },
  { name: "Chocolate", hex: "#4E2A1E" },
  { name: "Walnut", hex: "#5D432C" },
  { name: "Umber", hex: "#635147" },
  { name: "Chestnut", hex: "#954535" },
  { name: "Cognac", hex: "#9A463D" },
  { name: "Saddle Brown", hex: "#8B5A2B" },
  { name: "Toffee", hex: "#A47551" },
  { name: "Cinnamon", hex: "#B5651D" },
  { name: "Caramel", hex: "#C68E5A" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Fawn", hex: "#C8A27C" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Clay", hex: "#B66A50" },
  { name: "Sienna", hex: "#A0522D" },
  { name: "Latte", hex: "#C5A88A" },

  // Oranges, corals and peaches
  { name: "Burnt Orange", hex: "#CC5500" },
  { name: "Tangerine", hex: "#F28500" },
  { name: "Pumpkin", hex: "#E37222" },
  { name: "Ochre", hex: "#CC7722" },
  { name: "Apricot", hex: "#F4B183" },
  { name: "Peach", hex: "#F6C1A0" },
  { name: "Coral", hex: "#F08070" },
  { name: "Living Coral", hex: "#FF6F61" },
  { name: "Salmon", hex: "#F4A28C" },
  { name: "Marigold", hex: "#EAA221" },
  { name: "Honey", hex: "#E2B254" },
  { name: "Butterscotch", hex: "#E3A857" },
  { name: "Saffron", hex: "#F4C430" },
  { name: "Copper Rust", hex: "#A5502C" },

  // Yellows
  { name: "Butter Yellow", hex: "#F6E3A1" },
  { name: "Buttercup", hex: "#F3D36B" },
  { name: "Daffodil", hex: "#F7D35E" },
  { name: "Sunflower", hex: "#E5B83B" },
  { name: "Pale Lemon", hex: "#F8EFB6" },

  // Greens
  { name: "Mint", hex: "#B6E2C9" },
  { name: "Pistachio", hex: "#B5C99A" },
  { name: "Celadon", hex: "#ACC9A6" },
  { name: "Eucalyptus", hex: "#8AA399" },
  { name: "Seafoam", hex: "#9FE2BF" },
  { name: "Moss Green", hex: "#8A9A5B" },
  { name: "Fern", hex: "#6F8F5B" },
  { name: "Leaf Green", hex: "#5E8C3A" },
  { name: "Jade", hex: "#4F9A7C" },
  { name: "Hunter Green", hex: "#355E3B" },
  { name: "Bottle Green", hex: "#1E4D2B" },
  { name: "Pine", hex: "#2F5A49" },
  { name: "Chartreuse", hex: "#B8C25B" },
  { name: "Khaki", hex: "#B3A774" },
  { name: "Army Green", hex: "#5B5F3A" },
  { name: "Spring Green", hex: "#9CCB86" },
  { name: "Lime", hex: "#9ACD32" },
  { name: "Apple Green", hex: "#8DB600" },
  { name: "Kelly Green", hex: "#4CBB17" },
  { name: "Grass Green", hex: "#41A63C" },
  { name: "Shamrock", hex: "#2EB872" },
  { name: "Jungle Green", hex: "#29AB87" },
  { name: "Neon Green", hex: "#39E61A" },
  { name: "Bright Green", hex: "#1FC24A" },

  // Teals and aquas
  { name: "Teal", hex: "#2A7F7F" },
  { name: "Peacock", hex: "#1F6F78" },
  { name: "Aqua", hex: "#8ED9D2" },
  { name: "Turquoise", hex: "#40B5AD" },
  { name: "Tiffany Blue", hex: "#81D8D0" },
  { name: "Duck Egg", hex: "#C7DED6" },
  { name: "Spa Blue", hex: "#A9D6D0" },

  // Blues
  { name: "Ice Blue", hex: "#DCEBF3" },
  { name: "Baby Blue", hex: "#BFD7EA" },
  { name: "Sky Blue", hex: "#87BFE0" },
  { name: "Cornflower", hex: "#6F94D3" },
  { name: "Periwinkle", hex: "#A3A9E0" },
  { name: "Slate Blue", hex: "#6A7FA6" },
  { name: "Steel Blue", hex: "#4F7CA6" },
  { name: "Denim", hex: "#4C6E99" },
  { name: "French Blue", hex: "#3C6EB4" },
  { name: "Royal Blue", hex: "#3050B4" },
  { name: "Cobalt", hex: "#2550A0" },
  { name: "Sapphire", hex: "#1F3F8F" },
  { name: "Midnight Blue", hex: "#1C2541" },
  { name: "Ocean Blue", hex: "#2E6F95" },
  { name: "Azure", hex: "#1E88E5" },

  // Purples
  { name: "Lilac", hex: "#C8A2C8" },
  { name: "Wisteria", hex: "#B39DDB" },
  { name: "Thistle", hex: "#D8BFD8" },
  { name: "Heather", hex: "#A794B0" },
  { name: "Orchid", hex: "#C47FBF" },
  { name: "Amethyst", hex: "#8E66B5" },
  { name: "Iris", hex: "#6E5BA6" },
  { name: "Violet", hex: "#7F5AA6" },
  { name: "Grape", hex: "#5E3A7E" },
  { name: "Aubergine", hex: "#3D1F3A" },
  { name: "Mulberry", hex: "#7A2A57" },
  { name: "Royal Purple", hex: "#5B2C83" },
  { name: "Purple", hex: "#9B30C8" },
  { name: "Ultra Violet", hex: "#5F4B8B" },
  { name: "Electric Violet", hex: "#B23CF0" },

  // Pinks
  { name: "Petal Pink", hex: "#F6D2D8" },
  { name: "Ballet Pink", hex: "#F2C6CF" },
  { name: "Baby Pink", hex: "#F4C2C2" },
  { name: "Champagne Pink", hex: "#F1DDCF" },
  { name: "Nude Pink", hex: "#E6C2B4" },
  { name: "Peony", hex: "#E28CA6" },
  { name: "Rose", hex: "#D9879B" },
  { name: "Antique Rose", hex: "#C48A92" },
  { name: "Old Rose", hex: "#C08081" },
  { name: "Mauve Pink", hex: "#D1A3B1" },
  { name: "Flamingo", hex: "#F07C9B" },
  { name: "Bubblegum", hex: "#F49AC2" },
  { name: "Watermelon", hex: "#E85A71" },
  { name: "Hot Pink", hex: "#E25A9C" },
  { name: "Fuchsia", hex: "#C2307F" },
  { name: "Magenta", hex: "#A8326F" },
  { name: "Raspberry", hex: "#B3305E" },
  { name: "Rosewood", hex: "#8E4A49" },
  { name: "Dusty Pink", hex: "#D8A7A7" },
  { name: "Orchid Pink", hex: "#E3B5CF" },

  // Reds
  { name: "Scarlet", hex: "#D21F3C" },
  { name: "Cherry", hex: "#B11E31" },
  { name: "Crimson", hex: "#A6192E" },
  { name: "Ruby", hex: "#9B1B30" },
  { name: "Cranberry", hex: "#9E2A40" },
  { name: "Brick Red", hex: "#9C3D2E" },
  { name: "Marsala", hex: "#955251" },
  { name: "Garnet", hex: "#7A1F2B" },
  { name: "Wine", hex: "#722F37" },
  { name: "Merlot", hex: "#6F1E2E" },
  { name: "Oxblood", hex: "#4A0F17" },
  { name: "Poppy Red", hex: "#E0453A" },
];

export const COLOR_NAMES: ColorName[] = [
  ...COLORS.map((c) => ({ name: c.name, hex: c.hex, metal: c.category === "accent" })),
  ...EXTRA_NAMES,
];
