"use client";

import { useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(type: ToastType, message: string) {
  const item = { id: nextId++, type, message };
  items = [...items.slice(-3), item];
  emit();
  setTimeout(() => dismiss(item.id), type === "error" ? 7000 : 4000);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg animate-fade-up",
              t.type === "success" && "border-green-200",
              t.type === "error" && "border-red-200",
              t.type === "info" && "border-line",
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 flex-none",
                t.type === "success" && "text-green-600",
                t.type === "error" && "text-red-600",
                t.type === "info" && "text-brand",
              )}
              aria-hidden="true"
            />
            <p className="flex-1 text-ink">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="text-subtle hover:text-ink" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
