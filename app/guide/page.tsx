import type { Metadata } from "next";
import { decodeInputs } from "@/lib/state";
import { generateStyleGuide } from "@/lib/styling";
import { StyleGuideView } from "@/components/guide/style-guide-view";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Style Guide",
};

type GuidePageProps = {
  searchParams: Promise<{ d?: string }>;
};

export default async function GuidePage({ searchParams }: GuidePageProps) {
  const { d } = await searchParams;
  const inputs = d ? decodeInputs(d) : null;

  if (!inputs) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center">
        <h1 className="font-heading text-4xl">No style guide yet</h1>
        <p className="mt-4 max-w-md text-neutral-600">
          Choose your colours and we’ll put together a complete wedding visual
          direction for you.
        </p>
        <Link
          href="/plan"
          className="mt-10 border border-black bg-black px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          Start planning
        </Link>
      </main>
    );
  }

  let guide;
  try {
    guide = generateStyleGuide(inputs);
  } catch {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center">
        <h1 className="font-heading text-4xl">Something went wrong</h1>
        <p className="mt-4 text-neutral-600">That link looks incomplete.</p>
        <Link href="/plan" className="mt-10 underline underline-offset-4">
          Back to planning
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <StyleGuideView guide={guide} />
    </main>
  );
}
