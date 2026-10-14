import type { WeddingStyleId } from "@/types";

export type MetalTemperature = "warm" | "cool" | "pink";

export type Metal = {
  id: string;
  name: string;
  hex: string;
  temperature: MetalTemperature;
  /** Styles this finish expresses especially well. */
  styles: WeddingStyleId[];
};

/**
 * Metallic accent finishes. The engine ranks these against the palette's
 * temperature and the chosen styles; reshuffling walks down the ranking.
 */
export const METALS: Metal[] = [
  { id: "gold", name: "Gold", hex: "#D4AF37", temperature: "warm", styles: ["classic", "luxury", "traditional", "bold"] },
  { id: "champagne-gold", name: "Champagne Gold", hex: "#E6C28C", temperature: "warm", styles: ["elegant", "romantic", "classic"] },
  { id: "antique-gold", name: "Antique Gold", hex: "#B08D57", temperature: "warm", styles: ["traditional", "classic", "luxury"] },
  { id: "bronze", name: "Bronze", hex: "#8C6A3F", temperature: "warm", styles: ["traditional", "bold", "modern"] },
  { id: "copper", name: "Copper", hex: "#B87333", temperature: "warm", styles: ["bold", "modern", "romantic"] },
  { id: "rose-gold", name: "Rose Gold", hex: "#B76E79", temperature: "pink", styles: ["romantic", "elegant", "modern"] },
  { id: "silver", name: "Silver", hex: "#C0C0C0", temperature: "cool", styles: ["modern", "minimal", "classic"] },
  { id: "platinum", name: "Platinum", hex: "#E5E4E2", temperature: "cool", styles: ["minimal", "elegant", "luxury"] },
  { id: "pewter", name: "Pewter", hex: "#8E9092", temperature: "cool", styles: ["modern", "minimal"] },
];
