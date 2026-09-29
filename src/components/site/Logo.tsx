import Image from "next/image";
import Link from "next/link";
import { LOGO, LOGO_WHITE, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "default",
  className,
  priority,
}: {
  variant?: "default" | "white";
  className?: string;
  priority?: boolean;
}) {
  const logo = variant === "white" ? LOGO_WHITE : LOGO;
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label={`${SITE_NAME} home`}>
      <Image
        src={logo.src}
        alt={SITE_NAME}
        width={logo.width}
        height={logo.height}
        loading={priority ? "eager" : undefined}
        sizes="200px"
        className="h-full w-auto"
      />
    </Link>
  );
}
