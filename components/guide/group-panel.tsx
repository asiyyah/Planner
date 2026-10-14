import type { StylingRecommendation } from "@/types";
import { ColorCard } from "@/components/swatch/color-card";

/**
 * Editorial lookbook panel for one wedding group (PRD §24, §28).
 */
export function GroupPanel({
  number,
  recommendation,
}: {
  number: string;
  recommendation: StylingRecommendation;
}) {
  return (
    <article className="flex h-full flex-col border border-black bg-white">
      <header className="flex items-baseline justify-between border-b border-black px-6 py-4">
        <span className="font-mono text-sm text-neutral-500">{number}</span>
        <h2 className="text-xs uppercase tracking-[0.25em]">
          {recommendation.title}
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Colour row */}
        <div className="grid grid-cols-2 gap-2">
          {recommendation.colors.map((color) => (
            <ColorCard key={color.hex} color={color} />
          ))}
        </div>

        <dl className="space-y-3 text-sm">
          {recommendation.outfits.length > 0 && (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                Outfit
              </dt>
              <dd>{recommendation.outfits.join(" · ")}</dd>
            </div>
          )}
          {recommendation.fabrics.length > 0 && (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                Fabric suggestions
              </dt>
              <dd>{recommendation.fabrics.join(" · ")}</dd>
            </div>
          )}
          {recommendation.accessories &&
          recommendation.accessories.length > 0 ? (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                Accessories
              </dt>
              <dd>{recommendation.accessories.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-auto border-t border-neutral-200 pt-4 text-sm italic leading-relaxed text-neutral-600">
          {recommendation.notes}
        </p>
      </div>
    </article>
  );
}
