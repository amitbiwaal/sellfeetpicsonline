"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Files,
  Folder,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  Trophy,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/_actions/auth";
import { LOGO_WHITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  user: { name: string; email: string; role: "admin" | "editor" };
  unreadMessages: number;
};

const NAV = [
  { href: "/admin/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts/", label: "Posts", icon: FileText },
  { href: "/admin/pages/", label: "Pages", icon: Files },
  { href: "/admin/media/", label: "Media", icon: ImageIcon },
  { href: "/admin/categories/", label: "Categories", icon: Folder },
  { href: "/admin/tags/", label: "Tags", icon: Tags },
  { href: "/admin/authors/", label: "Authors", icon: UserCog },
  { href: "/admin/platforms/", label: "Platforms", icon: Trophy },
  { href: "/admin/messages/", label: "Messages", icon: Inbox, badge: "messages" as const },
  { href: "/admin/users/", label: "Users", icon: Users },
  { href: "/admin/settings/", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminSidebar({ user, unreadMessages }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string, exact?: boolean) => {
    const clean = (p: string) => p.replace(/\/+$/, "");
    return exact ? clean(pathname) === clean(href) : clean(pathname).startsWith(clean(href));
  };

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {NAV.filter((item) => !item.adminOnly || user.role === "admin").map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
              active ? "bg-white/12 text-white shadow-[inset_3px_0_0_#ff3d8b]" : "text-white/70 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className="size-[18px] flex-none" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.badge === "messages" && unreadMessages > 0 && (
              <span className="rounded-full bg-brand-bright px-2 py-0.5 text-[11px] font-bold text-white">{unreadMessages}</span>
            )}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
      >
        <ExternalLink className="size-[18px]" aria-hidden="true" /> View website
      </a>
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
      <p className="truncate text-xs text-white/55">
        {user.email} · {user.role === "admin" ? "Admin" : "Editor"}
      </p>
      <form action={logout} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
        >
          <LogOut className="size-4" aria-hidden="true" /> Log out
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin/" className="flex items-center gap-2 px-5 pt-5 pb-2">
      <Image src={LOGO_WHITE.src} alt="SellFeetOnline" width={LOGO_WHITE.width} height={LOGO_WHITE.height} className="h-10 w-auto" sizes="120px" loading="eager" />
      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white/80 uppercase">CMS</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-plum px-4 py-3 lg:hidden">
        <Link href="/admin/" className="flex items-center gap-2">
          <Image src={LOGO_WHITE.src} alt="SellFeetOnline" width={LOGO_WHITE.width} height={LOGO_WHITE.height} className="h-8 w-auto" sizes="100px" loading="eager" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-white hover:bg-white/10"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-plum">
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col bg-plum lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>
    </>
  );
}
