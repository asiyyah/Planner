import type { StylingRecommendation } from "@/types";
import { ColorCard } from "@/components/swatch/color-card";
import { CardHeader } from "./card-header";
import { CardNote, DetailList } from "./card-details";
import { ShuffleLink } from "./shuffle-link";

/**
 * Editorial lookbook panel for one wedding group (PRD §24, §28).
 */
export function GroupPanel({
  number,
  recommendation,
  shuffleHref,
  shuffleSection = recommendation.title,
}: {
  number: string;
  recommendation: StylingRecommendation;
  /** Omitted when another panel's button reshuffles this one. */
  shuffleHref?: string;
  shuffleSection?: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded border border-black bg-white">
      <CardHeader
        number={number}
        title={recommendation.title}
        action={shuffleHref ? <ShuffleLink href={shuffleHref} section={shuffleSection} /> : null}
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Colour row */}
        <div className="grid grid-cols-2 gap-2">
          {recommendation.colors.map((color) => (
            <ColorCard key={color.hex} color={color} />
          ))}
        </div>

        <DetailList
          items={[
            { label: "Outfit", values: recommendation.outfits },
            { label: "Fabric suggestions", values: recommendation.fabrics },
            { label: "Accessories", values: recommendation.accessories },
          ]}
        />

        <CardNote>{recommendation.notes}</CardNote>
      </div>
    </article>
  );
}
