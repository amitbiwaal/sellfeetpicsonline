"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import type { TocItem } from "@/lib/content/html";
import { cn } from "@/lib/utils";

function useActiveHeading(idsKey: string) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!idsKey) return;
    const elements = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey]);

  return active;
}

function TocList({ items, active, onNavigate }: { items: TocItem[]; active?: string | null; onNavigate?: () => void }) {
  return (
    <ol className="space-y-0.5 text-[14px] leading-snug">
      {items.map((item) => (
        <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg border-l-2 px-3 py-1.5 transition-colors",
              active === item.id
                ? "border-brand bg-blush font-semibold text-brand"
                : "border-transparent text-muted hover:bg-blush/70 hover:text-ink",
              item.level === 3 && "text-[13px]",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sticky sidebar table of contents with the current section highlighted. */
export function TocSidebar({ items }: { items: TocItem[] }) {
  const headings = items.filter((i) => i.level === 2);
  const active = useActiveHeading(headings.map((i) => i.id).join("|"));
  if (headings.length < 2) return null;
  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-line bg-white p-4">
      <p className="mb-2 flex items-center gap-2 px-3 text-xs font-bold tracking-[0.12em] text-brand uppercase">
        <ListOrdered className="size-4" aria-hidden="true" /> In this article
      </p>
      <div className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-1">
        <TocList items={headings} active={active} />
      </div>
    </nav>
  );
}

/** Collapsible table of contents shown above the article on small screens. */
export function TocInline({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const headings = items.filter((i) => i.level === 2);
  if (headings.length < 2) return null;
  return (
    <nav aria-label="Table of contents" className="mb-8 rounded-2xl border border-line bg-blush/60 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-ink"
      >
        <span className="flex items-center gap-2">
          <ListOrdered className="size-4 text-brand" aria-hidden="true" /> In this article
        </span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div className="border-t border-line px-2 py-3">
          <TocList items={headings} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}
