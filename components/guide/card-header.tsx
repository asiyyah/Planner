/**
 * Shared header for guide cards: "03  Bridesmaids" on the left, an optional
 * action (e.g. "Another option") on the right.
 */
export function CardHeader({
  number,
  title,
  titleId,
  action,
}: {
  number: string;
  title: string;
  titleId?: string;
  action?: React.ReactNode;
}) {
  return (
    // One row always: the action stays on the right; in narrow cards the
    // title wraps rather than pushing the action onto its own line.
    <header className="flex items-center justify-between gap-3 border-b border-black px-6 py-3">
      <div className="flex min-h-11 min-w-0 items-center gap-3">
        <span className="font-mono text-sm text-neutral-500">{number}</span>
        <h2 id={titleId} className="text-xs uppercase leading-snug tracking-[0.25em]">
          {title}
        </h2>
      </div>
      {action}
    </header>
  );
}
