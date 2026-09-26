import Link from "next/link";
import { cn } from "@/lib/cn";

/** Monogramme C0 : l'anneau reprend le miel, le mot est en Mirage fin. */
export function LogoMark({
  className,
  ringClassName,
}: {
  className?: string;
  ringClassName?: string;
}) {
  return (
    <span
      className={cn(
        "group/logo relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-espresso text-cream transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:rotate-[10deg]",
        className
      )}
      aria-hidden
    >
      <span className="font-display text-lg font-normal leading-none tracking-tight">
        C
      </span>
      <span
        className={cn(
          "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[2.5px] border-honey bg-transparent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:scale-125 group-hover/logo:border-coral",
          ringClassName
        )}
      />
    </span>
  );
}

export function Logo({
  href = "/",
  variant = "dark",
  size = "md",
  withWordmark = true,
  className,
}: {
  href?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: { mark: "h-8 w-8", text: "text-lg" },
    md: { mark: "h-10 w-10", text: "text-2xl" },
    lg: { mark: "h-14 w-14", text: "text-4xl" },
  }[size];
  const ink = variant === "dark" ? "text-espresso" : "text-cream";
  const sub = variant === "dark" ? "text-cocoa/55" : "text-cream/55";

  return (
    <Link
      href={href}
      className={cn("group/logo flex items-center gap-2.5", className)}
      aria-label="Ch0c0leg0 — accueil"
    >
      <LogoMark className={sizes.mark} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-normal tracking-tight",
              sizes.text,
              ink
            )}
          >
            Ch0c0leg0
          </span>
          <span className={cn("mt-1 text-[10px] font-normal uppercase tracking-[0.32em]", sub)}>
            Gaming Store
          </span>
        </span>
      )}
    </Link>
  );
}
