import type { Metadata } from "next";
import { PlanWizard } from "@/components/wizard/plan-wizard";
import { decodeInputs } from "@/lib/state";

export const metadata: Metadata = {
  title: "Plan",
  description:
    "Choose two colours you love — we'll work out the harmony for the rest.",
};

type PlanPageProps = {
  searchParams: Promise<{ d?: string | string[] }>;
};

/** `?d=` prefills the wizard — editing a saved/shared guide or a refreshed draft. */
export default async function PlanPage({ searchParams }: PlanPageProps) {
  const { d } = await searchParams;
  const raw = Array.isArray(d) ? d[0] : d;
  const initial = raw ? decodeInputs(raw) : null;
  return <PlanWizard key={raw ?? "new"} initial={initial} />;
}
