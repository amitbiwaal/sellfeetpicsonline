import Image from "next/image";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type Props = {
  badge?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: Crumb[];
  image?: { src: string; alt: string; width: number; height: number };
  children?: React.ReactNode;
  align?: "center" | "left";
};

/** Top section for inner pages: breadcrumbs, badge, serif H1, intro and optional illustration. */
export function PageHero({ badge, title, subtitle, crumbs, image, children, align = image ? "left" : "center" }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-line/70 bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-[28rem] rounded-full bg-brand-light/15 blur-3xl" />
      <Container className="relative pt-6 pb-12 md:pb-16">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div
          className={cn(
            "mt-8 md:mt-10",
            image ? "grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14" : "",
          )}
        >
          <div className={cn(align === "center" && "mx-auto max-w-3xl text-center")}>
            {badge && <Badge className="mb-5">{badge}</Badge>}
            <h1 className="sfo-h1 text-balance">{title}</h1>
            {subtitle && (
              <p
                className={cn(
                  "mt-5 text-[17px] leading-relaxed text-muted md:text-lg",
                  align === "center" ? "mx-auto max-w-2xl" : "max-w-xl",
                )}
              >
                {subtitle}
              </p>
            )}
            {children}
          </div>
          {image && (
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[32px] bg-blush-2/60 blur-2xl" />
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="eager"
                sizes="(min-width: 1024px) 520px, 100vw"
                className="relative h-auto w-full rounded-[26px] border border-line shadow-pink-lg"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
