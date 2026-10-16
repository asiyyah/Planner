import Link from "next/link";
import { ShuffleIcon } from "lucide-react";

/**
 * "Regenerate" — links to the same guide with this section's reshuffle
 * counter advanced. Back returns to the previous option.
 */
export function ShuffleLink({ href, section }: { href: string; section: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Regenerate ${section}`}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap text-sm text-black underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black print:hidden"
    >
      <ShuffleIcon aria-hidden="true" className="h-5 w-5" />
      Regenerate
    </Link>
  );
}
