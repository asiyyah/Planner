import { readableTextColor } from "@/lib/color/contrast";
import { cn } from "@/lib/utils";

type ColorSwatchProps = {
  hex: string;
  name?: string;
  role?: string;
  showHex?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Editorial colour block — fabric-sample feel (PRD §29).
 * Large rectangle, name + HEX + role where appropriate.
 */
export function ColorSwatch({
  hex,
  name,
  role,
  showHex = true,
  className,
  children,
}: ColorSwatchProps) {
  const text = readableTextColor(hex);
  const isLight = text === "#000000";

  return (
    <div
      className={cn(
        "swatch-frame flex flex-col justify-between p-3 sm:p-4",
        className
      )}
      style={{ backgroundColor: hex, color: text }}
    >
      <div className="flex items-start justify-between gap-2">
        {name ? (
          <span className="text-sm font-medium leading-tight">{name}</span>
        ) : (
          <span />
        )}
        {children}
      </div>
      <div
        className={cn(
          "mt-8 space-y-0.5",
          isLight ? "text-black/60" : "text-white/70"
        )}
      >
        {role ? (
          <p className="text-[10px] uppercase tracking-[0.2em]">{role}</p>
        ) : null}
        {showHex ? (
          <p className="font-mono text-xs uppercase">{hex}</p>
        ) : null}
      </div>
    </div>
  );
}
