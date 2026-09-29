import { cn } from "@/lib/utils";

type Props = {
  badge?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
  light?: boolean;
};

/** Pink pill badge + serif heading (with <em> accent) + subtitle. */
export function SectionHeading({ badge, title, subtitle, align = "center", as = "h2", className, light }: Props) {
  const Heading = as;
  return (
    <div className={cn(align === "center" ? "mx-auto text-center" : "text-left", "max-w-3xl", className)}>
      {badge && (
        <span
          className={cn(
            "sfo-badge mb-5",
            light && "border border-white/30 bg-white/15 text-white",
          )}
        >
          <span className={cn("sfo-badge-dot", light && "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)]")} />
          {badge}
        </span>
      )}
      <Heading className={cn(as === "h1" ? "sfo-h1" : "sfo-h2", "text-balance", light && "text-white")}>
        {title}
      </Heading>
      {subtitle && (
        <p
          className={cn(
            "sfo-sub mt-3.5 text-pretty",
            align === "center" && "mx-auto max-w-[580px]",
            light && "text-white/90",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("sfo-badge", className)}>
      <span className="sfo-badge-dot" />
      {children}
    </span>
  );
}
