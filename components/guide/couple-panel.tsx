import type { CoupleGuide, CoupleLook } from "@/types";
import { ColorCard } from "@/components/swatch/color-card";
import { CardHeader } from "./card-header";
import { CardNote, DetailList } from "./card-details";
import { ShuffleLink } from "./shuffle-link";

/**
 * Editorial two-look couple section (iteration 02 §9–12): Look 01 and
 * Look 02 side by side, each with its own colours, outfit, fabric and
 * styling note. The looks are visually distinct; the shared framing keeps
 * them part of one wedding identity.
 */
export function CouplePanel({
  number,
  couple,
  shuffleHrefs,
}: {
  number: string;
  couple: CoupleGuide;
  /** "Another option" links for Look 01 and Look 02, in order. */
  shuffleHrefs: [string, string];
}) {
  return (
    <article className="overflow-hidden rounded border border-black bg-white">
      <CardHeader number={number} title={couple.title} />

      <div className="grid gap-px bg-neutral-200 md:grid-cols-2">
        {couple.looks.map((look, i) => (
          <LookCard key={look.label} look={look} shuffleHref={shuffleHrefs[i]} />
        ))}
      </div>
    </article>
  );
}

function LookCard({ look, shuffleHref }: { look: CoupleLook; shuffleHref: string }) {
  return (
    <div className="flex h-full flex-col gap-4 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <h3 className="font-heading text-2xl">{look.label}</h3>
        <ShuffleLink href={shuffleHref} section={look.label} />
      </div>

      {/* Colour row */}
      <div className="grid grid-cols-2 gap-2">
        {look.colors.map((color) => (
          <ColorCard key={color.hex} color={color} />
        ))}
      </div>

      <DetailList
        items={[
          { label: "Outfit", values: look.outfits },
          { label: "Fabric suggestions", values: look.fabrics },
          { label: "Accents & accessories", values: look.accessories },
        ]}
      />

      <CardNote>{look.notes}</CardNote>
    </div>
  );
}
