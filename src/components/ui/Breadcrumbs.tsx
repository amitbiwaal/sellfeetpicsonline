import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-[13px] text-subtle", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={item.path} className="flex min-w-0 items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="truncate font-medium text-muted-2">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="transition-colors hover:text-brand">
                      {item.name}
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
