import { cn } from "@/lib/utils";

/**
 * Agency Partner Interactive brand mark — the two-triangle geometric symbol
 * rendered as inline SVG so it stays crisp at any size and inherits the brand
 * gradient. Use `variant="mark"` for the symbol alone, `"full"` for symbol +
 * wordmark.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 53" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M35.115 42.342V0L2.96729 42.342H35.115Z" fill="url(#apiMarkA)" />
      <path d="M37.7319 9.32422V51.6675L69.8809 9.32422H37.7319Z" fill="url(#apiMarkB)" />
      <defs>
        <linearGradient id="apiMarkA" x1="-4.7" y1="46" x2="64.3" y2="3.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7313FF" />
          <stop offset="0.43" stopColor="#5D48FD" />
          <stop offset="0.83" stopColor="#38A5F8" />
          <stop offset="1" stopColor="#24D5F6" />
        </linearGradient>
        <linearGradient id="apiMarkB" x1="-3.4" y1="56" x2="65.6" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7313FF" />
          <stop offset="0.43" stopColor="#5D48FD" />
          <stop offset="0.83" stopColor="#38A5F8" />
          <stop offset="1" stopColor="#24D5F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  variant = "full",
  className,
  onDark = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  onDark?: boolean;
}) {
  if (variant === "mark") {
    return <BrandMark className={cn("h-8 w-auto", className)} />;
  }
  return (
    <span className={cn("inline-flex items-end gap-[0.09em] text-lg", className)}>
      <BrandMark className="h-[1.71em] w-auto" />
      <span
        className={cn(
          "inline-flex items-start gap-[0.18em] font-display font-extrabold leading-none tracking-[-0.03em]",
          onDark ? "text-white" : "text-foreground"
        )}
      >
        <span>Agency</span>
        <span className="flex flex-col">
          <span>Partner</span>
          <span className="mt-[0.19em] leading-none">
            <span className="flex justify-between text-[0.30em] font-medium uppercase leading-none tracking-normal">
              {"INTERACTIVE".split("").map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
