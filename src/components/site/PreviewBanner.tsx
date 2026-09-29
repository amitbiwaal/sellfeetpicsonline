"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye } from "lucide-react";
import { exitPreview } from "@/app/actions/preview";

export function PreviewBanner() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-[60] bg-ink text-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-between gap-2 px-5 py-2 text-sm">
        <p className="flex items-center gap-2">
          <Eye className="size-4 text-brand-light" aria-hidden="true" />
          Preview mode: you are seeing unpublished changes.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/admin/" className="text-white/80 underline-offset-2 hover:underline">
            Admin
          </Link>
          <form action={exitPreview}>
            <input type="hidden" name="path" value={pathname} />
            <button type="submit" className="rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">
              Exit preview
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
