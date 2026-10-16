/**
 * Shared body parts for recommendation cards (couple looks and groups):
 * a labelled detail list and the closing styling note.
 */
export function DetailList({
  items,
}: {
  items: { label: string; values?: string[] }[];
}) {
  const shown = items.filter((item) => item.values && item.values.length > 0);
  return (
    <dl className="space-y-3">
      {shown.map((item) => (
        <div key={item.label}>
          <dt className="text-[13px] text-neutral-500">{item.label}</dt>
          <dd className="text-[15px] leading-snug">{item.values!.join(" · ")}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CardNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-auto border-t border-neutral-200 pt-4 text-[13px] leading-relaxed text-neutral-500">
      {children}
    </p>
  );
}
