"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
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
  const ctaHref = lastGuide ? guideHref : "/plan";
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const links = [
    { href: "/plan", match: "/plan", label: "Plan" },
    { href: guideHref, match: "/guide", label: "Style Guide" },
    { href: "/saved", match: "/saved", label: "Saved" },
  ];
  const isActive = (match: string) => pathname?.startsWith(match) ?? false;

  // Esc closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="relative z-40 border-b border-black bg-white print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={close}
          className="whitespace-nowrap font-heading text-2xl leading-none tracking-tight"
        >
          Wedding&nbsp;Planner
        </Link>

        {/* Desktop and tablet-landscape */}
        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.match}
              href={link.href}
              aria-current={isActive(link.match) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap px-3 py-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500",
                isActive(link.match)
                  ? "text-black underline underline-offset-8"
                  : "text-black/70"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="ml-2 whitespace-nowrap rounded border border-black bg-black px-4 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            My Wedding →
          </Link>
        </nav>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-black md:hidden"
        >
          {open ? (
            <XIcon aria-hidden="true" className="h-6 w-6" />
          ) : (
            <MenuIcon aria-hidden="true" className="h-6 w-6" />
          )}
        </button>
      </div>

      {open ? (
        <>
          {/* Tapping outside the menu closes it. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-16 z-30 cursor-default bg-black/20 md:hidden"
          />
          <nav
            id={menuId}
            aria-label="Main"
            className="absolute inset-x-0 top-full z-40 border-b border-black bg-white md:hidden"
          >
            <ul className="mx-auto max-w-6xl divide-y divide-neutral-200 px-4 sm:px-6">
              {links.map((link) => (
                <li key={link.match}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={isActive(link.match) ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center text-sm uppercase tracking-widest",
                      isActive(link.match) ? "text-black underline underline-offset-8" : "text-black/70"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="py-4">
                <Link
                  href={ctaHref}
                  onClick={close}
                  className="flex min-h-12 items-center justify-center rounded border border-black bg-black text-xs uppercase tracking-widest text-white"
                >
                  My Wedding →
                </Link>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
