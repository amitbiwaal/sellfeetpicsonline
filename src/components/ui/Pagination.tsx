import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Numbered pagination. `hrefFor(1)` should return the first page URL. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const itemClass =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className={cn(itemClass, "border-line bg-white text-brand-dark hover:bg-blush")}
          rel="prev"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-subtle">…</span>}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              itemClass,
              p === page ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-blush",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className={cn(itemClass, "border-line bg-white text-brand-dark hover:bg-blush")}
          rel="next"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Link>
      )}
    </nav>
  );
}
