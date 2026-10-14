import type { CoupleGuide, CoupleLook } from "@/types";
import { ColorCard } from "@/components/swatch/color-card";

/**
 * Editorial two-look couple section (iteration 02 §9–12): Look 01 and
 * Look 02 side by side, each with its own colours, outfit, fabric and
 * styling note. The looks are visually distinct; the shared framing keeps
 * them part of one wedding identity.
 */
export function CouplePanel({
  number,
  couple,
}: {
  number: string;
  couple: CoupleGuide;
}) {
  return (
    <article className="border border-black bg-white">
      <header className="flex items-baseline justify-between border-b border-black px-6 py-4">
        <span className="font-mono text-sm text-neutral-500">{number}</span>
        <h2 className="text-xs uppercase tracking-[0.25em]">{couple.title}</h2>
      </header>

      <div className="grid gap-px bg-neutral-200 md:grid-cols-2">
        {couple.looks.map((look) => (
          <LookCard key={look.label} look={look} />
        ))}
      </div>
    </article>
  );
}

function LookCard({ look }: { look: CoupleLook }) {
  return (
    <div className="flex h-full flex-col gap-5 bg-white p-6">
      <h3 className="font-heading text-2xl italic">{look.label}</h3>

      {/* Colour row */}
      <div className="grid grid-cols-2 gap-2">
        {look.colors.map((color) => (
          <ColorCard key={color.hex} color={color} />
        ))}
      </div>

      <dl className="space-y-3 text-sm">
        {look.outfits.length > 0 && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
              Outfit
            </dt>
            <dd>{look.outfits.join(" · ")}</dd>
          </div>
        )}
        {look.fabrics.length > 0 && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
              Fabric suggestions
            </dt>
            <dd>{look.fabrics.join(" · ")}</dd>
          </div>
        )}
        {look.accessories && look.accessories.length > 0 ? (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
              Accents &amp; accessories
            </dt>
            <dd>{look.accessories.join(" · ")}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-auto border-t border-neutral-200 pt-4 text-sm italic leading-relaxed text-neutral-600">
        {look.notes}
      </p>
    </div>
  );
}
