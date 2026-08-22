import type { GuestGuide } from "@/types";
import { readableTextColor } from "@/lib/color/contrast";

function SwatchChip({
  name,
  hex,
}: {
  name: string;
  hex: string;
}) {
  return (
    <span
      className="swatch-frame inline-flex items-center gap-2 px-3 py-2 text-sm"
      style={{ backgroundColor: hex, color: readableTextColor(hex) }}
    >
      <span
        aria-hidden="true"
        className="h-3 w-3 border border-black"
        style={{
          backgroundColor: hex,
        }}
      />
      {name}
      <span className="font-mono text-[10px] uppercase opacity-60">{hex}</span>
    </span>
  );
}

/** Guest colour guide — recommended / optional / avoid (PRD §19). */
export function GuestsPanel({
  number,
  guests,
}: {
  number: string;
  guests: GuestGuide;
}) {
  return (
    <article className="border border-black bg-white">
      <header className="flex items-baseline justify-between border-b border-black px-6 py-4">
        <span className="font-mono text-sm text-neutral-500">{number}</span>
        <h2 className="text-xs uppercase tracking-[0.25em]">Guests</h2>
      </header>

      <div className="grid gap-8 p-6 md:grid-cols-3">
        {(
          [
            ["Recommended", guests.recommended],
            ["Optional", guests.optional],
            ["Avoid", guests.avoid],
          ] as const
        ).map(([label, colors]) => (
          <section key={label}>
            <h3 className="text-[10px] uppercase tracking-widest text-neutral-500">
              {label}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((color) => (
                <SwatchChip key={color.name} {...color} />
              ))}
              {colors.length === 0 ? (
                <p className="text-sm text-neutral-400">—</p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-neutral-200 p-6 pt-4">
        <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600">
          {guests.avoidNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm italic text-neutral-600">{guests.notes}</p>
      </div>
    </article>
  );
}
