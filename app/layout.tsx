import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wedding Planner",
    template: "%s · Wedding Planner",
  },
  description:
    "Choose two colours. We'll help you build the rest — a coordinated wedding colour palette, outfits, fabrics and decor direction.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <TooltipProvider delayDuration={200}>
          <SiteNav />
          <div className="flex-1">{children}</div>
        </TooltipProvider>
      </body>
    </html>
  );
}
