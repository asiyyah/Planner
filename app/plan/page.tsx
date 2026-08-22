import type { Metadata } from "next";
import { PlanWizard } from "@/components/wizard/plan-wizard";

export const metadata: Metadata = {
  title: "Plan",
  description:
    "Choose two colours you love — we'll work out the harmony for the rest.",
};

export default function PlanPage() {
  return <PlanWizard />;
}
