import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Choose two colours",
    copy: "Pick any two colours you love. Don't worry about whether they match — that's our job.",
  },
  {
    number: "02",
    title: "Tell us about the wedding",
    copy: "The type of celebration, how it should feel, and how your party coordinates.",
  },
  {
    number: "03",
    title: "Receive your style guide",
    copy: "A complete lookbook — palette, outfits, fabrics, family and guest colours, decor.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-black">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              Wedding Planner
            </p>
            <h1 className="mt-6 font-heading text-5xl leading-[1.05] sm:text-7xl">
              Choose two colours.
              <br />
              We&rsquo;ll help you build{" "}
              <span className="italic">the rest.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-neutral-600">
              A coordinated wedding colour palette, outfits, fabrics and decor
              direction — styled like a lookbook, ready in seconds.
            </p>
            <Link
              href="/plan"
              className="mt-12 inline-block rounded border border-black bg-black px-12 py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              Start planning
            </Link>
          </div>

          {/* Editorial palette mock (interface stays black & white) */}
          <div aria-hidden="true" className="hidden overflow-hidden rounded border border-black lg:block">
            <p className="border-b border-black px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Your style guide
            </p>
            <div className="grid grid-cols-2">
              {[
                { h: "h-40", bg: "#3A3A3A", label: "Hero" },
                { h: "h-28", bg: "#A99784", label: "Secondary" },
              ].map((s) => (
                <div key={s.label} className={`${s.h} p-4`} style={{ backgroundColor: s.bg }}>
                  <span className="text-[10px] uppercase tracking-widest text-white/70">
                    {s.label}
                  </span>
                </div>
              ))}
              {[
                { h: "h-24", bg: "#F6EEDF", label: "Supporting" },
                { h: "h-32", bg: "#9CAF88", label: "Neutral" },
              ].map((s) => (
                <div key={s.label} className={`${s.h} p-4`} style={{ backgroundColor: s.bg }}>
                  <span className={`text-[10px] uppercase tracking-widest ${s.bg === "#F6EEDF" ? "text-black/50" : "text-white/70"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-black px-6 py-4">
              <span className="font-heading text-xl italic">Your colour × Your colour</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                08 sections
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="font-heading text-3xl sm:text-4xl">
          Two inputs. One complete direction.
        </h2>
        <ol className="mt-12 grid gap-px overflow-hidden rounded border border-black bg-black md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.number} className="bg-white p-8 sm:p-10">
              <span className="font-mono text-sm text-neutral-400">
                {step.number}
              </span>
              <h3 className="mt-4 font-heading text-2xl leading-snug">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded border border-black p-8 sm:flex-row sm:items-center sm:p-10">
          <p className="max-w-xl font-heading text-2xl leading-snug sm:text-3xl">
            &ldquo;I knew the colours I liked. I just didn&rsquo;t know what to
            do with them.&rdquo;
          </p>
          <Link
            href="/plan"
            className="shrink-0 rounded border border-black px-8 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
          >
            Start planning →
          </Link>
        </div>
      </section>
    </main>
  );
}
