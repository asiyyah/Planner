import type { StyleGuide, VariantKey } from "@/types";
import { encodeInputs } from "@/lib/state";
import { ColorSwatch } from "@/components/swatch/color-swatch";
import { CouplePanel } from "./couple-panel";
import { GroupPanel } from "./group-panel";
import { GuestsPanel } from "./guests-panel";
import { DecorSection } from "./decor-section";
import { GuideActions } from "./guide-actions";
import { HARMONIES } from "@/data/harmonies";
import { ShuffleLink } from "./shuffle-link";

export function StyleGuideView({ guide }: { guide: StyleGuide }) {
  const { palette, inputs } = guide;
  // "Same colours": bridesmaids and groomsmen are one matched set with one button.
  const sameParty = inputs.coordination === "same";

  /** The same guide with one section's reshuffle counter advanced. */
  const shuffleHref = (key: VariantKey) => {
    const variants = { ...inputs.variants, [key]: (inputs.variants?.[key] ?? 0) + 1 };
    return `/guide?d=${encodeInputs({ ...inputs, variants })}`;
  };

  const anchorNames = palette.anchors.map((c) => c.name);

  // Anchors lead the strip in chosen order; engine additions follow.
  const stripColors = [
    ...palette.anchors,
    ...palette.additions.filter(
      (c) => !palette.anchors.some((a) => a.hex === c.hex)
    ),
  ];

  const weAdded = [
    ...(!palette.anchors.some((a) => a.hex === palette.secondary.hex)
      ? [{ color: palette.secondary, role: "Secondary" }]
      : []),
    ...palette.supporting.map((c) => ({ color: c, role: "Supporting" })),
    { color: palette.neutral, role: "Neutral" },
    ...(palette.accent ? [{ color: palette.accent, role: "Accent" }] : []),
  ];

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* ------------------------------- Cover ------------------------------- */}
      <header className="rounded border border-black p-8 sm:p-14">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          Your Wedding
        </p>
        <h1 className="mt-6 font-heading text-5xl leading-none sm:text-7xl">
          {anchorNames.length === 1 ? (
            anchorNames[0]
          ) : (
            <>
              {anchorNames[0]} × {anchorNames[1]}
            </>
          )}
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          A coordinated wedding style guide — colours, outfits, fabrics and
          decor in one direction.
        </p>

        {/* Palette strip */}
        <div className="mt-8 flex h-12 overflow-hidden rounded-md ring-1 ring-inset ring-black/5">
          {stripColors.map((color, i) => (
            <div
              key={`${color.hex}-${i}`}
              className="h-full min-w-0 flex-1"
              style={{ backgroundColor: color.hex }}
              role="img"
              aria-label={color.name}
            />
          ))}
        </div>

        <div className="mt-8">
          <GuideActions guide={guide} />
        </div>
      </header>

      {/* --------------------------- 01 Colour Story -------------------------- */}
      <section aria-labelledby="colour-story">
        <SectionHeading number="01" id="colour-story" title="Colour Story" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col justify-between gap-6 rounded border border-black p-6 sm:p-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-500">
                Your colours
              </h3>
              <p className="mt-2 text-xs text-neutral-500">
                Chosen by you, kept exactly as picked.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {palette.anchors.map((color) => (
                  <ColorSwatch
                    key={color.id}
                    hex={color.hex}
                    name={color.name}
                    showHex={false}
                    className="h-28"
                  />
                ))}
              </div>
            </div>
            <figure className="border-t border-neutral-200 pt-5">
              <blockquote className="font-heading text-xl leading-snug sm:text-2xl">
                “{palette.explanation}”
              </blockquote>
              <figcaption className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500">
                Built on {HARMONIES[palette.harmony].label.toLowerCase()}{" "}
                relationships
              </figcaption>
            </figure>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-500">
                We added
              </h3>
              <p className="text-xs text-neutral-500">
                Supporting colours to complete your palette — yours always stay
              </p>
              <ShuffleLink href={shuffleHref("palette")} section="the palette" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {weAdded.map(({ color, role }) => (
                <ColorSwatch
                  key={`${role}-${color.id}`}
                  hex={color.hex}
                  name={color.name}
                  role={role}
                  className="min-h-24"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- People ------------------------------ */}
      <section aria-labelledby="people">
        <SectionHeading
          number="02–06"
          id="people"
          title="The Wedding Party & Families"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <CouplePanel
              number="02"
              couple={guide.couple}
              shuffleHrefs={[shuffleHref("couple"), shuffleHref("lookTwo")]}
            />
          </div>
          <GroupPanel
            number="03"
            recommendation={guide.bridesmaids}
            shuffleHref={shuffleHref("bridesmaids")}
            shuffleSection={sameParty ? "the wedding party" : "Bridesmaids"}
          />
          <GroupPanel
            number="04"
            recommendation={guide.groomsmen}
            shuffleHref={sameParty ? undefined : shuffleHref("groomsmen")}
          />
          <GroupPanel
            number="05"
            recommendation={guide.brideFamily}
            shuffleHref={shuffleHref("brideFamily")}
          />
          <GroupPanel
            number="06"
            recommendation={guide.groomFamily}
            shuffleHref={shuffleHref("groomFamily")}
          />
        </div>
      </section>

      {/* ------------------------------- Guests ------------------------------ */}
      <section aria-labelledby="guests">
        <GuestsPanel
          number="07"
          guests={guide.guests}
          shuffleHref={shuffleHref("guests")}
        />
      </section>

      {/* -------------------------------- Decor ------------------------------ */}
      <section aria-labelledby="decor">
        <DecorSection number="08" decor={guide.decor} />
      </section>

      <footer className="border-t border-black pt-6 pb-10 text-center">
        <p className="font-heading text-lg italic text-neutral-500">
          Suggested with love — adapt every detail to suit you.
        </p>
      </footer>
    </div>
  );
}

function SectionHeading({
  number,
  title,
  id,
}: {
  number: string;
  title: string;
  id?: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-sm text-neutral-400">{number}</span>
      <h2
        id={id}
        className="font-heading text-3xl leading-tight sm:text-4xl"
      >
        {title}
      </h2>
      <span className="hidden h-px flex-1 bg-black sm:block" aria-hidden="true" />
    </div>
  );
}
