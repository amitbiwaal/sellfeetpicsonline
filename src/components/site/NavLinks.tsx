"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  const clean = (p: string) => p.replace(/\/+$/, "") || "/";
  const current = clean(pathname);
  const target = clean(href);
  return target === "/" ? current === "/" : current === target || current.startsWith(`${target}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink/80 hover:bg-blush hover:text-brand",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-hot to-brand-bright" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
