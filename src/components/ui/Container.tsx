import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const width = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-[1140px]";
  return <div className={cn("mx-auto w-full px-5 sm:px-6", width, className)}>{children}</div>;
}
