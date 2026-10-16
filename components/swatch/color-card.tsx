import type { ColorRef } from "@/types";
import { readableTextColor } from "@/lib/color/contrast";

/** Compact named colour chip used in group and couple cards. */
export function ColorCard({ color }: { color: ColorRef }) {
  return (
    <div
      // A hairline inset ring keeps very light colours visible on white.
      className="rounded-md px-4 py-2 ring-1 ring-inset ring-black/5"
      style={{
        backgroundColor: color.hex,
        color: readableTextColor(color.hex),
      }}
    >
      <p className="text-xs opacity-75">Colour</p>
      <p className="text-sm leading-snug">{color.name}</p>
    </div>
  );
}
