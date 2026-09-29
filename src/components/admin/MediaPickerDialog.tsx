"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Media } from "@/lib/db/schema";
import { MediaLibrary } from "./MediaLibrary";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MediaPickerDialog({
  open,
  onClose,
  onPick,
  title = "Choose an image",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: Media) => void;
  title?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    // Move keyboard focus into the dialog, keep it there, and give it back on close.
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" tabIndex={-1} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#fffafc] shadow-2xl outline-none">
        <div className="flex items-center justify-between border-b border-[#f3e8ee] bg-white px-5 py-3.5">
          <h2 className="font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-subtle hover:bg-blush hover:text-ink" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <MediaLibrary
            mode="pick"
            onPick={(item) => {
              onPick(item);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
