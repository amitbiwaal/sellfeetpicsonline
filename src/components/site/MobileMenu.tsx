"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";
import { isActivePath } from "./NavLinks";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-blush"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-line bg-white/95 backdrop-blur-md md:top-20"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-[1140px] px-5 py-6">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 font-serif text-xl font-semibold transition-colors",
                      active ? "bg-blush text-brand" : "text-ink hover:bg-blush",
                    )}
                  >
                    {item.label}
                    <ArrowRight className="size-4 opacity-40" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/best-platforms/" onClick={() => setOpen(false)} className="btn btn-primary mt-6 w-full">
            Get started <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-6 text-center text-xs text-subtle">For adults 18+ only · Privacy first, always.</p>
        </nav>
      </div>
    </div>
  );
}
