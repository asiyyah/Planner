import Link from "next/link";

/**
 * "Give me another option" — links to the same guide with this section's
 * reshuffle counter advanced. Back returns to the previous option.
 */
export function ShuffleLink({ href, section }: { href: string; section: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Another option for ${section}`}
      className="shrink-0 text-[10px] uppercase tracking-widest text-neutral-500 underline-offset-4 transition-colors hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-black print:hidden"
    >
      ↻ Another option
    </Link>
  );
}
