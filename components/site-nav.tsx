"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLastGuide,
  getServerLastGuide,
  subscribeLastGuide,
} from "@/lib/last-guide";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();
  const lastGuide = useSyncExternalStore(
    subscribeLastGuide,
    getLastGuide,
    getServerLastGuide
  );
  const guideHref = lastGuide ? `/guide?d=${lastGuide}` : "/guide";

  const links = [
    { href: "/plan", match: "/plan", label: "Plan" },
    { href: guideHref, match: "/guide", label: "Style Guide" },
    { href: "/saved", match: "/saved", label: "Saved" },
  ];

  return (
    <header className="border-b border-black bg-white print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-2xl leading-none tracking-tight"
        >
          Wedding&nbsp;Planner
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.match}
              href={link.href}
              className={cn(
                "px-2 py-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500 sm:px-3",
                pathname?.startsWith(link.match)
                  ? "text-black underline underline-offset-8"
                  : "text-black/70"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={lastGuide ? guideHref : "/plan"}
            className="ml-2 hidden border border-black bg-black px-4 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black sm:inline-block"
          >
            My Wedding →
          </Link>
        </nav>
      </div>
    </header>
  );
}
