import type { ColorRef } from "@/types";
import { readableTextColor } from "@/lib/color/contrast";

/** Compact named colour block used in group and couple panels. */
export function ColorCard({ color }: { color: ColorRef }) {
  return (
    <div
      className="swatch-frame p-3"
      style={{
        backgroundColor: color.hex,
        color: readableTextColor(color.hex),
      }}
    >
      <p className="text-[10px] uppercase tracking-widest opacity-70">Colour</p>
      <p className="mt-1 text-sm font-medium leading-tight">{color.name}</p>
    </div>
  );
}
