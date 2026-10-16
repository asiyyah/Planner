import { DECOR_CATEGORY_LABELS } from "@/data/decor";
import { CardHeader } from "./card-header";
import type { DecorGuide } from "@/types";
import { readableTextColor } from "@/lib/color/contrast";

/** Decor direction (PRD §24-08, §23). */
export function DecorSection({
  number,
  decor,
}: {
  number: string;
  decor: DecorGuide;
}) {
  const roles = [
    { label: "Base", ...decor.base },
    { label: "Primary", ...decor.primary },
    { label: "Secondary", ...decor.secondary },
    { label: "Accent", ...decor.accent },
  ];

  return (
    <article className="overflow-hidden rounded border border-black bg-white">
      <CardHeader number={number} title="Decor" titleId="decor" />

      {/* Colour roles */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {roles.map((role) => (
          <div
            key={role.label}
            className="min-h-24 border-black p-4 [&:not(:last-child)]:border-r max-md:[&:nth-child(odd)]:border-r-0 max-md:[&:not(:last-child)]:border-b"
            style={{
              backgroundColor: role.hex,
              color: readableTextColor(role.hex),
              borderColor: "var(--swatch-border)",
            }}
          >
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              {role.label}
            </p>
            <p className="mt-1 text-sm font-medium">{role.name}</p>
          </div>
        ))}
      </div>

      <p className="border-t border-neutral-200 px-6 py-4 text-sm italic text-neutral-600">
        {decor.summary}
      </p>

      {/* Elements grouped by area */}
      <div className="grid gap-x-8 gap-y-6 border-t border-neutral-200 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {decor.elements.map((element) => (
          <div key={`${element.category}-${element.title}`}>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">
              {DECOR_CATEGORY_LABELS[element.category]}
            </p>
            <h3 className="mt-1 font-heading text-xl leading-snug">
              {element.title}
            </h3>
            <p className="mt-1 text-sm font-medium">{element.colorUsage}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{element.element}</p>
            <p className="mt-1 text-sm italic text-neutral-500">
              {element.note}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
